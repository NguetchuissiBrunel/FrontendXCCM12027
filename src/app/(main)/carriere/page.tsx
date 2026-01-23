'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Briefcase, ChevronRight, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';

const openings = [
  {
    title: 'UX/UI Designer',
    team: 'Design',
    type: 'Stage',
    location: 'Yaounde / Hybride',
    summary: 'Ameliorer l experience enseignant et etudiant sur XCCM1.',
  },
  {
    title: 'Frontend Developer',
    team: 'Engineering',
    type: 'Stage',
    location: 'Yaounde',
    summary: 'Construire des interfaces modernes avec Next.js et Tailwind.',
  },
  {
    title: 'Content Coordinator',
    team: 'Pedagogie',
    type: 'Temps partiel',
    location: 'En ligne',
    summary: 'Structurer les granules et accompagner les enseignants.',
  },
];

const benefits = [
  {
    title: 'Impact academique',
    desc: 'Vos contributions ameliorent la qualite des contenus pedagogiques.',
  },
  {
    title: 'Mentorat',
    desc: 'Encadrement par des enseignants et experts du domaine.',
  },
  {
    title: 'Apprentissage continu',
    desc: 'Technos modernes, bonnes pratiques et retours terrains.',
  },
];

const process = [
  'Candidature en ligne',
  'Echange rapide',
  'Mini cas pratique',
  'Onboarding XCCM1',
];

export default function CareersPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Briefcase className="h-4 w-4" />
            Carrieres
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Rejoignez l equipe XCCM1
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            Contribuez a une plateforme pedagogique ouverte, modulaire et collaborative.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="#candidature"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Postuler maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              Decouvrir le projet
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            A retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Offres ouvertes
              </h2>
              <div className="mt-4 space-y-4">
                {openings.map((role) => (
                  <div
                    key={role.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {role.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                          {role.team}
                        </p>
                      </div>
                      <span className="rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
                        {role.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{role.summary}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{role.location}</span>
                      <Link
                        href="#candidature"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
                      >
                        Postuler
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Notre quotidien
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Une equipe pluridisciplinaire, une approche agile et une forte proximite avec les
                enseignants pour tester rapidement les nouvelles idees.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  { src: '/images/open.jpg', alt: 'Atelier de travail', label: 'Ateliers' },
                  { src: '/images/prof.jpeg', alt: 'Session pedagogique', label: 'Pedagogie' },
                  { src: '/images/ima20.jpeg', alt: 'Collaboration', label: 'Collaboration' },
                ].map((image) => (
                  <div
                    key={image.src}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="relative h-40 w-full">
                      <Image src={image.src} alt={image.alt} fill className="object-cover" />
                    </div>
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {image.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Processus de recrutement
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {process.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </section>

            <section
              id="candidature"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Candidature rapide
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Quelques informations pour demarrer. Nous revenons vers vous rapidement.
              </p>
              <form
                className="mt-4 grid gap-4"
                action="mailto:xccm1-enspy@gmail.com"
                method="post"
                encType="text/plain"
                onSubmit={handleSubmit}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Nom complet"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse e-mail"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    name="role"
                    placeholder="Role vise"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Localisation"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Message ou lien vers votre CV/portfolio"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Envoyer la candidature
                  <ArrowRight className="h-4 w-4" />
                </button>
                {sent ? (
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                    Message envoye. Merci pour votre candidature.
                  </p>
                ) : null}
              </form>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-wide">Equipe XCCM1</p>
                </div>
                <p className="mt-3 text-sm text-slate-200">
                  Rejoignez un collectif motive par l innovation pedagogique.
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Parler a l equipe
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Profils recherches
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {['Design UX', 'Developpement frontend', 'Pedagogie'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Culture d equipe
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Autonomie, feedbacks rapides et partage des bonnes pratiques.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                >
                  En savoir plus
                  <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
