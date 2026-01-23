'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  Github,
  Globe,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const sections = [
  { id: 'intro', label: 'Introduction', icon: BookOpen },
  { id: 'problematique', label: 'Problematique', icon: FileText },
  { id: 'solution', label: 'Solution', icon: Sparkles },
  { id: 'tech', label: 'Equipe', icon: Users },
  { id: 'avenir', label: 'Avenir', icon: Globe },
];

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Utiliser useEffect pour déterminer le mode sombre côté client seulement
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPos && element.offsetHeight + element.offsetTop > scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Solution 1: Ne pas rendre l'image basée sur le thème avant le montage
  const imageSrc = !mounted ? "/images/image1.png" : (isDarkMode ? "/images/image3.png" : "/images/image1.png");

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
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Introduction</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="mb-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          XCCM (eXtensible Content Composition Module)
                        </span>{' '}
                        est un projet innovant développé dans le cadre du cours
                        <span className="font-semibold"> Interface Homme-Machine (GIF4087-1)</span> à l&apos;
                        <span className="font-semibold">
                          École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)
                        </span>
                        .
                      </p>
                      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                        Sous la supervision du <span className="font-semibold">Pr. Bernabe BATCHAKUI</span>, cette plateforme vise à transformer la création de contenu pédagogique
                        à travers une approche modulaire basée sur des{' '}
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          &quot;granules de connaissance&quot;
                        </span>
                        .
                      </p>
                    </div>
                    <div className="relative hidden h-48 w-48 overflow-hidden rounded-xl shadow-sm md:block">
                      <Image
                        src={imageSrc}
                        alt="XCCM Platform"
                        fill
                        className="object-cover"
                        priority
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Le reste du code reste inchangé */}
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

            <section id="tech" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Équipe de Développement</h2>
                </div>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-8 text-center">
                    <p className="text-base text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">12 étudiants</span> de 4ᵉ année Génie Informatique (2025–2026) sous la supervision du{' '}
                      <span className="font-semibold">Pr. Bernabe BATCHAKUI</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {[
                      "AZANGUE LEONEL DELMAT", "BALA ANDEGUE FRANCOIS LIONNEL", "NKOLO ANTAGANA STACY",
                      "NANA NDOUNDAM GABRIELLE", "NANKENG TSAMO PIERRE MARCELLE", "NCHANG ROY FRU",
                      "NGUETCHUISSI TCHUGOUA BRUNEL LANDRY", "SOUNTSA DJIELE PIO VIANNEY",
                      "OSSOMBE PIERRE RENE RAOUL", "NKAMLA CHEDJOU JOHAN", "NTIH TCHIO TAMOGOU DARYL",
                      "TAGASTING FOSTING SAMUEL SEAN"
                    ].map((name, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-purple-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-purple-700"
                      >
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-blue-400 text-sm font-semibold text-white">
                          {name.split(' ')[0][0]}
                        </div>
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {name.split(' ')[0]}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {name.split(' ').slice(1).join(' ')}
                        </p>
                      </div>
                    ))}
                  </div>
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