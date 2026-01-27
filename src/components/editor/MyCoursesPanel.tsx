'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaSpinner, FaPaperPlane, FaBook } from 'react-icons/fa';
import { CourseControllerService, CourseResponse } from '@/lib';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/contexts/LoadingContext';

interface MyCoursesPanelProps {
  onClose: () => void;
  onLoadCourse: (content: any, courseId: string, title: string, category: string, description: string, photoUrl?: string) => void;
}

const MyCoursesPanel: React.FC<MyCoursesPanelProps> = ({ onClose, onLoadCourse }) => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { startLoading, stopLoading, isLoading: globalLoading } = useLoading();

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });
  const [statusConfirm, setStatusConfirm] = useState<{ isOpen: boolean; id: number | null; status: string | undefined }>({
    isOpen: false,
    id: null,
    status: undefined
  });

  const fetchCourses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await CourseControllerService.getAuthorCourses(user.id);
      // Backend Standardized Response Handling
      const responseData = (response as any).data || response;
      setCourses(responseData || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses from backend on mount or when user changes
  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleDelete = async (id: number) => {
    try {
      await CourseControllerService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success("Cours supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      toast.error("Impossible de supprimer le cours.");
    }
  };

  const handleTogglePublish = async (id: number, currentStatus?: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await CourseControllerService.updateCourseStatus(id, newStatus);
      setCourses(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus as any } : c
      ));
      toast.success(newStatus === 'PUBLISHED' ? "Cours publié !" : "Cours repassé en brouillon.");
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Impossible de modifier le statut.");
    }
  };

  const handleLoad = (course: CourseResponse) => {
    onLoadCourse(
      course.content,
      String(course.id),
      course.title || "Sans titre",
      course.category || "Informatique",
      course.description || "",
      course.photoUrl
    );
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Date inconnue';
    try {
      return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => {
          if (deleteConfirm.id !== null) handleDelete(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null });
        }}
        title="Supprimer le cours"
        message="Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />
      <ConfirmModal
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ isOpen: false, id: null, status: undefined })}
        onConfirm={() => {
          if (statusConfirm.id !== null) handleTogglePublish(statusConfirm.id, statusConfirm.status);
          setStatusConfirm({ isOpen: false, id: null, status: undefined });
        }}
        title={statusConfirm.status === 'PUBLISHED' ? 'Dépublier le cours' : 'Publier le cours'}
        message={statusConfirm.status === 'PUBLISHED'
          ? 'Voulez-vous repasser ce cours en brouillon ? Il ne sera plus visible par les étudiants.'
          : 'Voulez-vous publier ce cours ? Il deviendra visible par tous les étudiants.'
        }
        confirmText={statusConfirm.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
        type={statusConfirm.status === 'PUBLISHED' ? 'warning' : 'info'}
      />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Mes Cours</h2>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading || globalLoading ? (
          null
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
            Aucun cours sauvegardé pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {[...courses]
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((course) => (
                <div
                  key={course.id}
                  className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-start gap-3 justify-between">
                    {(course.photoUrl || (course as any).coverImage) && (
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                        <img
                          src={course.photoUrl || (course as any).coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate pr-2" title={course.title}>
                        {course.title || "Sans titre"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Créé le {formatDate(course.createdAt)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}
                      >
                        {course.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoad(course)}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title="Charger dans l'éditeur"
                      >
                        <FaBook className="text-sm text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => course.id && setStatusConfirm({ isOpen: true, id: course.id, status: course.status })}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title={course.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                      >
                        {course.status === 'PUBLISHED' ? (
                          <FaPaperPlane className="text-sm text-gray-600 dark:text-gray-400" />
                        ) : (
                          <FaPaperPlane className="text-sm text-green-600 dark:text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => course.id && setDeleteConfirm({ isOpen: true, id: course.id })}
                        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash className="text-sm text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div >
  );
};

export default MyCoursesPanel;