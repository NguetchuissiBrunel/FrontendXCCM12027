// src/components/common/NewsletterForm.tsx
'use client';

import { useState } from 'react';
import { PublicServicesService, } from '@/lib/services/PublicServicesService';
import { NewsletterRequest } from '@/lib/models/NewsletterRequest';

interface NewsletterFormProps {
  className?: string;
}

export default function NewsletterForm({ className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const request: NewsletterRequest = { email };

      await PublicServicesService.subscribeNewsletter(request);

      setMessage({
        type: 'success',
        text: 'Merci ! Vous êtes maintenant inscrit à notre newsletter.'
      });
      setEmail(''); // Réinitialiser le champ

      // Optionnel: Reset message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Erreur inscription newsletter:', error);

      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

      if (error.status === 400) {
        errorMessage = 'Cette adresse email est déjà inscrite.';
      } else if (error.status === 422) {
        errorMessage = 'Adresse email invalide.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            suppressHydrationWarning={true}
            aria-label="Adresse email pour la newsletter"
            className="w-full min-w-0 appearance-none rounded-lg border border-transparent bg-gray-700 dark:bg-gray-800 py-3 px-4 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors shadow-inner"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-3 px-6 rounded-lg transition-all font-medium shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Inscription en cours...
            </span>
          ) : (
            "S'abonner"
          )}
        </button>
      </form>

      {/* Messages de feedback */}
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === 'success'
            ? 'bg-green-900/30 text-green-300 border border-green-800'
            : 'bg-red-900/30 text-red-300 border border-red-800'
          }`}>
          <div className="flex items-start">
            {message.type === 'success' ? (
              <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Note de confidentialité */}
      <p className="text-xs text-gray-400 mt-2">
        En vous abonnant, vous acceptez de recevoir nos newsletters.
        Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email.
        Vos données sont protégées conformément à notre{' '}
        <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
          politique de confidentialité
        </a>.
      </p>
    </div>
  );
}