'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    BookOpen,
    Plus,
    Trash2,
    Save,
    Layout,
    FileText,
    List,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    CheckCircle,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Types locaux pour le formulaire (basés sur src/types/course.ts mais adaptés pour l'édition)
interface LocalParagraph {
    id: string; // Pour la gestion de clé React
    title: string;
    content: string;
    notions: string[];
}

interface LocalChapter {
    id: string;
    title: string;
    paragraphs: LocalParagraph[];
}

interface LocalSection {
    id: string;
    title: string;
    chapters: LocalChapter[];
    paragraphs: LocalParagraph[]; // Pour supporter les sections sans chapitres
}

interface CourseFormState {
    title: string;
    category: string;
    image: string;
    description: string;
    learningObjectives: string[];
    sections: LocalSection[];
}

const initialFormState: CourseFormState = {
    title: '',
    category: 'Programmation',
    image: '',
    description: '',
    learningObjectives: [''],
    sections: [{
        id: Date.now().toString(),
        title: 'Introduction',
        chapters: [],
        paragraphs: []
    }]
};

export default function CreateCoursePage() {
    const [activeTab, setActiveTab] = useState<'basics' | 'curriculum' | 'preview'>('basics');
    const [formData, setFormData] = useState<CourseFormState>(initialFormState);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

    // Handlers pour les champs de base
    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...formData.learningObjectives];
        newObjectives[index] = value;
        setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
    };

    const addObjective = () => {
        setFormData(prev => ({ ...prev, learningObjectives: [...prev.learningObjectives, ''] }));
    };

    const removeObjective = (index: number) => {
        setFormData(prev => ({
            ...prev,
            learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
        }));
    };

    // Handlers pour le Curriculum (Sections)
    const addSection = () => {
        const newSection: LocalSection = {
            id: Date.now().toString(),
            title: 'Nouvelle Section',
            chapters: [],
            paragraphs: []
        };
        setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    const updateSection = (id: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const removeSection = (id: string) => {
        setSectionToDelete(id);
    };

    const confirmRemoveSection = () => {
        if (sectionToDelete) {
            setFormData(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== sectionToDelete)
            }));
            setSectionToDelete(null);
            toast.success('Section supprimée');
        }
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Handlers pour les Chapitres
    const addChapter = (sectionId: string) => {
        const newChapter: LocalChapter = {
            id: Date.now().toString(),
            title: 'Nouveau Chapitre',
            paragraphs: []
        };
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, chapters: [...s.chapters, newChapter] };
                }
                return s;
            })
        }));
    };

    const updateChapter = (sectionId: string, chapterId: string, title: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        chapters: s.chapters.map(c => c.id === chapterId ? { ...c, title } : c)
                    };
                }
                return s;
            })
        }));
    };

    const removeChapter = (sectionId: string, chapterId: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) };
                }
                return s;
            })
        }));
    };

    // Handlers pour les Paragraphes (dans les chapitres pour simplifier l'exemple, ou direct dans section)
    // Pour cet exemple, on gère l'ajout dans les chapitres principalement
    const addParagraph = (sectionId: string, chapterId: string) => {
        const newParagraph: LocalParagraph = {
            id: Date.now().toString(),
            title: 'Nouveau Point',
            content: '',
            notions: []
        };

        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        chapters: s.chapters.map(c => {
                            if (c.id === chapterId) {
                                return { ...c, paragraphs: [...c.paragraphs, newParagraph] };
                            }
                            return c;
                        })
                    };
                }
                return s;
            })
        }));
    };

    const updateParagraph = (sectionId: string, chapterId: string, pId: string, field: keyof LocalParagraph, value: any) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        chapters: s.chapters.map(c => {
                            if (c.id === chapterId) {
                                return {
                                    ...c,
                                    paragraphs: c.paragraphs.map(p => p.id === pId ? { ...p, [field]: value } : p)
                                };
                            }
                            return c;
                        })
                    };
                }
                return s;
            })
        }));
    };

    // Submit Mock
    const handleSubmit = () => {
        console.log('Course Data Submitted:', formData);
        toast.success('Cours sauvegardé (simulation) ! Vérifiez la console pour les données JSON.');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
            <ConfirmModal
                isOpen={!!sectionToDelete}
                onClose={() => setSectionToDelete(null)}
                onConfirm={confirmRemoveSection}
                title="Supprimer la section"
                message="Êtes-vous sûr de vouloir supprimer cette section ? Tout son contenu sera perdu."
                confirmText="Supprimer"
                type="danger"
            />
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Créer un nouveau cours</h1>
                        <p className="text-gray-600 dark:text-gray-400">Configurez le contenu et la structure de votre cours.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Sauvegarder
                    </button>
                </header>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { id: 'basics', label: 'Infos de base', icon: Layout },
                        { id: 'curriculum', label: 'Programme', icon: List },
                        { id: 'preview', label: 'Aperçu', icon: Eye }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]">

                    {/* BASICS TAB */}
                    {activeTab === 'basics' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 max-w-3xl mx-auto space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre du cours</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                    placeholder="Ex: Introduction à React"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleBasicChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="Programmation">Programmation</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image de couverture (URL)</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500">
                                            <ImageIcon className="w-5 h-5" />
                                        </span>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleBasicChange}
                                            className="flex-1 px-4 py-3 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleBasicChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Une brève description du cours..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Objectifs d'apprentissage</label>
                                <div className="space-y-3">
                                    {formData.learningObjectives.map((obj, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={obj}
                                                onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder={`Objectif ${idx + 1}`}
                                            />
                                            <button
                                                onClick={() => removeObjective(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addObjective}
                                        className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Ajouter un objectif
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CURRICULUM TAB */}
                    {activeTab === 'curriculum' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 mx-auto space-y-8 bg-gray-50/50 dark:bg-gray-900/50 min-h-[600px]"
                        >
                            {formData.sections.map((section, sIdx) => (
                                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center flex-1 gap-4">
                                            <button onClick={() => toggleSection(section.id)}>
                                                {expandedSections[section.id] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                            </button>
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="font-bold text-gray-400">Section {sIdx + 1}:</span>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 font-semibold text-gray-900 dark:text-white flex-1 p-0"
                                                    placeholder="Titre de la section"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => addChapter(section.id)}
                                                className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                            >
                                                + Chapitre
                                            </button>
                                            <button
                                                onClick={() => removeSection(section.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    <AnimatePresence>
                                        {expandedSections[section.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="p-4 space-y-4"
                                            >
                                                {section.chapters.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                        Cette section est vide. Ajoutez un chapitre pour commencer.
                                                    </div>
                                                )}

                                                {section.chapters.map((chapter, cIdx) => (
                                                    <div key={chapter.id} className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <BookOpen className="w-4 h-4 text-purple-500" />
                                                                <span className="text-sm font-medium text-gray-500">Chapitre {cIdx + 1}:</span>
                                                                <input
                                                                    type="text"
                                                                    value={chapter.title}
                                                                    onChange={(e) => updateChapter(section.id, chapter.id, e.target.value)}
                                                                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 p-0"
                                                                    placeholder="Titre du chapitre"
                                                                />
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                                <button
                                                                    onClick={() => addParagraph(section.id, chapter.id)}
                                                                    className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                                                >
                                                                    + Point
                                                                </button>
                                                                <button
                                                                    onClick={() => removeChapter(section.id, chapter.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Paragraphs */}
                                                        <div className="space-y-3">
                                                            {chapter.paragraphs.map((para, pIdx) => (
                                                                <div key={para.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 transition-colors">
                                                                    <input
                                                                        type="text"
                                                                        value={para.title}
                                                                        onChange={(e) => updateParagraph(section.id, chapter.id, para.id, 'title', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-transparent focus:border-purple-300 focus:ring-0 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 p-0 pb-1"
                                                                        placeholder="Titre du point..."
                                                                    />
                                                                    <textarea
                                                                        value={para.content}
                                                                        onChange={(e) => updateParagraph(section.id, chapter.id, para.id, 'content', e.target.value)}
                                                                        className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-400 border-none focus:ring-0 p-0 resize-none"
                                                                        placeholder="Contenu du paragraphe..."
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            <button
                                onClick={addSection}
                                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter une nouvelle section
                            </button>
                        </motion.div>
                    )}

                    {/* PREVIEW TAB */}
                    {activeTab === 'preview' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 max-w-4xl mx-auto"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
                                    {formData.category}
                                </span>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{formData.title || "Titre du cours"}</h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 font-light">
                                    {formData.description || "Aucune description fournie."}
                                </p>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        Objectifs :
                                    </h3>
                                    <ul className="grid md:grid-cols-2 gap-2">
                                        {formData.learningObjectives.map((obj, i) => (
                                            <li key={i} className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                                                {obj || "Objectif..."}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {formData.sections.map((section, sIdx) => (
                                    <div key={section.id} className="relative pl-8 pb-8 border-l-2 border-purple-100 dark:border-purple-900/30 last:border-l-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-white dark:ring-gray-900"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                            {section.title}
                                        </h3>

                                        <div className="space-y-4">
                                            {section.chapters.map((chapter) => (
                                                <div key={chapter.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">{chapter.title}</h4>
                                                    <div className="text-sm text-gray-500">
                                                        {chapter.paragraphs.length} points clés
                                                    </div>
                                                </div>
                                            ))}
                                            {section.chapters.length === 0 && <p className="text-gray-400 italic text-sm">Aucun contenu dans cette section.</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
