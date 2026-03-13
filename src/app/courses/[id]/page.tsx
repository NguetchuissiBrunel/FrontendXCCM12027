// src/app/courses/[id]/page.tsx
'use client';
import React, { useEffect } from "react";
import Course from "@/components/Course";
import { useCourse } from "@/hooks/useCourses";
import { useLoading } from "@/contexts/LoadingContext";
import { transformTiptapToCourseData } from "@/utils/courseTransformer";
import { AlertCircle } from "lucide-react";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

const CoursePage = ({ params }: CoursePageProps) => {
  const resolvedParams = React.use(params);
  const courseId = parseInt(resolvedParams.id, 10);
  const { course, loading, error } = useCourse(courseId);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  // Si on est déjà en cours de chargement global (depuis le clic sur le lien)
  // on retourne null pour laisser RouteLoading s'afficher
  if (loading || globalLoading) {
    return null;
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-red-100 dark:border-red-900/30">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oups !</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Cours non trouvé"}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const courseData = course ? transformTiptapToCourseData(course) : null;

  if (!courseData) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Données du cours invalides</div>;
  }

  return <Course courseData={courseData} />;
};

export default CoursePage;