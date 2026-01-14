'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, X, FileText, Image as ImageIcon, Target, Plus, Move } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { title: string; category: string; description: string; image?: string; file?: any }) => void;
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit }: Props) {

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    customCategory: '',
    description: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ name: string; type: string } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Réinitialiser la position au centre
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Fermeture avec la touche Echap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({ name: file.name, type: file.type });
    }
  };

  const handleSubmit = () => {
    console.log("Données soumises:", { ...formData, imagePreview, fileData });
    if (onSubmit) {
      onSubmit({
        title: formData.title,
        category: formData.category === 'custom' ? formData.customCategory : formData.category,
        description: formData.description,
        image: imagePreview || undefined,
        file: fileData
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay avec Flou */}
      <div
        className="absolute inset-0 bg-gray-900/60  transition-opacity"
        onClick={onClose}
      />

      {/* Contenu de la Modale - Draggable */}
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        className="relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-purple-100 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col transition-shadow hover:shadow-purple-500/20"
      >

        {/* Header Fixe - Zone de drag */}
        <div
          onMouseDown={handleMouseDown}
          className="bg-purple-600 dark:bg-purple-700 p-6 sm:p-8 text-center text-white relative cursor-grab active:cursor-grabbing"
        >
          <div className="absolute left-6 top-6 flex items-center gap-2 text-purple-200">
            <Move size={20} className="animate-pulse" />
            <span className="text-xs font-medium">Déplacer</span>
          </div>
          <button
            onClick={onClose}
            className="no-drag absolute right-6 top-6 hover:bg-white/20 p-2 rounded-full transition-all active:scale-90"
          >
            <X size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Création d'un Cours</h1>
          <p className="text-purple-100 mt-2 text-sm font-medium opacity-90">Partagez votre savoir avec vos étudiants</p>
        </div>

        {/* Formulaire défilable */}
        <div className="no-drag p-6 sm:p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">

          {/* Titre & Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Titre du cours
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Architecture des Systèmes"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Catégorie</label>
              <div className="relative group">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 appearance-none outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all cursor-pointer"
                >
                  <option value="" disabled hidden>Sélectionner...</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Langues">Langues</option>
                  <option value="custom">+ Autre catégorie</option>
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 group-hover:text-purple-500 pointer-events-none transition-colors" size={20} />
              </div>
            </div>
          </div>

          {formData.category === 'custom' && (
            <input
              type="text"
              placeholder="Saisissez votre catégorie personnalisée"
              className="w-full border-b-2 border-purple-400 p-2 outline-none animate-in slide-in-from-top-2"
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
            />
          )}

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ImageIcon size={18} className="text-purple-500" /> Image de couverture
              </label>
              <div
                onClick={() => !imagePreview && imageInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all h-40 flex flex-col items-center justify-center overflow-hidden cursor-pointer ${imagePreview ? 'border-purple-400' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-purple-400 hover:bg-purple-50/30'
                  }`}
              >
                <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                    <button onClick={(e) => { e.stopPropagation(); setImagePreview(null) }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors"><X size={14} /></button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload size={24} className="mx-auto mb-2 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500">JPG, PNG (Max 2Mo)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText size={18} className="text-purple-500" /> Ressources (PDF, DOC)
              </label>
              <div
                onClick={() => !fileData && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all h-40 flex flex-col items-center justify-center cursor-pointer ${fileData ? 'border-purple-400 bg-purple-50/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-purple-400'
                  }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
                {fileData ? (
                  <div className="flex flex-col items-center p-4 text-center">
                    <FileText size={32} className="text-purple-600 mb-2" />
                    <p className="text-xs font-bold truncate max-w-[150px]">{fileData.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setFileData(null) }} className="mt-2 text-xs text-red-500 hover:underline">Supprimer</button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Plus size={24} className="mx-auto mb-2 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500">Ajouter un support</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target size={18} className="text-purple-500" /> Description du programme
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Qu'est-ce que les étudiants vont apprendre ?"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-4 dark:bg-gray-900 h-32 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer Fixe */}
        <div className="no-drag p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-8 py-4 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="order-1 sm:order-2 bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-purple-200 dark:shadow-none transform hover:-translate-y-1 active:scale-95"
          >
            Créer le cours
          </button>
        </div>
      </div>
    </div>
  );
}