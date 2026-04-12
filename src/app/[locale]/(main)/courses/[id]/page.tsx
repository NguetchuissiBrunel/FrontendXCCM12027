// src/app/courses/[id]/page.tsx
'use client';
import React, { useEffect, useState } from "react";
import Course from "@/components/Course";
import { useCourse } from "@/hooks/useCourses";
import { useLoading } from "@/contexts/LoadingContext";
import { transformTiptapToCourseData } from "@/utils/courseTransformer";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useTranslations } from "next-intl";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

const CoursePage = ({ params }: CoursePageProps) => {
  const resolvedParams = React.use(params);
  const courseId = parseInt(resolvedParams.id, 10);
  const { course, loading, error, toggleLike, incrementDownload } = useCourse(courseId);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const t = useTranslations('pages.coursePage');

  useEffect(() => {
    if (loading || authLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, authLoading, startLoading, stopLoading]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [authLoading, isAuthenticated]);

  const handleConfirmLogin = () => {
    router.push('/login');
  };

  const handleCancelLogin = () => {
    router.push('/');
  };

  // Si on est déjà en cours de chargement global (depuis le clic sur le lien)
  // ou si l'auth est en cours de chargement, on retourne null pour laisser RouteLoading s'afficher
  if (loading || globalLoading || authLoading) {
    return null;
  }

  // Si pas authentifié, on affiche DIRECTEMENT le modal sans passer par les autres checks
  if (!isAuthenticated) {
    return (
      <ConfirmModal
        isOpen={true}
        onClose={handleCancelLogin}
        onConfirm={handleConfirmLogin}
        title={t('loginRequiredTitle')}
        message={t('loginRequiredMessage')}
        confirmText={t('loginConfirm')}
        cancelText={t('returnHome')}
        type="warning"
      />
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-red-100 dark:border-red-900/30">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('oops')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || t('courseNotFound')}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const courseData = course ? transformTiptapToCourseData(course) : null;

  if (!courseData) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">{t('invalidCourseData')}</div>;
  }

  return (
    <Course
      courseData={courseData}
      isLiked={!!course.isLiked}
      likeCount={course.likeCount ?? 0}
      toggleLike={toggleLike}
      incrementDownload={incrementDownload}
    />
  );
};

export default CoursePage;