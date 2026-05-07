'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = (courseId: number | null) => {
    const { token } = useAuth();
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const isCleaningUpRef = useRef(false);

    useEffect(() => {
        if (!courseId || !token) {
            setIsConnected(false);
            setStompClient(null);
            return;
        }

        isCleaningUpRef.current = false;

        // Get API URL from correct env var, removing trailing slash if exists
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        console.info('🔍 WebSocket debug', {
            courseId,
            apiBaseUrl: cleanBaseUrl,
            socketUrl: `${cleanBaseUrl}/ws`,
            tokenPresent: !!token,
        });

        const client = new Client({
            // Uses exactly the configuration specified in the backend team's guide
            webSocketFactory: () => new SockJS(`${cleanBaseUrl}/ws`),
            connectHeaders: {
                'Authorization': `Bearer ${token}`
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

        client.onWebSocketClose = (event) => {
            if (!isCleaningUpRef.current) {
                console.warn('🔌 WebSocket déconnecté', {
                    courseId,
                    code: event?.code,
                    reason: event?.reason,
                });
            }
            setIsConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            isCleaningUpRef.current = true;
            console.log('🧹 Désactivation du WebSocket...');
            client.deactivate();
            setStompClient(null);
            setIsConnected(false);
        };
    }, [courseId, token]);

    return { stompClient, isConnected };
};
