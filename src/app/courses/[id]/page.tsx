// src/app/courses/[id]/page.tsx
import React from "react";
import Course from "@/components/Course";
import { courses } from "@/data/CourseData";
import { CourseData } from "@/types/course";

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

const CoursePage: React.FC<CoursePageProps> = async ({ params }) => {
  // Attendre les params
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id, 10);
  const course = courses.find((course) => course.id === courseId);

  if (!course) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Cours non trouvé</div>;
  }

  const courseData = validateCourseData(course);

  if (!courseData) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Données du cours invalides</div>;
  }

  return <Course courseData={courseData} />;
};

export default CoursePage;