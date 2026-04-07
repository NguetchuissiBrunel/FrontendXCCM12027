/**
 * CollabInviteModal - Collaborative session invite modal
 *
 * Allows the course author to invite collaborators via a shareable link.
 * Designed to integrate with future WebSocket-based real-time editing.
 *
 * @author ALD
 * @date April 2026
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FaTimes,
    FaLink,
    FaCopy,
    FaCheck,
    FaUsers,
    FaUserPlus,
    FaSync,
    FaTrash,
} from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { CollabCollaborator } from '@/hooks/useCollabSession';

interface CollabInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number | null;
    courseTitle: string;
    sessionId: string | null;
    shareUrl: string | null;
    collaborators: CollabCollaborator[];
    onGenerateSession: () => string;
    onResetSession: () => void;
}

const CollabInviteModal: React.FC<CollabInviteModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    sessionId,
    shareUrl,
    collaborators,
    onGenerateSession,
    onResetSession,
}) => {
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const linkInputRef = useRef<HTMLInputElement>(null);

    // Auto-generate session when modal opens if none exists
    useEffect(() => {
        if (isOpen && !sessionId) {
            setIsGenerating(true);
            setTimeout(() => {
                onGenerateSession();
                setIsGenerating(false);
            }, 300);
        }
    }, [isOpen, sessionId, onGenerateSession]);

    // Reset copy state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        const urlToCopy = shareUrl || '';
        try {
            await navigator.clipboard.writeText(urlToCopy);
            setCopied(true);
            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: select the text in the input
            linkInputRef.current?.select();
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegenerateLink = () => {
        setIsGenerating(true);
        setCopied(false);
        setTimeout(() => {
            onGenerateSession();
            setIsGenerating(false);
        }, 200);
    };

    const handleRevokeLink = () => {
        if (confirm('Révoquer le lien invalidera l\'accès actuel. Continuer ?')) {
            onResetSession();
            setCopied(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                {/* Modal Container */}
                <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600">
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm">
                                <MdGroup className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold">Travail collaboratif</h2>
                                <p className="text-xs text-white/75 truncate max-w-xs">
                                    {courseTitle || 'Nouveau cours'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            title="Fermer"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5">

                        {/* Session Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${sessionId ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {sessionId
                                    ? `Session active · ID: ${sessionId.slice(0, 8)}…`
                                    : 'Aucune session active'}
                            </span>
                        </div>

                        {/* Share Link Section */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <FaLink className="inline mr-1.5 text-purple-500" />
                                Lien d&apos;invitation
                            </label>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        ref={linkInputRef}
                                        type="text"
                                        readOnly
                                        value={isGenerating ? 'Génération en cours…' : (shareUrl || 'Aucun lien généré')}
                                        className="w-full text-sm py-2.5 px-3 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-mono truncate focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-default"
                                        onClick={() => linkInputRef.current?.select()}
                                        title={shareUrl || ''}
                                    />
                                    {isGenerating && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <FaSync className="text-purple-400 animate-spin text-xs" />
                                        </div>
                                    )}
                                </div>

                                {/* Copy Button */}
                                <button
                                    onClick={handleCopyLink}
                                    disabled={!shareUrl || isGenerating}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${copied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    title="Copier le lien"
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className="text-xs" />
                                            <span>Copié !</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCopy className="text-xs" />
                                            <span>Copier</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Instructions */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Partagez ce lien avec les personnes que vous souhaitez inviter à co-éditer ce cours.
                                Toute personne possédant ce lien pourra rejoindre la session.
                            </p>
                        </div>

                        {/* Link Actions */}
                        <div className="flex gap-2 pt-0.5">
                            <button
                                onClick={handleRegenerateLink}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-40"
                                title="Générer un nouveau lien"
                            >
                                <FaSync className={`text-xs ${isGenerating ? 'animate-spin' : ''}`} />
                                Nouveau lien
                            </button>

                            {sessionId && (
                                <button
                                    onClick={handleRevokeLink}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 border-opacity-60 transition-colors"
                                    title="Révoquer le lien actuel"
                                >
                                    <FaTrash className="text-xs" />
                                    Révoquer
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 dark:border-gray-700" />

                        {/* Collaborators Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <FaUsers className="inline mr-1.5 text-indigo-500" />
                                    Collaborateurs actifs
                                    {collaborators.length > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs">
                                            {collaborators.length}
                                        </span>
                                    )}
                                </label>
                            </div>

                            {collaborators.length === 0 ? (
                                <div className="text-center py-6 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-600">
                                    <FaUserPlus className="text-2xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Personne n&apos;a encore rejoint la session
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Partagez le lien ci-dessus pour inviter des collaborateurs
                                    </p>
                                    <p className="text-xs text-purple-400 dark:text-purple-500 mt-2 font-medium">
                                        🔌 La présence en temps réel sera disponible dans la prochaine phase (WebSocket)
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {collaborators.map((collab) => (
                                        <div
                                            key={collab.id}
                                            className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: collab.color }}
                                            >
                                                {collab.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {collab.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Connecté
                                                </p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CollabInviteModal;
