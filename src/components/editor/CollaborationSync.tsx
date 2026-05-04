'use client';

import React, { useEffect, useState } from 'react';
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

    // Subscribe to updates + locks + cursors
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId || !editorRef?.current) return;

        const subMain = stompClient.subscribe(`/topic/projet/${courseId}`, (message) => {
            try {
                const action = JSON.parse(message.body);
                // Exclude own actions
                if (action.payload?.authorId === user?.id || action.authorId === user?.id) return;

                const type = action.type;
                const lockInfo = action.payload || {};

                if (type === 'MOVE') {
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
                    setRemoteCursors(prev => {
                        const newMap = new Map(prev);
                        if (cursorInfo.authorId) {
                            newMap.set(cursorInfo.authorId, cursorInfo);
                        }
                        return newMap;
                    });
                }
            } catch (e) {
                console.error("Erreur parsing message:", e);
            }
        });

        return () => {
            subMain.unsubscribe();
        };
    }, [stompClient, isConnected, courseId, editorRef, user?.id, editorInstance]);

    // Track local mouse movements and broadcast
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        // Use specific colors per user to differentiate them visually
        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const myColor = colors[Math.abs((user?.id || 'a').charCodeAt(0)) % colors.length];

        const handleMouseMove = throttle((e: MouseEvent) => {
            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/action`,
                    body: JSON.stringify({
                        type: 'CURSOR',
                        payload: {
                            authorId: user?.id || `anon-${Date.now()}`,
                            userName: user?.firstName || user?.email?.split('@')[0] || 'Anonyme',
                            x: e.clientX,
                            y: e.clientY,
                            color: myColor
                        }
                    })
                });
            } catch (err) { }
        }, 75); // 75ms throttle

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            handleMouseMove.cancel();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [stompClient, isConnected, courseId, user]);

    // Track local editor changes and broadcast (throttled)
    useEffect(() => {
        if (!isConnected || !stompClient || !courseId || !user) return;

        const handleLocalContentUpdate = throttle((e: any) => {
            const { json } = e.detail;
            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/action`,
                    body: JSON.stringify({
                        type: 'UNLOCK', // Using UNLOCK as a generic way to broadcast content updates as per backend guide
                        content: JSON.stringify(json),
                        payload: {
                            authorId: user.id,
                            timestamp: new Date().toISOString()
                        }
                    })
                });
            } catch (err) {
                console.error("Erreur lors de l'envoi du contenu:", err);
            }
        }, 800); // 800ms throttle

        window.addEventListener('xccm:editor-content-update' as any, handleLocalContentUpdate);

        return () => {
            handleLocalContentUpdate.cancel();
            window.removeEventListener('xccm:editor-content-update' as any, handleLocalContentUpdate);
        };
    }, [stompClient, isConnected, courseId, user]);

    // Listen to TipTap cursor movements to publish Locks
    useEffect(() => {
        if (!editorInstance || !stompClient || !isConnected || !courseId) return;

        let lastLockedNodeId: string | null = null;
        let timer: NodeJS.Timeout | null = null;

        const handleSelectionUpdate = () => {
            const { selection } = editorInstance.state;
            const { $anchor } = selection;

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
                                    color: '#A855F7'
                                }
                            })
                        });
                    }
                    lastLockedNodeId = currentNodeId;
                }, 100);
            }
        };

        editorInstance.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editorInstance.off('selectionUpdate', handleSelectionUpdate);
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
