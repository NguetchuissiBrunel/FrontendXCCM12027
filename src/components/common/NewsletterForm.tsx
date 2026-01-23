// src/components/common/NewsletterForm.tsx - MIS À JOUR
'use client';

import { useState, useEffect } from 'react';
import { PublicServicesService } from '@/lib/services/PublicServicesService';
import { NewsletterRequest } from '@/lib/models/NewsletterRequest';
import { useLoading } from '@/contexts/LoadingContext';

interface NewsletterFormProps {
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  showPrivacyNote?: boolean;
}

export default function NewsletterForm({
  className = '',
  compact = false,
  title = "Abonnez-vous à notre Newsletter",
  description = "Recevez les dernières nouvelles, mises à jour et offres spéciales directement dans votre boîte de réception.",
  showPrivacyNote = true
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { startLoading, stopLoading } = useLoading();

  // Gestion du chargement global
  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  // Nettoyer le message après 5 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setMessage({ 
        type: 'error', 
        text: 'Veuillez entrer une adresse email valide (ex: exemple@domaine.com)' 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Préparer la requête - UNIQUEMENT l'email (selon le type NewsletterRequest)
      const request: NewsletterRequest = { 
        email // Seul champ requis selon l'API
      };

      await PublicServicesService.subscribeNewsletter(request);

      setMessage({
        type: 'success',
        text: '🎉 Félicitations ! Vous êtes maintenant inscrit à notre newsletter.'
      });
      setEmail(''); // Réinitialiser le champ après succès

    } catch (error: any) {
      console.error('Erreur inscription newsletter:', error);

      // Gestion des erreurs spécifiques
      let errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';

      if (error.status === 400) {
        errorMessage = 'Cette adresse email est déjà inscrite à notre newsletter.';
      } else if (error.status === 422) {
        errorMessage = 'Adresse email invalide ou format incorrect.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
      } else if (error.status === 500) {
        errorMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      } else if (error.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = 'Vous semblez être hors ligne. Vérifiez votre connexion internet.';
      }

      setMessage({ 
        type: 'error', 
        text: errorMessage 
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Version compacte (pour header, petites sections)
  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            suppressHydrationWarning={true}
            aria-label="Adresse email pour la newsletter"
            className="flex-1 min-w-0 appearance-none rounded-lg border border-transparent bg-gray-700 dark:bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors disabled:opacity-50"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''}`}
          >
            {loading ? '...' : "S'abonner"}
          </button>
        </form>
        
        {message && (
          <div className={`text-xs rounded px-2 py-1 ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  // Version complète (par défaut)
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          {description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            suppressHydrationWarning={true}
            aria-label="Adresse email pour la newsletter"
            className="w-full min-w-0 appearance-none rounded-lg border border-transparent bg-gray-700 dark:bg-gray-800 py-3 px-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-3 px-6 rounded-lg transition-all font-medium shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${loading ? 'animate-pulse' : ''
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Inscription en cours...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 12H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z" />
            </svg>
            S'abonner à la newsletter
          </>
        )}
      </button>
    </form>

    {/* Messages de feedback */}
    {message && (
      <div className={`rounded-lg p-4 ${message.type === 'success'
          ? 'bg-green-900/20 border border-green-800/50'
          : 'bg-red-900/20 border border-red-800/50'
        }`}>
        <div className="flex items-start space-x-3">
          {message.type === 'success' ? (
            <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <div>
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {message.text}
            </p>
            {message.type === 'success' && (
              <p className="text-xs text-green-400/80 mt-1">
                Consultez votre boîte de réception (et vos spams) pour confirmer votre inscription.
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Note de confidentialité */}
    {showPrivacyNote && (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 leading-relaxed">
          🔒 En vous abonnant, vous acceptez de recevoir nos newsletters contenant des actualités,
          des conseils pédagogiques et des offres spéciales.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Vous pourrez vous désabonner à tout moment en cliquant sur le lien de désinscription présent dans chaque email.
          Vos données sont traitées conformément à notre{' '}
          <a 
            href="/privacy" 
            className="text-purple-400 hover:text-purple-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique de confidentialité
          </a>.
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Sécurité et confidentialité garanties</span>
        </div>
      </div>
    )}
  </div>
);
}