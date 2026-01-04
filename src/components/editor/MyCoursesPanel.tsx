'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/core/ApiError';

import type { CourseResponse } from '@/lib/models/CourseResponse';

interface MyCoursesPanelProps {
  onClose: () => void;
  onLoadCourse: (content: any, courseId: string, title: string) => void;
}

const MyCoursesPanel: React.FC<MyCoursesPanelProps> = ({ onClose, onLoadCourse }) => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCourses = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      const response = await CourseControllerService.getAuthorCourses(user.id);
      console.log("XCCM: Cours récupérés pour l'auteur :", response.data);
      if (response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des cours :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    try {
      await CourseControllerService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression du cours.");
    }
  };

  const handleTogglePublish = async (course: CourseResponse) => {
    if (!course.id) return;

    try {
      const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await CourseControllerService.updateCourseStatus(course.id, newStatus);

      setCourses(courses.map(c =>
        c.id === course.id ? { ...c, status: newStatus as any } : c
      ));
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      alert("Erreur lors du changement de statut du cours.");
    }
  };

const handleLoad = (course: CourseResponse) => {
  if (!course.id || !course.title) return;

  let parsedContent = null;
  try {
    parsedContent = course.content ? JSON.parse(course.content) : null;
  } catch (e) {
    console.error("Erreur lors du parsing du contenu :", e);
    // Fallback if content is already JSON or invalid string
    parsedContent = course.content;
  }

  onLoadCourse(parsedContent, course.id.toString(), course.title);
  onClose();
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
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">Chargement...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
          Aucun cours sauvegardé pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Catégorie : {course.category || 'Non spécifiée'}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${course.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {course.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleLoad(course)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Charger dans l'éditeur"
                  >
                    <FaEye className="text-sm text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
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