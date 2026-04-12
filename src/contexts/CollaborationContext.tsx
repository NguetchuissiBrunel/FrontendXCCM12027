'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Collaborator {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status?: 'ONLINE' | 'OFFLINE';
    type?: 'JOIN' | 'LEAVE';
}

interface CollaborationContextType {
    stompClient: Client | null;
    isConnected: boolean;
    courseId: number | null;
    collaborators: Collaborator[];
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider = ({
    children,
    courseId
}: {
    children: ReactNode,
    courseId: number | null
}) => {
    const { stompClient, isConnected } = useSocket(courseId);
    const { user } = useAuth();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        // Subscription to the presence topic
        const subscription = stompClient.subscribe(
            `/topic/projet/${courseId}/presence`,
            (message) => {
                try {
                    const body = JSON.parse(message.body);

                    if (Array.isArray(body)) {
                        const others = body.filter(c => c.status === 'ONLINE' && c.id !== user?.id);
                        setCollaborators(others);
                    } else if (body.type === 'JOIN' || body.status === 'ONLINE') {
                        if (body.id !== user?.id) {
                            toast.success(`${body.firstName || 'Un collaborateur'} a rejoint la session`, { id: `join-${body.id}` });
                            setCollaborators(prev => {
                                if (prev.find(c => c.id === body.id)) return prev;
                                return [...prev, body];
                            });
                        }
                    } else if (body.type === 'LEAVE' || body.status === 'OFFLINE') {
                        if (body.id !== user?.id) {
                            setCollaborators(prev => prev.filter(c => c.id !== body.id));
                        }
                    }
                } catch (e) {
                    console.error("Erreur de parsing de présence:", e);
                }
            }
        );

        // Announce our presence
        if (user) {
            try {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/presence/join`,
                    body: JSON.stringify({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        status: 'ONLINE',
                        type: 'JOIN'
                    })
                });
            } catch (e) { }
        }

        return () => {
            // Announce our departure
            if (user && isConnected && stompClient.active) {
                stompClient.publish({
                    destination: `/app/projet/${courseId}/presence/leave`,
                    body: JSON.stringify({ id: user.id, type: 'LEAVE', status: 'OFFLINE' })
                });
            }
            subscription.unsubscribe();
        };
    }, [stompClient, isConnected, courseId, user]);

    return (
        <CollaborationContext.Provider value={{ stompClient, isConnected, courseId, collaborators }}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (context === undefined) {
        throw new Error('useCollaboration doit être utilisé à l\'intérieur de CollaborationProvider');
    }
    return context;
};
