// src/app/courses/[id]/page.tsx
'use client';
import React from "react";
import Course from "@/components/Course";
import { useCourse } from "@/hooks/useCourses";
import { CourseData } from "@/types/course";
import { AlertCircle } from "lucide-react";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

// Fonction pour valider et normaliser les données du cours
const validateCourseData = (course: any): CourseData | null => {
  if (!course || typeof course !== 'object') return null;

  return {
    id: course.id || 0,
    title: course.title || "Titre non disponible",
    category: course.category || "Formation",
    image: course.image || "",
    views: course.views || 0,
    likes: course.likes || 0,
    downloads: course.downloads || 0,
    author: {
      name: course.author?.name || "Auteur inconnu",
      image: course.author?.image || "",
      designation: course.author?.designation
    },
    conclusion: course.conclusion || "",
    learningObjectives: course.learningObjectives || [],
    sections: course.sections || [],
    introduction: course.introduction,
    prerequisites: course.prerequisites,
    duration: course.duration,
    level: course.level,
    rating: course.rating,
    students: course.students,
    lastUpdated: course.lastUpdated,
    previewImage: course.previewImage
  };
};

const CoursePage = ({ params }: CoursePageProps) => {
  const resolvedParams = React.use(params);
  const courseId = parseInt(resolvedParams.id, 10);
  const { course, loading, error } = useCourse(courseId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du cours...</p>
        </div>
      </div>
    );
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

  const courseData = validateCourseData(course);

  if (!courseData) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Données du cours invalides</div>;
  }

  return <Course courseData={courseData} />;
};

export default CoursePage;