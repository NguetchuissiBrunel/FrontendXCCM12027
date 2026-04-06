'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaTimes, FaTrash, FaPaperPlane, FaBook } from 'react-icons/fa';
import { CourseControllerService, CourseResponse } from '@/lib';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';

interface MyCoursesPanelProps {
  onClose: () => void;
  onLoadCourse: (content: CourseResponse['content'], courseId: string, title: string, category: string, description: string, photoUrl?: string) => void;
}

const MyCoursesPanel: React.FC<MyCoursesPanelProps> = ({ onClose, onLoadCourse }) => {
  const locale = useLocale();
  const t = useTranslations('editor.myCoursesPanel');
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });
  const [statusConfirm, setStatusConfirm] = useState<{ isOpen: boolean; id: number | null; status: string | undefined }>({
    isOpen: false,
    id: null,
    status: undefined
  });

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await CourseControllerService.getAuthorCourses(user.id);
      const responseData = Array.isArray(response)
        ? response
        : typeof response === 'object' && response !== null && 'data' in response
          ? (response as { data?: CourseResponse[] }).data
          : [];
      setCourses(responseData || []);
    } catch (error) {
      console.error(t('fetchErrorLog'), error);
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  // Fetch courses from backend on mount or when user changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: number) => {
    try {
      await CourseControllerService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success(t('deleteSuccess'));
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      toast.error(t('deleteError'));
    }
  };

  const handleTogglePublish = async (id: number, currentStatus?: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await CourseControllerService.updateCourseStatus(id, newStatus);
      setCourses(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus as CourseResponse.status } : c
      ));
      toast.success(newStatus === 'PUBLISHED' ? t('published') : t('draft'));
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error(t('statusError'));
    }
  };

  const handleLoad = (course: CourseResponse) => {
    onLoadCourse(
      course.content,
      String(course.id),
      course.title || t('untitled'),
      course.category || t('defaultCategory'),
      course.description || "",
      course.photoUrl
    );
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t('unknownDate');
    try {
      return new Date(dateStr).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
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
        title={t('deleteTitle')}
        message={t('deleteMessage')}
        confirmText={t('deleteConfirm')}
        type="danger"
      />
      <ConfirmModal
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ isOpen: false, id: null, status: undefined })}
        onConfirm={() => {
          if (statusConfirm.id !== null) handleTogglePublish(statusConfirm.id, statusConfirm.status);
          setStatusConfirm({ isOpen: false, id: null, status: undefined });
        }}
        title={statusConfirm.status === 'PUBLISHED' ? t('unpublishTitle') : t('publishTitle')}
        message={statusConfirm.status === 'PUBLISHED'
          ? t('unpublishMessage')
          : t('publishMessage')
        }
        confirmText={statusConfirm.status === 'PUBLISHED' ? t('unpublishConfirm') : t('publishConfirm')}
        type={statusConfirm.status === 'PUBLISHED' ? 'warning' : 'info'}
      />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('header')}</h2>
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
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded-full w-20 mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
            {t('empty')}
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
                    {(course.photoUrl || course.coverImage) && (
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                        <Image
                          src={course.photoUrl || course.coverImage || '/images/Capture2.png'}
                          alt={course.title || t('untitled')}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate pr-2" title={course.title}>
                        {course.title || t('untitled')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('createdOn')} {formatDate(course.createdAt)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}
                      >
                        {course.status === 'PUBLISHED' ? t('publishedBadge') : t('draftBadge')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoad(course)}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title={t('loadInEditor')}
                      >
                        <FaBook className="text-sm text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => course.id && setStatusConfirm({ isOpen: true, id: course.id, status: course.status })}
                        className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        title={course.status === 'PUBLISHED' ? t('unpublishConfirm') : t('publishConfirm')}
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
                        title={t('deleteAction')}
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
