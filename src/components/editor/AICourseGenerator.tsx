'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Download, FileText, FileDown, ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/utils/authHelpers';
import { transformTiptapToCourseData } from '@/utils/courseTransformer';
import { downloadCourseAsPDF } from '@/utils/DownloadPdf';
import { downloadCourseAsDocx } from '@/utils/DownloadDocx';
import CourseContentRenderer from '@/components/CourseContentRenderer';

interface AICourseGeneratorProps {
  onClose: () => void;
  onInsertToEditor?: (tiptapJson: any) => void;
}

type Step = 'form' | 'loading' | 'preview';

interface FormState {
  title: string;
  description: string;
  subject: string;
  level: string;
  objectives: string;
  numSections: number;
}

const LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
];

const AICourseGenerator: React.FC<AICourseGeneratorProps> = ({ onClose, onInsertToEditor }) => {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    subject: '',
    level: 'intermediate',
    objectives: '',
    numSections: 3,
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleGenerate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Le titre et la description sont requis.');
      return;
    }

    setStep('loading');
    try {
      const token = getAuthToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://xccm1.duckdns.org';

      const res = await fetch(`${baseUrl}/api/v1/ai/generate-course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          subject: form.subject,
          level: form.level,
          objectives: form.objectives,
          numSections: form.numSections,
        }),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();

      const content = data.tiptapContent ?? data.content ?? data.tiptapJson ?? data;
      if (!content) throw new Error('Format de réponse inattendu du serveur.');

      setGeneratedContent(content);
      setStep('preview');
    } catch (err: any) {
      toast.error(`Génération échouée : ${err.message}`);
      setStep('form');
    }
  };

  const getCourseData = () =>
    transformTiptapToCourseData({
      title: form.title,
      content: generatedContent,
      category: form.subject || 'Cours',
      author: { name: 'IA Générative' },
    });

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    const toastId = toast.loading('Génération du PDF...');
    try {
      const courseData = getCourseData();
      const ok = await downloadCourseAsPDF(courseData);
      if (ok) toast.success('PDF téléchargé !', { id: toastId });
      else throw new Error('Échec PDF');
    } catch {
      toast.error('Erreur lors de la génération du PDF.', { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloadingDocx(true);
    const toastId = toast.loading('Génération du fichier Word...');
    try {
      const courseData = getCourseData();
      await downloadCourseAsDocx(courseData);
      toast.success('Fichier Word téléchargé !', { id: toastId });
    } catch {
      toast.error('Erreur lors de la génération du fichier Word.', { id: toastId });
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleInsert = () => {
    if (onInsertToEditor && generatedContent) {
      onInsertToEditor(generatedContent);
      toast.success('Cours inséré dans l\'éditeur !');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-purple-100 dark:border-purple-800/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-none">Générer un cours avec l&apos;IA</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {step === 'form' && 'Décrivez votre cours et laissez l\'IA le structurer'}
                {step === 'loading' && 'Génération en cours...'}
                {step === 'preview' && form.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 'preview' && (
              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft size={14} />
                Modifier
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* STEP: FORM */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="max-w-2xl mx-auto space-y-5">

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Titre du cours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="ex: Introduction à l'algèbre linéaire"
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description / Sujet <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Décrivez en détail le contenu du cours : thèmes abordés, contexte, public cible..."
                      rows={4}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Matière / Domaine</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="ex: Mathématiques, Informatique..."
                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Niveau</label>
                      <select
                        value={form.level}
                        onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      >
                        {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Objectifs pédagogiques</label>
                    <textarea
                      value={form.objectives}
                      onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                      placeholder="Ce que les apprenants sauront faire à l'issue du cours..."
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nombre de parties (Sections) : <span className="text-purple-600 font-bold">{form.numSections}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={form.numSections}
                      onChange={e => setForm(f => ({ ...f, numSections: Number(e.target.value) }))}
                      className="w-full accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                    </div>
                  </div>

                  {/* Structure reminder */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Structure générée</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Le cours sera structuré selon : <strong>Partie → Chapitre → Paragraphe → Notion</strong>, compatible avec l&apos;éditeur XCCM.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    <Sparkles size={18} />
                    Générer le cours
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: LOADING */}
            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={24} className="text-purple-600 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 dark:text-white">Génération en cours...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    L&apos;IA structure votre cours — cela peut prendre quelques instants.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP: PREVIEW */}
            {step === 'preview' && generatedContent && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex overflow-hidden"
              >
                {/* Preview panel */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                  <div className="max-w-4xl mx-auto py-8 px-6">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{form.title}</h1>
                    <CourseContentRenderer content={generatedContent} forceLight={false} />
                  </div>
                </div>

                {/* Right action panel */}
                <div className="w-64 flex-none border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col p-5 gap-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Actions</h3>

                  {onInsertToEditor && (
                    <button
                      onClick={handleInsert}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
                    >
                      <FileText size={15} />
                      Insérer dans l&apos;éditeur
                    </button>
                  )}

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                  >
                    <Download size={15} />
                    {isDownloadingPdf ? 'Génération...' : 'Télécharger PDF'}
                  </button>

                  <button
                    onClick={handleDownloadWord}
                    disabled={isDownloadingDocx}
                    className="w-full flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                  >
                    <FileDown size={15} />
                    {isDownloadingDocx ? 'Génération...' : 'Télécharger Word'}
                  </button>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                      Le cours est structuré en Parties, Chapitres, Paragraphes et Notions, compatible avec l&apos;éditeur XCCM.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AICourseGenerator;
