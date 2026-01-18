// src/app/support-technique/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useLoading } from '@/contexts/LoadingContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technique' | 'compte' | 'paiement';
  popularity: number;
}

interface TicketStatus {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  lastUpdate: string;
}

export default function SupportTechniquePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    urgency: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (isSubmitting) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isSubmitting, startLoading, stopLoading]);
  const [userTickets] = useState<TicketStatus[]>([
    { id: 'TKT-001', title: 'Problème de connexion à l\'éditeur', status: 'in-progress', priority: 'high', date: '15 Jan 2024', lastUpdate: 'Aujourd\'hui, 10:30' },
    { id: 'TKT-002', title: 'Question sur l\'export PDF', status: 'open', priority: 'medium', date: '14 Jan 2024', lastUpdate: 'Hier, 16:45' },
    { id: 'TKT-003', title: 'Demande de fonctionnalité', status: 'resolved', priority: 'low', date: '10 Jan 2024', lastUpdate: '12 Jan 2024' },
  ]);

  const [faqItems] = useState<FAQItem[]>([
    {
      id: 'faq-1',
      question: 'Comment créer mon premier cours sur la plateforme ?',
      answer: 'Pour créer votre premier cours : 1) Connectez-vous à votre compte, 2) Cliquez sur "Créer un cours" dans votre tableau de bord, 3) Donnez un titre à votre cours, 4) Utilisez l\'éditeur visuel pour ajouter du contenu, 5) Organisez votre cours en chapitres et sections, 6) Publiez votre cours quand il est prêt. Vous pouvez également importer des documents existants (PDF, Word, PowerPoint).',
      category: 'general',
      popularity: 95
    },
    {
      id: 'faq-2',
      question: 'Comment fonctionne l\'éditeur de contenu ?',
      answer: 'Notre éditeur utilise une approche WYSIWYG (What You See Is What You Get) : - Glissez-déposez des éléments (texte, images, vidéos) - Mise en forme riche avec la barre d\'outils - Support des équations mathématiques (LaTeX) - Insertion de quiz interactifs - Prévisualisation en temps réel. L\'éditeur sauvegarde automatiquement toutes les 30 secondes.',
      category: 'technique',
      popularity: 88
    },
    {
      id: 'faq-3',
      question: 'Comment collaborer avec d\'autres enseignants ?',
      answer: 'La collaboration se fait via les espaces collaboratifs : 1) Rejoignez ou créez un espace collaboratif, 2) Invitez vos collègues par email, 3) Partagez vos cours en mode "lecture seule" ou "édition", 4) Utilisez le chat intégré pour discuter, 5) Suivez les modifications avec l\'historique des versions. Vous pouvez également dupliquer des cours existants pour les adapter.',
      category: 'general',
      popularity: 76
    },
    {
      id: 'faq-4',
      question: 'Quels formats d\'export sont disponibles ?',
      answer: 'Nous supportons plusieurs formats d\'export : - PDF (avec mise en page optimisée) - DOCX (compatible Microsoft Word) - HTML (pour intégration web) - SCORM (pour LMS externes) - EPUB (pour liseuses). Chaque format inclut les métadonnées, la table des matières et les ressources multimédias adaptées.',
      category: 'technique',
      popularity: 72
    },
    {
      id: 'faq-5',
      question: 'Comment réinitialiser mon mot de passe ?',
      answer: 'Si vous avez oublié votre mot de passe : 1) Cliquez sur "Mot de passe oublié" sur la page de connexion, 2) Entrez votre adresse email, 3) Suivez le lien dans l\'email que vous recevrez, 4) Créez un nouveau mot de passe (minimum 8 caractères avec majuscule, minuscule et chiffre). Si vous ne recevez pas l\'email, vérifiez vos spams ou contactez-nous.',
      category: 'compte',
      popularity: 65
    },
    {
      id: 'faq-6',
      question: 'Comment gérer les abonnements et les paiements ?',
      answer: 'Gérez votre abonnement depuis "Paramètres du compte" > "Abonnement" : - Passez à un plan supérieur - Annulez votre abonnement - Téléchargez vos factures - Mettez à jour vos informations de paiement. Les paiements sont sécurisés via Stripe et vous recevez une confirmation par email après chaque transaction.',
      category: 'paiement',
      popularity: 59
    },
    {
      id: 'faq-7',
      question: 'La plateforme est-elle accessible sur mobile ?',
      answer: 'Oui, la plateforme est entièrement responsive et fonctionne sur tous les appareils : - Application web mobile optimisée - Applications natives iOS et Android disponibles - Synchronisation en temps réel entre appareils - Fonctionnalités adaptées à l\'écran tactile. Certaines fonctionnalités avancées de l\'éditeur sont optimisées pour le bureau.',
      category: 'technique',
      popularity: 54
    },
    {
      id: 'faq-8',
      question: 'Comment signaler un problème technique ?',
      answer: 'Pour signaler un problème : 1) Utilisez le formulaire de contact sur cette page, 2) Décrivez le problème en détail avec les étapes pour le reproduire, 3) Ajoutez des captures d\'écran si possible, 4) Indiquez votre navigateur et système d\'exploitation. Notre équipe technique répond dans les 24 heures ouvrables.',
      category: 'technique',
      popularity: 48
    },
  ]);

  const categories = [
    { id: 'all', label: 'Toutes les questions', count: faqItems.length },
    { id: 'general', label: 'Général', count: faqItems.filter(f => f.category === 'general').length },
    { id: 'technique', label: 'Technique', count: faqItems.filter(f => f.category === 'technique').length },
    { id: 'compte', label: 'Compte', count: faqItems.filter(f => f.category === 'compte').length },
    { id: 'paiement', label: 'Paiement', count: faqItems.filter(f => f.category === 'paiement').length },
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFAQToggle = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Votre message a été envoyé ! Notre équipe vous répondra dans les 24 heures.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: '',
      urgency: 'medium',
    });
    setIsSubmitting(false);
  };

  const getPriorityColor = (priority: TicketStatus['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getStatusColor = (status: TicketStatus['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in-progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 pt-10 pb-16 overflow-hidden border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Support Technique</span>
              <span className="block text-purple-600 dark:text-purple-400">Centre d'aide</span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl">
              Trouvez rapidement des réponses à vos questions ou contactez notre équipe d'assistance
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="#faq"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-center hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">FAQ</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Questions fréquentes</p>
          </Link>

          <Link
            href="#contact"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-center hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Contact</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Formulaire de contact</p>
          </Link>

          <Link
            href="#tickets"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-center hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Mes tickets</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Suivi des demandes</p>
          </Link>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-white">Chat en direct</h3>
            <p className="text-purple-100 text-sm">Disponible 9h-18h</p>
            <button className="mt-3 bg-white text-purple-600 hover:bg-purple-50 text-sm font-medium py-2 px-4 rounded-lg transition-colors w-full">
              Démarrer le chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - FAQ & Search */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans l'aide..."
                  className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Foire Aux Questions</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredFAQs.length} questions trouvées
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeCategory === category.id
                      ? 'bg-purple-600 text-white dark:bg-purple-700'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {category.label}
                    <span className="ml-2 bg-white/20 dark:bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => handleFAQToggle(item.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">?</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.question}</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {item.popularity}% d'utilité
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedFAQ === item.id ? 'transform rotate-180' : ''
                            }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expandedFAQ === item.id && (
                      <div className="px-6 pb-4">
                        <div className="pl-11 border-l-2 border-purple-200 dark:border-purple-800">
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{item.answer}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Catégorie : {categories.find(c => c.id === item.category)?.label}
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" />
                                </svg>
                                Utile
                              </button>
                              <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                                Pas utile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Formulaire de Contact</h2>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        placeholder="Sujet de votre demande"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Catégorie *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <option value="general">Général</option>
                        <option value="technique">Problème technique</option>
                        <option value="compte">Problème de compte</option>
                        <option value="paiement">Facturation/Paiement</option>
                        <option value="feature">Demande de fonctionnalité</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgence *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'low', label: 'Basse', icon: '🟢' },
                        { value: 'medium', label: 'Moyenne', icon: '🟡' },
                        { value: 'high', label: 'Haute', icon: '🟠' },
                        { value: 'urgent', label: 'Urgente', icon: '🔴' },
                      ].map((level) => (
                        <label
                          key={level.value}
                          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${formData.urgency === level.value
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-600 dark:border-purple-500'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={level.value}
                            checked={formData.urgency === level.value}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          <span className="text-lg">{level.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{level.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-colors"
                      placeholder="Décrivez votre problème ou votre demande en détail..."
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      * Champs obligatoires
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <span>Envoi...</span>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Envoyer le message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>

          {/* Right Column - Tickets & Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* My Tickets */}
            <section id="tickets">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mes tickets</h3>
                  <Link href="/tickets" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    Voir tout
                  </Link>
                </div>

                <div className="space-y-4">
                  {userTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority === 'urgent' ? 'Urgent' :
                            ticket.priority === 'high' ? 'Haute' :
                              ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>{ticket.id}</span>
                        <span>{ticket.date}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status === 'open' ? 'Ouvert' :
                            ticket.status === 'in-progress' ? 'En cours' :
                              ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Dernière mise à jour : {ticket.lastUpdate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-colors flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nouvelle demande</span>
                </button>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Informations de contact</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Téléphone</h4>
                      <p className="text-purple-100 text-sm">+33 1 23 45 67 89</p>
                      <p className="text-purple-200 text-xs">Lun-Ven 9h-18h</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Email</h4>
                      <p className="text-purple-100 text-sm">support@xccm-platform.com</p>
                      <p className="text-purple-200 text-xs">Réponse sous 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Adresse</h4>
                      <p className="text-purple-100 text-sm">123 Rue de l'Éducation</p>
                      <p className="text-purple-200 text-xs">75000 Paris, France</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="font-medium text-white mb-3">Heures d'ouverture</h4>
                  <div className="space-y-2 text-sm text-purple-100">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span>10h00 - 14h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span>Fermé</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Resources */}
            <section>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ressources utiles</h3>

                <div className="space-y-4">
                  <Link href="/documentation" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Documentation complète
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link href="/tutoriels" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Tutoriels vidéo
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link href="/blog" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Blog & Actualités
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link href="/community" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Communauté
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl shadow-lg dark:shadow-gray-900/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-purple-100 text-sm">Support disponible</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">2h</div>
              <div className="text-purple-100 text-sm">Temps de réponse moyen</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-purple-100 text-sm">Satisfaction client</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-purple-100 text-sm">Questions résolues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}