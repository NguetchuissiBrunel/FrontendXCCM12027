"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, BookOpen, GraduationCap, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
    image?: string;
}

const Onboarding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps: Step[] = [
        {
            title: "Bienvenue sur XCCM1",
            description: "Votre nouvelle plateforme d'apprentissage collaborative. Découvrez comment tirer le meilleur parti de nos outils pédagogiques.",
            icon: <Sparkles className="w-12 h-12 text-purple-600" />,
        },
        {
            title: "Explorez la Bibliothèque",
            description: "Accédez à des centaines de cours et supports de qualité. Filtrez par catégorie, auteur ou popularité pour trouver ce qu'il vous faut.",
            icon: <BookOpen className="w-12 h-12 text-blue-600" />,
        },
        {
            title: "Créez vos propres Cours",
            description: "Utilisez notre éditeur moderne pour structurer vos connaissances. Ajoutez des formules, images et exercices en toute simplicité.",
            icon: <PenTool className="w-12 h-12 text-green-600" />,
        },
        {
            title: "Suivez votre Progression",
            description: "Visualisez vos acquis et restez motivé grâce à votre tableau de bord personnel. Bonne chance dans votre aventure !",
            icon: <GraduationCap className="w-12 h-12 text-orange-600" />,
        }
    ];

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsOpen(false);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 group"
            title="Revoir le tutoriel"
        >
            <Sparkles className="w-6 h-6" />
            <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Besoin d'aide ?
            </span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-purple-100 dark:border-gray-700">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="mb-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 shadow-inner">
                                {steps[currentStep].icon}
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                                {steps[currentStep].title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                {steps[currentStep].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-purple-600' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:text-purple-600 dark:hover:text-white transition-colors"
                            >
                                Retour
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>C'est parti ! <Check className="w-5 h-5" /></>
                            ) : (
                                <>Continuer <ChevronRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
