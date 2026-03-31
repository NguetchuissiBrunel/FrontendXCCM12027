"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Step {
    target: string; // CSS Selector or "body" for general
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const Onboarding = () => {
    const t = useTranslations('onboarding');
    const pathname = usePathname();
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const getTourSteps = useCallback((): Record<string, Step[]> => ({
        '/etudashboard': [
            {
                target: '#welcome-section',
                title: t('student.steps.welcome.title'),
                description: t('student.steps.welcome.description'),
                position: 'bottom'
            },
            {
                target: '#stats-overview',
                title: t('student.steps.stats.title'),
                description: t('student.steps.stats.description'),
                position: 'left'
            },
            {
                target: '#my-courses',
                title: t('student.steps.courses.title'),
                description: t('student.steps.courses.description'),
                position: 'top'
            },
            {
                target: '#pending-exercises',
                title: t('student.steps.todo.title'),
                description: t('student.steps.todo.description'),
                position: 'left'
            },
            {
                target: '#sidebar-nav',
                title: t('student.steps.navigation.title'),
                description: t('student.steps.navigation.description'),
                position: 'right'
            }
        ],
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
        ]
    }), [t]);
    const normalizedPath = useMemo(
        () => pathname?.replace(/^\/(fr|en)(?=\/|$)/, '') || '/',
        [pathname]
    );
    const tours = useMemo(() => getTourSteps(), [getTourSteps]);
    const steps = useMemo(() => tours[normalizedPath] || [], [tours, normalizedPath]);

    const updateTargetRect = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const selector = steps[currentStep].target;
        if (selector === 'body') {
            setTargetRect(null);
            return;
        }

        const element = document.querySelector(selector);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);

            // Scroll to element if not visible
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
        }
    }, [isActive, currentStep, steps]);

    useEffect(() => {
        if (steps.length > 0) {
            const hasSeen = localStorage.getItem(`hasSeenTour_${normalizedPath}`);
            if (!hasSeen) {
                // Wait a bit for the page to render
                const timer = setTimeout(() => {
                    setIsActive(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        } else {
            const timer = window.setTimeout(() => {
                setIsActive(false);
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, [steps.length, normalizedPath]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            updateTargetRect();
        }, 0);
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
        };
    }, [updateTargetRect]);

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

    // Button to restart tour (can be used in settings or dashboard)
    if (!isActive) {
        return (
            <button
                onClick={handleRestart}
                className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 group"
                title={t('actions.reviewTutorial')}
            >
                <HelpCircle className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t('actions.needHelp')}
                </span>
            </button>
        );
    }

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* SVG Overlay for Spotlight */}
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

            {/* Focused Frame */}
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

            {/* Tooltip Content */}
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
                                        <>{t('actions.finish')} <Check size={18} /></>
                                    ) : (
                                        <>{t('actions.next')} <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress Badge */}
                        <div className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                            {currentStep + 1} / {steps.length}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Helper to position tooltip based on target rect and preferred position
function getTooltipStyles(targetRect: DOMRect | null, _position?: string): React.CSSProperties {
    void _position;
    if (!targetRect) {
        return { position: 'relative' };
    }

    // Vérifie si l'élément se trouve dans la moitié inférieure de l'écran
    // Si oui, on affiche le tooltip en haut pour ne pas le cacher, et vice versa.
    const isTargetInBottomHalf = targetRect.top > window.innerHeight / 2;

    return {
        position: 'fixed', // Utilisé fixed par rapport à l'écran pour garantir un positionnement stable
        ...(isTargetInBottomHalf ? { top: '2rem' } : { bottom: '2rem' }),
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10000,
    };
}

export default Onboarding;
