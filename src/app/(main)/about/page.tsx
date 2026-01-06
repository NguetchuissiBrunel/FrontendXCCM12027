// src/app/about/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, ExternalLink, Mail, Copy, Check,
  Users, Code, BookOpen, Globe, Award, Sparkles,
  ChevronRight, ArrowDown, FileText, Github,
  Layers, Share2, RefreshCw, Lock, Zap, Cpu
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'problematique', 'solution', 'equipe', 'tech', 'avenir'];
      const scrollPos = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveSection(section);
          break;
        }
      }
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                Projet Académique ENSPY
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              À Propos de{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                XCCM
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Une plateforme innovante pour la <span className="font-semibold text-purple-600 dark:text-purple-400">création modulaire</span> et{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">collaborative</span> de contenu pédagogique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollTo('solution')}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                Découvrir le projet
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <a
                href="https://github.com/enspy-xccm/xccm1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition shadow-sm"
              >
                <Github className="w-5 h-5" />
                Code Source
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <button
            onClick={() => scrollTo('intro')}
            className="animate-bounce mb-4"
          >
            <ArrowDown className="w-8 h-8 text-purple-400 dark:text-purple-600" />
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Navigation</h3>
              <nav className="space-y-1">
                {[
                  { id: 'intro', label: 'Introduction', icon: BookOpen },
                  { id: 'problematique', label: 'Contexte & Problématique', icon: FileText },
                  { id: 'solution', label: 'Notre Solution', icon: Layers },
                  { id: 'equipe', label: 'Équipe', icon: Users },
                  { id: 'avenir', label: 'Perspectives', icon: Globe },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 text-purple-700 dark:text-purple-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Documents</h4>
                <div className="space-y-2">
                  <a
                    href="/documents/memoire-xccm.pdf"
                    className="flex items-center gap-2 p-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Mémoire du projet
                  </a>
                  <a
                    href="/documents/presentation-xccm.pdf"
                    className="flex items-center gap-2 p-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Présentation
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors mt-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter en PDF
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-16">
            {/* 1. INTRODUCTION */}
            <section id="intro" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Introduction</h2>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <span className="font-bold text-purple-600 dark:text-purple-400">XCCM (eXtensible Content Composition Module)</span> est un projet innovant développé dans le cadre du cours 
                        <span className="font-semibold"> Interface Homme-Machine (GIF4087-1)</span> à l'
                        <span className="font-bold">École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)</span>.
                      </p>
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        Sous la supervision du <span className="font-bold">Dr. Bernabe BATCHAKUI</span>, cette plateforme vise à transformer la création de contenu pédagogique 
                        à travers une approche modulaire basée sur des <span className="font-semibold text-purple-600 dark:text-purple-400">"granules de connaissance"</span>.
                      </p>
                    </div>
                    <div className="hidden md:block w-48 h-48 relative rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={isDarkMode ? "/images/image3.png" : "/images/image1.png"}
                        alt="XCCM Platform"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* 2. PROBLÉMATIQUE */}
            <section id="problematique" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contexte & Problématique</h2>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-2xl p-8 border border-red-100 dark:border-red-900/30 mb-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    Face à la <span className="font-semibold">transformation numérique de l'éducation</span>, les outils traditionnels 
                    (PDF, PowerPoint) montrent leurs limites en matière d'interactivité, de collaboration et d'adaptabilité.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { 
                      title: "Contenus statiques", 
                      desc: "Les formats traditionnels (PDF, DOC) ne permettent pas l'interactivité ni la mise à jour en temps réel.",
                      icon: "📄"
                    },
                    { 
                      title: "Manque de modularité", 
                      desc: "Impossible de réutiliser ou recomposer des éléments pédagogiques entre différents cours.",
                      icon: "🧩"
                    },
                    { 
                      title: "Collaboration limitée", 
                      desc: "Absence d'outils de co-création et de partage entre enseignants et institutions.",
                      icon: "👥"
                    },
                    { 
                      title: "Accessibilité réduite", 
                      desc: "Difficulté d'accès et d'adaptation pour les apprenants avec des besoins spécifiques.",
                      icon: "♿"
                    },
                  ].map((prob, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all"
                    >
                      <div className="w-12 h-12 text-2xl flex items-center justify-center mb-4">
                        {prob.icon}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{prob.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{prob.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* 3. NOTRE SOLUTION */}
            <section id="solution" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notre Solution</h2>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-8 border border-green-100 dark:border-green-900/30 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">L'approche granulaire</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    XCCM introduit le concept innovant de <span className="font-bold text-green-600 dark:text-green-400">"granules de connaissance"</span> : 
                    des unités pédagogiques autonomes, réutilisables et interconnectables.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Modulaire",
                      description: "Créez, assemblez et réutilisez des granules comme des briques LEGO",
                      icon: <Layers className="w-8 h-8" />,
                      color: "from-purple-600 to-purple-700"
                    },
                    {
                      title: "Collaboratif",
                      description: "Travaillez en équipe avec des espaces de travail partagés",
                      icon: <Share2 className="w-8 h-8" />,
                      color: "from-blue-600 to-blue-700"
                    },
                    {
                      title: "Évolutif",
                      description: "Mettez à jour automatiquement le contenu dans tous les cours",
                      icon: <RefreshCw className="w-8 h-8" />,
                      color: "from-green-600 to-green-700"
                    },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* 4. ÉQUIPE */}
            <section id="equipe" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Équipe de Développement</h2>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 mb-8">
                  <div className="text-center mb-8">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      <span className="font-bold text-purple-600 dark:text-purple-400">12 étudiants</span> de 4ᵉ année Génie Informatique (2025–2026) sous la supervision du{' '}
                      <span className="font-bold">Dr. Bernabe BATCHAKUI</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                      "AZANGUE LEONEL DELMAT", "BALA ANDEGUE FRANCOIS LIONNEL", "NKOLO ANTAGANA STACY",
                      "NANA NDOUNDAM GABRIELLE", "NANKENG TSAMO PIERRE MARCELLE", "NCHANG ROY FRU",
                      "NGUETCHUISSI TCHUGOUA BRUNEL LANDRY", "SOUNTSA DJIELE PIO VIANNEY",
                      "OSSOMBE PIERRE RENE RAOUL", "NKAMLA CHEDJOU JOHAN", "NTIH TCHIO TAMOGOU DARYL",
                      "TAGASTING FOSTING SAMUEL SEAN"
                    ].map((name, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm">
                          {name.split(' ')[0][0]}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {name.split(' ')[0]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {name.split(' ').slice(1).join(' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>


            {/* 6. PERSPECTIVES */}
            <section id="avenir" className="scroll-mt-24 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Perspectives d'Avenir</h2>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Évolutions prévues</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { 
                        title: "Intelligence Artificielle",
                        description: "Assistant IA pour la génération et l'optimisation de contenu",
                        icon: "🤖"
                      },
                      { 
                        title: "Multilingue",
                        description: "Support de plusieurs langues (FR, EN, ES, AR)",
                        icon: "🌍"
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{item.icon}</span>
                          <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}