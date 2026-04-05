import React, { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Award, CheckCircle, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExerciceNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const isEditable = editor.isEditable;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  
  // Viewer state
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const questions = node.attrs.questions || [];

  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [node.attrs.title]);

  const handleAnswerChange = (idx: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [idx]: opt }));
  };

  const submitExercise = () => {
    if (!questions.length) return;
    
    let correct = 0;
    questions.forEach((q: any, idx: number) => {
      // The answer is stored in 'réponse' in the data structure
      if (answers[idx] === q.réponse) {
        correct++;
      }
    });

    const percentage = (correct / questions.length) * 100;
    setScore(percentage);

    if (percentage >= 70) {
      toast.success("Bravo ! Exercice réussi !");
    } else {
      toast.error("Continuez vos efforts, vous pouvez faire mieux !");
    }
  };

  return (
    <NodeViewWrapper
      className="exercice-node"
      data-id={node.attrs.id}
      style={{
        position: 'relative',
        border: '2px solid #6366F1',
        borderLeft: '8px solid #6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        padding: '24px',
        margin: '32px 0',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Label Badge */}
      <div contentEditable={false} className="flex items-center gap-3 mb-6 select-none bg-indigo-600 text-white px-4 py-2 rounded-lg w-fit shadow-md">
        <Award className="h-5 w-5" />
        <span className="text-sm font-black uppercase tracking-wider">
          Exercice d'application {node.attrs.number || ""}
        </span>
      </div>
      {/* Exercise Title/Header */}
      <div className="flex items-start gap-2 mb-4">
        {isEditable ? (
          <textarea
            ref={titleRef}
            value={node.attrs.title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            rows={1}
            style={{
              display: 'block',
              width: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              resize: 'none',
              overflow: 'hidden',
              fontSize: '20px',
              fontWeight: 'bold',
              lineHeight: '1.5',
              color: '#4F46E5',
              padding: 0,
              margin: 0
            }}
            placeholder="Titre de l'exercice..."
          />
        ) : (
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            lineHeight: '1.5',
            color: '#4F46E5',
          }}>
            {node.attrs.title || "Application"}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="mb-6">
        <NodeViewContent className="content" />
      </div>

      {/* Interactive QCM for Viewer */}
      {!isEditable && questions.length > 0 && (
        <div contentEditable={false} className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/30 space-y-6">
          {questions.map((q: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-indigo-50 dark:border-indigo-900/20 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{q.text}</h4>
              </div>
              <div className="grid gap-3 ml-8">
                {q.options?.map((opt: string, optIdx: number) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerChange(idx, opt)}
                    className={`text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      answers[idx] === opt
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      answers[idx] === opt ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {answers[idx] === opt && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={submitExercise}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              Valider l'exercice
            </button>
            
            {score !== null && (
              <div className={`text-center font-bold text-lg ${score >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                Score : {Math.round(score as number)}% {score >= 70 ? '✅' : '🎯'}
              </div>
            )}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}