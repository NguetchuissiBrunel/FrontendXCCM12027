// src/app/espaces-collaboratifs/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  image: string;
  status: 'online' | 'offline' | 'away';
  institution: string;
}

interface SharedResource {
  id: string;
  title: string;
  type: 'course' | 'document' | 'presentation' | 'video';
  author: string;
  date: string;
  size: string;
  downloadCount: number;
}

interface Discussion {
  id: string;
  user: {
    name: string;
    image: string;
    role: string;
  };
  message: string;
  timestamp: string;
  likes: number;
  replies?: Discussion[];
}

interface CollaborativeSpace {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  resourceCount: number;
  lastActivity: string;
  tags: string[];
  isPrivate: boolean;
  admin: {
    name: string;
    image: string;
  };
}

export default function CollaborativeSpacesPage() {
  const [activeTab, setActiveTab] = useState<'spaces' | 'messages' | 'resources'>('spaces');
  const [messageInput, setMessageInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Données simulées
  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Marie Dupont', role: 'Prof de Mathématiques', image: '/images/avatars/teacher1.png', status: 'online', institution: 'Lycée Descartes' },
    { id: '2', name: 'Thomas Martin', role: 'Prof de Physique', image: '/images/avatars/teacher2.png', status: 'online', institution: 'Université Paris-Saclay' },
    { id: '3', name: 'Sophie Bernard', role: 'Prof de SVT', image: '/images/avatars/teacher3.png', status: 'away', institution: 'Collège Voltaire' },
    { id: '4', name: 'Jean Leroy', role: 'Prof d\'Informatique', image: '/images/avatars/teacher4.png', status: 'offline', institution: 'ENSPY' },
    { id: '5', name: 'Alice Petit', role: 'Prof de Français', image: '/images/avatars/teacher5.png', status: 'online', institution: 'Lycée Molière' },
  ]);

  const [sharedResources] = useState<SharedResource[]>([
    { id: '1', title: 'Cours sur les équations différentielles', type: 'course', author: 'Marie Dupont', date: '15 Jan 2024', size: '2.4 MB', downloadCount: 42 },
    { id: '2', title: 'Présentation - Mécanique quantique', type: 'presentation', author: 'Thomas Martin', date: '10 Jan 2024', size: '5.7 MB', downloadCount: 28 },
    { id: '3', title: 'Fiches de révision - Biologie cellulaire', type: 'document', author: 'Sophie Bernard', date: '5 Jan 2024', size: '1.2 MB', downloadCount: 65 },
    { id: '4', title: 'Tutoriel Python avancé', type: 'video', author: 'Jean Leroy', date: '3 Jan 2024', size: '125 MB', downloadCount: 89 },
  ]);

  const [discussions] = useState<Discussion[]>([
    {
      id: '1',
      user: { name: 'Marie Dupont', image: '/images/avatars/teacher1.png', role: 'Prof de Mathématiques' },
      message: 'Bonjour à tous ! J\'ai partagé un nouveau cours sur les équations différentielles. N\'hésitez pas à me faire vos retours.',
      timestamp: 'Il y a 2 heures',
      likes: 12,
      replies: [
        {
          id: '1-1',
          user: { name: 'Thomas Martin', image: '/images/avatars/teacher2.png', role: 'Prof de Physique' },
          message: 'Excellent travail Marie ! J\'ai particulièrement aimé la section sur les applications pratiques.',
          timestamp: 'Il y a 1 heure',
          likes: 3
        }
      ]
    },
    {
      id: '2',
      user: { name: 'Jean Leroy', image: '/images/avatars/teacher4.png', role: 'Prof d\'Informatique' },
      message: 'Je cherche des ressources pour enseigner l\'intelligence artificielle au lycée. Des suggestions ?',
      timestamp: 'Hier, 14:30',
      likes: 8,
      replies: [
        {
          id: '2-1',
          user: { name: 'Alice Petit', image: '/images/avatars/teacher5.png', role: 'Prof de Français' },
          message: 'J\'ai quelques liens intéressants. Je te les envoie en MP.',
          timestamp: 'Hier, 15:45',
          likes: 1
        }
      ]
    },
  ]);

  const [collaborativeSpaces] = useState<CollaborativeSpace[]>([
    {
      id: '1',
      title: 'Sciences Mathématiques Avancées',
      description: 'Espace dédié aux professeurs de mathématiques pour partager des ressources et collaborer sur des projets pédagogiques.',
      memberCount: 24,
      resourceCount: 156,
      lastActivity: 'Il y a 2 heures',
      tags: ['Mathématiques', 'Université', 'Recherche'],
      isPrivate: false,
      admin: { name: 'Marie Dupont', image: '/images/avatars/teacher1.png' }
    },
    {
      id: '2',
      title: 'Physique & Sciences Expérimentales',
      description: 'Collaboration entre enseignants de physique pour développer des expériences de laboratoire innovantes.',
      memberCount: 18,
      resourceCount: 89,
      lastActivity: 'Aujourd\'hui, 09:30',
      tags: ['Physique', 'Laboratoire', 'Expérimentation'],
      isPrivate: false,
      admin: { name: 'Thomas Martin', image: '/images/avatars/teacher2.png' }
    },
    {
      id: '3',
      title: 'Projet Interdisciplinaire STEM',
      description: 'Groupe de travail sur l\'intégration des technologies dans l\'enseignement des sciences.',
      memberCount: 32,
      resourceCount: 210,
      lastActivity: 'Hier, 16:45',
      tags: ['Interdisciplinaire', 'Technologie', 'Innovation'],
      isPrivate: true,
      admin: { name: 'Sophie Bernard', image: '/images/avatars/teacher3.png' }
    },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  const getResourceIcon = (type: SharedResource['type']) => {
    switch (type) {
      case 'course': return '📚';
      case 'document': return '📄';
      case 'presentation': return '📊';
      case 'video': return '🎥';
      default: return '📁';
    }
  };

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 pt-10 pb-16 overflow-hidden border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Espaces Collaboratifs</span>
              <span className="block text-purple-600 dark:text-purple-400">Entre Enseignants</span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl">
              Collaborez, échangez des ressources pédagogiques et travaillez ensemble pour enrichir vos pratiques d'enseignement.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('spaces')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'spaces'
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Espaces de travail</span>
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                    {collaborativeSpaces.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages'
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Discussions</span>
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                    {discussions.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources'
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Ressources partagées</span>
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                    {sharedResources.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Collaborateurs en ligne */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Collaborateurs en ligne</h3>
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <Image
                            src={collaborator.image}
                            alt={collaborator.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(collaborator.status)} rounded-full border-2 border-white dark:border-gray-900`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{collaborator.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{collaborator.role}</p>
                      </div>
                    </div>
                    <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA pour créer un espace */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-2">Créez votre propre espace collaboratif</h3>
              <p className="text-purple-100 text-sm mb-4">Réunissez vos collègues autour d'un projet pédagogique commun</p>
              <button className="w-full bg-white text-purple-600 hover:bg-purple-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Créer un espace</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'spaces' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Espaces de travail</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      Tous les espaces
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Mes espaces
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collaborativeSpaces.map((space) => (
                    <div key={space.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{space.title}</h3>
                            {space.isPrivate && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Privé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{space.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {space.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{space.memberCount} membres</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{space.resourceCount} ressources</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <Image
                              src={space.admin.image}
                              alt={space.admin.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Administré par</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{space.admin.name}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-lg transition-colors">
                          Rejoindre
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discussions récentes</h2>
                
                <div className="space-y-6 mb-6">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          <Image
                            src={discussion.user.image}
                            alt={discussion.user.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{discussion.user.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{discussion.user.role} • {discussion.timestamp}</p>
                            </div>
                            <button className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{discussion.message}</p>
                          
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" />
                              </svg>
                              <span>{discussion.likes}</span>
                            </button>
                            <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              Répondre
                            </button>
                            <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              Partager
                            </button>
                          </div>

                          {/* Réponses */}
                          {discussion.replies && discussion.replies.length > 0 && (
                            <div className="mt-4 ml-10 space-y-4">
                              {discussion.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    <Image
                                      src={reply.user.image}
                                      alt={reply.user.name}
                                      width={32}
                                      height={32}
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white">{reply.user.name}</h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{reply.timestamp}</p>
                                      </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{reply.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone de saisie de message */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      <Image
                        src="/images/avatars/default.png"
                        alt="Votre avatar"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Partagez vos idées, posez une question ou démarrez une nouvelle discussion..."
                        className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 transition-colors"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <button className="px-6 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium rounded-lg transition-colors">
                          Publier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ressources partagées</h2>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-lg transition-colors flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Partager une ressource</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {sharedResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{resource.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>Par {resource.author}</span>
                            <span>•</span>
                            <span>{resource.date}</span>
                            <span>•</span>
                            <span>{resource.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.downloadCount} téléchargements
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filtres */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filtrer par type</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg">Tous</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Cours
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Documents
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Présentations
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Vidéos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Statistiques */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Statistiques de collaboration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">156</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ressources partagées</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">42</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Espaces actifs</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">892</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Messages échangés</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">74</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Collaborateurs actifs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}