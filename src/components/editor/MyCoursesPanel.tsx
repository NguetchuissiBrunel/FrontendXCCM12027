'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { CourseControllerService, CourseResponse } from '@/lib';
import { useAuth } from '@/contexts/AuthContext';

interface MyCoursesPanelProps {
  onClose: () => void;
  onLoadCourse: (content: any, courseId: string, title: string, category: string, description: string) => void;
}

const MyCoursesPanel: React.FC<MyCoursesPanelProps> = ({ onClose, onLoadCourse }) => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
    if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    try {
      await CourseControllerService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      alert("Impossible de supprimer le cours sur le serveur.");
    }
  };

  const handleTogglePublish = async (id: number, currentStatus?: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await CourseControllerService.updateCourseStatus(id, newStatus);
      setCourses(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus as any } : c
      ));
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Impossible de modifier le statut du cours.");
    }
  };

  const handleLoad = (course: CourseResponse) => {
    onLoadCourse(
      course.content,
      String(course.id),
      course.title || "Sans titre",
      course.category || "Informatique",
      course.description || ""
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
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-12 text-gray-500 dark:text-gray-400">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <p className="text-sm">Chargement de vos cours...</p>
          </div>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate pr-2">
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

                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoad(course)}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title="Charger dans l'éditeur"
                      >
                        <FaEye className="text-sm text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => course.id && handleTogglePublish(course.id, course.status)}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title={course.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                      >
                        {course.status === 'PUBLISHED' ? (
                          <FaEyeSlash className="text-sm text-gray-600 dark:text-gray-400" />
                        ) : (
                          <FaEye className="text-sm text-green-600 dark:text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => course.id && handleDelete(course.id)}
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
    </div>
  );
};

export default MyCoursesPanel;