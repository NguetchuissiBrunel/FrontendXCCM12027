'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAIGeneration } from '@/contexts/AIGenerationContext';

interface AIGenerationBackgroundNotifierProps {
  onOpenModal: () => void;
}

const TOAST_SUCCESS_ID = 'ai-generation-complete';
const TOAST_ERROR_ID = 'ai-generation-error';

export default function AIGenerationBackgroundNotifier({
  onOpenModal,
}: AIGenerationBackgroundNotifierProps) {
  const {
    isGenerating,
    isInBackground,
    hasUnreadCompletion,
    hasUnreadError,
    result,
    error,
    returnToForeground,
    steps,
  } = useAIGeneration();

  const notifiedCompletionRef = useRef(false);
  const notifiedErrorRef = useRef(false);

  const handleOpenModal = useCallback(() => {
    toast.dismiss(TOAST_SUCCESS_ID);
    toast.dismiss(TOAST_ERROR_ID);
    returnToForeground();
    onOpenModal();
  }, [returnToForeground, onOpenModal]);

  useEffect(() => {
    if (hasUnreadCompletion && result && !notifiedCompletionRef.current) {
      notifiedCompletionRef.current = true;
      toast.custom(
        (t) => (
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              handleOpenModal();
            }}
            className={`${
              t.visible ? 'animate-in slide-in-from-top-2' : 'opacity-0'
            } flex items-start gap-3 w-full max-w-sm p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 text-left cursor-pointer hover:shadow-xl transition-shadow`}
          >
            <div className="flex-none p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Cours généré avec succès
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                « {result.title} »
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1.5 font-medium">
                Cliquez pour voir et insérer le cours
              </p>
            </div>
          </button>
        ),
        { id: TOAST_SUCCESS_ID, duration: Infinity, position: 'top-right' }
      );
    }

    if (!hasUnreadCompletion) {
      notifiedCompletionRef.current = false;
    }
  }, [hasUnreadCompletion, result, handleOpenModal]);

  useEffect(() => {
    if (hasUnreadError && error && !notifiedErrorRef.current) {
      notifiedErrorRef.current = true;
      toast.custom(
        (t) => (
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              handleOpenModal();
            }}
            className={`${
              t.visible ? 'animate-in slide-in-from-top-2' : 'opacity-0'
            } flex items-start gap-3 w-full max-w-sm p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-red-200 dark:border-red-800 text-left cursor-pointer hover:shadow-xl transition-shadow`}
          >
            <div className="flex-none p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Échec de la génération IA
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                {error}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                Cliquez pour voir les détails
              </p>
            </div>
          </button>
        ),
        { id: TOAST_ERROR_ID, duration: Infinity, position: 'top-right' }
      );
    }

    if (!hasUnreadError) {
      notifiedErrorRef.current = false;
    }
  }, [hasUnreadError, error, handleOpenModal]);

  if (!mounted || !isInBackground || !isGenerating) return null;

  const lastStep = steps[steps.length - 1];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 max-w-xs">
      <Loader2 className="h-4 w-4 animate-spin text-purple-500 flex-none" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Génération IA en cours
        </p>
        {lastStep && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {lastStep.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleOpenModal}
        className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline flex-none"
      >
        Voir
      </button>
    </div>
  );
}
