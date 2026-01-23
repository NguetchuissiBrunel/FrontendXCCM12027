// src/components/exercises/GradingInterface.tsx - VERSION MISE À JOUR
'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, Submission, Question } from '@/types/exercise';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  FileText, 
  Calendar,
  Clock,
  User,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Award
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(submission.answers || []);
  const [overallScore, setOverallScore] = useState(submission.score || 0);
  const [overallFeedback, setOverallFeedback] = useState(submission.feedback || '');
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

  useEffect(() => {
    // Calculer le score total basé sur les réponses individuelles
    const totalScore = answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
    setOverallScore(totalScore);
  }, [answers]);

  const handleAnswerGrade = (points: number, feedback?: string) => {
    const newAnswers = [...answers];
    const answerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (answerIndex >= 0) {
      newAnswers[answerIndex] = {
        ...newAnswers[answerIndex],
        points,
        feedback,
        autoGraded: false,
        graderComment: feedback
      };
    } else {
      newAnswers.push({
        id: Date.now(),
        questionId: currentQuestion.id,
        answer: '',
        points,
        feedback,
        autoGraded: false,
        graderComment: feedback
      });
    }
    
    setAnswers(newAnswers);
  };

  const handleSaveGrade = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await ExerciseService.gradeSubmission(submission.id, {
        score: overallScore,
        feedback: overallFeedback
      });

      if (result.success) {
        toast.success('✅ Notation enregistrée avec succès');
        onGradeComplete();
      } else {
        toast.error(result.message || 'Erreur lors de la notation');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGrade = () => {
    if (!currentQuestion.correctAnswer || !currentAnswer) return;

    const isCorrect = currentAnswer.answer.trim().toLowerCase() === 
                      currentQuestion.correctAnswer.toLowerCase();
    
    const points = isCorrect ? currentQuestion.points : 0;
    const feedback = isCorrect 
      ? 'Bonne réponse !' 
      : `Réponse incorrecte. La réponse attendue était : ${currentQuestion.correctAnswer}`;
    
    handleAnswerGrade(points, feedback);
  };

  const calculateProgress = () => {
    const gradedAnswers = answers.filter(a => a.points !== undefined);
    return exercise.questions.length > 0 
      ? Math.round((gradedAnswers.length / exercise.questions.length) * 100)
      : 0;
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <CheckCircle className="w-4 h-4" />;
      case 'CODE': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatStudentAnswer = (answer: string, questionType: string) => {
    if (questionType === 'CODE') {
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {answer}
        </pre>
      );
    }
    return <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{answer}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* En-tête */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Correction de soumission
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                {submission.studentName}
                <span className="mx-2">•</span>
                <Calendar className="w-4 h-4" />
                {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {overallScore}/{exercise.maxScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Score actuel
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Barre latérale - Navigation des questions */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Questions ({exercise.questions.length})
            </h3>
            
            <div className="space-y-2">
              {exercise.questions.map((question, index) => {
                const answer = answers.find(a => a.questionId === question.id);
                const isGraded = answer?.points !== undefined;
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent
                            ? 'bg-blue-500 text-white'
                            : isGraded
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Question {index + 1}
                        </span>
                      </div>
                      {isGraded && (
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {answer?.points}/{question.points}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {getQuestionTypeIcon(question.type)}
                      <span className="truncate">
                        {question.type === 'MULTIPLE_CHOICE' ? 'Choix multiple' :
                         question.type === 'CODE' ? 'Code' : 'Texte libre'}
                      </span>
                      <span className="ml-auto">{question.points} pts</span>
                    </div>
                    
                    {answer?.feedback && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {answer.feedback}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Progression */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progression</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {calculateProgress()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestion ? (
            <div className="max-w-4xl mx-auto">
              {/* En-tête de la question */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl">
                      {getQuestionTypeIcon(currentQuestion.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Question {currentQuestionIndex + 1}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {currentQuestion.points} points
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Choix multiple' :
                           currentQuestion.type === 'CODE' ? 'Exercice de code' : 'Réponse libre'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAutoGrade}
                      disabled={!currentQuestion.correctAnswer}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Auto-correction
                    </button>
                  </div>
                </div>
                
                {/* Énoncé de la question */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Énoncé
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {currentQuestion.text}
                  </p>
                  
                  {/* Options pour choix multiple */}
                  {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Options disponibles:
                      </h5>
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            option === currentQuestion.correctAnswer
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                              option === currentQuestion.correctAnswer
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-gray-800 dark:text-gray-200">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Réponse de l'étudiant */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Réponse de l'étudiant
                  </h4>
                  {currentAnswer && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Actuellement noté:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {currentAnswer.points !== undefined ? currentAnswer.points : 0}/{currentQuestion.points}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  {currentAnswer ? (
                    formatStudentAnswer(currentAnswer.answer, currentQuestion.type)
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      L'étudiant n'a pas répondu à cette question
                    </div>
                  )}
                </div>
                
                {currentAnswer?.graderComment && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                          Commentaire précédent
                        </div>
                        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                          {currentAnswer.graderComment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Correction */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Correction
                </h4>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Attribution des points (0 - {currentQuestion.points})
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={currentQuestion.points}
                        value={currentAnswer?.points || 0}
                        onChange={(e) => handleAnswerGrade(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          max={currentQuestion.points}
                          value={currentAnswer?.points || 0}
                          onChange={(e) => handleAnswerGrade(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 text-center"
                        />
                      </div>
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        / {currentQuestion.points}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Feedback pour cette question
                    </label>
                    <textarea
                      value={currentAnswer?.feedback || ''}
                      onChange={(e) => handleAnswerGrade(currentAnswer?.points || 0, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                      rows={3}
                      placeholder="Commentaires spécifiques à cette réponse..."
                    />
                  </div>
                  
                  {/* Réponse correcte (si disponible) */}
                  {currentQuestion.correctAnswer && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                            Réponse correcte
                          </div>
                          <p className="text-green-700 dark:text-green-400">
                            {currentQuestion.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation entre questions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Question précédente
                </button>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Question {currentQuestionIndex + 1} sur {exercise.questions.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {currentAnswer?.points !== undefined ? '✓ Notée' : '○ À noter'}
                  </div>
                </div>
                
                <button
                  onClick={() => setCurrentQuestionIndex(prev => 
                    Math.min(exercise.questions.length - 1, prev + 1)
                  )}
                  disabled={currentQuestionIndex === exercise.questions.length - 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Question suivante
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Aucune question disponible
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Cet exercice ne contient pas de questions à corriger.
              </p>
            </div>
          )}
        </div>

        {/* Barre latérale droite - Feedback global */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
            Feedback global
          </h3>
          
          {/* Score global */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Score final
            </label>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {overallScore}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                sur {exercise.maxScore} points
              </div>
              <div className="mt-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pourcentage: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {exercise.maxScore > 0 ? Math.round((overallScore / exercise.maxScore) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Feedback global */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Commentaires généraux
            </label>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              rows={6}
              placeholder="Commentaires généraux sur la performance de l'étudiant..."
            />
          </div>
          
          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={handleSaveGrade}
              disabled={isSaving}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer la notation
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                // Marquer comme terminé
                handleSaveGrade();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Terminer et envoyer
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
          </div>
          
          {/* Résumé des questions notées */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Questions notées
            </h4>
            <div className="space-y-2">
              {exercise.questions.slice(0, 3).map((question, index) => {
                const answer = answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      Q{index + 1}
                    </span>
                    <span className={`font-medium ${
                      answer?.points !== undefined 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {answer?.points !== undefined ? `${answer.points}/${question.points}` : '--'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}