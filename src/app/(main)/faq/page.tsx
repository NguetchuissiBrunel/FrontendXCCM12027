'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  Search,
  Shield,
  Users,
} from 'lucide-react';

const categories = [
  { id: 'general', label: 'General' },
  { id: 'comptes', label: 'Comptes' },
  { id: 'contenus', label: 'Contenus' },
  { id: 'export', label: 'Export' },
  { id: 'securite', label: 'Securite' },
];

const faqSections = [
  {
    id: 'general',
    title: 'Questions generales',
    items: [
      {
        q: 'A quoi sert XCCM1 ?',
        a: 'XCCM1 est une plateforme academique pour creer, structurer et partager des contenus pedagogiques sous forme de granules.',
      },
      {
        q: 'Qui peut utiliser la plateforme ?',
        a: "Les enseignants et etudiants de l'ENSPY. L'acces est reserve au cadre academique.",
      },
      {
        q: 'La plateforme est-elle gratuite ?',
        a: 'Oui. XCCM1 est un prototype developpe pour un usage pedagogique.',
      },
    ],
  },
  {
    id: 'comptes',
    title: 'Comptes & acces',
    items: [
      {
        q: 'Comment creer un compte ?',
        a: "Contactez l'equipe XCCM1 ou votre responsable pedagogique pour activer votre compte.",
      },
      {
        q: 'J ai oublie mon mot de passe, que faire ?',
        a: "Utilisez le formulaire de recuperation ou contactez l'equipe support.",
      },
      {
        q: 'Puis-je changer mon role ?',
        a: "Oui, sur demande aupres de l'administration XCCM1.",
      },
    ],
  },
  {
    id: 'contenus',
    title: 'Contenus & granules',
    items: [
      {
        q: 'Qu est-ce qu un granule ?',
        a: 'Un granule est un module de connaissance (definition, exemple, exercice, ressource).',
      },
      {
        q: 'Puis-je dupliquer un granule ?',
        a: 'Oui, pour gagner du temps et adapter vos cours.',
      },
      {
        q: 'Les etudiants peuvent-ils modifier un cours ?',
        a: "Non. Les etudiants ont un acces en lecture.",
      },
    ],
  },
  {
    id: 'export',
    title: 'Export & formats',
    items: [
      {
        q: 'Quels formats sont disponibles ?',
        a: 'PDF, Word et version web selon le cours.',
      },
      {
        q: 'Pourquoi mon export est incomplet ?',
        a: 'Verifiez que tous les granules sont publies et associes au bon module.',
      },
      {
        q: 'Puis-je personnaliser le format ?',
        a: 'Oui, via les options d export dans la page du cours.',
      },
    ],
  },
  {
    id: 'securite',
    title: 'Securite & confidentialite',
    items: [
      {
        q: 'Mes donnees sont-elles protegees ?',
        a: 'Oui, les mots de passe sont hashes et les acces controles.',
      },
      {
        q: 'Mes contenus sont-ils publics ?',
        a: "Non, ils sont accessibles uniquement aux utilisateurs autorises.",
      },
      {
        q: 'Comment signaler un probleme ?',
        a: "Utilisez la page support ou contactez l'equipe XCCM1.",
      },
    ],
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = faqSections
    .map((section) => {
      const inTitle = section.title.toLowerCase().includes(normalizedQuery);
      const items =
        !normalizedQuery || inTitle
          ? section.items
          : section.items.filter((item) =>
              `${item.q} ${item.a}`.toLowerCase().includes(normalizedQuery),
            );
      return { ...section, items };
    })
    .filter((section) => !normalizedQuery || section.items.length > 0);

  const resultsCount = filteredSections.reduce((acc, section) => acc + section.items.length, 0);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Questions frequentes
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            Trouvez rapidement les reponses sur l usage de XCCM1.
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Search className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>
          </div>
          {normalizedQuery ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Resultats: {resultsCount}
            </p>
          ) : null}
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            A retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Support academique',
                desc: 'Equipe XCCM1 disponible pour les enseignants et etudiants.',
                icon: Users,
              },
              {
                title: 'Guides de prise en main',
                desc: 'Des ressources pour creer vos premiers granules.',
                icon: BookOpen,
              },
              {
                title: 'Securite',
                desc: 'Donnees protegees et acces controles.',
                icon: Shield,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <item.icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  {item.title}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.q}
                        <ChevronRight className="h-4 w-4 text-purple-600 transition-transform duration-200 group-open:rotate-90 dark:text-purple-300" />
                      </summary>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
            {normalizedQuery && resultsCount === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Aucun resultat. Essayez un autre mot-cle ou consultez les categories.
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">Besoin d aide ?</h3>
                <p className="mt-2 text-sm text-slate-200">
                  Contactez l equipe XCCM1 pour un accompagnement personnalise.
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Contacter le support
                  <LifeBuoy className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Categories
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
                    >
                      {cat.label}
                      <ChevronRight className="h-4 w-4 text-purple-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Guides utiles
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <Link href="/blog" className="block hover:text-purple-600">
                    Bien demarrer avec XCCM1
                  </Link>
                  <Link href="/blog" className="block hover:text-purple-600">
                    Modeles de granules
                  </Link>
                  <Link href="/blog" className="block hover:text-purple-600">
                    Checklist de publication
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
