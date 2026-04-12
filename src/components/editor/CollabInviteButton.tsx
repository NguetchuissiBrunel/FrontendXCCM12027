/**
 * CollabInviteButton - Floating invite button for the editor page header
 *
 * Visible only on the /editor route, positioned in the top-right area
 * of the fixed Navbar. Opens the CollabInviteModal on click.
 *
 * Uses useCollabSession to manage session state.
 *
 * @author ALD
 * @date April 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdGroup } from 'react-icons/md';
import { useCollabSession } from '@/hooks/useCollabSession';
import CollabInviteModal from './CollabInviteModal';

interface CollabInviteButtonProps {
    courseId: number | null;
    courseTitle: string;
}

const CollabInviteButton: React.FC<CollabInviteButtonProps> = ({
    courseId,
    courseTitle,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        sessionId,
        shareUrl,
        collaborators,
        generateSession,
        resetSession,
    } = useCollabSession(courseId);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hasActiveSession = !!sessionId;
    const activeCount = collaborators.length;

    const buttonContent = (
        <>
            {/* Button — normally positioned, takes space in flex layout */}
            <button
                id="btn-collab-invite"
                onClick={() => setIsModalOpen(true)}
                className={`
                    flex items-center gap-2
                    px-3 py-2 rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    shadow-md hover:shadow-purple-500/25 border
                    ${hasActiveSession
                        ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                        : 'bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700'
                    }
                `}
                title={hasActiveSession ? 'Session collaborative active — Gérer' : 'Inviter des collaborateurs'}
            >
                {/* Icon */}
                <div className="relative">
                    <MdGroup className="text-lg" />
                    {/* Active session indicator dot */}
                    {hasActiveSession && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border border-white dark:border-gray-800" />
                    )}
                </div>

                {/* Label */}
                <span className="hidden sm:inline whitespace-nowrap">
                    {hasActiveSession ? 'Collaboration' : 'Inviter'}
                </span>

                {/* Collaborator count badge */}
                {activeCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                        {activeCount > 9 ? '9+' : activeCount}
                    </span>
                )}
            </button>

            {/* Modal */}
            <CollabInviteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseId={courseId}
                courseTitle={courseTitle}
                sessionId={sessionId}
                shareUrl={shareUrl}
                collaborators={collaborators}
                onGenerateSession={generateSession}
                onResetSession={resetSession}
            />
        </>
    );

    if (!mounted) return null;

    const slot = document.getElementById('navbar-collab-slot');
    if (slot) {
        return createPortal(buttonContent, slot);
    }

    // fallback visually somewhere if slot isn't found (shouldn't happen on EditorLayout)
    return <div className="absolute right-0 top-0">{buttonContent}</div>;
};

export default CollabInviteButton;
