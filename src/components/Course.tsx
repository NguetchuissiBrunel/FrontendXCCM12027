// src/components/Course.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Eye, ThumbsUp, Download, Award, ArrowRight, CheckCircle, ArrowLeft, BookOpen, Layout, BookUp, Tv, FileText } from "lucide-react";
import { downloadCourseAsPDF } from "@/utils/DownloadPdf";
import { downloadCourseAsDocx } from "@/utils/DownloadDocx";
import { downloadCertificationPDF } from "@/utils/DownloadCertification";
import CourseSidebar from "@/components/CourseSidebar";
import SmartNotes from "@/components/SmartNotes";
import DownloadOptions from './DownloadOptions';
import { CourseData, Section, Chapter, Paragraph, QuestionData } from "@/types/course";
import { toast } from "react-hot-toast";
import EnrollmentButton from '@/components/EnrollmentButton';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';
import Link from 'next/link';
import CourseContentRenderer from './CourseContentRenderer';
import confetti from 'canvas-confetti';
import TeacherLink from '@/components/TeacherLink';


interface CourseProps {
  courseData: CourseData;
  incrementLike: (id: number) => Promise<void>;
  incrementDownload: (id: number) => Promise<void>;
}

const Course: React.FC<CourseProps> = ({ courseData, incrementLike, incrementDownload }) => {
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [exerciseScore, setExerciseScore] = useState<{ [key: string]: number }>({});
  const [showExercise, setShowExercise] = useState<boolean>(false);
  const [courseCompleted, setCourseCompleted] = useState<boolean>(false);
  const [currentExerciseAnswers, setCurrentExerciseAnswers] = useState<{ [key: number]: string }>({});
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [docxGenerating, setDocxGenerating] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isCertifying, setIsCertifying] = useState<boolean>(false);
  const [currentExerciseLevel, setCurrentExerciseLevel] = useState<'section' | 'chapter' | 'paragraph' | null>(null);
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
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (pdfGenerating || docxGenerating || isLiking || isCertifying) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [pdfGenerating, docxGenerating, isLiking, isCertifying, startLoading, stopLoading]);

  // Scroll to top when topic changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex, currentChapterIndex, currentParagraphIndex, showExercise]);

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
    if (chapter?.paragraphs?.length && currentParagraphIndex < chapter.paragraphs.length) {
      return chapter.paragraphs[currentParagraphIndex];
    }

    // Fallback to direct section paragraphs if chapter is missing or empty
    const section = getCurrentSection();
    if (section?.paragraphs?.length && currentParagraphIndex < section.paragraphs.length) {
      return section.paragraphs[currentParagraphIndex];
    }

    return null;
  };

  const section = getCurrentSection();
  const chapter = getCurrentChapter();
  const paragraph = getCurrentParagraph();

  const hasSections = courseData?.sections?.length > 0;
  const hasChapters = Boolean(section?.chapters?.length);
  const hasParagraphs = Boolean(chapter?.paragraphs?.length);

  // Course completion is now handled manually by clicking "Next" on the very last thing.
  // This prevents the conclusion from showing prematurely.

  const handleDownloadPDF = () => {
    setShowOrientationSelector(true);
  };

  const handleOrientationSelect = async (orientation: 'p' | 'l') => {
    setPdfGenerating(true);

    try {
      await incrementDownload(courseData.id);
      await downloadCourseAsPDF(courseData, orientation);
      setPdfGenerating(false);
      setShowDownloadModal(false);
    } catch (error) {
      console.error("Error generating PDF or incrementing count:", error);
      setPdfGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    setDocxGenerating(true);
    try {
      await incrementDownload(courseData.id);
      await downloadCourseAsDocx(courseData);
      setDocxGenerating(false);
      setShowDownloadModal(false);
    } catch (error) {
      console.error("Error generating DOCX or incrementing count:", error);
      setDocxGenerating(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await incrementLike(courseData.id);

      // Wow factor: Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });

      toast.success("Cours ajouté à vos favoris !");
    } catch (error) {
      console.error("Error liking course:", error);
      toast.error("Impossible d'aimer ce cours");
    } finally {
      setIsLiking(false);
    }
  };

  const isCurrentExerciseCompleted = (): boolean => {
    // Current active exercise based on currentExerciseLevel
    let activeExercise: any = null;
    let exerciseId = "";

    if (currentExerciseLevel === 'paragraph' && paragraph) {
      activeExercise = paragraph.exercise;
      exerciseId = `p-${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`;
    } else if (currentExerciseLevel === 'chapter' && chapter) {
      activeExercise = chapter.exercise;
      exerciseId = `c-${currentSectionIndex}-${currentChapterIndex}`;
    } else if (currentExerciseLevel === 'section' && section) {
      activeExercise = section.exercise;
      exerciseId = `s-${currentSectionIndex}`;
    }

    if (!activeExercise && !paragraph?.exerciseContent && !chapter?.exerciseContent && !section?.exerciseContent) return true;

    // If it's a free-form exercise (exerciseContent), we consider it completed once opened then next is clicked
    // unless there are questions.
    if (!activeExercise?.questions?.length) return true;

    return exerciseScore[exerciseId] !== undefined && exerciseScore[exerciseId] >= 70;
  };

  const nextParagraph = () => {
    if (!hasSections || !section) return;

    if (showExercise) {
      if (!isCurrentExerciseCompleted()) return;
      setShowExercise(false);
      setCurrentExerciseLevel(null);

      // Move to next item after completing an exercise
      if (currentExerciseLevel === 'paragraph') {
        // If we completed paragraph exercise, move to next item
        proceedToNextAfterParagraph();
      } else if (currentExerciseLevel === 'chapter') {
        // If we completed chapter exercise, move to next chapter or section exercise
        proceedToNextAfterChapter();
      } else if (currentExerciseLevel === 'section') {
        // If we completed section exercise, move to next section
        proceedToNextAfterSection();
      }
      return;
    }

    // Check if current level has an exercise before moving on
    if (paragraph?.exercise || paragraph?.exerciseContent) {
      setCurrentExerciseLevel('paragraph');
      setShowExercise(true);
      return;
    }

    proceedToNextAfterParagraph();
  };

  const proceedToNextAfterParagraph = () => {
    if (hasChapters && chapter) {
      if (currentParagraphIndex < chapter.paragraphs.length - 1) {
        setCurrentParagraphIndex(currentParagraphIndex + 1);
      } else {
        // End of paragraphs in chapter - check chapter exercise
        if (chapter.exercise || chapter.exerciseContent) {
          setCurrentExerciseLevel('chapter');
          setShowExercise(true);
        } else {
          proceedToNextAfterChapter();
        }
      }
    } else if (section?.paragraphs && section.paragraphs.length > 0) {
      if (currentParagraphIndex < section.paragraphs.length - 1) {
        setCurrentParagraphIndex(currentParagraphIndex + 1);
      } else {
        // End of section paragraphs - check section exercise
        if (section.exercise || section.exerciseContent) {
          setCurrentExerciseLevel('section');
          setShowExercise(true);
        } else {
          proceedToNextAfterSection();
        }
      }
    }
  };

  const proceedToNextAfterChapter = () => {
    if (section && currentChapterIndex < section.chapters!.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentParagraphIndex(0);
    } else {
      // End of chapters in section - check section exercise
      if (section && (section.exercise || section.exerciseContent)) {
        setCurrentExerciseLevel('section');
        setShowExercise(true);
      } else {
        proceedToNextAfterSection();
      }
    }
  };

  const proceedToNextAfterSection = () => {
    if (currentSectionIndex < courseData.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentChapterIndex(0);
      setCurrentParagraphIndex(0);
    } else {
      // Very end of course
      setCourseCompleted(true);
      // Ensure we scroll to top to see conclusion
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevParagraph = () => {
    setCourseCompleted(false);
    if (showExercise) {
      setShowExercise(false);
      return;
    }

    if (!hasSections || !section) return;

    // 1. Same Chapter back nav
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(currentParagraphIndex - 1);
      return;
    }

    // 2. Cross Chapter back nav (current chapter is at index 0)
    if (currentChapterIndex > 0) {
      const prevChapter = section.chapters![currentChapterIndex - 1];
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentParagraphIndex((prevChapter.paragraphs?.length || 1) - 1);
      return;
    }

    // 3. Cross Section back nav (current section start)
    if (currentSectionIndex > 0) {
      const prevSection = courseData.sections[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);

      if (prevSection.chapters?.length) {
        // Go to last paragraph of last chapter
        const lastChapterIdx = prevSection.chapters.length - 1;
        const lastChapter = prevSection.chapters[lastChapterIdx];
        setCurrentChapterIndex(lastChapterIdx);
        setCurrentParagraphIndex((lastChapter.paragraphs?.length || 1) - 1);
      } else {
        // Go to last paragraph of section
        setCurrentChapterIndex(0);
        setCurrentParagraphIndex((prevSection.paragraphs?.length || 1) - 1);
      }
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setCurrentExerciseAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const submitExercise = () => {
    let activeExercise: any = null;
    let exerciseId = "";

    if (currentExerciseLevel === 'paragraph' && paragraph) {
      activeExercise = paragraph.exercise;
      exerciseId = `p-${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`;
    } else if (currentExerciseLevel === 'chapter' && chapter) {
      activeExercise = chapter.exercise;
      exerciseId = `c-${currentSectionIndex}-${currentChapterIndex}`;
    } else if (currentExerciseLevel === 'section' && section) {
      activeExercise = section.exercise;
      exerciseId = `s-${currentSectionIndex}`;
    }

    if (!activeExercise) return;

    let score = 0;
    const totalQuestions = activeExercise.questions.length;

    activeExercise.questions.forEach((q: QuestionData, idx: number) => {
      if (currentExerciseAnswers[idx] === (q as any).réponse) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;
    setExerciseScore((prev) => ({ ...prev, [exerciseId]: percentage }));

    if (percentage >= 70) {
      toast.success("Félicitations ! Exercice réussi.");
      // setShowExercise(false); // Let user see result before clicking next
    } else {
      toast.error("Veuisillez réessayer pour atteindre au moins 70%.");
    }
  };

  const handleCertificationClick = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour obtenir un certificat.");
      return;
    }

    setIsCertifying(true);
    const toastId = toast.loading("Génération de votre certificat...");
    
    try {
      const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Étudiant XCCM";
      const success = await downloadCertificationPDF(courseData, studentName);
      
      if (success) {
        toast.success("Certificat généré avec succès !", { id: toastId });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A855F7', '#8B5CF6', '#D946EF']
        });
      } else {
        toast.error("Échec de la génération du certificat.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue.", { id: toastId });
    } finally {
      setIsCertifying(false);
    }
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border-2 border-dashed border-purple-200 dark:border-purple-900/30 text-center">
            {/* Icône avec animation */}
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-100 to-white dark:from-gray-700 dark:to-gray-800 w-32 h-32 rounded-full flex items-center justify-center shadow-xl">
                <BookOpen className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {/* Titre */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ce cours est en cours de préparation
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Le contenu de ce cours n'est pas encore disponible. Notre équipe pédagogique travaille activement à sa création pour vous offrir la meilleure expérience d'apprentissage possible.
            </p>

            {/* Informations supplémentaires */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-8">
              <div className="flex items-start justify-center text-left max-w-md mx-auto">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Que faire en attendant ?</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Explorez d'autres cours disponibles dans la bibliothèque</li>
                    <li>• Revenez plus tard pour découvrir le nouveau contenu</li>
                    <li>• Inscrivez-vous pour être notifié de sa publication</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/bibliotheque">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Retour à la bibliothèque
                </button>
              </Link>

              <EnrollmentButton
                courseId={courseData.id}
                size="md"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getActiveExercise = () => {
    if (currentExerciseLevel === 'paragraph' && paragraph) return { exercise: paragraph.exercise, content: paragraph.exerciseContent, id: `p-${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}` };
    if (currentExerciseLevel === 'chapter' && chapter) return { exercise: chapter.exercise, content: chapter.exerciseContent, id: `c-${currentSectionIndex}-${currentChapterIndex}` };
    if (currentExerciseLevel === 'section' && section) return { exercise: section.exercise, content: section.exerciseContent, id: `s-${currentSectionIndex}` };
    return null;
  };

  const currentExercise = getActiveExercise();

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
        setCourseCompleted={setCourseCompleted}
        onDownloadRequest={() => setShowDownloadModal(true)}
      />

      {courseData.author?.id && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Par</p>
          <TeacherLink
            teacherId={String(courseData.author.id)}
            teacherName={courseData.author.name}
            teacherPhoto={courseData.author.image}
          />
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-20">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{courseData.title}</h1>
              <p className="text-xl text-purple-600 dark:text-purple-400 mb-4">{courseData.category}</p>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <span className="flex items-center"><Eye className="h-5 w-5 mr-2" /> {courseData.viewCount} vues</span>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center hover:text-red-500 transition-colors cursor-pointer group"
                >
                  <ThumbsUp className={`h-5 w-5 mr-2 ${isLiking ? 'animate-pulse text-red-400' : 'group-hover:scale-110 transition-transform'}`} />
                  {courseData.likeCount} likes
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center hover:text-purple-500 transition-colors cursor-pointer group"
                >
                  <Download className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  {courseData.downloadCount} téléchargements
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-12">
            {!showExercise ? (
              <>
                {/* Hierarchical Breadcrumbs / Titles */}
                <div className="mb-1 space-y-4">
                  {/* Title Section */}
                  <div className="space-y-3">
                    <h2 className="text-4xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight">
                      {section?.title}
                    </h2>
                    {section?.introduction && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border-l-4 border-purple-500">
                        <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">{section.introduction}</p>
                      </div>
                    )}
                  </div>

                  {/* Title Chapter */}
                  {chapter && (
                    <div className="space-y-3 ml-4 border-l-2 border-green-100 dark:border-green-900/30 pl-6">
                      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {chapter.title}
                      </h3>
                      {chapter?.introduction && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border-l-4 border-green-500">
                          <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">{chapter.introduction}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title Paragraph */}
                  <div className="space-y-3 ml-8 border-l-2 border-orange-100 dark:border-orange-900/30 pl-6">
                    <h4 className="text-xl font-semibold text-orange-600 dark:text-orange-400 pb-2 border-b border-orange-100 dark:border-orange-900/30">
                      {paragraph?.title || "Titre non disponible"}
                    </h4>
                    {paragraph?.introduction && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border-l-4 border-amber-500">
                        <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">{paragraph.introduction}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-8 border-l-2 border-transparent pl-6">
                  {paragraph?.content ? (
                    <div className="mb-8">
                      <CourseContentRenderer content={paragraph.content} />
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">Contenu non disponible</p>
                  )}

                  {paragraph?.notions && paragraph.notions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                          <BookOpen className="h-5 w-5 text-red-600" />
                        </div>
                        Notions
                      </h3>
                      <ul className="space-y-3">
                        {paragraph.notions.map((notion: string, index: number) => (
                          <li key={index} className="flex items-start bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{notion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Award className="h-7 w-7 mr-3 text-indigo-600" />
                  Exercice : {currentExercise?.exercise?.title || "Application"}
                </h2>

                {currentExercise?.content && (
                  <div className="mb-10 prose dark:prose-invert max-w-none qcm-content">
                    <CourseContentRenderer content={currentExercise.content} />
                  </div>
                )}

                {currentExercise?.exercise?.questions && currentExercise.exercise.questions.length > 0 && (
                  <div className="space-y-8">
                    {currentExercise.exercise.questions.map((q: QuestionData, idx: number) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{q.text}</h4>
                        <div className="space-y-3">
                          {q.options && q.options.length > 0 ? (
                            q.options.map((option: string, optIdx: number) => (
                              <label 
                                key={optIdx} 
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                  currentExerciseAnswers[idx] === option 
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10 shadow-sm' 
                                    : 'border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900/30 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                              >
                                <div className="flex items-center h-5">
                                  <input
                                    type="radio"
                                    name={`question-${idx}`}
                                    value={option}
                                    checked={currentExerciseAnswers[idx] === option}
                                    onChange={() => handleAnswerChange(idx, option)}
                                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                                  />
                                </div>
                                <span className={`ml-3 transition-colors duration-200 ${
                                  currentExerciseAnswers[idx] === option 
                                    ? 'text-purple-700 dark:text-purple-300 font-medium' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {String.fromCharCode(97 + optIdx)}) {option}
                                </span>
                              </label>
                            ))
                          ) : (
                            <textarea
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                              rows={3}
                              placeholder="Votre réponse..."
                              value={currentExerciseAnswers[idx] || ""}
                              onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitExercise}
                      disabled={Object.keys(currentExerciseAnswers).length < (currentExercise.exercise.questions.length || 0)}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-bold text-lg"
                      type="button"
                    >
                      Valider mes réponses
                    </button>
                    {currentExercise.id && exerciseScore[currentExercise.id] !== undefined && (
                      <div className={`mt-6 p-6 rounded-xl border-2 ${exerciseScore[currentExercise.id] >= 70
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300'
                        }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Award className={`h-6 w-6 ${exerciseScore[currentExercise.id] >= 70 ? 'text-green-600' : 'text-red-600'}`} />
                          <h4 className="text-xl font-bold">Résultat : {exerciseScore[currentExercise.id]}%</h4>
                        </div>
                        {exerciseScore[currentExercise.id] >= 70 ? (
                          <p className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Excellent ! Vous maîtrisez cette notion. Vous pouvez passer à la suite.
                          </p>
                        ) : (
                          <p>N'ayez crainte ! Relisez le cours et essayez à nouveau pour atteindre les 70% requis.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
              disabled={!canGoNext || courseCompleted}
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
                    Aperçu du cours
                  </h3>
                  {(courseData.introduction || (courseData.sections && courseData.sections.length > 0)) ? (
                    <div className="space-y-4">
                      {courseData.introduction && (
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white mb-2">Description</h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {courseData.introduction}
                          </p>
                        </div>
                      )}

                      {courseData.sections && courseData.sections.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white mb-2 mt-4">Plan du cours</h4>
                          <ul className="space-y-2">
                            {courseData.sections.map((section: Section, index: number) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{section.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
                  disabled={isCertifying}
                  className={`bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center ${isCertifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 active:scale-95'}`}
                  type="button"
                >
                  <Award className={`h-7 w-7 mr-2 ${isCertifying ? 'animate-spin' : ''}`} />
                  {isCertifying ? 'Génération...' : 'Obtenir votre certification'}
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-5 rounded-3xl font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                  type="button"
                >
                  <Download size={24} />
                  Télécharger le cours
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SmartNotes courseId={courseData.id} courseTitle={courseData.title} />
      <DownloadOptions
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onSelectPdf={handleOrientationSelect}
        onSelectWord={handleDownloadDocx}
        isPdfLoading={pdfGenerating}
        isWordLoading={docxGenerating}
      />
    </div>
  );
};

export default Course;
