/**
 * useCollabSession - Hook for collaborative editing session management
 *
 * Generates and persists a unique session token linked to a courseId.
 * Provides the shareable URL for inviting collaborators.
 * Ready for future WebSocket integration.
 *
 * @author ALD
 * @date April 2026
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CollabCollaborator {
    id: string;
    name: string;
    color: string;
    joinedAt: string;
}

export interface CollabSession {
    sessionId: string | null;
    shareUrl: string | null;
    collaborators: CollabCollaborator[];
    generateSession: () => string;
    resetSession: () => void;
}

/**
 * Generates a cryptographically-safe UUID v4 fallback
 */
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Returns the sessionStorage key for a given courseId.
 */
function getStorageKey(courseId: number | null): string {
    return courseId ? `xccm_collab_session_${courseId}` : 'xccm_collab_session_new';
}

/**
 * Builds the shareable URL for a given session.
 */
function buildShareUrl(courseId: number | null, sessionId: string): string {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    const locale = window.location.pathname.split('/')[1] || 'fr';
    const courseParam = courseId ? `&courseId=${courseId}` : '';
    return `${base}/${locale}/editor?sessionId=${sessionId}${courseParam}`;
}

/**
 * useCollabSession
 *
 * @param courseId - Current course ID, or null if no course is loaded yet
 */
export function useCollabSession(courseId: number | null): CollabSession {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    // Placeholder: will be populated by WebSocket in future phase
    const [collaborators] = useState<CollabCollaborator[]>([]);

    // On mount or courseId change: restore existing session or stay null
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const key = getStorageKey(courseId);
        const stored = sessionStorage.getItem(key);
        if (stored) {
            setSessionId(stored);
            setShareUrl(buildShareUrl(courseId, stored));
        } else {
            // Reset if no session yet
            setSessionId(null);
            setShareUrl(null);
        }
    }, [courseId]);

    /**
     * Generates (or regenerates) a new session token.
     * Persists to sessionStorage so it survives page refreshes.
     */
    const generateSession = useCallback((): string => {
        const newId = generateUUID();
        const key = getStorageKey(courseId);
        sessionStorage.setItem(key, newId);
        setSessionId(newId);
        const url = buildShareUrl(courseId, newId);
        setShareUrl(url);
        return newId;
    }, [courseId]);

    /**
     * Resets the session (removes stored token).
     */
    const resetSession = useCallback(() => {
        const key = getStorageKey(courseId);
        sessionStorage.removeItem(key);
        setSessionId(null);
        setShareUrl(null);
    }, [courseId]);

    return {
        sessionId,
        shareUrl,
        collaborators,
        generateSession,
        resetSession,
    };
}
