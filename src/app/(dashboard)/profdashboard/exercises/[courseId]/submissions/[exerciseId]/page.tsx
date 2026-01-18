// src/app/(dashboard)/profdashboard/exercises/[courseId]/submissions/[exerciseId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { ExerciseSubmissions } from '@/components/exercises/ExerciseSubmissions';
import { ExerciseStats } from '@/components/exercises/ExerciseStats';
import { Exercise } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
  FaDownload,
  FaChartBar,
  FaUsers,
  FaEdit,
  FaTrash,
  FaShare
} from 'react-icons/fa';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function ExerciseSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (courseId && exerciseId) {
      loadExercise();
    }
  }, [courseId, exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const exerciseData = await ExerciseService.getExerciseDetails(exerciseId);
      if (exerciseData) {
        setExercise(exerciseData);
      } else {
        toast.error('Exercice non trouvé');
        router.push(`/profdashboard/exercises/${courseId}`);
      }
    } catch (error) {
      console.error('Failed to load exercise:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSubmissions = async () => {
    try {
      setExporting(true);
      // Simuler l'export (à implémenter avec votre backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Export généré avec succès');
      // Ici vous pourriez déclencher un téléchargement
      // window.open(`/api/exports/exercises/${exerciseId}/submissions`, '_blank');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!exercise) return;
    
    if (confirm(`Supprimer l'exercice "${exercise.title}" ? Toutes les soumissions seront également supprimées.`)) {
      try {
        await ExerciseService.deleteExercise(exerciseId);
        toast.success('Exercice supprimé');
        router.push(`/profdashboard/exercises/${courseId}`);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Exercice non trouvé</h1>
          <button
            onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation et actions */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/profdashboard/exercises/${courseId}`}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des soumissions</h1>
                <p className="text-gray-600">Cours • Exercice</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportSubmissions}
                disabled={exporting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    Export...
                  </>
                ) : (
                  <>
                    <FaDownload className="w-4 h-4" />
                    Exporter
                  </>
                )}
              </button>
              
              <Link
                href={`/profdashboard/exercises/${courseId}/edit/${exerciseId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
                Modifier
              </Link>
              
              <button
                onClick={handleDeleteExercise}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <FaTrash className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Informations de l'exercice */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  exercise.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {exercise.status === 'PUBLISHED' ? 'Publié' : 'Fermé'}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                  {exercise.maxScore} points
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{exercise.title}</h2>
              
              {exercise.description && (
                <p className="text-gray-600 mb-4">{exercise.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Créé le {formatDate(exercise.createdAt)}
                  </span>
                </div>
                
                {exercise.dueDate && (
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>
                      Échéance : {formatDate(exercise.dueDate)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  <span>
                    {exercise.questions?.length || 0} question{exercise.questions?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-80">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaChartBar className="w-5 h-5 text-indigo-600" />
                  Résumé
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Étudiants inscrits</span>
                    <span className="font-semibold">{exercise.totalStudents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soumissions</span>
                    <span className="font-semibold">{exercise.submissionsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux de participation</span>
                    <span className="font-semibold">
                      {exercise.totalStudents 
                        ? Math.round(((exercise.submissionsCount || 0) / exercise.totalStudents) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score moyen</span>
                    <span className="font-semibold">
                      {exercise.averageScore?.toFixed(1) || '0.0'}/{exercise.maxScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-8">
          <ExerciseStats exercise={exercise} />
        </div>

        {/* Liste des soumissions */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <FaUsers className="w-6 h-6 text-indigo-600" />
              Soumissions des étudiants
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {exercise.submissionsCount || 0}
              </span>
            </h2>
          </div>
          <div className="p-6">
            <ExerciseSubmissions exerciseId={exerciseId} />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/profdashboard/courses/${courseId}`}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Retour au cours</h3>
            <p className="text-sm text-gray-600">Revenir à la page principale du cours</p>
          </Link>
          
          <button
            onClick={() => {
              // Partage des résultats
              navigator.clipboard.writeText(
                `${window.location.origin}/profdashboard/exercises/${courseId}/submissions/${exerciseId}`
              );
              toast.success('Lien copié dans le presse-papier');
            }}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaShare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Partager les résultats</h3>
            </div>
            <p className="text-sm text-gray-600">Copier le lien de cette page</p>
          </button>
          
          <Link
            href={`/profdashboard/exercises/${courseId}/new`}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Créer un nouvel exercice</h3>
            <p className="text-sm text-gray-600">Pour le même cours</p>
          </Link>
        </div>
      </div>
    </div>
  );
}