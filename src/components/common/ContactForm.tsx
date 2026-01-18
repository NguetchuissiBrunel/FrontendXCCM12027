// src/components/common/ContactForm.tsx
'use client';

import { useState } from 'react';
import { PublicServicesService } from '@/lib/services/PublicServicesService';
import type { ContactRequest } from '@/lib/models/ContactRequest';
import { useLoading } from '@/contexts/LoadingContext';
import { useEffect } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    message: '',
    subject: '' // Ajoutez ce champ si votre ContactRequest l'inclut
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await PublicServicesService.contactUs(formData);

      setMessage({
        type: 'success',
        text: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.'
      });

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        message: '',
        subject: ''
      });

      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);

      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

      if (error.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur. Notre équipe a été notifiée.';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg ${className}`}>
      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-400 mb-6">
        Contactez-nous directement
      </h3>

      {/* Messages de feedback */}
      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
          <div className="flex items-start">
            {message.type === 'success' ? (
              <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-purple-500 dark:text-purple-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              placeholder="Votre nom *"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              disabled={loading}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-purple-500 dark:text-purple-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Votre email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Champ sujet si présent dans ContactRequest */}
        {'subject' in formData && (
          <div className="relative">
            <input
              type="text"
              name="subject"
              placeholder="Sujet (optionnel)"
              value={formData.subject || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              disabled={loading}
            />
          </div>
        )}

        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 text-purple-500 dark:text-purple-400 w-5 h-5" />
          <textarea
            name="message"
            placeholder="Votre message *"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none resize-none"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''
            }`}
        >
          {loading ? (
            "Envoi..."
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer le message
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        * Champs obligatoires. Vos données sont traitées conformément à notre{' '}
        <a href="/privacy" className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 underline">
          politique de confidentialité
        </a>.
      </p>
    </div>
  );
}