'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  FaFileAlt, FaSearch, FaKey, FaUser,
  FaFileUpload, FaShare, FaCreditCard,
  FaBook, FaUserPlus, FaHeadset, FaTimes
} from 'react-icons/fa';
import { Heart, MessageSquare, ThumbsUp, Award, Gift, Smile } from 'lucide-react';
import ContactForm from '@/components/common/ContactForm';
import { toast } from 'react-hot-toast';
import { PublicServicesService } from '@/lib/services/PublicServicesService';
import { useTranslations } from 'next-intl';

interface HelpItem {
  title: string;
  icon: React.ReactElement;
  solution: string;
}

const ContactPage = () => {
  const t = useTranslations('pages.aide');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const content = useMemo(() => {
    const helpItemKeys = ['login', 'password', 'customer', 'account', 'firstDoc', 'share', 'renew', 'tutorial'];
    const getHelpIcon = (key: string) => {
      switch (key) {
        case 'login': return <FaKey className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'password': return <FaUser className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'customer': return <FaHeadset className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'account': return <FaUserPlus className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'firstDoc': return <FaFileUpload className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'share': return <FaShare className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'renew': return <FaCreditCard className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        case 'tutorial': return <FaBook className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
        default: return <FaFileAlt className="w-8 h-8 text-purple-500 dark:text-purple-700" />;
      }
    };

    const faqKeys = ['pwd', 'support', 'email', 'docs', 'fees'];

    return {
      validationRequired: t('validationRequired'),
      helpItems: helpItemKeys.map(key => ({
        title: t(`helpItems.${key}.title`),
        solution: t(`helpItems.${key}.solution`),
        icon: getHelpIcon(key)
      })),
      faqItems: faqKeys.map(key => ({
        question: t(`faqItems.${key}.question`),
        answer: t(`faqItems.${key}.answer`)
      })),
      stats: [
        { icon: <ThumbsUp className="text-purple-500" />, value: t('stats.satisfaction.value'), label: t('stats.satisfaction.label') },
        { icon: <MessageSquare className="text-purple-500" />, value: t('stats.support.value'), label: t('stats.support.label') },
        { icon: <Award className="text-purple-500" />, value: t('stats.reviews.value'), label: t('stats.reviews.label') },
        { icon: <Gift className="text-purple-500" />, value: t('stats.features.value'), label: t('stats.features.label') }
      ],
      headerTitle: t('headerTitle'),
      headerDescription: t('headerDescription'),
      searchPlaceholder: t('searchPlaceholder'),
      startTyping: t('startTyping'),
      resultsFor: t('resultsFor'),
      noResults: t('noResults'),
      moreQuestions: t('moreQuestions'),
      faqTitle: t('faqTitle'),
      contactTitle: t('contactTitle'),
      contactDescription: t('contactDescription'),
      imageAlt: t('imageAlt'),
      feedbackThanksTitle: t('feedbackThanksTitle'),
      feedbackThanksDescription: t('feedbackThanksDescription'),
      feedbackAgain: t('feedbackAgain'),
      contactSuccess: t('contactSuccess'),
      contactError: t('contactError'),
      invalidFields: t('invalidFields'),
      tooManyAttempts: t('tooManyAttempts'),
      unavailable: t('unavailable')
    };
  }, [t]);

  const handleSuggestionClick = (item: HelpItem) => {
    setSearchQuery(item.title);
    console.log(item.solution);
    closeSearch();
  };

  const resetForm = () => {
    setSubmitted(false);
  };

  const helpItems: HelpItem[] = useMemo(() => content.helpItems, [content]);

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

  const faqItems = content.faqItems;
  const stats = content.stats;

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
                {content.headerTitle}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white mb-6 dark:text-gray-100 sm:mb-8 max-w-2xl mx-auto">
                {content.headerDescription}
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
                    placeholder={content.searchPlaceholder}
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
                        <p>{content.startTyping}</p>
                      </div>
                    )}

                    {searchQuery.trim() !== '' && (
                      filteredItems.length > 0 ? (
                        <div className="space-y-4 max-w-xl mx-auto">
                          <h2 className="text-gray-500 dark:text-gray-400 mb-4 font-semibold">{content.resultsFor} &quot;{searchQuery}&quot;</h2>
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
                          <p>{content.noResults} &quot;{searchQuery}&quot;.</p>
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
                  <a href="#faq" className="text-white font-semibold">{content.moreQuestions}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="container mx-auto px-4 py-8">
        <h2 className="text-3xl dark:text-gray-300 font-bold mb-4">{content.faqTitle}</h2>
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
              {content.contactTitle}
            </h2>
            <p className="text-black dark:text-gray-500 text-lg">
              {content.contactDescription}
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
            title=""
            description=""
          />
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 overflow-hidden relative h-64 md:h-auto rounded-lg">
          <Image
            src="/images/ima20.jpeg"
            alt={content.imageAlt}
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
              {content.feedbackThanksTitle}
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-6">
              {content.feedbackThanksDescription}
            </p>
            <button
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {content.feedbackAgain}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ContactPage;
