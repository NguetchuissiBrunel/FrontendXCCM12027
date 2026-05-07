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
    const lastLockedNodeIdRef = useRef<string | null>(null);

    const editorInstanceRef = useRef<Editor | null | undefined>(null);
    useEffect(() => {
        editorInstanceRef.current = editorInstance;
    }, [editorInstance]);

    // ─── Subscription principale ────────────────────────────────────────────────
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        const subMain = stompClient.subscribe(`/topic/projet/${courseId}`, (message) => {
            try {
                const action = JSON.parse(message.body);

                // Ignorer ses propres actions
                const myId = user?.id || sessionId.current;
                const authorId = action.payload?.authorId || action.authorId;
                if (authorId === myId) return;

                const type = action.type;
                const lockInfo = action.payload || {};
                const editor = editorInstanceRef.current;

                if (type === 'BLOCK_UPDATE') {
                    const blockContent = action.content || lockInfo.content;
                    if (blockContent && lockInfo.nodeId && editor) {
                        let blockJson;
                        try { blockJson = JSON.parse(blockContent); } catch { return; }

                        let targetPos = -1;
                        let targetNodeSize = 0;

                        editor.state.doc.descendants((node, pos) => {
                            if (node.attrs && node.attrs.id === lockInfo.nodeId) {
                                targetPos = pos;
                                targetNodeSize = node.nodeSize;
                                return false;
                            }
                        });

                        if (targetPos !== -1) {
                            try {
                                const newNode = editor.schema.nodeFromJSON(blockJson);
                                editor.commands.command(({ tr, dispatch }) => {
                                    if (dispatch) {
                                        tr.replaceWith(targetPos, targetPos + targetNodeSize, newNode);
                                        tr.setMeta('isRemote', true);
                                    }
                                    return true;
                                });
                            } catch (e) { console.error(e); }
                        }
                    }
                } else if (type === 'MOVE') {
                    if (editorRef.current && action.payload) {
                        editorRef.current.handleTOCAction('move', action.payload.itemId, {
                            targetId: action.payload.targetId,
                            position: action.payload.position
                        }, true);
                    }
                } else if (type === 'DELETE') {
                    if (editorRef.current && action.nodeId) {
                        editorRef.current.handleTOCAction('delete', action.nodeId, null, true);
                    }
                } else if (type === 'RENAME') {
                    if (editorRef.current && action.nodeId && action.newTitle) {
                        editorRef.current.handleTOCAction('rename', action.nodeId, action.newTitle, true);
                    }
                } else if (type === 'DUPLICATE') {
                    if (editorRef.current && action.nodeId) {
                        editorRef.current.handleTOCAction('duplicate', action.nodeId, null, true);
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
            } catch (e) { console.error(e); }
        });

        return () => subMain.unsubscribe();
    }, [stompClient, isConnected, courseId, editorRef, user?.id]);

    // ─── Souris ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;
        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        const handleMouseMove = throttle((e: MouseEvent) => {
            const page = document.getElementById('xccm-editor-page');
            if (!page) return;
            const rect = page.getBoundingClientRect();
            const style = window.getComputedStyle(page);
            const matrix = new DOMMatrix(style.transform);
            const scale = matrix.a || 1;
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/action`,
                    body: JSON.stringify({
                        type: 'CURSOR',
                        payload: {
                            authorId: user?.id || sessionId.current,
                            userName: user?.firstName || user?.email?.split('@')[0] || 'Anonyme',
                            x, y, color: myColor
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

    // ─── Verrouillage (Selection) ────────────────────────────────────────────────
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;
        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        const handleSelectionUpdate = throttle(() => {
            const { selection } = editorInstance.state;
            let currentNodeId: string | null = null;
            for (let depth = selection.$anchor.depth; depth > 0; depth--) {
                const node = selection.$anchor.node(depth);
                if (node && node.attrs && node.attrs.id) {
                    currentNodeId = node.attrs.id;
                    break;
                }
            }

            if (currentNodeId !== lastLockedNodeIdRef.current) {
                const oldId = lastLockedNodeIdRef.current;
                const myId = user?.id || sessionId.current;
                if (oldId) {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'UNLOCK',
                            granuleId: 0,
                            payload: { authorId: myId, nodeId: oldId }
                        })
                    });
                }
                if (currentNodeId) {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'LOCK',
                            granuleId: 0,
                            payload: {
                                authorId: myId,
                                userName: user?.firstName || user?.email?.split('@')[0] || 'Anonyme',
                                color: myColor,
                                nodeId: currentNodeId
                            }
                        })
                    });
                }
                lastLockedNodeIdRef.current = currentNodeId;
            }
        }, 150);

        editorInstance.on('selectionUpdate', handleSelectionUpdate);
        return () => {
            editorInstance.off('selectionUpdate', handleSelectionUpdate);
            handleSelectionUpdate.cancel();
            if (lastLockedNodeIdRef.current && stompClient.active) {
                try {
                    const myId = user?.id || sessionId.current;
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'UNLOCK',
                            granuleId: 0,
                            payload: { authorId: myId, nodeId: lastLockedNodeIdRef.current }
                        })
                    });
                } catch { }
            }
        };
    }, [editorInstance, stompClient, isConnected, courseId, user]);

    // ─── Mise à jour du contenu et structure ─────────────────────────────────────
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        const handleUpdate = throttle((props?: any) => {
            const { transaction } = props || {};
            if (transaction?.getMeta('isRemote')) return;
            const editor = editorInstanceRef.current;
            if (!editor) return;

            const { state } = editor;
            const { selection } = state;

            let currentBlockNode: any = null;
            let parentBlockNode: any = null;
            
            for (let depth = selection.$anchor.depth; depth > 0; depth--) {
                const node = selection.$anchor.node(depth);
                if (node && node.attrs && node.attrs.id) {
                    if (!currentBlockNode) currentBlockNode = node;
                    else { parentBlockNode = node; break; }
                }
            }

            const isStructural = transaction?.docChanged && (transaction.steps.some((step: any) => step.slice?.content?.childCount > 0) || transaction.steps.length > 1);
            let targetNode = (isStructural && parentBlockNode) ? parentBlockNode : currentBlockNode;

            // ✅ FALLBACK : Si on n'a pas de targetNode via la sélection (ex: focus dans un textarea de NodeView pour l'intro)
            // on cherche quel nœud a été modifié par la transaction (attributs ou contenu)
            if (!targetNode && transaction?.docChanged) {
                transaction.steps.forEach((step: any) => {
                    // Les steps peuvent avoir 'from' ou 'pos' selon leur type
                    const pos = step.from !== undefined ? step.from : step.pos;
                    if (pos !== undefined) {
                        try {
                            const $pos = state.doc.resolve(pos);
                            for (let d = $pos.depth; d >= 0; d--) {
                                const n = $pos.node(d);
                                if (n?.attrs?.id) {
                                    targetNode = n;
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                });
            }

            if (targetNode) {
                const nodeJson = JSON.stringify(targetNode.toJSON());
                try {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'BLOCK_UPDATE',
                            granuleId: 0,
                            content: nodeJson,
                            payload: {
                                authorId: user?.id || sessionId.current,
                                nodeId: targetNode.attrs.id,
                                content: nodeJson,
                                isStructural
                            }
                        })
                    });
                } catch (e) { console.error(e); }
            }
        }, 300);

        editorInstance.on('update', ({ transaction }) => handleUpdate({ transaction }));

        // Écouter les actions structurelles venant de MainEditor (TOC) pour les diffuser
        const handleLocalAction = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { type, nodeId, newTitle, payload } = customEvent.detail;
            
            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/action`,
                    body: JSON.stringify({
                        type,
                        nodeId,
                        newTitle,
                        payload: {
                            ...payload,
                            authorId: user?.id || sessionId.current
                        }
                    })
                });
            } catch (err) {
                console.error('Erreur diffusion action locale:', err);
            }
        };

        window.addEventListener('xccm:editor-action', handleLocalAction);

        return () => {
            handleUpdate.cancel();
            editorInstance.off('update', handleUpdate);
            window.removeEventListener('xccm:editor-action', handleLocalAction);
        };
    }, [editorInstance, stompClient, isConnected, courseId, user]);

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
