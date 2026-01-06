// src/app/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      description: 'Parfait pour découvrir la plateforme',
      price: { monthly: 0, annual: 0 },
      features: [
        { text: 'Jusqu\'à 3 cours créés', included: true },
        { text: 'Éditeur de contenu basique', included: true },
        { text: '1 Go de stockage', included: true },
        { text: 'Support par email', included: true },
        { text: 'Export PDF', included: false },
        { text: 'Collaboration en équipe', included: false },
        { text: 'Assistant IA avancé', included: false },
        { text: 'Statistiques avancées', included: false },
        { text: 'Intégrations API', included: false },
      ],
      buttonText: 'Commencer gratuitement',
      buttonVariant: 'outline',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professionnel',
      description: 'Pour les enseignants et formateurs actifs',
      price: { monthly: 9.99, annual: 99.99 },
      features: [
        { text: 'Cours illimités', included: true },
        { text: 'Éditeur de contenu avancé', included: true },
        { text: '10 Go de stockage', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Export PDF/DOCX', included: true },
        { text: 'Collaboration (jusqu\'à 5 personnes)', included: true },
        { text: 'Assistant IA basique', included: true },
        { text: 'Statistiques de base', included: true },
        { text: 'Intégrations API limitées', included: false },
      ],
      buttonText: 'Essayer gratuitement 14 jours',
      buttonVariant: 'primary',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Établissement',
      description: 'Pour les écoles et universités',
      price: { monthly: 24.99, annual: 249.99 },
      features: [
        { text: 'Cours illimités', included: true },
        { text: 'Éditeur de contenu premium', included: true },
        { text: 'Stockage illimité', included: true },
        { text: 'Support 24/7', included: true },
        { text: 'Export tous formats', included: true },
        { text: 'Collaboration illimitée', included: true },
        { text: 'Assistant IA avancé', included: true },
        { text: 'Analytics complets', included: true },
        { text: 'Intégrations API complètes', included: true },
      ],
      buttonText: 'Contactez-nous',
      buttonVariant: 'primary',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements sont appliqués immédiatement et les ajustements de prix sont calculés au prorata.',
    },
    {
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Non, tous nos prix sont transparents. Le prix indiqué est le prix que vous payez. Aucun frais caché, aucune surprise.',
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes de crédit/débit (Visa, MasterCard, American Express), PayPal, et les virements bancaires pour les plans Établissement.',
    },
    {
      question: 'Puis-je annuler mon abonnement ?',
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment. Vous conservez l\'accès à vos fonctionnalités jusqu\'à la fin de la période payée.',
    },
    {
      question: 'Offrez-vous des réductions pour les établissements éducatifs ?',
      answer: 'Oui, nous proposons des réductions spéciales pour les écoles, universités et organisations éducatives à but non lucratif. Contactez notre équipe commerciale pour en savoir plus.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons un chiffrement de bout en bout et suivons les meilleures pratiques de sécurité. Vos données pédagogiques sont stockées de manière sécurisée en Europe.',
    },
  ];

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
      <section className="relative bg-white dark:bg-gray-900 py-12 sm:py-16 lg:py-20 overflow-hidden border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Tarifs adaptés</span>
              <span className="block text-purple-600 dark:text-purple-400">à vos besoins</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 sm:mt-6 sm:text-xl">
              Choisissez le plan qui correspond le mieux à vos besoins pédagogiques.
              Commencez gratuitement, évoluez quand vous le souhaitez.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Facturation mensuelle
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 dark:bg-purple-700 transition-colors"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Facturation annuelle
                </span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Économisez 16%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-white dark:bg-gray-900 sm:py-20 lg:py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-lg dark:shadow-gray-900/50 transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? 'ring-2 ring-purple-600 dark:ring-purple-500 border-purple-200 dark:border-purple-900'
                    : 'border border-gray-200 dark:border-gray-800'
                } bg-white dark:bg-gray-900`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold">
                      Le plus populaire
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {isAnnual ? plan.price.annual : plan.price.monthly}€
                      </span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        /{isAnnual ? 'an' : 'mois'}
                      </span>
                    </div>
                    {plan.price.monthly > 0 && isAnnual && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Soit {(plan.price.annual / 12).toFixed(2)}€/mois
                      </p>
                    )}
                  </div>

                  <Link
                    href={plan.id === 'free' ? '/register' : plan.id === 'enterprise' ? '/contact' : '/register'}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-lg transition-colors shadow-md ${
                      plan.buttonVariant === 'primary'
                        ? 'border-transparent text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
                        : 'border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>

                  <div className="mt-8 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      Ce qui est inclus :
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Contact */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 sm:p-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Besoins personnalisés pour votre établissement ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Nous proposons des solutions sur mesure pour les écoles, universités et organisations éducatives.
                  Contactez-nous pour discuter de vos besoins spécifiques.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 shadow-md transition-colors"
                  >
                    Contacter l'équipe commerciale
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 dark:border-purple-400 text-base font-medium rounded-lg text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                  >
                    Demander une démo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 sm:py-20 lg:py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Tout ce que vous devez savoir sur nos tarifs et notre offre.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/70"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Vous avez d'autres questions ?{' '}
                <Link
                  href="/contact"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                >
                  Contactez notre équipe
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900 sm:py-20 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Prêt à révolutionner votre enseignement ?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Rejoignez des milliers d'enseignants qui utilisent déjà notre plateforme pour créer des cours engageants.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 shadow-md transition-colors"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-3 border border-purple-600 dark:border-purple-400 text-base font-medium rounded-lg text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
              >
                Demander une démo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}