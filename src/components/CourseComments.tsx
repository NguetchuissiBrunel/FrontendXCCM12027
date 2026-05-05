// src/components/CourseComments.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CommentService, CommentDTO } from "@/lib/services/CommentService";
import { LikeService } from "@/lib/services/LikeService";
import { MessageCircle, Send, Trash2, Edit2, X, Check, Heart, CornerDownRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface CourseCommentsProps {
    courseId: number;
}

const CourseComments: React.FC<CourseCommentsProps> = ({ courseId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [likingIds, setLikingIds] = useState<Set<number>>(new Set());

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await CommentService.getComments(courseId);
            let data: CommentDTO[] = [];
            const raw = response?.data;
            if (Array.isArray(raw)) {
                data = raw;
            } else if (raw && 'content' in raw && Array.isArray((raw as any).content)) {
                data = (raw as any).content;
            }
            setComments(data.filter(c => !c.deleted));
        } catch (error) {
            console.error("Erreur récupération commentaires:", error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await CommentService.addComment(courseId, newComment.trim());
            if (response?.data) {
                setComments(prev => [response.data!, ...prev]);
                setNewComment("");
                toast.success("Commentaire ajouté");
            }
        } catch (error) {
            toast.error("Échec de l'ajout du commentaire");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddReply = async (parentId: number) => {
        if (!replyContent.trim()) return;
        try {
            const response = await CommentService.addComment(courseId, replyContent.trim(), parentId);
            if (response?.data) {
                setComments(prev => prev.map(c =>
                    c.id === parentId
                        ? { ...c, replies: [...(c.replies || []), response.data!] }
                        : c
                ));
                setReplyContent("");
                setReplyingToId(null);
                toast.success("Réponse ajoutée");
            }
        } catch {
            toast.error("Échec de l'ajout de la réponse");
        }
    };

    const handleDelete = async (commentId: number, isReply?: boolean, parentId?: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
        try {
            await CommentService.deleteComment(commentId);
            if (isReply && parentId) {
                setComments(prev => prev.map(c =>
                    c.id === parentId
                        ? { ...c, replies: (c.replies || []).filter(r => r.id !== commentId) }
                        : c
                ));
            } else {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
            toast.success("Commentaire supprimé");
        } catch {
            toast.error("Échec de la suppression");
        }
    };

    const handleUpdateComment = async (commentId: number) => {
        if (!editContent.trim()) return;
        try {
            const response = await CommentService.updateComment(commentId, editContent.trim());
            if (response?.data) {
                setComments(prev => prev.map(c =>
                    c.id === commentId ? { ...c, content: editContent, updatedAt: new Date().toISOString() } : c
                ));
                setEditingCommentId(null);
                toast.success("Commentaire modifié");
            }
        } catch {
            toast.error("Échec de la modification");
        }
    };

    const handleLikeComment = async (commentId: number, currentlyLiked: boolean) => {
        if (likingIds.has(commentId)) return;
        setLikingIds(prev => new Set(prev).add(commentId));

        // Optimistic update
        setComments(prev => prev.map(c =>
            c.id === commentId
                ? {
                    ...c,
                    isLiked: !currentlyLiked,
                    likeCount: currentlyLiked ? Math.max(0, (c.likeCount || 0) - 1) : (c.likeCount || 0) + 1,
                }
                : c
        ));

        try {
            if (currentlyLiked) {
                await LikeService.removeLike('COMMENT', commentId);
            } else {
                const res = await LikeService.addLike('COMMENT', commentId);
                if (res?.data) {
                    setComments(prev => prev.map(c =>
                        c.id === commentId ? { ...c, likeCount: res.data!.likeCount, isLiked: res.data!.liked } : c
                    ));
                }
            }
        } catch {
            // Rollback
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c, isLiked: currentlyLiked, likeCount: currentlyLiked ? (c.likeCount || 0) + 1 : Math.max(0, (c.likeCount || 0) - 1) }
                    : c
            ));
        } finally {
            setLikingIds(prev => { const s = new Set(prev); s.delete(commentId); return s; });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const CommentItem: React.FC<{ comment: CommentDTO; isReply?: boolean; parentId?: number }> = ({
        comment, isReply = false, parentId,
    }) => (
        <div className={`flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 ${isReply ? 'ml-10 mt-2' : ''}`}>
            <div className="flex-shrink-0">
                {comment.userPhotoUrl ? (
                    <img src={comment.userPhotoUrl} alt={comment.userFullName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">
                        {comment.userFullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <div>
                        <span className="font-bold text-gray-900 dark:text-white mr-2 text-sm">
                            {comment.userFullName || "Utilisateur inconnu"}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && " (modifié)"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Like commentaire */}
                        {isAuthenticated && (
                            <button
                                onClick={(e) => { e.preventDefault(); handleLikeComment(comment.id!, comment.isLiked || false); }}
                                className={`flex items-center gap-1 text-xs transition-all ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            >
                                <Heart
                                    className={`w-3.5 h-3.5 transition-all duration-300 ${comment.isLiked ? 'fill-current scale-110' : ''} ${likingIds.has(comment.id!) ? 'animate-pulse' : ''}`}
                                    strokeWidth={1.5}
                                />
                                {comment.likeCount ? comment.likeCount : ''}
                            </button>
                        )}
                        {/* Répondre */}
                        {isAuthenticated && !isReply && (
                            <button
                                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id!)}
                                className="text-xs text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                <CornerDownRight size={14} />
                            </button>
                        )}
                        {/* Modifier / Supprimer (auteur uniquement) */}
                        {isAuthenticated && user?.id === comment.userId && editingCommentId !== comment.id && (
                            <>
                                <button onClick={() => { setEditingCommentId(comment.id!); setEditContent(comment.content || ""); }} className="text-gray-400 hover:text-purple-600 transition-colors" title="Modifier">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => comment.id && handleDelete(comment.id, isReply, parentId)} className="text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {editingCommentId === comment.id ? (
                    <div className="mt-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500 mb-2 min-h-[70px]"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingCommentId(null)} className="flex items-center gap-1 text-xs px-3 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md">
                                <X size={12} /> Annuler
                            </button>
                            <button onClick={() => comment.id && handleUpdateComment(comment.id)} className="flex items-center gap-1 text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md">
                                <Check size={12} /> Enregistrer
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">{comment.content}</p>
                )}

                {/* Formulaire réponse */}
                {replyingToId === comment.id && (
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Écrire une réponse..."
                            className="flex-1 bg-white dark:bg-gray-900 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddReply(comment.id!); } }}
                        />
                        <button onClick={() => handleAddReply(comment.id!)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg">
                            <Send size={14} />
                        </button>
                        <button onClick={() => { setReplyingToId(null); setReplyContent(""); }} className="text-gray-400 hover:text-gray-600 px-2">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

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
                    <p className="text-gray-600 dark:text-gray-400">Connectez-vous pour participer à la discussion.</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Soyez le premier à commenter ce cours !</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id}>
                            <CommentItem comment={comment} />
                            {/* Réponses imbriquées */}
                            {(comment.replies || []).map(reply => (
                                <CommentItem key={reply.id} comment={reply} isReply parentId={comment.id} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseComments;
