// src/components/Course.tsx
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Eye, ThumbsUp, Download, Award, ArrowRight, CheckCircle, ArrowLeft, BookOpen, Layout, FileText, Check, Heart } from "lucide-react";
import { downloadCourseAsPDF } from "@/utils/DownloadPdf";
import { downloadCourseAsDocx } from "@/utils/DownloadDocx";
import { downloadCertificationPDF } from "@/utils/DownloadCertification";
import CourseSidebar from "@/components/CourseSidebar";
import SmartNotes from "@/components/SmartNotes";
import CourseComments from "@/components/CourseComments";
import DownloadOptions from './DownloadOptions';
import { CourseData, Section, Chapter, Paragraph, QuestionData, NotionContentData, SubItem } from "@/types/course";
import { toast } from "react-hot-toast";
import EnrollmentButton from '@/components/EnrollmentButton';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import CourseContentRenderer from './CourseContentRenderer';
import confetti from 'canvas-confetti';
import TeacherLink from '@/components/TeacherLink';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useTranslations } from 'next-intl';

interface CourseProps {
  courseData: CourseData;
  isLiked: boolean;
  likeCount?: number;
  toggleLike: (id: number) => Promise<void>;
  incrementDownload: (id: number) => Promise<void>;
}

interface Step {
  type: 'section_intro' | 'chapter_intro' | 'paragraph' | 'exercise_level' | 'conclusion';
  s: number;
  c: number;
  p: number;
  exIdx: number;
  exL: 'section' | 'chapter' | 'paragraph' | null;
  comp: boolean;
}

const notionLabel = 'Notion';

const normalizeNotionData = (notionData: string | NotionContentData): NotionContentData => {
  if (typeof notionData === 'string') {
    return {
      title: notionLabel,
      plainText: notionData,
    };
  }

  return notionData;
};

const renderParagraphNotions = (subItems?: SubItem[]) => {
  const notionItems = subItems?.filter((item): item is Extract<SubItem, { type: 'notion' }> => item.type === 'notion') ?? [];

  if (notionItems.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {notionItems.map((item, idx) => {
        const notionData = normalizeNotionData(item.data);
        const notionKey = notionData.id ?? `${notionData.title}-${idx}`;

        return (
          <div key={notionKey} className="rounded-2xl border border-red-100 bg-red-50/70 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
            <div className="mb-3 text-xs font-black uppercase tracking-wide text-red-600 dark:text-red-300">
              {notionData.title || notionLabel}
            </div>
            {notionData.content ? (
              <CourseContentRenderer content={notionData.content} notionTitle={notionData.title || notionLabel} />
            ) : notionData.plainText ? (
              <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300">{notionData.plainText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const Course: React.FC<CourseProps> = ({ courseData, isLiked, likeCount, toggleLike, incrementDownload }) => {
  const t = useTranslations('pages.course');
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [exerciseScore, setExerciseScore] = useState<{ [key: string]: number }>({});
  const [currentExerciseAnswers, setCurrentExerciseAnswers] = useState<{ [key: number]: string }>({});
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [docxGenerating, setDocxGenerating] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isCertifying, setIsCertifying] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState({ rating: 0, feedback: "", submitted: false });

  // Local like state for instant reactive UI (no page reload needed)
  const [localIsLiked, setLocalIsLiked] = useState<boolean>(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState<number>(likeCount ?? courseData.likeCount ?? 0);

  // Sync with prop changes (e.g. initial load)
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalLikeCount(likeCount ?? courseData.likeCount ?? 0);
  }, [likeCount, courseData.likeCount]);

  const { isEnrolled, loading: enrollmentLoading, updateProgress: updateCourseProgress, progress: savedProgress, enrollment } = useEnrollment(courseData.id);

  const isStudent = user?.role?.includes('student');
  const canDownload = !isStudent || (isEnrolled && enrollment?.status === 'APPROVED');

  // --- Step Generation (unchanged logic) ---
  const steps = useMemo(() => {
    if (!courseData?.sections?.length) return [];
    const s: Step[] = [];
    courseData.sections.forEach((sec: Section, sIdx: number) => {
      s.push({ type: 'section_intro', s: sIdx, c: 0, p: 0, exIdx: 0, exL: null, comp: false });
      const chapters = sec.chapters || [];
      if (chapters.length > 0) {
        chapters.forEach((chap: Chapter, cIdx: number) => {
          s.push({ type: 'chapter_intro', s: sIdx, c: cIdx, p: 0, exIdx: 0, exL: null, comp: false });
          const paragraphs = chap.paragraphs || [];
          paragraphs.forEach((para: Paragraph, pIdx: number) => {
            s.push({ type: 'paragraph', s: sIdx, c: cIdx, p: pIdx, exIdx: 0, exL: null, comp: false });
          });
          if (chap.exercises?.length || chap.exercise || chap.exerciseContent) {
            s.push({ type: 'exercise_level', s: sIdx, c: cIdx, p: (chap.paragraphs?.length || 1) - 1, exIdx: 0, exL: 'chapter', comp: false });
          }
        });
      } else if (sec.paragraphs?.length) {
        sec.paragraphs.forEach((para: Paragraph, pIdx: number) => {
          s.push({ type: 'paragraph', s: sIdx, c: 0, p: pIdx, exIdx: 0, exL: null, comp: false });
        });
      }
      if (sec.exercises?.length || sec.exercise || sec.exerciseContent) {
        s.push({ type: 'exercise_level', s: sIdx, c: Math.max(0, (sec.chapters?.length || 1) - 1), p: 0, exIdx: 0, exL: 'section', comp: false });
      }
    });
    s.push({ type: 'conclusion', s: (courseData.sections.length || 1) - 1, c: 0, p: 0, exIdx: 0, exL: null, comp: true });
    return s;
  }, [courseData]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const { s: currentSectionIndex, c: currentChapterIndex, p: currentParagraphIndex, exL: currentExerciseLevel, comp: courseCompleted } = currentStep;
  const showExercise = currentStep.type === 'exercise_level';
  const currentExerciseIndex = currentStep.exIdx;

  const getProgressPercentage = () => {
    if (steps.length <= 1) return courseCompleted ? 100 : 0;
    return Math.round((currentStepIndex / (steps.length - 1)) * 100);
  };

  // Effects (unchanged)
  useEffect(() => {
    if (isEnrolled && !enrollmentLoading && !isInitialized && steps.length > 0) {
      if (savedProgress > 0) {
        const restoredIndex = Math.round((savedProgress / 100) * (steps.length - 1));
        setCurrentStepIndex(Math.min(restoredIndex, steps.length - 1));
      }
      setIsInitialized(true);
    }
  }, [isEnrolled, enrollmentLoading, savedProgress, steps.length, isInitialized]);

  useEffect(() => {
    if (isEnrolled && !enrollmentLoading && isInitialized) {
      updateCourseProgress(getProgressPercentage());
    }
  }, [currentStepIndex, isEnrolled, enrollmentLoading, isInitialized]);

  // NB: le téléchargement (PDF/DOCX), la certification et le like ne déclenchent
  // PAS le loader global de route. Sinon la page parente (CoursePage) retourne
  // null tant que globalLoading est vrai, ce qui démonte tout le cours et le
  // remonte à zéro (effet « rechargement complet » pendant la génération).
  // Ces actions ont déjà leur propre indicateur local : le modal de
  // téléchargement (isPdfLoading/isWordLoading) et le bouton certif (t('generating')).

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex]);

  // Helpers
  const section = courseData.sections?.[currentSectionIndex];
  const chapter = section?.chapters?.[currentChapterIndex];
  const paragraph = chapter ? chapter.paragraphs?.[currentParagraphIndex] : section?.paragraphs?.[currentParagraphIndex];

  const getExercisesAtCurrentLevel = () => {
    if (currentExerciseLevel === 'chapter' && chapter) return (chapter.exercises || (chapter.exercise ? [chapter.exercise] : []));
    if (currentExerciseLevel === 'section' && section) return (section.exercises || (section.exercise ? [section.exercise] : []));
    return [];
  };

  const isCurrentStepCompleted = (): boolean => {
    if (!showExercise) return true;
    const activeExercises = getExercisesAtCurrentLevel();
    const activeExercise = activeExercises[currentExerciseIndex];
    if (!activeExercise?.questions?.length) return true;
    const id = currentExerciseLevel === 'chapter' ? `c-${currentSectionIndex}-${currentChapterIndex}-${currentExerciseIndex}` : `s-${currentSectionIndex}-${currentExerciseIndex}`;
    return (exerciseScore[id] || 0) >= 70;
  };

  const nextStep = () => {
    if (!isCurrentStepCompleted()) return;
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentExerciseAnswers({});
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentExerciseAnswers({});
    }
  };

  const navigateToParagraph = (sIdx: number, cIdx: number, pIdx: number) => {
    const idx = steps.findIndex((st: Step) => st.s === sIdx && st.c === cIdx && st.p === pIdx && st.type === 'paragraph');
    if (idx !== -1) setCurrentStepIndex(idx);
    else {
      const idxAlt = steps.findIndex((st: Step) => st.s === sIdx && st.p === pIdx && st.type === 'paragraph');
      if (idxAlt !== -1) setCurrentStepIndex(idxAlt);
    }
  };

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isLiking) return;
    setIsLiking(true);
    // Optimistic local update — instant UI feedback, no page reload
    const willLike = !localIsLiked;
    setLocalIsLiked(willLike);
    setLocalLikeCount((prev: number) => willLike ? prev + 1 : Math.max(0, prev - 1));
    try {
      await toggleLike(courseData.id);
      if (willLike) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      // Rollback on error
      setLocalIsLiked(!willLike);
      setLocalLikeCount((prev: number) => willLike ? Math.max(0, prev - 1) : prev + 1);
    } finally { setIsLiking(false); }
  };

  // Le modal se ferme immédiatement et la génération se fait en arrière-plan.
  // Retour utilisateur via toast (le PDF/DOCX est produit côté client, ça peut
  // prendre quelques secondes selon le cours).
  const handleOrientationSelect = (orientation: 'p' | 'l') => {
    setShowDownloadModal(false);
    setPdfGenerating(true);
    const toastId = toast.loading('Génération du PDF en cours…');
    (async () => {
      try {
        await incrementDownload(courseData.id);
        const ok = await downloadCourseAsPDF(courseData, orientation);
        if (ok) toast.success('PDF téléchargé', { id: toastId });
        else toast.error('Échec de la génération du PDF', { id: toastId });
      } catch (e) {
        toast.error('Échec de la génération du PDF', { id: toastId });
      } finally { setPdfGenerating(false); }
    })();
  };

  const handleDownloadDocx = () => {
    setShowDownloadModal(false);
    setDocxGenerating(true);
    const toastId = toast.loading('Génération du document Word en cours…');
    (async () => {
      try {
        await incrementDownload(courseData.id);
        await downloadCourseAsDocx(courseData);
        toast.success('Document Word téléchargé', { id: toastId });
      } catch (e) {
        toast.error('Échec de la génération du document', { id: toastId });
      } finally { setDocxGenerating(false); }
    })();
  };

  const handleCertificationClick = async () => {
    if (!user) {
      toast.error(t('loginForCert'));
      return;
    }
    const isStudent = user?.role?.includes('student');
    if (isStudent && !isEnrolled) {
      // 🔧 Missing key: add 'enrollToCertify' to translation files
      toast.error(t('enrollToCertify') || 'You must be enrolled to get a certificate.');
      return;
    }
    setIsCertifying(true);
    try {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || t('studentStr');
      await downloadCertificationPDF(courseData, name);
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    } catch (e) { }
    finally { setIsCertifying(false); }
  };

  const handleAnswerChange = (idx: number, val: string) => setCurrentExerciseAnswers((p: any) => ({ ...p, [idx]: val }));

  const submitExercise = () => {
    const active = getExercisesAtCurrentLevel()[currentExerciseIndex];
    if (!active?.questions) return;
    let score = 0;
    active.questions.forEach((q: any, i: number) => { if (currentExerciseAnswers[i] === q.réponse) score++; });
    const pct = (score / active.questions.length) * 100;
    const id = currentExerciseLevel === 'chapter' ? `c-${currentSectionIndex}-${currentChapterIndex}-${currentExerciseIndex}` : `s-${currentSectionIndex}-${currentExerciseIndex}`;
    setExerciseScore(p => ({ ...p, [id]: pct }));
    if (pct >= 70) toast.success(t('congratulations'));
    else toast.error(t('tryAgain'));
  };

  const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </div>
  );

  // --- Render ---
  if (courseCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        <CourseSidebar
          courseData={courseData}
          currentSectionIndex={currentSectionIndex}
          currentChapterIndex={currentChapterIndex}
          currentParagraphIndex={currentParagraphIndex}
          setCurrentSectionIndex={(idx) => navigateToParagraph(idx, 0, 0)}
          setCurrentChapterIndex={(idx) => navigateToParagraph(currentSectionIndex, idx, 0)}
          setCurrentParagraphIndex={(idx) => navigateToParagraph(currentSectionIndex, currentChapterIndex, idx)}
          setShowExercise={() => { }}
          setCourseCompleted={() => { }}
          onDownloadRequest={() => {
            if (!canDownload) {
              const msg = isStudent && enrollment?.status === 'PENDING'
                ? (t('pendingEnrollment') || 'Your enrollment is pending validation.')
                : (t('enrollToDownload') || 'You must be enrolled to download this course.');
              toast.error(msg);
              return;
            }
            setShowDownloadModal(true);
          }}
          isEnrolled={canDownload}
        />
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border-t-8 border-purple-600">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t('courseCompletionTitle') || 'Congratulations!'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('courseCompletedMessage', { title: courseData.title }) || `Course completed: ${courseData.title}`}
            </p>
            <button
              onClick={handleCertificationClick}
              disabled={isCertifying || !canDownload}
              className={`w-full py-4 rounded-xl font-bold transition-all mb-8 ${!canDownload
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                }`}
              title={!canDownload ? (t('enrollToCertify') || 'Enroll to get this certificate') : t('getCert')}
            >
              {isCertifying ? t('generating') : t('getCert')}
            </button>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 text-left">
              <h3 className="font-bold mb-2">{t('reviewTitle') || 'Review'}</h3>
              {!evaluation.submitted ? (
                <div className="space-y-4">
                  <StarRating rating={evaluation.rating} setRating={r => setEvaluation(p => ({ ...p, rating: r }))} />
                  <textarea
                    value={evaluation.feedback}
                    onChange={e => setEvaluation(p => ({ ...p, feedback: e.target.value }))}
                    className="w-full p-3 rounded-lg border dark:bg-gray-800"
                    rows={3}
                    placeholder={t('feedbackPlaceholder')}
                  />
                  <button onClick={() => setEvaluation(p => ({ ...p, submitted: true }))} className="w-full py-2 bg-gray-800 text-white rounded-lg">
                    {t('submitRating')}
                  </button>
                </div>
              ) : (
                <p className="text-green-600 font-bold">{t('thanksFeedback')}</p>
              )}
            </div>
          </div>
        </div>
        <DownloadOptions isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} onSelectPdf={handleOrientationSelect} onSelectWord={handleDownloadDocx} isPdfLoading={pdfGenerating} isWordLoading={docxGenerating} />
      </div>
    );
  }

  if (!section) return null;

  const currentExercise = showExercise ? getExercisesAtCurrentLevel()[currentExerciseIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      <CourseSidebar
        courseData={courseData}
        currentSectionIndex={currentSectionIndex}
        currentChapterIndex={currentChapterIndex}
        currentParagraphIndex={currentParagraphIndex}
        setCurrentSectionIndex={(idx) => navigateToParagraph(idx, 0, 0)}
        setCurrentChapterIndex={(idx) => navigateToParagraph(currentSectionIndex, idx, 0)}
        setCurrentParagraphIndex={(idx) => navigateToParagraph(currentSectionIndex, currentChapterIndex, idx)}
        setShowExercise={() => { }}
        setCourseCompleted={() => { }}
        onDownloadRequest={() => {
          if (!canDownload) {
            const msg = isStudent && enrollment?.status === 'PENDING'
              ? (t('pendingEnrollment') || 'Your enrollment is pending validation.')
              : (t('enrollToDownload') || 'You must be enrolled to download this course.');
            toast.error(msg);
            return;
          }
          setShowDownloadModal(true);
        }}
        isEnrolled={canDownload}
      />

      <div ref={scrollContainerRef} className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-16">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{courseData.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{courseData.viewCount} {t('views')}</span>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1.5 transition-all duration-200 ${localIsLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${localIsLiked ? 'fill-current scale-110' : ''} ${isLiking ? 'animate-pulse' : ''}`}
                  strokeWidth={1.5}
                />
                {localLikeCount} {t('likes')}
              </button>
              <TeacherLink teacherId={String(courseData.author?.id)} teacherName={courseData.author?.name} teacherPhoto={courseData.author?.image} />
            </div>
          </div>

          <div className="sticky top-20 z-20 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black uppercase text-purple-600">{t('progressLabel') || 'Progress'}</span>
              <span className="text-lg font-black text-purple-600">{getProgressPercentage()}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 transition-all duration-700" style={{ width: `${getProgressPercentage()}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 md:p-10 mb-10 min-h-[60vh]">
            {!showExercise ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-[40px] font-black text-[#8B5CF6] mb-4 leading-tight">{section.title}</h2>
                  {(currentStep.type === 'section_intro' || currentStep.type === 'chapter_intro' || currentStep.type === 'paragraph') && section.introduction && (
                    <div className="text-[18px] leading-relaxed text-gray-700 dark:text-gray-300 italic mb-8">{section.introduction}</div>
                  )}

                  {chapter && (
                    <div className="ml-4 pl-4 border-l-4 border-[#10B981] mb-8">
                      <h3 className="text-[30px] font-bold text-[#10B981] mb-2 leading-tight">{chapter.title}</h3>
                      {(currentStep.type === 'chapter_intro' || currentStep.type === 'paragraph') && chapter.introduction && (
                        <div className="text-[17px] leading-relaxed text-gray-800 dark:text-gray-300 italic mb-4">{chapter.introduction}</div>
                      )}

                      {currentStep.type === 'paragraph' && paragraph && (
                        <div className="ml-4 pl-4 border-l-4 border-[#F97316]">
                          <h4 className="text-[25px] font-bold text-[#F97316] mb-4 leading-tight">{paragraph.title}</h4>
                          {paragraph.introduction && <div className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-400 italic mb-6">{paragraph.introduction}</div>}
                          <div className="mt-4"><CourseContentRenderer content={paragraph.content} /></div>
                          {renderParagraphNotions(paragraph.subItems)}
                        </div>
                      )}
                    </div>
                  )}

                  {!chapter && currentStep.type === 'paragraph' && paragraph && (
                    <div className="ml-4 pl-4 border-l-4 border-[#F97316]">
                      <h4 className="text-[25px] font-bold text-[#F97316] mb-4 leading-tight">{paragraph.title}</h4>
                      {paragraph.introduction && <div className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-400 italic mb-6">{paragraph.introduction}</div>}
                      <div className="mt-4"><CourseContentRenderer content={paragraph.content} /></div>
                      {renderParagraphNotions(paragraph.subItems)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Award /> {currentExercise?.title || t('exerciseLabel', { title: '' })}
                </h2>
                {currentExercise && 'content' in currentExercise && currentExercise.content && (
                  <div className="mb-6"><CourseContentRenderer content={currentExercise.content} /></div>
                )}
                {currentExercise?.questions?.map((q: any, i: number) => (
                  <div key={i} className="mb-6 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="font-bold mb-3">{q.text}</p>
                    <div className="space-y-2">
                      {q.options?.map((opt: string, oi: number) => (
                        <label key={oi} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-white dark:hover:bg-gray-700">
                          <input type="radio" checked={currentExerciseAnswers[i] === opt} onChange={() => handleAnswerChange(i, opt)} className="w-4 h-4 text-purple-600" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={submitExercise} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                  {t('validateAnswers')}
                </button>
                {(() => {
                  const id = currentExerciseLevel === 'chapter' ? `c-${currentSectionIndex}-${currentChapterIndex}-${currentExerciseIndex}` : `s-${currentSectionIndex}-${currentExerciseIndex}`;
                  if (exerciseScore[id] === undefined) return null;
                  return (
                    <div className={`mt-4 p-4 rounded-xl border-2 ${isCurrentStepCompleted() ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <h4 className="font-black">{t('resultLabel', { score: exerciseScore[id] })}</h4>
                      <p>{isCurrentStepCompleted() ? t('excellent') : (t('requiredPercent') || '70% required.')}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border">
            <button onClick={prevStep} disabled={currentStepIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 disabled:opacity-30">
              <ArrowLeft /> {t('previous')}
            </button>
            <button onClick={nextStep} disabled={!isCurrentStepCompleted()} className={`flex items-center gap-2 px-10 py-3 rounded-xl font-black text-white ${isCurrentStepCompleted() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 opacity-50 cursor-not-allowed'}`}>
              {getProgressPercentage() === 100 ? (t('finish') || 'Finish') : t('next')} <ArrowRight />
            </button>
          </div>

          {/* Section Commentaires */}
          <CourseComments courseId={courseData.id} />
        </div>
      </div>

      <SmartNotes courseId={courseData.id} courseTitle={courseData.title} />
      <DownloadOptions isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} onSelectPdf={handleOrientationSelect} onSelectWord={handleDownloadDocx} isPdfLoading={pdfGenerating} isWordLoading={docxGenerating} />
    </div>
  );
};

export default Course;