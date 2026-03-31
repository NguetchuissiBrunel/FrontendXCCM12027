// src/components/common/ContactForm.tsx - MIS À JOUR
'use client';

import { useState, useEffect } from 'react';
import { PublicServicesService } from '@/lib/services/PublicServicesService';
import type { ContactRequest } from '@/lib/models/ContactRequest';
import { useLoading } from '@/contexts/LoadingContext';
import { Send, User, Mail, MessageSquare, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ContactFormProps {
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  showPrivacyNote?: boolean;
}

export default function ContactForm({ 
  className = '',
  compact = false,
  title = "Contactez-nous",
  description = "Nous sommes là pour vous aider. Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.",
  showPrivacyNote = true
}: ContactFormProps) {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer le message d'erreur lorsque l'utilisateur commence à taper
    if (message?.type === 'error') {
      setMessage(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t('validation.nameRequired');
    }
    
    if (!formData.email.trim()) {
      return t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return t('validation.emailInvalid');
    }
    
    if (!formData.subject.trim()) {
      return t('validation.subjectRequired');
    }
    
    if (!formData.message.trim()) {
      return t('validation.messageRequired');
    } else if (formData.message.length < 10) {
      return t('validation.messageTooShort');
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await PublicServicesService.contactUs(formData);

      setMessage({
        type: 'success',
        text: t('messages.success')
      });

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        message?: string;
      };
      console.error('Erreur lors de l\'envoi du message:', error);

      let errorMessage = t('messages.unexpectedError');

      if (apiError.status === 400) {
        errorMessage = t('messages.invalidData');
      } else if (apiError.status === 422) {
        errorMessage = t('messages.validationError');
      } else if (apiError.status === 429) {
        errorMessage = t('messages.tooManyAttempts');
      } else if (apiError.status === 500) {
        errorMessage = t('messages.serviceUnavailable');
      } else if (apiError.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = t('messages.offline');
      }

      setMessage({ type: 'error', text: errorMessage });
      
    } finally {
      setLoading(false);
    }
  };

  // Version compacte
  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              placeholder={t('placeholders.name')}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
              disabled={loading}
              required
            />
            <input
              type="email"
              name="email"
              placeholder={t('placeholders.email')}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
              disabled={loading}
              required
            />
          </div>
          <textarea
            name="message"
            placeholder={t('placeholders.messageShort')}
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm resize-none"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('actions.sendingShort') : t('actions.sendShort')}
          </button>
        </form>
        {message && (
          <div className={`text-xs px-3 py-2 rounded ${message.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  // Version complète
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        {/* Messages de feedback */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800'
              : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {message.text}
                </p>
                {message.type === 'success' && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {t('messages.replyHint')} <span className="font-semibold">{formData.email}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nom */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                {t('fields.fullName')}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t('placeholders.name')}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-colors disabled:opacity-50"
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                {t('fields.email')}
              </label>
              <input
                type="email"
                name="email"
                placeholder={t('placeholders.emailExample')}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-colors disabled:opacity-50"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MessageSquare className="h-4 w-4" />
              {t('fields.subject')}
            </label>
            <input
              type="text"
              name="subject"
              placeholder={t('placeholders.subject')}
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-colors disabled:opacity-50"
              disabled={loading}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MessageSquare className="h-4 w-4" />
              {t('fields.message')}
            </label>
            <textarea
              name="message"
              placeholder={t('placeholders.message')}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-colors resize-none disabled:opacity-50"
              disabled={loading}
              required
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl ${
              loading ? 'animate-pulse' : 'hover:from-purple-700 hover:to-purple-800'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('actions.sending')}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                {t('actions.send')}
              </>
            )}
          </button>
        </form>

        {/* Informations de contact alternatives */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('alternativeTitle')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 text-purple-500" />
              <span>contact@xccm.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 text-purple-500" />
              <span>+237 6 94 77 34 72</span>
            </div>
          </div>
        </div>

        {/* Note de confidentialité */}
        {showPrivacyNote && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('privacy.prefix')}{' '}
              <a 
                href="/privacy" 
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('privacy.link')}
              </a>
              . {t('privacy.suffix')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
