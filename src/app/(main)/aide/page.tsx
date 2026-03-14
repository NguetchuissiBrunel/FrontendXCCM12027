'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  FaFileAlt, FaSearch, FaKey, FaUser,
  FaFileUpload, FaShare, FaCreditCard,
  FaBook, FaUserPlus, FaHeadset, FaTimes
} from 'react-icons/fa';
import { Heart, Star, Send, Mail, User, MessageSquare, ThumbsUp, Award, Gift, Smile } from 'lucide-react';
import ContactForm from '@/components/common/ContactForm';
import { toast } from 'react-hot-toast';
import { PublicServicesService } from '@/lib/services/PublicServicesService';

interface HelpItem {
  title: string;
  icon: React.ReactElement;
  solution: string;
}

const ContactPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState({ name: '', email: '', rating: '5', comments: '' });
  const [thankYouMessage, setThankYouMessage] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestionClick = (item: HelpItem) => {
    setSearchQuery(item.title);
    console.log(item.solution);
    closeSearch();
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.name || !feedback.email || !feedback.comments) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFeedback({
      name: '',
      email: '',
      rating: '5',
      comments: ''
    });
  };

  const helpItems: HelpItem[] = useMemo(() => [
    {
      title: "Problème de connexion",
      icon: <FaKey className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Vérifiez vos identifiants, effacez le cache du navigateur, ou utilisez la fonction 'mot de passe oublié'. Si le problème persiste, contactez le support."
    },
    {
      title: "Mot de passe oublié",
      icon: <FaUser className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Suivez les instructions envoyées à votre email pour réinitialiser votre mot de passe."
    },
    {
      title: "Service client",
      icon: <FaHeadset className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Notre équipe est disponible 24/7. Contactez-nous par chat en direct ou envoyez un email à support@xccm.com pour une assistance rapide."
    },
    {
      title: "Changer de compte",
      icon: <FaUserPlus className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Accédez aux paramètres du compte, sélectionnez 'Changer de compte' et suivez les étapes pour basculer vers un autre profil."
    },
    {
      title: "Créer mon premier document",
      icon: <FaFileUpload className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Cliquez sur le bouton '+' dans votre tableau de bord, choisissez un modèle ou commencez avec une page blanche."
    },
    {
      title: "Partager ma composition",
      icon: <FaShare className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Ouvrez votre composition, cliquez sur 'Partager' en haut à droite, et choisissez votre méthode de partage préférée."
    },
    {
      title: "Renouveler mon abonnement",
      icon: <FaCreditCard className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Allez dans 'Paramètres → Abonnement', sélectionnez votre plan et suivez les instructions de paiement."
    },
    {
      title: "Tuto global",
      icon: <FaBook className="w-8 h-8 text-purple-500 dark:text-purple-700" />,
      solution: "Explorez notre guide complet étape par étape. Accédez à 'Aide → Tutoriels' pour des vidéos et guides détaillés."
    }
  ], []);

  const openSearch = () => setIsSearchOverlayOpen(true);
  const closeSearch = () => setIsSearchOverlayOpen(false);

  const toggleSearchOverlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSearchOverlayOpen) {
      setSearchQuery('');
      closeSearch();
    } else {
      openSearch();
    }
  };

  const filteredItems = useMemo(() => {
    if (searchQuery.trim() === '') {
      return [];
    }
    return helpItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, helpItems]);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqItems = [
    {
      question: "Comment réinitialiser mon mot de passe ?",
      answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Vous recevrez un email avec des instructions."
    },
    {
      question: "Comment contacter le support client ?",
      answer: "Notre équipe est disponible 24/7. Vous pouvez nous contacter par chat en direct ou par email."
    },
    {
      question: "Puis-je changer mon adresse email ?",
      answer: "Oui, vous pouvez changer votre adresse email dans les paramètres de votre compte."
    },
    {
      question: "Comment accéder à mes documents ?",
      answer: "Connectez-vous à votre compte et accédez à votre tableau de bord pour voir vos documents."
    },
    {
      question: "Y a-t-il des frais de retard pour les abonnements ?",
      answer: "Oui, des frais peuvent s'appliquer si vous ne renouvelez pas votre abonnement à temps."
    }
  ];

  const stats = [
    { icon: <ThumbsUp className="text-purple-500" />, value: '98%', label: 'Satisfaction' },
    { icon: <MessageSquare className="text-purple-500" />, value: '24/7', label: 'Support' },
    { icon: <Award className="text-purple-500" />, value: '50k+', label: 'Reviews' },
    { icon: <Gift className="text-purple-500" />, value: '200+', label: 'Features' }
  ];

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nouvelle fonction pour gérer la soumission du formulaire de contact
  const handleContactSubmit = async (formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    setIsSubmitting(true);
    try {
      await PublicServicesService.contactUs(formData);
      toast.success('✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      return { success: true };
    } catch (error: any) {
      console.error('Erreur envoi formulaire contact:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.';
      
      if (error.status === 400) {
        errorMessage = 'Veuillez vérifier les informations saisies. Certains champs sont invalides.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
      } else if (error.status === 500) {
        errorMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      {/* Header Section */}
      <div className="relative flex-grow">
        <div className="relative h-[300px] sm:h-[400px]">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat 
                    bg-[url('/images/fond9.jpeg')] 
                    dark:bg-[url('/images/unnamed.jpg')]">
            <div className="absolute inset-0 bg-purple-900/35 dark:bg-purple-900/30" />
          </div>

          <div className="container mx-auto relative h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white flex items-center">
                <FaFileAlt className="mr-4" />
                Centre d&apos;aide de XCCM
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white mb-6 dark:text-gray-100 sm:mb-8 max-w-2xl mx-auto">
                Votre satisfaction est notre engagement : des solutions simples et rapides à portée de main... Contactez-nous !
              </p>

              {/* Bloc de recherche */}
              <div className={`max-w-xl w-full mx-auto ${isSearchOverlayOpen
                ? 'z-50 fixed top-20 left-1/2 -translate-x-1/2 px-4'
                : 'relative'
                }`}>
                <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    onFocus={openSearch}
                    placeholder="Rechercher une solution..."
                    className="w-full pl-12 pr-16 py-4 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base bg-white dark:bg-gray-800" />
                  <button
                    type="button"
                    onClick={toggleSearchOverlay}
                    className="absolute right-2 p-2 sm:p-3 text-white bg-purple-600 dark:bg-purple-700 rounded-full hover:bg-purple-700 transition-colors"
                  >
                    {isSearchOverlayOpen ? (
                      <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FaSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </form>
              </div>

              {/* Overlay plein écran */}
              {isSearchOverlayOpen && (
                <div
                  className="fixed inset-0 top-0 left-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-40 overflow-y-auto"
                >
                  <div className="container mx-auto px-4 py-8 pt-40">

                    {searchQuery.trim() === '' && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <p>Commencez à taper pour rechercher un sujet...</p>
                      </div>
                    )}

                    {searchQuery.trim() !== '' && (
                      filteredItems.length > 0 ? (
                        <div className="space-y-4 max-w-xl mx-auto">
                          <h2 className="text-gray-500 dark:text-gray-400 mb-4 font-semibold">Résultats pour &quot;{searchQuery}&quot;</h2>
                          {filteredItems.map((item, index) => (
                            <div
                              key={index}
                              className="cursor-pointer p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-shadow"
                              onClick={() => handleSuggestionClick(item)}
                            >
                              <h3 className="text-purple-900 dark:text-purple-300 font-semibold">{item.title}</h3>
                              <span className="text-gray-600 dark:text-gray-400 block mt-1">{item.solution}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                          <p>Aucun résultat trouvé pour &quot;{searchQuery}&quot;.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Items Section */}
        <div className="container mx-auto px-4 py-8 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col justify-between">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-700 mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.solution}</p>
                </div>
                <div className="mt-auto w-full bg-gradient-to-r from-purple-400 to-purple-900 text-center p-2 rounded-b-lg">
                  <a href="#faq" className="text-white font-semibold">Plus de questions</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="container mx-auto px-4 py-8">
        <h2 className="text-3xl dark:text-gray-300 font-bold mb-4">Foire Aux Questions (FAQ)</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
              <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-semibold text-purple-900 dark:text-purple-800">{item.question}</span>
                <span>{faqOpen === index ? '-' : '+'}</span>
              </button>
              {faqOpen === index && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial Section */}
      <div className="container bg-purple-100 dark:bg-purple-800 rounded-lg mx-auto px-4 py-8 flex flex-col md:flex-row items-start">
        {/* Section tutoriel - vous pouvez ajouter du contenu ici si nécessaire */}
      </div>

      {/* Contact Section - AVEC FORMULAIRE CONNECTÉ */}
      <div className="container w-full bg-white dark:bg-gray-900 mx-auto px-4 py-8 flex flex-wrap md:flex-nowrap gap-6">
        <div className="w-full md:w-1/2">
          <div className="text-center mb-8">
            <h2 className="text-4xl text-black dark:text-gray-400 font-bold mb-4 flex items-center justify-center gap-2">
              <Heart className="text-black dark:text-gray-400 w-10 h-10" />
              Contactez notre support
            </h2>
            <p className="text-black dark:text-gray-500 text-lg">
              Notre équipe est là pour vous aider. Envoyez-nous votre message et nous vous répondrons rapidement.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg text-center">
                <div className="mb-2 text-xl">{stat.icon}</div>
                <div className="text-lg font-bold dark:text-purple-600 text-purple-900">{stat.value}</div>
                <div className="text-sm text-black dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ContactForm connecté à l'API */}
          <ContactForm 
            onSubmit={handleContactSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 overflow-hidden relative h-64 md:h-auto rounded-lg">
          <Image
            src="/images/ima20.jpeg"
            alt="Support client"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* Section Feedback optionnelle - si vous voulez la garder */}
      {submitted ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-2xl text-center">
            <Smile className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
              Merci pour votre feedback !
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-6">
              Votre avis nous est précieux pour améliorer nos services.
            </p>
            <button
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Soumettre un autre feedback
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ContactPage;