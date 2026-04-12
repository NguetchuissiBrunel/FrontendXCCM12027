'use client';

import { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = (courseId: number | null) => {
    const { token } = useAuth();
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!courseId || !token) return;

        // Get API URL, removing trailing slash if exists
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        const client = new Client({
            // For fallback/compatibility, use SockJS
            webSocketFactory: () => new SockJS(`${cleanBaseUrl}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP: ', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('✅ Connecté au WebSocket STOMP (Projet ID:', courseId, ')');
            setIsConnected(true);
        };

        client.onStompError = (frame) => {
            console.error('❌ Erreur STOMP:', frame.headers['message']);
            console.error('Details:', frame.body);
        };

        client.onWebSocketError = (event) => {
            console.warn('⚠️ Erreur bas niveau WebSocket:', event);
        };

        client.onWebSocketClose = () => {
            console.warn('🔌 WebSocket déconnecté');
            setIsConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            console.log('🧹 Désactivation du WebSocket...');
            client.deactivate();
            setStompClient(null);
            setIsConnected(false);
        };
    }, [courseId, token]);

    return { stompClient, isConnected };
};
