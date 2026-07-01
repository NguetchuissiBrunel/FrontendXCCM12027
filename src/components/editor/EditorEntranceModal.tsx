'use client';

import React from 'react';
import { Plus, Edit, X, BookOpen, Clock, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreateNew: (title: string) => void;
    onModifyExisting: () => void;
    onGenerateCourse: () => void;
}

export default function EditorEntranceModal({ isOpen, onClose, onCreateNew, onModifyExisting, onGenerateCourse }: Props) {
    const locale = useLocale();
    const [step, setStep] = React.useState<'choice' | 'title'>('choice');
    const [title, setTitle] = React.useState('');
    const suggestions = React.useMemo(() => (
        locale === 'fr'
            ? [
                "Introduction a l'Algebre",
                "Histoire du Cameroun : les grandes dates",
                "Physique : les lois de Newton",
                "Litterature : l'art de la dissertation",
                "Informatique : algorithmique de base"
            ]
            : [
                'Introduction to Algebra',
                'History of Cameroon: key dates',
                "Physics: Newton's laws",
                'Literature: the art of essay writing',
                'Computer science: algorithmic basics'
            ]
    ), [locale]);
    const content = React.useMemo(() => (
        locale === 'fr'
            ? {
                welcome: "Bienvenue dans l'Editeur",
                subtitle: "Que souhaitez-vous faire aujourd'hui ?",
                createTitle: 'Creer un cours',
                createDescription: 'Commencer un nouveau projet a partir de zero',
                generateTitle: 'Generer un cours',
                generateDescription: "Creer un cours complet avec l'intelligence artificielle",
                editTitle: 'Modifier un cours',
                editDescription: 'Reprendre le travail sur une de vos compositions',
                masterpiece: "Quel est le titre de votre futur chef-d'oeuvre ?",
                titlePlaceholder: 'Ex: Les fondamentaux de la thermodynamique...',
                smartSuggestions: 'Suggestions intelligentes',
                back: 'Retour',
                startEditing: "Commencer l'edition",
                premiumEditor: 'Editeur premium',
                autosave: 'Auto-sauvegarde',
                export: 'Export PDF/Word'
            }
            : {
                welcome: 'Welcome to the XCCM Editor',
                subtitle: 'What would you like to do today?',
                createTitle: 'Create a course',
                createDescription: 'Start a new project from scratch',
                generateTitle: 'Generate a course',
                generateDescription: 'Create a complete course with artificial intelligence',
                editTitle: 'Edit a course',
                editDescription: 'Continue working on one of your compositions',
                masterpiece: 'What is the title of your future masterpiece?',
                titlePlaceholder: 'Example: Thermodynamics fundamentals...',
                smartSuggestions: 'Smart suggestions',
                back: 'Back',
                startEditing: 'Start editing',
                premiumEditor: 'Premium editor',
                autosave: 'Autosave',
                export: 'PDF/Word export'
            }
    ), [locale]);

    if (!isOpen) return null;

    const handleCreateNew = () => {
        setStep('title');
    };

    const handleFinalCreate = () => {
        if (title.trim()) {
            onCreateNew(title);
            setStep('choice');
            setTitle('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100 dark:border-gray-700 w-full max-w-4xl flex flex-col"
            >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 dark:bg-purple-900/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                <div className="p-8 sm:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            {content.welcome} <span className="text-purple-600">XCCM</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {content.subtitle}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'choice' ? (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                            >
                                {/* Create New Option */}
                                <button
                                    onClick={handleCreateNew}
                                    className="group relative flex flex-col items-center p-8 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-800/50 rounded-3xl hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10"
                                >
                                    <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                        <Plus size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{content.createTitle}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                        {content.createDescription}
                                    </p>
                                </button>

                                {/* Generate Course Option */}
                                <button
                                    onClick={onGenerateCourse}
                                    className="group relative flex flex-col items-center p-8 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-800/50 rounded-3xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                        <Sparkles size={30} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{content.generateTitle}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                        {content.generateDescription}
                                    </p>
                                </button>

                                {/* Modify Existing Option */}
                                <button
                                    onClick={onModifyExisting}
                                    className="group relative flex flex-col items-center p-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800/50 rounded-3xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10"
                                >
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                        <Edit size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{content.editTitle}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                        {content.editDescription}
                                    </p>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="title"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                        {content.masterpiece}
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFinalCreate()}
                                        placeholder={content.titlePlaceholder}
                                        autoFocus
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-purple-100 dark:border-gray-700 rounded-2xl focus:border-purple-500 dark:focus:border-purple-500 outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{content.smartSuggestions}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setTitle(s)}
                                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-700 transition-all shadow-sm"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setStep('choice')}
                                        className="flex-1 py-4 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-700 dark:hover:text-white transition-colors"
                                    >
                                        {content.back}
                                    </button>
                                    <button
                                        onClick={handleFinalCreate}
                                        disabled={!title.trim()}
                                        className="flex-grow-[2] py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {content.startEditing}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Info / Stats */}
                    <div className="mt-12 flex items-center justify-around py-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <BookOpen size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{content.premiumEditor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Clock size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{content.autosave}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <FileText size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{content.export}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
