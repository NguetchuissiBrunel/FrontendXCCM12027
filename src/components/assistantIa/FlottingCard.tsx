"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Maximize2, Minimize2, Square } from 'lucide-react';
import { ChatService } from '@/lib2/services/ChatService';
import { CancelError } from '@/lib2/core/CancelablePromise';
import { motion } from 'framer-motion';


interface Message {
  role: 'assistant' | 'user';
  content: string;
  loading?: boolean;
  metadata?: {
    agent_type?: string;
    confidence_score?: number;
    follow_up_questions?: string[];
    sources?: string[];
    suggested_resources?: string[];
  };
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant éducatif XCCM1. Posez-moi une question sur les mathématiques, physique, informatique, ou d\'autres disciplines.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [photoUrl, setPhotoUrl] = useState<string>('/images/pp.jpeg');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('general');
  const [position, setPosition] = useState({ x: 20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 20, y: 0 });
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonDragOffset = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<any>(null);

  // Détection dynamique de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setPosition({ x: 20, y: window.innerHeight - 520 });
        setButtonPosition({ x: 20, y: window.innerHeight - 70 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setPhotoUrl(parsedUser.photoUrl || '/images/pp.jpeg');
        setUserName(parsedUser.firstName || '');

        // Déterminer le rôle de l'utilisateur
        if (parsedUser.role === 'teacher' || parsedUser.role === 'admin') {
          setUserRole(parsedUser.role);
        }

        // Mettre à jour le message de bienvenue personnalisé
        setMessages([{
          role: 'assistant',
          content: `Bonjour ${parsedUser.firstName || ''} ! Je suis votre assistant éducatif XCCM1. Comment puis-je vous aider aujourd'hui ?`
        }]);
      } catch (e) {
        console.error('Erreur parsing user data:', e);
      }
    }
  }, []);



  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || isFullscreen) return;
    const target = e.target as HTMLElement;
    if (target.closest('.chat-header')) {
      setIsDragging(true);
      dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    setIsButtonDragging(true);
    buttonDragOffset.current = { x: e.clientX - buttonPosition.x, y: e.clientY - buttonPosition.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isMobile) {
      const newX = Math.max(10, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 370));
      const newY = Math.max(10, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 490));
      setPosition({ x: newX, y: newY });
    }
    if (isButtonDragging && !isMobile) {
      const newX = Math.max(10, Math.min(e.clientX - buttonDragOffset.current.x, window.innerWidth - 70));
      const newY = Math.max(10, Math.min(e.clientY - buttonDragOffset.current.y, window.innerHeight - 70));
      setButtonPosition({ x: newX, y: newY });
    }
  }, [isDragging, isButtonDragging, isMobile]);

  useEffect(() => {
    if (isDragging || isButtonDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => {
        setIsDragging(false);
        setIsButtonDragging(false);
      });
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging, isButtonDragging, handleMouseMove]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      prevPositionRef.current = position;
      setIsFullscreen(true);
      setIsDragging(false);
    } else {
      if (prevPositionRef.current) {
        setPosition(prevPositionRef.current);
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const handleStop = () => {
    if (requestRef.current && requestRef.current.cancel) {
      requestRef.current.cancel();
      requestRef.current = null;
    }
  };

  const handleSend = async () => { 
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setInput('');

    // Ajouter un message de chargement
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      loading: true
    }]);

    setIsLoading(true);

    try {
      // Appeler l'API via le service généré
      const request = ChatService.postChat({
        question: trimmedInput,
        user_role: userRole,
        discipline: selectedDiscipline as any,
        user_id: `user_${Date.now()}`,
        // Vous pouvez ajouter d'autres paramètres optionnels
        // course_context: "Votre contexte de cours ici",
        // difficulty_level: "intermediate",
      });
      requestRef.current = request;
      const response = await request;
      requestRef.current = null;

      // Remplacer le message de chargement par la réponse
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: response.answer || 'Désolé, je n\'ai pas pu générer de réponse.',
          metadata: {
            agent_type: response.agent_type,
            confidence_score: response.confidence_score,
            follow_up_questions: response.follow_up_questions,
            sources: response.sources,
            suggested_resources: response.suggested_resources,
          }
        };
        return newMessages;
      });

      // Suggérer des questions de suivi si disponibles
      if (response.follow_up_questions && response.follow_up_questions.length > 0) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Vous pourriez aussi me demander :',
            metadata: {
              follow_up_questions: response.follow_up_questions
            }
          }]);
        }, 500);
      }

    } catch (error) {
      // Only log non-cancellation errors to console
      if (!(error instanceof CancelError)) {
        console.error('Erreur API:', error);
      }

      // Remplacer le message de chargement par un message d'erreur
      setMessages(prev => {
        const newMessages = [...prev];
        if (error instanceof CancelError) {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'La réflexion a été arrêtée par l\'utilisateur.',
          };
        } else {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant. Veuillez réessayer.',
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      requestRef.current = null;
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Déclencher l'envoi après un court délai
    setTimeout(() => {
      const sendButton = document.querySelector('button[onClick*="handleSend"]');
      if (sendButton) {
        (sendButton as HTMLElement).click();
      }
    }, 100);
  };

  const disciplines = [
    { value: 'mathematics', label: 'Mathématiques' },
    { value: 'physics', label: 'Physique' },
    { value: 'computer_science', label: 'Informatique' },
    { value: 'life_sciences', label: 'Sciences de la vie' },
    { value: 'databases', label: 'Bases de données' },
    { value: 'artificial_intelligence', label: 'Intelligence Artificielle' },
    { value: 'general', label: 'Général' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {/* Bouton flottant draggable */}
      {/* Bouton - Toujours visible en bas à droite */}

      <motion.button
        onMouseDown={handleButtonMouseDown}
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        //bottom-5 left-5
        className="pointer-events-auto fixed w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white dark:border-gray-800 hover:bg-purple-700 cursor-grab active:cursor-grabbing"
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          right: 'auto',
          bottom: 'auto',
          cursor: isButtonDragging ? 'grabbing' : 'grab'
        }}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </motion.button>
      {isOpen && (
        <div
          className={`pointer-events-auto fixed bg-white dark:bg-gray-900 shadow-2xl flex flex-col border border-purple-200 dark:border-gray-700 transition-all duration-200
            ${isFullscreen
              ? 'inset-0 rounded-none w-full h-full'
              : isMobile 
                ? 'inset-x-2 bottom-20 top-16 rounded-3xl w-auto h-auto' 
                : 'rounded-2xl w-[400px] h-[550px]'
            }
          `}
          style={!isMobile && !isFullscreen ? { 
            left: `${position.x}px`, 
            top: `${position.y}px`, 
            cursor: isDragging ? 'grabbing' : 'default',
            touchAction: 'none' 
          } : { touchAction: 'none' }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div className={`chat-header bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 flex items-center justify-between select-none
            ${isMobile ? 'rounded-t-3xl' : (isFullscreen ? 'rounded-t-none' : 'rounded-t-2xl cursor-grab active:cursor-grabbing')}
          `}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/40">
                  <Bot size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-purple-600 rounded-full"></span>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate"> XCCM AI</h3>
                <p className="text-[10px] text-purple-100 opacity-80">
                  {userName ? `En ligne pour ${userName}` : 'Assistant éducatif'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors mr-2"
                aria-pressed={isFullscreen}
                title={isFullscreen ? 'Réduire' : 'Agrandir'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sélecteur de discipline (optionnel) */}
          <div className="px-4 pt-3 pb-2 border-b border-purple-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Discipline :</span>
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {disciplines.map((disc) => (
                  <option key={disc.value} value={disc.value}>
                    {disc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/20 dark:bg-gray-800/40">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm border ${msg.role === 'user'
                    ? 'bg-purple-600 text-white border-purple-500 rounded-2xl rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-purple-100 dark:border-gray-700 rounded-2xl rounded-tl-none'
                  }`}>
                  {msg.loading || (isLoading && idx === messages.length - 1 && msg.role === 'assistant' && !msg.content) ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>L'assistant réfléchit...</span>
                    </div>
                  ) : (
                    <>
                      <div>{msg.content}</div>

                      {/* Métadonnées de la réponse */}
                      {msg.metadata && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {msg.metadata.agent_type && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Agent :</span> {msg.metadata.agent_type}
                            </div>
                          )}
                          {msg.metadata.confidence_score && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Confiance :</span>
                              {(msg.metadata.confidence_score * 100).toFixed(1)}%
                            </div>
                          )}

                          {/* Questions de suivi */}
                          {msg.metadata.follow_up_questions && msg.metadata.follow_up_questions.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Questions suggérées :
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {msg.metadata.follow_up_questions.slice(0, 3).map((q, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleQuickQuestion(q)}
                                    className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                  >
                                    {q.length > 30 ? `${q.substring(0, 30)}...` : q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Saisie */}
          <div className={`p-4 border-t border-purple-100 dark:border-gray-700 bg-white dark:bg-gray-900 ${isMobile ? 'pb-6 rounded-b-3xl' : 'rounded-b-2xl'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question ici..."
                disabled={isLoading}
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-purple-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white disabled:opacity-50"
              />
              {isLoading ? (
                <button 
                  type="button"
                  onClick={handleStop}
                  className="bg-red-500 text-white p-3 rounded-2xl shadow-lg active:scale-95 hover:bg-red-600 transition-colors flex items-center justify-center"
                  title="Arrêter la réflexion"
                >
                  <Square size={20} fill="currentColor" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSend} 
                  disabled={!input.trim()}
                  className="bg-purple-600 text-white p-3 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              )}
            </div>

            {/* Suggestions rapides */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Essayez :</span>
              {[
                "Explique-moi le théorème de Pythagore",
                "Qu'est-ce qu'une base de données ?",
                "Donne-moi un exemple de code Python"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}