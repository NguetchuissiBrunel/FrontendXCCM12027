'use client';

import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useAuth } from '@/contexts/AuthContext';

export interface HocuspocusState {
    ydoc: Y.Doc | null;
    provider: HocuspocusProvider | null;
    isConnected: boolean;
    isSynced: boolean;
}

/**
 * Connexion Y.js/Hocuspocus pour l'édition collaborative temps réel (type Overleaf).
 *
 * Le Y.Doc et le provider sont exposés via un state : ils sont null tant que la
 * connexion n'est pas établie, puis fournis ensemble une fois prêts. Le composant
 * éditeur ne doit activer les extensions Collaboration qu'une fois `ydoc` non-null
 * (voir MainEditor : la clé de re-création dépend de ydoc/provider).
 *
 * URL : dérivée de NEXT_PUBLIC_API_BASE_URL, chemin `/collab/` (proxy nginx -> Hocuspocus :1234).
 */
export const useHocuspocus = (courseId: number | string | null, enabled: boolean = true): HocuspocusState => {
    const { token, user } = useAuth();
    const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        if (!enabled || !courseId || !token) {
            setYdoc(null);
            setProvider(null);
            setIsConnected(false);
            setIsSynced(false);
            return;
        }

        const doc = new Y.Doc();

        // URL Hocuspocus : ex. https://xccm1.duckdns.org -> wss://xccm1.duckdns.org/collab/
        const base = process.env.NEXT_PUBLIC_HOCUSPOCUS_URL
            || `${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
                .replace(/^http/, 'ws')
                .replace(/\/$/, '')}/collab/`;

        const hp = new HocuspocusProvider({
            url: base,
            name: String(courseId),
            document: doc,
            token,
            onConnect: () => setIsConnected(true),
            onDisconnect: () => { setIsConnected(false); setIsSynced(false); },
            onSynced: () => setIsSynced(true),
            onAuthenticationFailed: ({ reason }: { reason: string }) => {
                console.error('[Hocuspocus] Auth échouée:', reason);
            },
        });

        // Awareness : identité de l'utilisateur courant (curseur nommé + couleur)
        const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
        const color = colors[Math.abs((user?.email || 'u').charCodeAt(0)) % colors.length];
        hp.setAwarenessField('user', {
            id: user?.id || 'anon',
            name: user?.firstName || user?.email?.split('@')[0] || 'Collaborateur',
            email: user?.email || '',
            color,
        });

        setYdoc(doc);
        setProvider(hp);

        return () => {
            hp.destroy();
            doc.destroy();
            setYdoc(null);
            setProvider(null);
            setIsConnected(false);
            setIsSynced(false);
        };
    }, [enabled, courseId, token, user?.id, user?.email, user?.firstName]);

    return { ydoc, provider, isConnected, isSynced };
};
