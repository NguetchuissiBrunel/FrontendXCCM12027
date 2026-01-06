'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Code,
  FileText,
  Github,
  Globe,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  { id: 'intro', label: 'Introduction', icon: BookOpen },
  { id: 'problematique', label: 'Problematique', icon: FileText },
  { id: 'solution', label: 'Solution', icon: Sparkles },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'tech', label: 'Technologies', icon: Code },
  { id: 'avenir', label: 'Avenir', icon: Globe },
];

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('intro');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPos && element.offsetTop + element.offsetHeight > scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            Projet academique ENSPY
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            A propos de XCCM1
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            Une plateforme modulaire pour creer, structurer et partager des contenus pedagogiques.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => scrollTo('solution')}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Decouvrir le projet
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="https://github.com/Prrojet-XCCM1/FrontendXCCM12027.git"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              <Github className="h-4 w-4" />
              Voir sur GitHub
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            A retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Prototype open-source',
                desc: 'Developpe par les etudiants ENSPY pour le cours GIF4087-1.',
              },
              {
                title: 'Granules pedagogiques',
                desc: 'Unites modulaires pour structurer et reutiliser les contenus.',
              },
              {
                title: 'Collaboration',
                desc: 'Travail d equipe, versionnage et export multi-format.',
              },
            ].map((item) => (
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
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Sommaire
                </h3>
                <nav className="mt-4 space-y-2 text-sm">
                  {sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                        activeSection === item.id
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="space-y-12 lg:col-span-2">
            <section id="intro" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Introduction
                </h2>
                <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-slate-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-slate-200">
                  <p>
                    <strong>XCCM1</strong> est un prototype academique realise dans le cadre du
                    cours <strong>Interface Homme-Machine (GIF4087-1)</strong> a l&apos;ENSPY Yaounde.
                  </p>
                  <p className="mt-3">
                    Il introduit le concept de <strong>granules</strong> pour structurer les cours
                    en modules reutilisables, versionnes et partageables.
                  </p>
                </div>
              </motion.div>
            </section>

            <section id="problematique" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Problematique
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { title: 'Formats rigides', desc: 'PDF/Word difficiles a modifier.' },
                    { title: 'Peu de modularite', desc: 'Reutiliser un chapitre est complexe.' },
                    { title: 'Collaboration limitee', desc: 'Peu d outils de co-edition.' },
                    { title: 'Qualite inegale', desc: 'Absence de standardisation.' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section id="solution" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Notre solution
                </h2>
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                    Le concept de granules
                  </h3>
                  <p className="mt-3 text-sm text-emerald-900 dark:text-emerald-100">
                    Un granule est une unite atomique (definition, exemple, exercice, ressource)
                    enrichie par des metadonnees, versionnage et droits d auteur.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {['Modulaire', 'Collaboratif', 'Exportable'].map((feature) => (
                      <div
                        key={feature}
                        className="rounded-xl border border-emerald-100 bg-white p-3 text-center text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-200"
                      >
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                          <Check className="h-5 w-5" />
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            <section id="equipe" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Equipe de developpement
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  12 etudiants de 4e annee Genie Informatique (2025-2026)
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    'AZANGUE LEONEL DELMAT',
                    'BALA ANDEGUE FRANCOIS LIONNEL',
                    'NKOLO ANTAGANA STACY',
                    'NANA NDOUNDAM GABRIELLE',
                    'NANKENG TSAMO PIERRE MARCELLE',
                    'NCHANG ROY FRU',
                    'NGUETCHUISSI TCHUGOUA BRUNEL LANDRY',
                    'SOUNTSA DJIELE PIO VIANNEY',
                    'OSSOMBE PIERRE RENE RAOUL',
                    'NKAMLA CHEDJOU JOHAN',
                    'NTIH TCHIO TAMOGOU DARYL',
                    'TAGASTING FOSTING SAMUEL SEAN',
                  ].map((name) => (
                    <div
                      key={name}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {name.split(' ')[0]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {name.split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section id="tech" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Stack technique
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: 'Frontend',
                      items: ['Next.js 16 + App Router', 'React + TypeScript', 'Tailwind CSS'],
                    },
                    {
                      title: 'Backend & donnees',
                      items: ['API REST + WebSockets', 'PostgreSQL + JSONB', 'Export PDF/Word'],
                    },
                  ].map((block) => (
                    <div
                      key={block.title}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        {block.title}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {block.items.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section id="avenir" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Perspectives d avenir
                </h2>
                <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-500/30 dark:bg-purple-500/10">
                  <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    {[
                      "Integration d'IA pour la generation de granules",
                      'Support multilingue (FR, EN, ES)',
                      'Application mobile (React Native)',
                      'Gamification et badges',
                      'Integration Moodle / Google Classroom',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Award className="mt-0.5 h-4 w-4 text-purple-600 dark:text-purple-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
