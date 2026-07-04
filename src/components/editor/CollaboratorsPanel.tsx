'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaCrown, FaUserEdit, FaUserPlus } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { CourseInvitationControllerService } from '@/lib/services/CourseInvitationControllerService';

interface Collaborator {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    designation?: string;
}

interface CollaboratorsPanelProps {
    courseId: number | null;
    /** Auteur / propriétaire du cours (utilisateur courant le plus souvent). */
    owner?: { name?: string; email?: string; image?: string } | null;
    onClose: () => void;
    onInvite?: () => void;
}

const initials = (name?: string) =>
    (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('') || '?';

const Avatar: React.FC<{ name?: string; image?: string; ring: string }> = ({ name, image, ring }) => (
    image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name || ''} className={`h-9 w-9 rounded-full object-cover ring-2 ${ring}`} />
    ) : (
        <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 ring-2 dark:bg-purple-900/50 dark:text-purple-300 ${ring}`}>
            {initials(name)}
        </div>
    )
);

export const CollaboratorsPanel: React.FC<CollaboratorsPanelProps> = ({ courseId, owner, onClose, onInvite }) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) {
            setCollaborators([]);
            return;
        }
        let cancelled = false;
        const fetchCollaborators = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp: any = await CourseInvitationControllerService.getCollaborators(courseId);
                const data = resp?.data ?? resp ?? [];
                if (!cancelled) setCollaborators(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) setError("Impossible de charger les collaborateurs.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchCollaborators();
        return () => { cancelled = true; };
    }, [courseId]);

    return (
        <div className="flex h-full flex-col bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                    <FaUsers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Collaborateurs</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                    <FaTimes className="text-sm" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {!courseId ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                        <FaUsers className="mb-3 text-3xl text-gray-400" />
                        <p className="text-xs text-gray-500">Enregistrez le cours pour gérer ses collaborateurs.</p>
                    </div>
                ) : (
                    <>
                        {/* Propriétaire */}
                        {owner && (
                            <div className="mb-4">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Propriétaire</p>
                                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800 dark:bg-amber-900/20">
                                    <Avatar name={owner.name} image={owner.image} ring="ring-amber-300 dark:ring-amber-700" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{owner.name || 'Vous'}</p>
                                        {owner.email && <p className="truncate text-xs text-gray-500">{owner.email}</p>}
                                    </div>
                                    <FaCrown className="h-4 w-4 shrink-0 text-amber-500" title="Propriétaire" />
                                </div>
                            </div>
                        )}

                        {/* Éditeurs / collaborateurs */}
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Éditeurs {!loading && `(${collaborators.length})`}
                            </p>
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />}
                        </div>

                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5 dark:border-gray-700">
                                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-600" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-2/3 rounded bg-gray-200 dark:bg-gray-600" />
                                            <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <p className="py-6 text-center text-xs text-red-500">{error}</p>
                        ) : collaborators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                                <FaUserEdit className="mb-2 text-2xl text-gray-400" />
                                <p className="text-xs text-gray-500">Aucun collaborateur pour l'instant.</p>
                                <p className="mt-1 text-[11px] text-gray-400">Invitez un enseignant pour co-éditer ce cours.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {collaborators.map((c, i) => (
                                    <div key={c.id || c.email || i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 dark:border-gray-700 dark:bg-gray-700/40">
                                        <Avatar name={c.name} image={c.image} ring="ring-purple-200 dark:ring-purple-800" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{c.name || 'Sans nom'}</p>
                                            {c.email && <p className="truncate text-xs text-gray-500">{c.email}</p>}
                                        </div>
                                        {c.designation && (
                                            <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                                                {c.designation}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {courseId && onInvite && (
                <div className="border-t border-gray-200 p-3 dark:border-gray-700">
                    <button
                        onClick={onInvite}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                        <FaUserPlus className="h-3.5 w-3.5" />
                        Inviter un collaborateur
                    </button>
                </div>
            )}
        </div>
    );
};

export default CollaboratorsPanel;
