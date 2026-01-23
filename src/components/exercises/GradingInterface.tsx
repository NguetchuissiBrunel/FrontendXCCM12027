// src/components/exercises/GradingInterface.tsx - VERSION CORRIGÉE HAUTEUR
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Submission, Exercise, Question } from '@/types/exercise';
import { useGradeSubmission } from '@/hooks/useExercise';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Save, 
  Award, 
  MessageSquare,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Type,
  Code,
  Eye,
  Hash
} from 'lucide-react';

interface GradingInterfaceProps {
  submission: Submission;
  exercise: Exercise;
  onClose: () => void;
  onGradeComplete: () => void;
}

export default function GradingInterface({
  submission,
  exercise,
  onClose,
  onGradeComplete
}: GradingInterfaceProps) {
  const { mutate: gradeSubmission, isPending } = useGradeSubmission();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const initialScores: Record<number, number> = {};
    submission.answers?.forEach(answer => {
      initialScores[answer.questionId] = answer.points || 0;
    });
    return initialScores;
  });
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');
  const [questionFeedback, setQuestionFeedback] = useState<Record<number, string>>(() => {
    const initialFeedback: Record<number, string> = {};
    submission.answers?.forEach(answer => {
      initialFeedback[answer.questionId] = answer.feedback || '';
    });
    return initialFeedback;
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState('auto');

  // Ajuster la hauteur du contenu
  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        const viewportHeight = window.innerHeight;
        const modalMaxHeight = Math.min(viewportHeight * 0.9, 800); // Max 800px
        const headerHeight = 64; // En-tête approx
        const footerHeight = 180; // Pied approx
        const availableHeight = modalMaxHeight - headerHeight - footerHeight;
        
        setContentHeight(`${Math.max(availableHeight, 300)}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const questions = exercise.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = submission.answers?.find(
    a => a.questionId === currentQuestion?.id
  );

  // Calculer le score total
  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  };

  const currentTotalScore = calculateTotalScore();
  const percentage = exercise.maxScore > 0 ? (currentTotalScore / exercise.maxScore) * 100 : 0;

  const handleQuestionScoreChange = (questionId: number, score: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const maxPoints = question.points || 1;
    const newScore = Math.min(Math.max(0, score), maxPoints);
    
    setScores(prev => ({
      ...prev,
      [questionId]: newScore
    }));
  };

  const handleQuestionFeedbackChange = (questionId: number, text: string) => {
    setQuestionFeedback(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleGrade = async () => {
    try {
      if (currentTotalScore > exercise.maxScore) {
        toast.error(`Score trop élevé (max: ${exercise.maxScore})`);
        return;
      }

      await gradeSubmission(
        submission.id,
        currentTotalScore,
        feedback || undefined,
        {
          onSuccess: () => {
            toast.success('Notation enregistrée');
            onGradeComplete();
          },
          onError: (error) => {
            toast.error(`Erreur: ${error.message}`);
          }
        }
      );
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore <= 0) return 'text-gray-600';
    const perc = (score / maxScore) * 100;
    if (perc >= 80) return 'text-green-600';
    if (perc >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQuestionIcon = (type?: string) => {
    switch (type) {
      case 'CODE': return <Code className="w-4 h-4 text-blue-500" />;
      case 'MULTIPLE_CHOICE': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Type className="w-4 h-4 text-purple-500" />;
    }
  };

  const formatQuestionType = (type?: string) => {
    switch (type) {
      case 'CODE': return 'Code';
      case 'MULTIPLE_CHOICE': return 'QCM';
      default: return 'Texte';
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Points rapides adaptés
  const getQuickPoints = () => {
    const maxPoints = currentQuestion?.points || 1;
    const points = [0, 0.5, 1];
    
    if (maxPoints >= 2) points.push(2);
    if (maxPoints >= 3) points.push(3);
    if (maxPoints >= 5) points.push(5);
    if (maxPoints >= 10) points.push(10);
    
    points.push(maxPoints);
    return Array.from(new Set(points)).sort((a, b) => a - b);
  };

  return (
    <div className="flex flex-col min-h-0" style={{ height: '100%', maxHeight: '90vh' }}>
      {/* En-tête FIXE */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                Notation
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{submission.studentName}</span>
                <span>•</span>
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{exercise.title}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation FIXE */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="text-center min-w-[80px]">
              <div className="text-xs text-gray-500 dark:text-gray-400">Question</div>
              <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
            
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="p-1.5 disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Score global</div>
            <div className={`text-lg font-bold ${getScoreColor(currentTotalScore, exercise.maxScore)}`}>
              {currentTotalScore.toFixed(1)}/{exercise.maxScore}
            </div>
          </div>
        </div>
        
        {/* Liste des questions */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 pb-1">
            {questions.map((question, index) => {
              const isCurrent = currentQuestionIndex === index;
              const score = scores[question.id] || 0;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex flex-col items-center p-2 rounded min-w-[60px] transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs font-medium mt-1">
                    {score.toFixed(1)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL avec SCROLL */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ minHeight: '300px', maxHeight: contentHeight }}
      >
        {currentQuestion && (
          <div className="space-y-6">
            {/* Question et réponse */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getQuestionIcon(currentQuestion.type)}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formatQuestionType(currentQuestion.type)}
                  </span>
                  <span className="ml-auto px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                    {currentQuestion.points || 1} pts
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  {currentQuestion.text}
                </h3>
                
                {/* Réponse étudiante */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Réponse de l'étudiant
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 p-3">
                    {currentAnswer?.answer ? (
                      currentQuestion.type === 'CODE' ? (
                        <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-40">
                          {currentAnswer.answer}
                        </pre>
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {currentAnswer.answer}
                        </p>
                      )
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        Aucune réponse
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* NOTATION - SECTION CLAIRE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Attribuer un score
              </h4>
              
              {/* Score actuel */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Score actuel</span>
                  <span className={`text-xl font-bold ${getScoreColor(scores[currentQuestion.id] || 0, currentQuestion.points || 1)}`}>
                    {scores[currentQuestion.id]?.toFixed(1) || 0} / {currentQuestion.points || 1}
                  </span>
                </div>
                
                {/* Curseur SIMPLE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-8 text-center">0</span>
                    <input
                      type="range"
                      min="0"
                      max={currentQuestion.points || 1}
                      step="0.5"
                      value={scores[currentQuestion.id] || 0}
                      onChange={(e) => handleQuestionScoreChange(currentQuestion.id, parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 w-8 text-center">{currentQuestion.points || 1}</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-40">
                      <input
                        type="number"
                        min="0"
                        max={currentQuestion.points || 1}
                        step="0.5"
                        value={scores[currentQuestion.id] || 0}
                        onChange={(e) => handleQuestionScoreChange(currentQuestion.id, parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-bold text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Points rapides */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sélection rapide:
                </div>
                <div className="flex flex-wrap gap-2">
                  {getQuickPoints().map((points) => (
                    <button
                      key={points}
                      onClick={() => handleQuestionScoreChange(currentQuestion.id, points)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        scores[currentQuestion.id] === points
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {points} point{points !== 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={questionFeedback[currentQuestion.id] || ''}
                  onChange={(e) => handleQuestionFeedbackChange(currentQuestion.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  rows={2}
                  placeholder="Commentaire pour cette question..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PIED DE PAGE FIXE */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="space-y-3">
          {/* Feedback général */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Commentaire général
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              rows={1}
              placeholder="Commentaire sur l'ensemble..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Score final</div>
              <div className={`text-lg font-bold ${getScoreColor(currentTotalScore, exercise.maxScore)}`}>
                {currentTotalScore.toFixed(1)} pts
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleGrade}
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                {isPending ? '...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}