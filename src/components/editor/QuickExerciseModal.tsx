'use client';

import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { QuestionType } from '@/types/exercise';
import { useLocale } from 'next-intl';

export interface QuestionData {
  text: string;
  options: string[];
}

interface QuickExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; type: QuestionType; questions: QuestionData[] }) => void;
}

export const QuickExerciseModal: React.FC<QuickExerciseModalProps> = ({ isOpen, onClose, onSave }) => {
  const locale = useLocale();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<QuestionType>('TEXT');
  const [questions, setQuestions] = useState<QuestionData[]>([{ text: '', options: ['', ''] }]);
  const content = React.useMemo(() => (
    locale === 'fr'
      ? {
          title: 'Creer un exercice rapide',
          exerciseTitle: "Titre de l'exercice",
          exercisePlaceholder: 'Ex: Quiz Chapitre 1',
          exerciseType: "Type d'exercice",
          types: { TEXT: 'Texte', MULTIPLE_CHOICE: 'QCM', CODE: 'Code' },
          questions: 'Questions',
          questionPlaceholder: 'Votre question...',
          options: 'Options :',
          option: 'Option',
          addOption: 'Ajouter une option',
          addQuestion: 'Ajouter une question',
          cancel: 'Annuler',
          save: 'Sauvegarder'
        }
      : {
          title: 'Create a quick exercise',
          exerciseTitle: 'Exercise title',
          exercisePlaceholder: 'Example: Chapter 1 quiz',
          exerciseType: 'Exercise type',
          types: { TEXT: 'Text', MULTIPLE_CHOICE: 'MCQ', CODE: 'Code' },
          questions: 'Questions',
          questionPlaceholder: 'Your question...',
          options: 'Options:',
          option: 'Option',
          addOption: 'Add an option',
          addQuestion: 'Add a question',
          cancel: 'Cancel',
          save: 'Save'
        }
  ), [locale]);

  if (!isOpen) return null;

  const handleAddQuestion = () => setQuestions([...questions, { text: '', options: ['', ''] }]);
  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
      setQuestions(newQuestions);
    }
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, type, questions: questions.filter(q => q.text.trim() !== '') });
    setTitle('');
    setType('TEXT');
    setQuestions([{ text: '', options: ['', ''] }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-purple-200 dark:border-purple-900/30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{content.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{content.exerciseTitle}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={content.exercisePlaceholder}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{content.exerciseType}</label>
            <div className="flex gap-2">
              {(['TEXT', 'MULTIPLE_CHOICE', 'CODE'] as QuestionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    type === t
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {content.types[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto pr-2 text-gray-800 dark:text-gray-200">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{content.questions}</label>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div className="flex gap-2">
                    <span className="flex h-10 w-8 items-center justify-center font-bold text-gray-400">{index + 1}.</span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder={content.questionPlaceholder}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-400 hover:text-red-600 disabled:opacity-30 p-2"
                      disabled={questions.length <= 1}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>

                  {type === 'MULTIPLE_CHOICE' && (
                    <div className="ml-10 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{content.options}</p>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                            placeholder={`${content.option} ${oIndex + 1}`}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 focus:border-purple-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white text-xs"
                          />
                          <button
                            onClick={() => handleRemoveOption(index, oIndex)}
                            className="text-gray-400 hover:text-red-400 disabled:opacity-20"
                            disabled={q.options.length <= 2}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddOption(index)}
                        className="text-[10px] font-bold text-purple-500 hover:text-purple-600 flex items-center gap-1"
                      >
                        <FaPlus size={8} /> {content.addOption}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <FaPlus size={12} /> {content.addQuestion}
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {content.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> {content.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickExerciseModal;
