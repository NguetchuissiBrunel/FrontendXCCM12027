// src/components/Course.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Eye, ThumbsUp, Download, Award, ArrowRight, CheckCircle, ArrowLeft, BookOpen, Layout, BookUp, Tv } from "lucide-react";
import { downloadCourseAsPDF } from "@/utils/DownloadPdf";
import CourseSidebar from "@/components/CourseSidebar";
import { CourseData, Section, Chapter, Paragraph, ExerciseQuestion } from "@/types/course";
import EnrollmentButton from '@/components/EnrollmentButton';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';


interface OrientationSelectorProps {
  isOpen: boolean;
  onSelect: (orientation: 'p' | 'l') => void;
  onClose: () => void;
}

const OrientationSelector: React.FC<OrientationSelectorProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Layout className="h-5 w-5 mr-2 text-purple-600" />
          Choisissez l'orientation du PDF
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
          <button
            onClick={() => onSelect('p')}
            className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all flex flex-col items-center"
            type="button"
          >
            <div className="w-20 h-28 border-2 border-purple-400 rounded-md mb-3 flex items-center justify-center">
              <BookUp className="h-8 w-8 text-purple-500" />
            </div>
            <span className="font-medium text-purple-700">Portrait</span>
          </button>
          
          <button
            onClick={() => onSelect('l')}
            className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all flex flex-col items-center"
            type="button"
          >
            <div className="w-28 h-20 border-2 border-purple-400 rounded-md mb-3 flex items-center justify-center">
              <Tv className="h-8 w-8 text-purple-500" />
            </div>
            <span className="font-medium text-purple-700">Paysage</span>
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            type="button"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

interface CourseProps {
  courseData: CourseData;
}

const Course: React.FC<CourseProps> = ({ courseData }) => {
    const { user } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [exerciseScore, setExerciseScore] = useState<{ [key: string]: number }>({});
  const [showExercise, setShowExercise] = useState<boolean>(false);
  const [courseCompleted, setCourseCompleted] = useState<boolean>(false);
  const [currentExerciseAnswers, setCurrentExerciseAnswers] = useState<{ [key: number]: string }>({});
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<{
    rating: number;
    feedback: string;
    submitted: boolean;
  }>({
    rating: 0,
    feedback: "",
    submitted: false,
  });
  const [showOrientationSelector, setShowOrientationSelector] = useState<boolean>(false);

  // Helper functions to safely access data
  const getCurrentSection = (): Section | null => {
    if (!courseData?.sections?.length || currentSectionIndex >= courseData.sections.length) {
      return null;
    }
    return courseData.sections[currentSectionIndex];
  };

  const getCurrentChapter = (): Chapter | null => {
    const section = getCurrentSection();
    if (!section?.chapters?.length || currentChapterIndex >= section.chapters.length) {
      return null;
    }
    return section.chapters[currentChapterIndex];
  };

  const getCurrentParagraph = (): Paragraph | null => {
    const chapter = getCurrentChapter();
    if (!chapter?.paragraphs?.length || currentParagraphIndex >= chapter.paragraphs.length) {
      return null;
    }
    return chapter.paragraphs[currentParagraphIndex];
  };

  const section = getCurrentSection();
  const chapter = getCurrentChapter();
  const paragraph = getCurrentParagraph();

  const hasSections = courseData?.sections?.length > 0;
  const hasChapters = Boolean(section?.chapters?.length);
  const hasParagraphs = Boolean(chapter?.paragraphs?.length);

  useEffect(() => {
    if (!hasSections || !section) {
      setCourseCompleted(false);
      return;
    }

    const isLastSection = currentSectionIndex === courseData.sections.length - 1;
    
    if (hasChapters && chapter) {
      const isLastChapter = currentChapterIndex === section.chapters!.length - 1;
      const isLastParagraph = currentParagraphIndex === chapter.paragraphs.length - 1;
      setCourseCompleted(isLastSection && isLastChapter && isLastParagraph);
    } else if (section.paragraphs?.length) {
      const isLastParagraph = currentParagraphIndex === section.paragraphs.length - 1;
      setCourseCompleted(isLastSection && isLastParagraph);
    } else {
      setCourseCompleted(isLastSection);
    }
  }, [currentSectionIndex, currentChapterIndex, currentParagraphIndex, courseData, hasSections, hasChapters, section, chapter]);

  const handleDownloadPDF = () => {
    setShowOrientationSelector(true);
  };
  
  const handleOrientationSelect = (orientation: 'p' | 'l') => {
    setShowOrientationSelector(false);
    setPdfGenerating(true);
    
    downloadCourseAsPDF(courseData, orientation)
      .then(() => setPdfGenerating(false))
      .catch(() => setPdfGenerating(false));
  };

  const isCurrentExerciseCompleted = (): boolean => {
    if (!paragraph || !paragraph.exercise) return true;
    
    const exerciseId = `${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`;
    return exerciseScore[exerciseId] !== undefined && exerciseScore[exerciseId] >= 70;
  };

  const nextParagraph = () => {
    if (!hasSections || !section) return;
    
    if (showExercise) {
      if (!isCurrentExerciseCompleted()) return;
      setShowExercise(false);
    } else if (paragraph?.exercise) {
      setShowExercise(true);
      return;
    }

    if (hasChapters && chapter) {
      // Navigation avec chapitres
      if (currentParagraphIndex < chapter.paragraphs.length - 1) {
        setCurrentParagraphIndex(currentParagraphIndex + 1);
      } else if (currentChapterIndex < section.chapters!.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentParagraphIndex(0);
      } else if (currentSectionIndex < courseData.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentChapterIndex(0);
        setCurrentParagraphIndex(0);
      }
    } else if (section.paragraphs && section.paragraphs.length > 0) {
      // Navigation directe avec paragraphes dans la section
      if (currentParagraphIndex < section.paragraphs.length - 1) {
        setCurrentParagraphIndex(currentParagraphIndex + 1);
      } else if (currentSectionIndex < courseData.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentParagraphIndex(0);
      }
    }
  };

  const prevParagraph = () => {
    if (showExercise) {
      setShowExercise(false);
      return;
    }

    if (!hasSections || !section) return;

    if (hasChapters && chapter) {
      // Navigation avec chapitres
      if (currentParagraphIndex > 0) {
        setCurrentParagraphIndex(currentParagraphIndex - 1);
      } else if (currentChapterIndex > 0) {
        const prevChapter = section.chapters![currentChapterIndex - 1];
        if (prevChapter?.paragraphs?.length) {
          setCurrentChapterIndex(currentChapterIndex - 1);
          setCurrentParagraphIndex(prevChapter.paragraphs.length - 1);
        }
      } else if (currentSectionIndex > 0) {
        const prevSection = courseData.sections[currentSectionIndex - 1];
        if (prevSection?.chapters?.length) {
          setCurrentSectionIndex(currentSectionIndex - 1);
          const lastChapterIndex = prevSection.chapters.length - 1;
          const lastChapter = prevSection.chapters[lastChapterIndex];
          if (lastChapter?.paragraphs?.length) {
            setCurrentChapterIndex(lastChapterIndex);
            setCurrentParagraphIndex(lastChapter.paragraphs.length - 1);
          }
        }
      }
    } else if (section.paragraphs && section.paragraphs.length > 0) {
      // Navigation directe avec paragraphes dans la section
      if (currentParagraphIndex > 0) {
        setCurrentParagraphIndex(currentParagraphIndex - 1);
      } else if (currentSectionIndex > 0) {
        const prevSection = courseData.sections[currentSectionIndex - 1];
        if (prevSection?.paragraphs?.length) {
          setCurrentSectionIndex(currentSectionIndex - 1);
          setCurrentParagraphIndex(prevSection.paragraphs.length - 1);
        }
      }
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setCurrentExerciseAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const submitExercise = () => {
    if (!paragraph?.exercise) return;

    let score = 0;
    const totalQuestions = paragraph.exercise.questions.length;

    paragraph.exercise.questions.forEach((q: ExerciseQuestion, idx: number) => {
      if (currentExerciseAnswers[idx] === q.réponse) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;
    const exerciseId = `${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`;
    setExerciseScore((prev) => ({ ...prev, [exerciseId]: percentage }));

    if (percentage >= 70) {
      setShowExercise(false);
    }
  };

  const handleCertificationClick = () => {
    console.log("Certification requested");
  };

  const handleEvaluationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEvaluation((prev) => ({ ...prev, feedback: e.target.value }));
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluation((prev) => ({ ...prev, submitted: true }));
  };

  interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
  }

  const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (!hasSections || !section) {
    return <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Aucun contenu disponible pour ce cours.</div>;
  }

  const canGoNext = !showExercise || isCurrentExerciseCompleted();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex">
      <CourseSidebar 
        courseData={courseData}
        currentSectionIndex={currentSectionIndex}
        currentChapterIndex={currentChapterIndex}
        currentParagraphIndex={currentParagraphIndex}
        setCurrentSectionIndex={setCurrentSectionIndex}
        setCurrentChapterIndex={setCurrentChapterIndex}
        setCurrentParagraphIndex={setCurrentParagraphIndex}
        setShowExercise={setShowExercise}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-20">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{courseData.title}</h1>
            <p className="text-xl text-purple-600 dark:text-purple-400 mb-6">{courseData.category}</p>
            <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
              <span className="flex items-center"><Eye className="h-5 w-5 mr-2" /> {courseData.views} vues</span>
              <span className="flex items-center"><ThumbsUp className="h-5 w-5 mr-2" /> {courseData.likes} likes</span>
              <span className="flex items-center"><Download className="h-5 w-5 mr-2" /> {courseData.downloads} téléchargements</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-12">
            {!showExercise ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{paragraph?.title || "Titre non disponible"}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">{paragraph?.content || "Contenu non disponible"}</p>
                
                {paragraph?.notions && paragraph.notions.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
                      Notions clés
                    </h3>
                    <ul className="space-y-3">
                      {paragraph.notions.map((notion: string, index: number) => (
                        <li key={index} className="flex items-start bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{notion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-purple-600" />
                  Exercice
                </h2>
                <div className="space-y-8">
                  {paragraph?.exercise?.questions.map((q: ExerciseQuestion, idx: number) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{q.question}</h4>
                      <div className="space-y-3">
                        {q.options.map((option: string, optIdx: number) => (
                          <label key={optIdx} className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              value={option}
                              checked={currentExerciseAnswers[idx] === option}
                              onChange={() => handleAnswerChange(idx, option)}
                              className="form-radio text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={submitExercise}
                    disabled={Object.keys(currentExerciseAnswers).length < (paragraph?.exercise?.questions.length || 0)}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                    type="button"
                  >
                    Soumettre les réponses
                  </button>
                  {exerciseScore[`${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`] !== undefined && (
                    <div className={`p-4 rounded-lg ${
                      exerciseScore[`${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`] >= 70 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      <p className="font-semibold">Score: {exerciseScore[`${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`]}%</p>
                      {exerciseScore[`${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`] >= 70 ? (
                        <p>Félicitations ! Vous pouvez continuer.</p>
                      ) : (
                        <p>Essayez à nouveau pour atteindre au moins 70%.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mb-12">
            <button
              onClick={prevParagraph}
              disabled={currentSectionIndex === 0 && currentChapterIndex === 0 && currentParagraphIndex === 0 && !showExercise}
              className="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Précédent
            </button>
            
            <button
              onClick={nextParagraph}
              disabled={!canGoNext}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
              type="button"
            >
              {showExercise 
                ? <>Continuer <ArrowRight className="h-5 w-5 ml-2" /></>
                : paragraph?.exercise 
                  ? <>Passer à l'exercice <Award className="h-5 w-5 ml-2" /></>
                  : <>Suivant <ArrowRight className="h-5 w-5 ml-2" /></>
              }
            </button>
          </div>
          
          {/* Section de conclusion */}
          {courseCompleted && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
                  <Award className="h-8 w-8 mr-3 text-purple-600" />
                  Conclusion du cours
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                  {courseData.conclusion || "Merci d'avoir suivi ce cours!"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-400 mb-4 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2 text-purple-600" />
                    Ce que vous avez appris
                  </h3>
                  {courseData.learningObjectives && courseData.learningObjectives.length > 0 ? (
                    <ul className="space-y-3">
                      {courseData.learningObjectives.map((objective: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Aucun objectif d'apprentissage n'a été défini pour ce cours.</p>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <Award className="h-6 w-6 mr-2 text-purple-600" />
                    Évaluez ce cours
                  </h3>
                  {!evaluation.submitted ? (
                    <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Notez ce cours (sur 5) :
                        </label>
                        <StarRating rating={evaluation.rating} setRating={(rating: number) => setEvaluation((prev) => ({ ...prev, rating }))} />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Votre feedback :
                        </label>
                        <textarea
                          value={evaluation.feedback}
                          onChange={handleEvaluationChange}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          rows={4}
                          placeholder="Qu'avez-vous pensé de ce cours ?"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Soumettre l'évaluation
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-purple-600 dark:text-purple-400 font-semibold">
                      Merci pour votre évaluation !
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleCertificationClick}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                  type="button"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Obtenir votre certification
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                  disabled={pdfGenerating}
                  type="button"
                >
                  {pdfGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Télécharger en PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <OrientationSelector 
        isOpen={showOrientationSelector} 
        onSelect={handleOrientationSelect} 
        onClose={() => setShowOrientationSelector(false)} 
      />
    </div>
  );
};

export default Course;