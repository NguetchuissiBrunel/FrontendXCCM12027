// src/components/CourseComments.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CourseInteractionControllerService } from "@/lib";
import { CourseCommentDTO } from "@/lib/models/CourseCommentDTO";
import { MessageCircle, Send, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface CourseCommentsProps {
    courseId: number;
}

const CourseComments: React.FC<CourseCommentsProps> = ({ courseId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<CourseCommentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit state
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const fetchComments = async () => {
        try {
            const response = await CourseInteractionControllerService.getComments(courseId);
            // Handle multiple possible API response shapes
            let data: CourseCommentDTO[] = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response && Array.isArray(response.data)) {
                data = response.data;
            } else if (response && response.success && Array.isArray(response.data)) {
                data = response.data;
            } else if (response && Array.isArray((response as any).content)) {
                data = (response as any).content;
            }
            setComments(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [courseId]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await CourseInteractionControllerService.addComment(courseId, { content: newComment });
            if (response.success && response.data) {
                toast.success("Commentaire ajouté");
                setNewComment("");
                // Reload comments or append locally
                await fetchComments();
            }
        } catch (error) {
            toast.error("Échec de l'ajout du commentaire");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;

        try {
            await CourseInteractionControllerService.deleteComment(courseId, commentId);
            toast.success("Commentaire supprimé");
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            toast.error("Échec de la suppression");
            console.error(error);
        }
    };

    const startEdit = (comment: CourseCommentDTO) => {
        if (!comment.id) return;
        setEditingCommentId(comment.id);
        setEditContent(comment.content || "");
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleUpdateComment = async (commentId: number) => {
        if (!editContent.trim()) return;

        try {
            const response = await CourseInteractionControllerService.updateComment(courseId, commentId, { content: editContent });
            if (response.success) {
                toast.success("Commentaire modifié");
                setEditingCommentId(null);
                await fetchComments();
            }
        } catch (error) {
            toast.error("Échec de la modification");
            console.error(error);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="text-purple-600" />
                Commentaires ({comments.length})
            </h3>

            {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="mb-8 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-4 pr-16 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[100px]"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center mb-8">
                    <p className="text-gray-600 dark:text-gray-400">
                        Connectez-vous pour participer à la discussion.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Soyez le premier à commenter ce cours !</p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {comment.userPhotoUrl ? (
                                    <img src={comment.userPhotoUrl} alt={comment.userFullName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
                                        {comment.userFullName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <span className="font-bold text-gray-900 dark:text-white mr-2">
                                            {comment.userFullName || "Utilisateur inconnu"}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(comment.createdAt)}
                                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && " (modifié)"}
                                        </span>
                                    </div>

                                    {/* Actions (seulement pour l'auteur) */}
                                    {isAuthenticated && user?.id === comment.userId && editingCommentId !== comment.id && (
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(comment)} className="text-gray-400 hover:text-purple-600 transition-colors" title="Modifier">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => comment.id && handleDelete(comment.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Edition ou Affichage */}
                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500 mb-2 min-h-[80px]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={cancelEdit} className="flex items-center gap-1 text-sm px-3 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md">
                                                <X size={14} /> Annuler
                                            </button>
                                            <button onClick={() => comment.id && handleUpdateComment(comment.id)} className="flex items-center gap-1 text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md">
                                                <Check size={14} /> Enregistrer
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">
                                        {comment.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseComments;
