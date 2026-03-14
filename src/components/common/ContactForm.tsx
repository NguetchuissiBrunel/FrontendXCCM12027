// src/components/common/ContactForm.tsx - MIS À JOUR
'use client';

import { useState, useEffect } from 'react';
import { PublicServicesService } from '@/lib/services/PublicServicesService';
import type { ContactRequest } from '@/lib/models/ContactRequest';
import { useLoading } from '@/contexts/LoadingContext';
import { Send, User, Mail, MessageSquare, Phone, Building } from 'lucide-react';

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
      return 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      return 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Veuillez entrer une adresse email valide';
    }
    
    if (!formData.subject.trim()) {
      return 'Le sujet est requis';
    }
    
    if (!formData.message.trim()) {
      return 'Le message est requis';
    } else if (formData.message.length < 10) {
      return 'Le message doit contenir au moins 10 caractères';
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
        text: '🎉 Message envoyé avec succès ! Notre équipe vous répondra dans les 24-48 heures.'
      });

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);

      let errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';

      if (error.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (error.status === 422) {
        errorMessage = 'Certains champs contiennent des erreurs de validation.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
      } else if (error.status === 500) {
        errorMessage = 'Service temporairement indisponible. Notre équipe technique a été notifiée.';
      } else if (error.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = 'Vous semblez être hors ligne. Vérifiez votre connexion internet.';
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
              placeholder="Votre nom"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
              disabled={loading}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
              disabled={loading}
              required
            />
          </div>
          <textarea
            name="message"
            placeholder="Votre message"
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
            {loading ? 'Envoi...' : 'Envoyer'}
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
                    Nous vous répondrons à l&apos;adresse <span className="font-semibold">{formData.email}</span>
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
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Votre nom"
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
                Adresse email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="exemple@email.com"
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
              Sujet *
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Sujet de votre message"
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
              Message *
            </label>
            <textarea
              name="message"
              placeholder="Décrivez votre demande en détail..."
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
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Envoyer le message
              </>
            )}
          </button>
        </form>

        {/* Informations de contact alternatives */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Autres moyens de nous contacter
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
              En soumettant ce formulaire, vous acceptez notre{' '}
              <a 
                href="/privacy" 
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                politique de confidentialité
              </a>
              . Vos données sont sécurisées et ne seront jamais partagées avec des tiers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}