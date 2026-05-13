'use client';

import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
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
    isSelf?: boolean;
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

    const selfCollaborator = useMemo<Collaborator | null>(() => {
        if (!user?.id) return null;

        return {
            id: user.id,
            email: user.email || '',
            firstName: user.firstName || user.email?.split('@')[0] || 'Vous',
            lastName: user.lastName || '',
            status: 'ONLINE',
            isSelf: true,
        };
    }, [user]);

    useEffect(() => {
        if (!isConnected || !stompClient || !courseId) return;

        if (selfCollaborator) {
            setCollaborators((prev) => {
                const others = prev.filter((collaborator) => collaborator.id !== selfCollaborator.id);
                return [selfCollaborator, ...others];
            });
        }

        try {
            stompClient.publish({
                destination: `/app/projet/${courseId}/action`,
                body: JSON.stringify({
                    type: 'CURSOR',
                    payload: {
                        authorId: user?.id,
                        userName: user?.firstName || user?.email?.split('@')[0] || 'Collaborateur',
                        email: user?.email || '',
                        x: null,
                        y: null,
                    }
                })
            });
        } catch (error) {
            // Ignore presence ping failure
        }

        // Subscribe to the presence topic (JOIN/LEAVE) — évite la double souscription au canal principal
        const subscription = stompClient.subscribe(
            `/topic/projet/${courseId}/presence`,
            (message) => {
                try {
                    const body = JSON.parse(message.body);
                    const { type, userEmail, userName } = body;

                    if (!userEmail || userEmail === user?.email) return;

                    if (type === 'JOIN') {
                        const newCollab: Collaborator = {
                            id: userEmail,
                            email: userEmail,
                            firstName: userName || userEmail.split('@')[0],
                            lastName: '',
                            status: 'ONLINE',
                        };
                        setCollaborators(prev => {
                            if (prev.find(c => c.email === userEmail)) return prev;
                            setTimeout(() => {
                                toast.success(`${newCollab.firstName} a rejoint la session`, { id: `join-${userEmail}` });
                            }, 0);
                            return [...prev, newCollab];
                        });
                    } else if (type === 'LEAVE') {
                        setCollaborators(prev =>
                            prev.map(c => c.email === userEmail ? { ...c, status: 'OFFLINE' } : c)
                        );
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        );

        // Subscribe to personal error queue as mentioned in backend guide
        const errorSub = stompClient.subscribe('/user/queue/errors', (message) => {
            try {
                const error = JSON.parse(message.body);
                toast.error('Erreur de collaboration : ' + (error.content || error.message || 'Action non autorisée'));
            } catch (e) {
                toast.error('Erreur non autorisée lors de la collaboration.');
            }
        });

        return () => {
            subscription.unsubscribe();
            errorSub.unsubscribe();
        };
    }, [stompClient, isConnected, courseId, user, selfCollaborator]);

    useEffect(() => {
        if (isConnected) return;

        setCollaborators((prev) =>
            prev.map((collaborator) => ({
                ...collaborator,
                status: collaborator.isSelf ? collaborator.status : 'OFFLINE',
            }))
        );
    }, [isConnected]);

    return (
        <CollaborationContext.Provider value={{ stompClient, isConnected, courseId, collaborators }}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (context === undefined) {
        return {
            stompClient: null,
            isConnected: false,
            courseId: null,
            collaborators: []
        };
    }
    return context;
};
