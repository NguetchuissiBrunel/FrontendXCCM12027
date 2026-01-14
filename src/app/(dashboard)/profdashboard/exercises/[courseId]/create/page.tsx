// src/app/(dashboard)/profdashboard/exercises/[courseId]/create/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {ExerciseEditor} from '@/components/exercises/ExerciseEditor';
import { ArrowLeft } from 'lucide-react';

export default function CreateExercisePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  
  const handleSave = (exercise: any) => {
    // Rediriger vers la liste des exercices après création
    router.push(`/profdashboard/exercises/${courseId}`);
  };
  
  const handleCancel = () => {
    router.push(`/profdashboard/exercises/${courseId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux exercices
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Créer un nouvel exercice
        </h1>
        
        <ExerciseEditor
          courseId={courseId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}