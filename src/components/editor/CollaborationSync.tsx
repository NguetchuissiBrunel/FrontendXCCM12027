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

        const subUpdates = stompClient.subscribe(`/topic/projet/${courseId}/updates`, (message) => {
            try {
                const update = JSON.parse(message.body);
                if (update.type === 'MOVE') {
                    if (editorRef.current) {
                        editorRef.current.handleTOCAction('move', update.itemId, {
                            targetId: update.targetId,
                            position: update.position
                        });
                    }
                }
            } catch (e) {
                console.error("Erreur de parsing des updates:", e);
            }
        });

        const subLocks = stompClient.subscribe(`/topic/projet/${courseId}/locks`, (message) => {
            try {
                const lockData = JSON.parse(message.body);
                if (lockData.userId === user?.id) return; // Ignore our own locks

                if (lockData.type === 'LOCK') {
                    setLockedNodes(prev => {
                        const newMap = new Map(prev);
                        newMap.set(lockData.nodeId, lockData);
                        return newMap;
                    });
                } else if (lockData.type === 'UNLOCK') {
                    setLockedNodes(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(lockData.nodeId);
                        return newMap;
                    });
                }
            } catch (e) {
                console.error("Erreur parsing locks:", e);
            }
        });

        const subCursors = stompClient.subscribe(`/topic/projet/${courseId}/cursor`, (message) => {
            try {
                const cursorData = JSON.parse(message.body);
                if (cursorData.userId === user?.id) return; // Ignore our own cursor

                setRemoteCursors(prev => {
                    const newMap = new Map(prev);
                    newMap.set(cursorData.userId, cursorData);
                    return newMap;
                });
            } catch (e) { }
        });

        const subContent = stompClient.subscribe(`/topic/projet/${courseId}/content`, (message) => {
            try {
                const contentData = JSON.parse(message.body);
                if (contentData.userId === user?.id) return; // Ignore our own updates

                if (editorInstance && contentData.json) {
                    // We dispatch the update but tell the editor it's a remote update
                    editorInstance.commands.setContent(contentData.json, false);
                    editorInstance.view.dispatch(editorInstance.state.tr.setMeta('isRemote', true));
                }
            } catch (e) {
                console.error("Erreur parsing content update:", e);
            }
        });

        return () => {
            subUpdates.unsubscribe();
            subLocks.unsubscribe();
            subCursors.unsubscribe();
            subContent.unsubscribe();
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
                    destination: `/app/projet/${courseId}/cursor`,
                    body: JSON.stringify({
                        userId: user?.id || `anon-${Date.now()}`,
                        userName: user?.firstName || user?.email?.split('@')[0] || 'Anonyme',
                        x: e.clientX,
                        y: e.clientY,
                        color: myColor
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
                    destination: `/api/v1/projet/${courseId}/content`, // Utilisation du mapping correct
                    body: JSON.stringify({
                        userId: user.id,
                        json: json,
                        timestamp: new Date().toISOString()
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
                            destination: `/app/projet/${courseId}/unlock`,
                            body: JSON.stringify({ type: 'UNLOCK', userId: user?.id, nodeId: lastLockedNodeId })
                        });
                    }
                    if (currentNodeId) {
                        stompClient.publish({
                            destination: `/app/projet/${courseId}/lock`,
                            body: JSON.stringify({
                                type: 'LOCK',
                                userId: user?.id,
                                nodeId: currentNodeId,
                                userName: user?.firstName || user?.email || 'Anonyme',
                                color: '#A855F7' // Purple color indicator for this user
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
                        destination: `/app/projet/${courseId}/unlock`,
                        body: JSON.stringify({ type: 'UNLOCK', userId: user?.id, nodeId: lastLockedNodeId })
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
                    key={cursor.userId}
                    userId={cursor.userId}
                    userName={cursor.userName}
                    x={cursor.x}
                    y={cursor.y}
                    color={cursor.color}
                />
            ))}
        </>
    );
}
