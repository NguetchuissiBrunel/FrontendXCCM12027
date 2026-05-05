'use client';

import React, { useEffect, useState,useRef } from 'react';
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

    // Maps Node ID to the Collaborator who locked it
    const [lockedNodes, setLockedNodes] = useState<Map<string, any>>(new Map());
    // Maps User ID to their latest cursor position
    const [remoteCursors, setRemoteCursors] = useState<Map<string, any>>(new Map());

    const sessionId = useRef(`anon-${Math.random().toString(36).substr(2, 9)}`);

    // Subscribe to updates + locks + cursors
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId || !editorRef?.current) return;

        const subMain = stompClient.subscribe(`/topic/projet/${courseId}`, (message) => {
            try {
                const action = JSON.parse(message.body);
                // Exclude own actions
                if (action.payload?.authorId === (user?.id || sessionId.current) || action.authorId === (user?.id || sessionId.current)) return;

                const type = action.type;
                const lockInfo = action.payload || {};

                if (type === 'BLOCK_UPDATE') {
                    if (action.content && lockInfo.nodeId && editorInstance) {
                        let blockJson;
                        try { blockJson = JSON.parse(action.content); } catch (e) { return; }

                        // Chercher le nœud correspondant dans le document local
                        let targetPos = -1;
                        let targetNodeSize = 0;
                        
                        editorInstance.state.doc.descendants((node, pos) => {
                            if (node.attrs && node.attrs.id === lockInfo.nodeId) {
                                targetPos = pos;
                                targetNodeSize = node.nodeSize;
                                return false; // Arrêter la recherche
                            }
                        });

                        // Remplacement chirurgical via l'API Prosemirror
                        if (targetPos !== -1) {
                            const { tr, schema } = editorInstance.state;
                            try {
                                const newNode = schema.nodeFromJSON(blockJson);
                                tr.replaceWith(targetPos, targetPos + targetNodeSize, newNode);
                                tr.setMeta('isRemote', true); // Ne pas déclencher de boucle infinie
                                editorInstance.view.dispatch(tr);
                            } catch (e) {
                                console.error('Erreur remplacement de bloc:', e);
                            }
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
                        newMap.set(String(action.granuleId), {
                            nodeId: String(action.granuleId),
                            authorId: lockInfo.authorId || action.authorId,
                            userName: lockInfo.userName || 'Un collaborateur',
                            color: lockInfo.color || '#A855F7'
                        });
                        return newMap;
                    });
                } else if (type === 'UNLOCK') {
                    setLockedNodes(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(String(action.granuleId));
                        return newMap;
                    });

                    // If backend gives 'content' upon unlock or update
                    if (action.content && editorInstance) {
                        let jsonContent = action.content;
                        if (typeof action.content === 'string') {
                            try { jsonContent = JSON.parse(action.content); } catch (e) { }
                        }

                        editorInstance.commands.setContent(jsonContent, false);
                        editorInstance.view.dispatch(editorInstance.state.tr.setMeta('isRemote', true));
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
                console.error("Erreur parsing message:", e);
            }
        });

        return () => {
            subMain.unsubscribe();
        };
    }, [stompClient, isConnected, courseId, editorRef, user?.id, editorInstance]);

    // Track local mouse movements to broadcast fluid cursors
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
                            x: e.clientX + window.scrollX, // Coordonnée absolue de la page
                            y: e.clientY + window.scrollY,
                            color: myColor
                        }
                    })
                });
            } catch (err) { }
        }, 75);

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            handleMouseMove.cancel();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [stompClient, isConnected, courseId, user]);

    // Listen to TipTap cursor movements to publish Locks
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        let lastLockedNodeId: string | null = null;
        let timer: NodeJS.Timeout | null = null;

        const handleSelectionUpdate = throttle(() => {
            const { selection } = editorInstance.state;
            const { $anchor } = selection;

            // Lock logic for blocks (granules)
            let currentNodeId = null;
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
                                payload: { authorId: user?.id }
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
                                    color: myColor
                                }
                            })
                        });
                    }
                    lastLockedNodeId = currentNodeId;
                }, 100);
            }
        }, 100); // Throttle selection updates to 100ms for performance

        editorInstance.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editorInstance.off('selectionUpdate', handleSelectionUpdate);
            handleSelectionUpdate.cancel();
            if (timer) clearTimeout(timer);
            if (lastLockedNodeId && stompClient.active) {
                try {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({ type: 'UNLOCK', granuleId: parseInt(lastLockedNodeId) || 0, payload: { authorId: user?.id } })
                    });
                } catch (e) { }
            }
        };
    }, [editorInstance, stompClient, isConnected, courseId, user]);

    // Track local editor changes and broadcast (throttled) for real-time typing
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        const handleUpdate = throttle(() => {
            const { state } = editorInstance;
            const { selection } = state;
            
            // Trouver le bloc actuellement verrouillé dans lequel on écrit
            let currentBlockNode = null;
            for (let depth = selection.$anchor.depth; depth > 0; depth--) {
                const node = selection.$anchor.node(depth);
                if (node && node.attrs && node.attrs.id) {
                    currentBlockNode = node;
                    break;
                }
            }

            if (currentBlockNode) {
                try {
                    stompClient.publish({
                        destination: `/app/projet/${courseId}/action`,
                        body: JSON.stringify({
                            type: 'BLOCK_UPDATE',
                            granuleId: parseInt(currentBlockNode.attrs.id) || 0,
                            content: JSON.stringify(currentBlockNode.toJSON()),
                            payload: { 
                                authorId: user?.id || sessionId.current,
                                nodeId: currentBlockNode.attrs.id
                            }
                        })
                    });
                } catch (err) { }
            }
        }, 300); // 300ms donne une sensation de temps réel fluide sans surcharger le navigateur

        editorInstance.on('update', handleUpdate);

        return () => {
            handleUpdate.cancel();
            editorInstance.off('update', handleUpdate);
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
