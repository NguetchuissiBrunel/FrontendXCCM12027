// components/StudentOnboarding.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

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

    // Complete tour steps for student dashboard home page
    const HOME_PAGE_STEPS: Step[] = [
        { 
            target: '#welcome-section', 
            title: 'Bienvenue sur votre espace étudiant !', 
            description: 'Cette visite guidée vous aidera à découvrir toutes les fonctionnalités de votre tableau de bord.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#stats-overview', 
            title: 'Vos statistiques en un coup d\'œil', 
            description: 'Suivez votre progression : moyenne générale, nombre de soumissions, exercices en attente et terminés.', 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#my-courses', 
            title: 'Mes cours', 
            description: 'Retrouvez ici tous vos cours actifs. Cliquez sur "Continuer" pour accéder au contenu du cours.', 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#pending-exercises', 
            title: 'Exercices à rendre', 
            description: 'Les exercices en attente de votre part. Ne manquez pas les délais !', 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#my-submissions', 
            title: 'Mes soumissions', 
            description: 'Consultez l\'historique de vos soumissions et les feedbacks des correcteurs.', 
            position: 'left',
            highlight: true 
        },
        { 
            target: '#quick-actions', 
            title: 'Actions rapides', 
            description: 'Accédez rapidement aux fonctionnalités essentielles.', 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#sidebar-nav', 
            title: 'Navigation principale', 
            description: 'Accédez à toutes les sections de votre espace étudiant : cours, exercices, soumissions, etc.', 
            position: 'right',
            highlight: true 
        },
        { 
            target: '#user-profile', 
            title: 'Votre profil', 
            description: 'Personnalisez votre profil, modifiez vos informations et suivez vos certifications.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'C\'est parti !', 
            description: 'Vous êtes prêt à commencer votre apprentissage. Explorez votre espace et n\'hésitez pas à cliquer sur le point d\'interrogation si vous avez besoin d\'aide.', 
            position: 'center',
            highlight: false 
        }
    ];

    // Steps for courses page
    const COURSES_PAGE_STEPS: Step[] = [
        { 
            target: '#courses-list', 
            title: 'Mes cours', 
            description: 'Retrouvez tous vos cours ici. Cliquez sur "Voir le cours" pour accéder au contenu pédagogique.', 
            position: 'top',
            highlight: true 
        },
        { 
            target: '#explore-library-btn', 
            title: 'Explorer la bibliothèque', 
            description: 'Découvrez de nouveaux cours et enrichissez vos connaissances.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'Fin de la visite', 
            description: 'Vous pouvez maintenant explorer vos cours et vous inscrire à de nouveaux !', 
            position: 'center',
            highlight: false 
        }
    ];

    // Steps for exercises page
    const EXERCISES_PAGE_STEPS: Step[] = [
        { 
            target: '#exercises-stats', 
            title: 'Vos statistiques', 
            description: 'Suivez votre progression sur l\'ensemble des exercices. Nombre total, à commencer, en cours, soumis et notés.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#exercises-filters', 
            title: 'Filtres et recherche', 
            description: 'Filtrez les exercices par statut, par cours ou recherchez par titre pour trouver rapidement ce que vous cherchez.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: '#exercises-list', 
            title: 'Liste des exercices', 
            description: 'Tous vos exercices avec leur statut, échéance et votre score si disponible. Cliquez sur "Commencer" pour démarrer un exercice.', 
            position: 'top',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'Bonne chance !', 
            description: 'Vous êtes prêt à relever ces défis. N\'oubliez pas de respecter les délais !', 
            position: 'center',
            highlight: false 
        }
    ];

    // Steps for submissions page
    const SUBMISSIONS_PAGE_STEPS: Step[] = [
        { 
            target: '#submissions-list', 
            title: 'Mes soumissions', 
            description: 'Historique complet de toutes vos soumissions avec les feedbacks des correcteurs. Cliquez sur "Détails" pour voir les réponses et les commentaires.', 
            position: 'top',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'Suivi des soumissions', 
            description: 'Vous pouvez voir ici toutes vos soumissions et consulter les retours de vos professeurs.', 
            position: 'center',
            highlight: false 
        }
    ];

    // Steps for deadlines page
    const DEADLINES_PAGE_STEPS: Step[] = [
        { 
            target: '#calendar-view', 
            title: 'Calendrier des échéances', 
            description: 'Visualisez toutes vos deadlines dans un calendrier interactif. Les couleurs vous aident à identifier les différents types d\'événements.', 
            position: 'bottom',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'Organisez votre temps', 
            description: 'Utilisez ce calendrier pour gérer votre emploi du temps et ne plus jamais manquer une échéance !', 
            position: 'center',
            highlight: false 
        }
    ];

    // Steps for profile page
    const PROFILE_PAGE_STEPS: Step[] = [
        { 
            target: '#profile-info', 
            title: 'Mon profil', 
            description: 'Personnalisez vos informations personnelles et académiques. Cliquez sur "Modifier" pour mettre à jour vos données.', 
            position: 'right',
            highlight: true 
        },
        { 
            target: '#profile-stats', 
            title: 'Mes statistiques', 
            description: 'Suivez vos certifications, votre assiduité et vos performances globales.', 
            position: 'left',
            highlight: true 
        },
        { 
            target: 'body', 
            title: 'Profil personnalisé', 
            description: 'Votre profil est votre carte d\'identité sur la plateforme. Prenez le temps de le compléter !', 
            position: 'center',
            highlight: false 
        }
    ];

    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [isWaitingForElement, setIsWaitingForElement] = useState(false);
    const waitTimeoutRef = useRef<NodeJS.Timeout>(null);
    const retryCountRef = useRef(0);

    // Check if current route is a student dashboard page where onboarding should be available
    const isStudentDashboardPage = useCallback(() => {
        const studentRoutes = [
            '/fr/etudashboard',
            '/fr/etudashboard/',
            '/fr/etudashboard/cours',
            '/fr/etudashboard/exercises',
            '/fr/etudashboard/submissions',
            '/fr/etudashboard/echeances',
            '/fr/etudashboard/profil',
            '/en/etudashboard',
            '/en/etudashboard/',
            '/en/etudashboard/cours',
            '/en/etudashboard/exercises',
            '/en/etudashboard/submissions',
            '/en/etudashboard/echeances',
            '/en/etudashboard/profil'
        ];
        
        return studentRoutes.some(route => {
            return pathname === route;
        });
    }, [pathname]);

    // Get steps for current page
    const getStepsForCurrentPage = useCallback(() => {
        if (pathname === '/fr/etudashboard' || pathname === '/en/etudashboard') {
            return HOME_PAGE_STEPS;
        } else if (pathname === '/fr/etudashboard/cours' || pathname === '/en/etudashboard/cours') {
            return COURSES_PAGE_STEPS;
        } else if (pathname === '/fr/etudashboard/exercises' || pathname === '/en/etudashboard/exercises') {
            return EXERCISES_PAGE_STEPS;
        } else if (pathname === '/fr/etudashboard/submissions' || pathname === '/en/etudashboard/submissions') {
            return SUBMISSIONS_PAGE_STEPS;
        } else if (pathname === '/fr/etudashboard/echeances' || pathname === '/en/etudashboard/echeances') {
            return DEADLINES_PAGE_STEPS;
        } else if (pathname === '/fr/etudashboard/profil' || pathname === '/en/etudashboard/profil') {
            return PROFILE_PAGE_STEPS;
        }
        return [];
    }, [pathname]);

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
            
            // Scroll to element if not visible
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsWaitingForElement(false);
            retryCountRef.current = 0;
        } else {
            // Element not found, wait for it to appear
            setIsWaitingForElement(true);
            setTargetRect(null);
            
            if (retryCountRef.current < 10) {
                waitTimeoutRef.current = setTimeout(() => {
                    retryCountRef.current++;
                    updateTargetRect();
                }, 500);
            } else {
                // Too many retries, skip this step
                console.warn(`Element ${selector} not found after multiple retries`);
                setIsWaitingForElement(false);
            }
        }
    }, [isActive, currentStep, steps]);

    // Initialize onboarding when route changes
    useEffect(() => {
        // Reset state when route changes
        setIsActive(false);
        setCurrentStep(0);
        setTargetRect(null);
        retryCountRef.current = 0;
        
        if (isStudentDashboardPage()) {
            const pageSteps = getStepsForCurrentPage();
            if (pageSteps.length > 0) {
                setSteps(pageSteps);
                
                // Check if tour has been seen for this specific page
                const storageKey = `student_tour_${pathname}`;
                const hasSeen = localStorage.getItem(storageKey);
                
                if (!hasSeen) {
                    // Small delay to ensure DOM is ready
                    const timer = setTimeout(() => {
                        setIsActive(true);
                    }, 1200);
                    return () => clearTimeout(timer);
                }
            }
        } else {
            setSteps([]);
        }
    }, [pathname, isStudentDashboardPage, getStepsForCurrentPage]);

    // Update target rect when step changes or window resizes
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
        const storageKey = `student_tour_${pathname}`;
        localStorage.setItem(storageKey, 'true');
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsActive(true);
        retryCountRef.current = 0;
    };

    // Show help button on all student dashboard pages when tour is not active
    if (!isActive && isStudentDashboardPage() && steps.length > 0) {
        return (
            <button
                onClick={handleRestart}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all z-50 group"
                aria-label="Aide et visite guidée"
            >
                <HelpCircle className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                    Revoir la visite guidée
                </span>
            </button>
        );
    }

    if (!isActive || !steps.length) return null;

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* SVG Overlay for Spotlight */}
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
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="black"
                            />
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

            {/* Focused Frame */}
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

            {/* Tooltip Content */}
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
                            aria-label="Fermer"
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
                                        className="h-1.5 rounded-full transition-all duration-300"
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        aria-label="Précédent"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg group"
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <>
                                            Terminer <Check size={18} />
                                        </>
                                    ) : (
                                        <>
                                            Suivant <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress Badge */}
                        <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
                            {currentStep + 1} / {steps.length}
                        </div>

                        {/* Skip hint */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Cliquez sur l'arrière-plan pour fermer
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Loading indicator when waiting for element */}
            {isWaitingForElement && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-20 pointer-events-none">
                    Recherche de l'élément...
                </div>
            )}
        </div>
    );
};

// Helper to position tooltip based on target rect and preferred position
function getTooltipStyles(targetRect: DOMRect | null, position?: string, highlight?: boolean): React.CSSProperties {
    if (!targetRect || highlight === false) {
        return {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            maxWidth: '90vw'
        };
    }

    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 384; // max-w-md = 24rem = 384px
    const tooltipHeight = 300; // approximate height

    let top: number, left: number;
    
    switch (position) {
        case 'top':
            top = targetRect.top - spacing - tooltipHeight;
            left = targetRect.left + targetRect.width / 2;
            break;
        case 'bottom':
            top = targetRect.bottom + spacing;
            left = targetRect.left + targetRect.width / 2;
            break;
        case 'left':
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
            left = targetRect.left - spacing - tooltipWidth;
            break;
        case 'right':
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
            left = targetRect.right + spacing;
            break;
        default:
            top = targetRect.bottom + spacing;
            left = targetRect.left + targetRect.width / 2;
    }

    // Adjust to keep tooltip in viewport
    if (left + tooltipWidth / 2 > viewportWidth - spacing) {
        left = viewportWidth - tooltipWidth / 2 - spacing;
    }
    if (left - tooltipWidth / 2 < spacing) {
        left = tooltipWidth / 2 + spacing;
    }
    
    if (top + tooltipHeight > viewportHeight - spacing) {
        top = targetRect.top - tooltipHeight - spacing;
    }
    if (top < spacing) {
        top = spacing;
    }

    return {
        position: 'fixed',
        top: top,
        left: left,
        transform: 'translateX(-50%) translateY(0)',
        zIndex: 10000,
        maxWidth: '90vw'
    };
}

export default StudentOnboarding;
