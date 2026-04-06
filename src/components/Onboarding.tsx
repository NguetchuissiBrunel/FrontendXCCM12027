"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Step {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const Onboarding = () => {
    const t = useTranslations('onboarding');
    const pathname = usePathname();

    const normalizedPath = useMemo(
        () => pathname?.replace(/^\/(fr|en)(?=\/|$)/, '') || '/',
        [pathname]
    );

    const getTourSteps = useCallback((): Record<string, Step[]> => ({
        '/profdashboard': [
            {
                target: '#dashboard-header',
                title: t('teacher.steps.control.title'),
                description: t('teacher.steps.control.description'),
                position: 'bottom'
            },
            {
                target: '#quick-actions',
                title: t('teacher.steps.quickActions.title'),
                description: t('teacher.steps.quickActions.description'),
                position: 'bottom'
            },
            {
                target: '#teacher-stats',
                title: t('teacher.steps.stats.title'),
                description: t('teacher.steps.stats.description'),
                position: 'bottom'
            },
            {
                target: '#profile-card',
                title: t('teacher.steps.profile.title'),
                description: t('teacher.steps.profile.description'),
                position: 'top'
            },
            {
                target: '#exercise-actions',
                title: t('teacher.steps.exercises.title'),
                description: t('teacher.steps.exercises.description'),
                position: 'top'
            },
            {
                target: '#sidebar-nav',
                title: t('teacher.steps.navigation.title'),
                description: t('teacher.steps.navigation.description'),
                position: 'right'
            }
        ],
        '/editor': [
            {
                target: '#sidebar-toc',
                title: t('editor.steps.toc.title'),
                description: t('editor.steps.toc.description'),
                position: 'right'
            },
            {
                target: '#sidebar-toc',
                title: t('editor.steps.dragDrop.title'),
                description: t('editor.steps.dragDrop.description'),
                position: 'right'
            },
            {
                target: '#main-editor-container',
                title: t('editor.steps.main.title'),
                description: t('editor.steps.main.description'),
                position: 'center'
            },
            {
                target: '#editor-toolbar',
                title: t('editor.steps.toolbar.title'),
                description: t('editor.steps.toolbar.description'),
                position: 'bottom'
            },
            {
                target: '#right-icon-bar',
                title: t('editor.steps.rightBar.title'),
                description: t('editor.steps.rightBar.description'),
                position: 'left'
            },
            {
                target: '#icon-structure',
                title: t('editor.steps.structure.title'),
                description: t('editor.steps.structure.description'),
                position: 'left'
            },
            {
                target: '#icon-info',
                title: t('editor.steps.info.title'),
                description: t('editor.steps.info.description'),
                position: 'left'
            },
            {
                target: '#icon-preview',
                title: t('editor.steps.preview.title'),
                description: t('editor.steps.preview.description'),
                position: 'left'
            },
            {
                target: '#icon-feedback',
                title: t('editor.steps.feedback.title'),
                description: t('editor.steps.feedback.description'),
                position: 'left'
            },
            {
                target: '#icon-my-courses',
                title: t('editor.steps.myCourses.title'),
                description: t('editor.steps.myCourses.description'),
                position: 'left'
            },
            {
                target: '#icon-exercises',
                title: t('editor.steps.exercises.title'),
                description: t('editor.steps.exercises.description'),
                position: 'left'
            },
            {
                target: '#icon-grading',
                title: t('editor.steps.grading.title'),
                description: t('editor.steps.grading.description'),
                position: 'left'
            },
            {
                target: '#icon-workshops',
                title: t('editor.steps.workshops.title'),
                description: t('editor.steps.workshops.description'),
                position: 'left'
            },
            {
                target: '#icon-settings',
                title: t('editor.steps.settings.title'),
                description: t('editor.steps.settings.description'),
                position: 'left'
            },
            {
                target: '#btn-save-course',
                title: t('editor.steps.save.title'),
                description: t('editor.steps.save.description'),
                position: 'left'
            }
        ],
        '/etudashboard': [
            {
                target: '#welcome-section',
                title: t('etu.welcomeTitle'),
                description: t('etu.welcomeDesc'),
                position: 'bottom'
            },
            {
                target: '#stats-overview',
                title: t('etu.statsTitle'),
                description: t('etu.statsDesc'),
                position: 'bottom'
            },
            {
                target: '#my-courses',
                title: t('etu.coursesTitle'),
                description: t('etu.coursesDesc'),
                position: 'top'
            },
            {
                target: '#pending-exercises',
                title: t('etu.pendingTitle'),
                description: t('etu.pendingDesc'),
                position: 'left'
            },
            {
                target: '#my-submissions',
                title: t('etu.submissionsTitle'),
                description: t('etu.submissionsDesc'),
                position: 'left'
            },
            {
                target: '#quick-actions',
                title: t('etu.quickActionsTitle'),
                description: t('etu.quickActionsDesc'),
                position: 'left'
            }
        ]
    }), [t]);

    const tours = useMemo(() => getTourSteps(), [getTourSteps]);
    const steps = useMemo(() => tours[normalizedPath] || [], [tours, normalizedPath]);

    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const updateTargetRect = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const selector = steps[currentStep].target;
        const element = document.querySelector(selector);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
        }
    }, [isActive, currentStep, steps]);

    useEffect(() => {
        if (steps.length > 0) {
            const hasSeen = localStorage.getItem(`hasSeenTour_${normalizedPath}`);
            if (!hasSeen) {
                const timer = setTimeout(() => setIsActive(true), 1000);
                return () => clearTimeout(timer);
            }
        } else {
            setIsActive(false);
        }
    }, [steps.length, normalizedPath]);

    useEffect(() => {
        if (isActive) {
            updateTargetRect();
            window.addEventListener('resize', updateTargetRect);
            window.addEventListener('scroll', updateTargetRect);
            return () => {
                window.removeEventListener('resize', updateTargetRect);
                window.removeEventListener('scroll', updateTargetRect);
            };
        }
    }, [isActive, updateTargetRect]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleEnd();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleEnd = () => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(`hasSeenTour_${normalizedPath}`, 'true');
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsActive(true);
    };

    if (!isActive && !steps.length) return null;

    if (!isActive) {
        return (
            <button
                onClick={handleRestart}
                className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 group"
                title={t('buttons.reviewTutorial')}
            >
                <HelpCircle className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t('buttons.needHelp')}
                </span>
            </button>
        );
    }

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <motion.rect
                                initial={false}
                                animate={{
                                    x: targetRect.left - 10,
                                    y: targetRect.top - 10,
                                    width: targetRect.width + 20,
                                    height: targetRect.height + 20,
                                    rx: 12
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.6)"
                    mask="url(#spotlight-mask)"
                    onClick={handleEnd}
                />
            </svg>

            <AnimatePresence>
                {targetRect && (
                    <motion.div
                        initial={false}
                        animate={{
                            top: targetRect.top - 10,
                            left: targetRect.left - 10,
                            width: targetRect.width + 20,
                            height: targetRect.height + 20,
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute border-2 border-purple-400 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] z-10"
                    />
                )}
            </AnimatePresence>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-purple-100 dark:border-gray-700 relative z-20"
                        style={getTooltipStyles(targetRect, currentStepData?.position)}
                    >
                        <button
                            onClick={handleEnd}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                {currentStepData?.title}
                            </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            {currentStepData?.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-purple-600' : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md group"
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <>{t('buttons.finish')} <Check size={18} /></>
                                    ) : (
                                        <>{t('buttons.next')} <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                            {currentStep + 1} / {steps.length}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

function getTooltipStyles(targetRect: DOMRect | null, _position?: string): React.CSSProperties {
    if (!targetRect) return { 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000 
    };
    const isTargetInBottomHalf = targetRect.top > window.innerHeight / 2;
    return {
        position: 'fixed',
        ...(isTargetInBottomHalf ? { top: '2rem' } : { bottom: '2rem' }),
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10000,
    };
}

export default Onboarding;
