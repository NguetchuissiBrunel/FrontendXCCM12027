'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

interface SavedCourse {
  id: string;
  title: string;
  content: any; // TipTap JSON
  html: string;
  published: boolean;
  savedAt: string;
}

interface MyCoursesPanelProps {
  onClose: () => void;
  onLoadCourse: (content: any, courseId: string, title: string) => void;
}

const MyCoursesPanel: React.FC<MyCoursesPanelProps> = ({ onClose, onLoadCourse }) => {
  const [courses, setCourses] = useState<SavedCourse[]>([]);

  // Load courses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('xccm_saved_courses');
    if (saved) {
      setCourses(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem('xccm_saved_courses', JSON.stringify(updated));
  };

  const handleTogglePublish = (id: string) => {
    const updated = courses.map(c =>
      c.id === id ? { ...c, published: !c.published } : c
    );
    setCourses(updated);
    localStorage.setItem('xccm_saved_courses', JSON.stringify(updated));
  };

const handleLoad = (course: SavedCourse) => {
  onLoadCourse(course.content, course.id, course.title);
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
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
            Aucun cours sauvegardé pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {courses
              .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
              .map((course) => (
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
                        Sauvegardé le {course.savedAt}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                          course.published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {course.published ? 'Publié' : 'Brouillon'}
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
                        onClick={() => handleTogglePublish(course.id)}
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title={course.published ? 'Dépublier' : 'Publier'}
                      >
                        {course.published ? (
                          <FaEyeSlash className="text-sm text-gray-600 dark:text-gray-400" />
                        ) : (
                          <FaEye className="text-sm text-green-600 dark:text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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