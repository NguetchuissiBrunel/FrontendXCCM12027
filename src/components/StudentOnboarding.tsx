// components/StudentOnboarding.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Step {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    delay?: number;
    highlight?: boolean;
}

const StudentOnboarding = () => {
    const pathname = usePathname() || '';
    const t = useTranslations('onboarding.etu');
    const tb = useTranslations('onboarding.buttons');

    // Complete tour steps for student dashboard home page
    const HOME_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#welcome-section', 
            title: t('welcomeTitle'), 
            description: t('welcomeDesc'), 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#stats-overview', 
            title: t('statsTitle'), 
            description: t('statsDesc'), 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#my-courses', 
            title: t('coursesTitle'), 
            description: t('coursesDesc'), 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#pending-exercises', 
            title: t('pendingTitle'), 
            description: t('pendingDesc'), 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#my-submissions', 
            title: t('submissionsTitle'), 
            description: t('submissionsDesc'), 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#quick-actions', 
            title: t('quickActionsTitle'), 
            description: t('quickActionsDesc'), 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#sidebar-nav', 
            title: t('navTitle'), 
            description: t('navDesc'), 
            position: 'right',
            highlight: true 
        },
        { 
            target: '#user-profile', 
            title: t('profilePageTitle'), 
            description: t('profilePageDesc'), 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: 'body', 
            title: tb('finish'), 
            description: t('welcomeDesc'), // Or a generic final message
            position: 'center',
            highlight: false 
        }
    ], [t, tb]);

    // Steps for courses page
    const COURSES_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#courses-list', 
            title: t('coursesPageTitle'), 
            description: t('coursesPageDesc'), 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#explore-library-btn', 
            title: t('exploreLibraryTitle'), 
            description: t('exploreLibraryDesc'), 
            position: 'bottom',
            highlight: true 
        }
    ], [t]);

    // Steps for exercises page
    const EXERCISES_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#exercises-stats', 
            title: t('exercisesStatsTitle'), 
            description: t('exercisesStatsDesc'), 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#exercises-filters', 
            title: t('exercisesFiltersTitle'), 
            description: t('exercisesFiltersDesc'), 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#exercises-list', 
            title: t('exercisesListTitle'), 
            description: t('exercisesListDesc'), 
            position: 'top',
            highlight: true 
        }
    ], [t]);

    // Steps for submissions page
    const SUBMISSIONS_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#submissions-list', 
            title: t('submissionsPageTitle'), 
            description: t('submissionsPageDesc'), 
            position: 'top',
            highlight: true 
        }
    ], [t]);

    // Steps for deadlines page
    const DEADLINES_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#calendar-view', 
            title: t('calendarViewTitle'), 
            description: t('calendarViewDesc'), 
            position: 'bottom',
            highlight: true 
        }
    ], [t]);

    // Steps for profile page
    const PROFILE_PAGE_STEPS: Step[] = useMemo(() => [
        { 
            target: '#profile-info', 
            title: t('profileInfoTitle'), 
            description: t('profileInfoDesc'), 
            position: 'right',
            highlight: true 
        },
        { 
            target: '#profile-stats', 
            title: t('profileStatsTitle'), 
            description: t('profileStatsDesc'), 
            position: 'left',
            highlight: true 
        }
    ], [t]);

    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [isWaitingForElement, setIsWaitingForElement] = useState(false);
    const waitTimeoutRef = useRef<NodeJS.Timeout| null>(null);
    const retryCountRef = useRef(0);

    // Get clean path without locale
    const getCleanPath = useCallback(() => {
        return pathname.replace(/^\/(fr|en)/, '') || '/';
    }, [pathname]);

    // Check if current route is a student dashboard page
    const isStudentDashboardPage = useCallback(() => {
        const cleanPath = getCleanPath();
        const studentRoutes = [
            '/etudashboard',
            '/etudashboard/',
            '/etudashboard/cours',
            '/etudashboard/exercises',
            '/etudashboard/submissions',
            '/etudashboard/echeances',
            '/etudashboard/profil'
        ];
        
        return studentRoutes.some(route => cleanPath === route);
    }, [getCleanPath]);

    // Get steps for current page
    const getStepsForCurrentPage = useCallback(() => {
        const cleanPath = getCleanPath();
        if (cleanPath === '/etudashboard' || cleanPath === '/etudashboard/') {
            return HOME_PAGE_STEPS;
        } else if (cleanPath === '/etudashboard/cours') {
            return COURSES_PAGE_STEPS;
        } else if (cleanPath === '/etudashboard/exercises') {
            return EXERCISES_PAGE_STEPS;
        } else if (cleanPath === '/etudashboard/submissions') {
            return SUBMISSIONS_PAGE_STEPS;
        } else if (cleanPath === '/etudashboard/echeances') {
            return DEADLINES_PAGE_STEPS;
        } else if (cleanPath === '/etudashboard/profil') {
            return PROFILE_PAGE_STEPS;
        }
        return [];
    }, [getCleanPath, HOME_PAGE_STEPS, COURSES_PAGE_STEPS, EXERCISES_PAGE_STEPS, SUBMISSIONS_PAGE_STEPS, DEADLINES_PAGE_STEPS, PROFILE_PAGE_STEPS]);

    const updateTargetRect = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const selector = steps[currentStep].target;
        if (selector === 'body') {
            setTargetRect(null);
            setIsWaitingForElement(false);
            return;
        }

        const element = document.querySelector(selector);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsWaitingForElement(false);
            retryCountRef.current = 0;
        } else {
            setIsWaitingForElement(true);
            setTargetRect(null);
            
            if (retryCountRef.current < 10) {
                waitTimeoutRef.current = setTimeout(() => {
                    retryCountRef.current++;
                    updateTargetRect();
                }, 500);
            } else {
                console.warn(`Element ${selector} not found after multiple retries`);
                setIsWaitingForElement(false);
            }
        }
    }, [isActive, currentStep, steps]);

    // Initialize onboarding
    useEffect(() => {
        setIsActive(false);
        setCurrentStep(0);
        setTargetRect(null);
        retryCountRef.current = 0;
        
        if (isStudentDashboardPage()) {
            const pageSteps = getStepsForCurrentPage();
            if (pageSteps.length > 0) {
                setSteps(pageSteps);
                
                const storageKey = `student_tour_${getCleanPath()}`;
                const hasSeen = localStorage.getItem(storageKey);
                
                if (!hasSeen) {
                    const timer = setTimeout(() => {
                        setIsActive(true);
                    }, 1200);
                    return () => clearTimeout(timer);
                }
            }
        } else {
            setSteps([]);
        }
    }, [pathname, isStudentDashboardPage, getStepsForCurrentPage, getCleanPath]);

    // Update listeners
    useEffect(() => {
        if (isActive && steps.length > 0) {
            updateTargetRect();
            
            window.addEventListener('resize', updateTargetRect);
            window.addEventListener('scroll', updateTargetRect);
            
            const observer = new MutationObserver(() => {
                updateTargetRect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            
            return () => {
                window.removeEventListener('resize', updateTargetRect);
                window.removeEventListener('scroll', updateTargetRect);
                observer.disconnect();
                if (waitTimeoutRef.current) {
                    clearTimeout(waitTimeoutRef.current);
                }
            };
        }
    }, [isActive, currentStep, steps, updateTargetRect]);

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
        const storageKey = `student_tour_${getCleanPath()}`;
        localStorage.setItem(storageKey, 'true');
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsActive(true);
        retryCountRef.current = 0;
    };

    if (!isActive && isStudentDashboardPage() && steps.length > 0) {
        return (
            <button
                onClick={handleRestart}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all z-50 group"
                aria-label={tb('helpTitle')}
            >
                <HelpCircle className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                    {tb('helpTitle')}
                </span>
            </button>
        );
    }

    if (!isActive || !steps.length) return null;

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="student-spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && currentStepData.highlight !== false && (
                            <motion.rect
                                initial={false}
                                animate={{
                                    x: targetRect.left - 12,
                                    y: targetRect.top - 12,
                                    width: targetRect.width + 24,
                                    height: targetRect.height + 24,
                                    rx: 12
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                fill="black"
                            />
                        )}
                        {(!targetRect || currentStepData.highlight === false) && (
                            <rect x="0" y="0" width="100%" height="100%" fill="black" />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#student-spotlight-mask)"
                    onClick={handleEnd}
                />
            </svg>

            <AnimatePresence>
                {targetRect && currentStepData.highlight !== false && (
                    <motion.div
                        initial={false}
                        animate={{
                            top: targetRect.top - 12,
                            left: targetRect.left - 12,
                            width: targetRect.width + 24,
                            height: targetRect.height + 24,
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute border-2 border-purple-400 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.5)] z-10 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border-2 border-purple-200 dark:border-purple-800 relative z-20"
                        style={getTooltipStyles(targetRect, currentStepData?.position, currentStepData?.highlight)}
                    >
                        <button
                            onClick={handleEnd}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                {currentStepData?.title}
                            </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
                            {currentStepData?.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {steps.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={{
                                            width: i === currentStep ? 24 : 6,
                                            backgroundColor: i === currentStep ? '#8b5cf6' : '#e5e7eb'
                                        }}
                                        className="h-1.5 rounded-full"
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
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md group"
                                >
                                    {currentStep === steps.length - 1 ? tb('finish') : tb('next')}
                                    {currentStep !== steps.length - 1 && <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />}
                                </button>
                            </div>
                        </div>

                        <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
                            {currentStep + 1} / {steps.length}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

function getTooltipStyles(targetRect: DOMRect | null, position?: string, highlight?: boolean): React.CSSProperties {
    if (!targetRect || highlight === false) {
        return {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            maxWidth: 'min(420px, calc(100vw - 40px))',
            width: 'auto',
            minWidth: '280px'
        };
    }

    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(400, viewportWidth - 40);
    const tooltipHeight = 280;
    
    const spaceAbove = targetRect.top;
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = viewportWidth - targetRect.right;
    
    let top: number;
    
    if (position === 'top') {
        top = spaceAbove >= tooltipHeight + spacing ? targetRect.top - tooltipHeight - spacing : targetRect.bottom + spacing;
    } else if (position === 'bottom') {
        top = spaceBelow >= tooltipHeight + spacing ? targetRect.bottom + spacing : targetRect.top - tooltipHeight - spacing;
    } else if (position === 'left' && spaceLeft >= tooltipWidth + spacing) {
        return {
            position: 'fixed',
            top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            left: targetRect.left - tooltipWidth - spacing,
            zIndex: 10000,
            maxWidth: `${tooltipWidth}px`,
            width: 'auto',
            minWidth: '280px'
        };
    } else if (position === 'right' && spaceRight >= tooltipWidth + spacing) {
        return {
            position: 'fixed',
            top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            left: targetRect.right + spacing,
            zIndex: 10000,
            maxWidth: `${tooltipWidth}px`,
            width: 'auto',
            minWidth: '280px'
        };
    } else {
        top = spaceBelow >= tooltipHeight + spacing ? targetRect.bottom + spacing : (spaceAbove >= tooltipHeight + spacing ? targetRect.top - tooltipHeight - spacing : (viewportHeight - tooltipHeight) / 2);
    }
    
    const left = Math.min(viewportWidth - tooltipWidth / 2 - spacing, Math.max(tooltipWidth / 2 + spacing, targetRect.left + targetRect.width / 2));
    
    return {
        position: 'fixed',
        top: Math.min(viewportHeight - tooltipHeight - spacing, Math.max(spacing, top)),
        left: left,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        maxWidth: `${tooltipWidth}px`,
        width: 'auto',
        minWidth: '280px'
    };
}

export default StudentOnboarding;
