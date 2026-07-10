'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  FileText,
  Github,
  Globe,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('pages.about');
  const [activeSection, setActiveSection] = useState('intro');
  const [isDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  const content = useMemo(() => {
    return {
      sections: [
        { id: 'intro', label: t('sections.intro'), icon: BookOpen },
        { id: 'problematique', label: t('sections.problematique'), icon: FileText },
        { id: 'solution', label: t('sections.solution'), icon: Sparkles },
        { id: 'tech', label: t('sections.tech'), icon: Users },
        { id: 'avenir', label: t('sections.avenir'), icon: Globe },
      ],
      badge: t('badge'),
      title: t('title'),
      description: t('description'),
      discover: t('discover'),
      github: t('github'),
      highlightsTitle: t('highlightsTitle'),
      highlights: [
        { title: t('highlights.prototype.title'), desc: t('highlights.prototype.desc') },
        { title: t('highlights.granules.title'), desc: t('highlights.granules.desc') },
        { title: t('highlights.collaboration.title'), desc: t('highlights.collaboration.desc') }
      ],
      summary: t('summary'),
      introTitle: t('introTitle'),
      introParagraph1: t('introParagraph1'),
      introParagraph2: t('introParagraph2'),
      problemTitle: t('problemTitle'),
      problems: [
        { title: t('problems.formats.title'), desc: t('problems.formats.desc') },
        { title: t('problems.modularity.title'), desc: t('problems.modularity.desc') },
        { title: t('problems.collaboration.title'), desc: t('problems.collaboration.desc') },
        { title: t('problems.quality.title'), desc: t('problems.quality.desc') }
      ],
      solutionTitle: t('solutionTitle'),
      granulesTitle: t('granulesTitle'),
      granulesDescription: t('granulesDescription'),
      solutionFeatures: [
        t('solutionFeatures.modular'),
        t('solutionFeatures.collaborative'),
        t('solutionFeatures.exportable')
      ],
      teamTitle: t('teamTitle'),
      teamDescription: t('teamDescription'),
      futureTitle: t('futureTitle'),
      futureItems: [
        t('futureItems.ai'),
        t('futureItems.multilingual'),
        t('futureItems.mobile'),
        t('futureItems.gamification'),
        t('futureItems.moodle')
      ]
    };
  }, [t]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const section of content.sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPos && element.offsetHeight + element.offsetTop > scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content.sections]);

  const imageSrc = isDarkMode ? '/images/image3.png' : '/images/image1.png';

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            {content.badge}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            {content.title}
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            {content.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => scrollTo('solution')}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              {content.discover}
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="https://github.com/Prrojet-XCCM/FrontendXCCM2027.git"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              <Github className="h-4 w-4" />
              {content.github}
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            {content.highlightsTitle}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {content.highlights.map((item) => (
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
                  {content.summary}
                </h3>
                <nav className="mt-4 space-y-2 text-sm">
                  {content.sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${activeSection === item.id
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
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{content.introTitle}</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="mb-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                        {content.introParagraph1}
                      </p>
                      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                        {content.introParagraph2}
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
                  {content.problemTitle}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {content.problems.map((item) => (
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
                  {content.solutionTitle}
                </h2>
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                    {content.granulesTitle}
                  </h3>
                  <p className="mt-3 text-sm text-emerald-900 dark:text-emerald-100">
                    {content.granulesDescription}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {content.solutionFeatures.map((feature) => (
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
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{content.teamTitle}</h2>
                </div>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-8 text-center">
                    <p className="text-base text-slate-600 dark:text-slate-300">
                      {content.teamDescription}
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
                  {content.futureTitle}
                </h2>
                <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-500/30 dark:bg-purple-500/10">
                  <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    {content.futureItems.map((item) => (
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
