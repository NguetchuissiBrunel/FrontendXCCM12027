'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useAuth } from '@/contexts/AuthContext';
import { MainEditorRef } from './MainEditor';
import { Editor } from '@tiptap/react';
import RemoteCursor from './RemoteCursor';
import throttle from 'lodash.throttle';

interface CollaborationSyncProps {
    editorRef: React.MutableRefObject<MainEditorRef | null>;
    editorInstance?: Editor | null;
}

export default function CollaborationSync({ editorRef, editorInstance }: CollaborationSyncProps) {
    const { stompClient, isConnected, courseId } = useCollaboration();
    const { user } = useAuth();

    const [lockedNodes, setLockedNodes] = useState<Map<string, any>>(new Map());
    const [remoteCursors, setRemoteCursors] = useState<Map<string, any>>(new Map());

    const sessionId = useRef(`anon-${Math.random().toString(36).substr(2, 9)}`);

    // ✅ FIX CRITIQUE : Ref vers l'instance de l'éditeur pour éviter le bug de closure.
    // La subscription STOMP est créée une seule fois. Si editorInstance était null à ce moment,
    // il resterait null pour toujours dans la closure. La ref est TOUJOURS à jour.
    const editorInstanceRef = useRef<Editor | null | undefined>(null);
    useEffect(() => {
        editorInstanceRef.current = editorInstance;
    }, [editorInstance]);

    // ─── Subscription principale : reçoit TOUS les messages du projet ───────────
    // ✅ FIX : Plus de garde sur editorRef?.current ni editorInstance dans les deps.
    //    On utilise editorInstanceRef pour lire la dernière instance disponible.
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        const subMain = stompClient.subscribe(`/topic/projet/${courseId}`, (message) => {
            try {
                const action = JSON.parse(message.body);

                // Ignorer ses propres actions
                const myId = user?.id || sessionId.current;
                if (action.payload?.authorId === myId || action.authorId === myId) return;

                const type = action.type;
                const lockInfo = action.payload || {};

                // ✅ On lit toujours la ref qui pointe vers l'éditeur ACTUEL
                const editor = editorInstanceRef.current;

                if (type === 'BLOCK_UPDATE') {
                    const blockContent = action.content || lockInfo.content;
                    console.debug('📥 BLOCK_UPDATE reçu', {
                        nodeId: lockInfo.nodeId,
                        hasContent: !!blockContent,
                        hasEditor: !!editor,
                        actionKeys: Object.keys(action),
                        payloadKeys: Object.keys(lockInfo),
                    });

                    if (blockContent && lockInfo.nodeId && editor) {
                        let blockJson;
                        try { blockJson = JSON.parse(blockContent); } catch {
                            console.error('❌ JSON parse du contenu échoué');
                            return;
                        }

                        // Chercher le nœud dans le document local
                        let targetPos = -1;
                        let targetNodeSize = 0;

                        editor.state.doc.descendants((node, pos) => {
                            if (node.attrs && node.attrs.id === lockInfo.nodeId) {
                                targetPos = pos;
                                targetNodeSize = node.nodeSize;
                                return false; // Arrêter la recherche
                            }
                        });

                        console.debug('🔍 Recherche nœud', { nodeId: lockInfo.nodeId, targetPos, targetNodeSize });

                        // Remplacement chirurgical via l'API ProseMirror intégrée à TipTap
                        if (targetPos !== -1) {
                            try {
                                const newNode = editor.schema.nodeFromJSON(blockJson);
                                editor.commands.command(({ tr, dispatch }) => {
                                    if (dispatch) {
                                        tr.replaceWith(targetPos, targetPos + targetNodeSize, newNode);
                                        tr.setMeta('isRemote', true); // Évite la boucle infinie
                                    }
                                    return true;
                                });
                                console.debug('✅ Bloc remplacé avec succès', { nodeId: lockInfo.nodeId });
                            } catch (e) {
                                console.error('❌ Erreur remplacement de bloc:', e);
                            }
                        } else {
                            console.warn('⚠️ Nœud non trouvé dans le document local:', lockInfo.nodeId);
                        }
                    }
                } else if (type === 'MOVE') {
                    if (editorRef.current && action.payload) {
                        editorRef.current.handleTOCAction('move', action.payload.itemId, {
                            targetId: action.payload.targetId,
                            position: action.payload.position
                        });
                    }
                } else if (type === 'LOCK') {
                    setLockedNodes(prev => {
                        const newMap = new Map(prev);
                        const idToLock = lockInfo.nodeId || String(action.granuleId);
                        newMap.set(idToLock, {
                            nodeId: idToLock,
                            authorId: lockInfo.authorId || action.authorId,
                            userName: lockInfo.userName || 'Un collaborateur',
                            color: lockInfo.color || '#A855F7'
                        });
                        return newMap;
                    });
                } else if (type === 'UNLOCK') {
                    setLockedNodes(prev => {
                        const newMap = new Map(prev);
                        const idToUnlock = lockInfo.nodeId || String(action.granuleId);
                        newMap.delete(idToUnlock);
                        return newMap;
                    });

                    // Mise à jour du contenu si fourni lors du unlock
                    if (action.content && editor) {
                        let jsonContent = action.content;
                        if (typeof action.content === 'string') {
                            try { jsonContent = JSON.parse(action.content); } catch { }
                        }
                        editor.commands.setContent(jsonContent, false);
                        editor.view.dispatch(editor.state.tr.setMeta('isRemote', true));
                    }
                } else if (type === 'CURSOR') {
                    const cursorInfo = action.payload || {};
                    if (cursorInfo.authorId && cursorInfo.x !== undefined && cursorInfo.y !== undefined) {
                        setRemoteCursors(prev => {
                            const newMap = new Map(prev);
                            newMap.set(cursorInfo.authorId, cursorInfo);
                            return newMap;
                        });
                    }
                }
            } catch (e) {
                console.error('Erreur parsing message:', e);
            }
        });

        return () => {
            subMain.unsubscribe();
        };
    // ✅ editorInstance RETIRÉ des dépendances — on utilise la ref à la place.
    // Évite de recréer la subscription à chaque changement d'état de l'éditeur.
    }, [stompClient, isConnected, courseId, editorRef, user?.id]);

    // ─── Diffuse la position du curseur souris (coordonnées absolues) ────────────
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        const handleMouseMove = throttle((e: MouseEvent) => {
            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/action`,
                    body: JSON.stringify({
                        type: 'CURSOR',
                        payload: {
                            authorId: user?.id || sessionId.current,
                            userName: user?.firstName || user?.email?.split('@')[0] || 'Anonyme',
                            x: e.clientX + window.scrollX,
                            y: e.clientY + window.scrollY,
                            color: myColor
                        }
                    })
                });
            } catch { }
        }, 75);

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            handleMouseMove.cancel();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [stompClient, isConnected, courseId, user]);

    // ─── Envoie un LOCK/UNLOCK quand le curseur se déplace dans l'éditeur ────────
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        let lastLockedNodeId: string | null = null;
        let timer: NodeJS.Timeout | null = null;

        const handleSelectionUpdate = throttle(() => {
            const { selection } = editorInstance.state;
            const { $anchor } = selection;

            let currentNodeId: string | null = null;
            for (let depth = $anchor.depth; depth > 0; depth--) {
                const node = $anchor.node(depth);
                if (node && node.attrs && node.attrs.id) {
                    currentNodeId = node.attrs.id;
                    break;
                }
            }

            if (currentNodeId !== lastLockedNodeId) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    if (lastLockedNodeId) {
                        stompClient.publish({
                            destination: `/app/projet/${courseId}/action`,
                            body: JSON.stringify({
                                type: 'UNLOCK',
                                granuleId: parseInt(lastLockedNodeId) || 0,
                                payload: { 
                                    authorId: user?.id,
                                    nodeId: lastLockedNodeId
                                }
                            })
                        });
                    }
                    if (currentNodeId) {
                        stompClient.publish({
                            destination: `/app/projet/${courseId}/action`,
                            body: JSON.stringify({
                                type: 'LOCK',
                                granuleId: parseInt(currentNodeId) || 0,
                                payload: {
                                    authorId: user?.id,
                                    userName: user?.firstName || user?.email || 'Anonyme',
                                    color: myColor,
                                    nodeId: currentNodeId
                                }
                            })
                        });
                    }
                    lastLockedNodeId = currentNodeId;
                }, 100);
            }
        }, 100);

        editorInstance.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editorInstance.off('selectionUpdate', handleSelectionUpdate);
            handleSelectionUpdate.cancel();
            if (timer) clearTimeout(timer);
            if (lastLockedNodeId && stompClient.active) {
                try {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'UNLOCK',
                            granuleId: parseInt(lastLockedNodeId) || 0,
                            payload: { 
                                authorId: user?.id,
                                nodeId: lastLockedNodeId
                            }
                        })
                    });
                } catch { }
            }
        };
    }, [editorInstance, stompClient, isConnected, courseId, user]);

    // ─── Diffuse le bloc en cours d'édition (throttle 300ms) ─────────────────────
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        const handleUpdate = throttle(({ transaction }: { transaction: any }) => {
            // Ne pas rediffuser les changements reçus de collaborateurs distants
            if (transaction?.getMeta('isRemote')) return;

            // ✅ FIX: Lire l'état ACTUEL de l'éditeur via la ref, pas la closure périmée
            const editor = editorInstanceRef.current;
            if (!editor) return;

            const { state } = editor;
            const { selection } = state;

            let currentBlockNode: any = null;
            for (let depth = selection.$anchor.depth; depth > 0; depth--) {
                const node = selection.$anchor.node(depth);
                if (node && node.attrs && node.attrs.id) {
                    currentBlockNode = node;
                    break;
                }
            }

            if (currentBlockNode) {
                const nodeJson = JSON.stringify(currentBlockNode.toJSON());
                console.debug('📤 BLOCK_UPDATE envoyé', { nodeId: currentBlockNode.attrs.id, size: nodeJson.length });
                try {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'BLOCK_UPDATE',
                            granuleId: parseInt(currentBlockNode.attrs.id) || 0,
                            content: nodeJson,
                            payload: {
                                authorId: user?.id || sessionId.current,
                                nodeId: currentBlockNode.attrs.id,
                                content: nodeJson
                            }
                        })
                    });
                } catch (e) {
                    console.error('❌ BLOCK_UPDATE publish error:', e);
                }
            }
        }, 300);

        editorInstance.on('update', handleUpdate);

        return () => {
            handleUpdate.cancel();
            editorInstance.off('update', handleUpdate);
        };
    }, [editorInstance, stompClient, isConnected, courseId, user]);

    // ─── Styles CSS pour les blocs verrouillés ───────────────────────────────────
    const lockStyles = Array.from(lockedNodes.values()).map(lock => `
      [data-id="${lock.nodeId}"] {
          pointer-events: none !important;
          opacity: 0.55 !important;
          outline: 2px dashed ${lock.color || '#F87171'} !important;
          transition: all 0.3s ease;
          position: relative !important;
      }
      [data-id="${lock.nodeId}"]::before {
          content: "🔒 Edité par ${lock.userName || 'Un collaborateur'}";
          position: absolute;
          top: -12px;
          right: 20px;
          background: ${lock.color || '#F87171'};
          color: white;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: bold;
          border-radius: 4px;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
  `).join('\n');

    return (
        <>
            <style>{lockStyles}</style>
            {Array.from(remoteCursors.values()).map(cursor => (
                <RemoteCursor
                    key={cursor.authorId}
                    userId={cursor.authorId}
                    userName={cursor.userName}
                    x={cursor.x}
                    y={cursor.y}
                    color={cursor.color}
                />
            ))}
        </>
    );
}
