// src/app/about/page.tsx
'use client';

import  Footer  from '@/components/layout/Footer';
import  Navbar  from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, ExternalLink, Mail, Copy, Check, 
  Users, Code, BookOpen, Globe, Award, Sparkles,
  ChevronRight, ArrowDown, FileText, Github
} from 'lucide-react';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('');

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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white pt-16">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-purple-700">Prototype Académique ENSPY</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-6">
                À Propos de XCCM1
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                Une plateforme innovante pour la <strong>création modulaire</strong> et <strong>collaborative</strong> de contenu pédagogique.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => scrollTo('problematique')}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Découvrir le projet
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <a
                  href="https://github.com/enspy-xccm/xccm1"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition"
                >
                  <Github className="w-5 h-5" />
                  Voir sur GitHub
                </a>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
          </div>
        </section>

        {/* TABLE OF CONTENTS - STICKY SIDEBAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-lg text-purple-700 mb-4">Sommaire</h3>
                <nav className="space-y-2">
                  {[
                    { id: 'intro', label: 'Introduction', icon: BookOpen },
                    { id: 'problematique', label: 'Problématique', icon: FileText },
                    { id: 'solution', label: 'Notre Solution', icon: Sparkles },
                    { id: 'equipe', label: 'Équipe', icon: Users },
                    { id: 'tech', label: 'Technologies', icon: Code },
                    { id: 'avenir', label: 'Avenir', icon: Globe },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-semibold shadow-sm'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                  >
                    <Download className="w-4 h-4" />
                    Exporter en PDF
                  </button>
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
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Introduction</h2>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border-l-4 border-purple-600">
                    <p className="text-lg leading-relaxed">
                      <strong>XCCM1</strong> est un <strong>prototype académique</strong> développé dans le cadre du cours 
                      <em> Interface Homme-Machine (GIF4087-1)</em> à l'<strong>ENSPY Yaoundé</strong>.
                    </p>
                    <p className="mt-4 text-lg">
                      Supervisé par <strong>Dr. Bernabe BATCHAKUI</strong>, ce projet vise à <strong>révolutionner la création de contenu pédagogique</strong> 
                      grâce au concept innovant de <strong>"granules"</strong> — des unités modulaires, réutilisables et collaboratives.
                    </p>
                  </div>
                </motion.div>
              </section>

              {/* 2. PROBLÉMATIQUE */}
              <section id="problematique" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Problématique</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { title: "Rigidité des formats", desc: "PDF, Word → difficile à modifier" },
                      { title: "Manque de modularité", desc: "Impossible de réutiliser un chapitre" },
                      { title: "Collaboration limitée", desc: "Pas de co-édition en temps réel" },
                      { title: "Qualité inégale", desc: "Contenus non standardisés" },
                    ].map((prob, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-red-600 text-2xl">X</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">{prob.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{prob.desc}</p>
                      </div>
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
                >
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Notre Solution : XCCM1</h2>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-l-4 border-green-600">
                    <h3 className="text-xl font-bold text-green-800 mb-4">Le concept de "Granules"</h3>
                    <p className="text-lg mb-6">
                      Un <strong>granule</strong> = une unité atomique de contenu (définition, exercice, vidéo, image) 
                      avec métadonnées, versionnage et droits d'auteur.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      {['Modulaire', 'Collaboratif', 'Exportable'].map((feature) => (
                        <div key={feature} className="bg-white p-4 rounded-lg shadow">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <span className="font-semibold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* 4. ÉQUIPE */}
              <section id="equipe" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Équipe de Développement</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    12 étudiants de <strong>4ᵉ année Génie Informatique</strong> (2025–2026)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                      "AZANGUE LEONEL DELMAT", "BALA ANDEGUE FRANCOIS LIONNEL", "NKOLO ANTAGANA STACY",
                      "NANA NDOUNDAM GABRIELLE", "NANKENG TSAMO PIERRE MARCELLE", "NCHANG ROY FRU",
                      "NGUETCHUISSI TCHUGOUA BRUNEL LANDRY", "SOUNTSA DJIELE PIO VIANNEY",
                      "OSSOMBE PIERRE RENE RAOUL", "NKAMLA CHEDJOU JOHAN", "NTIH TCHIO TAMOGOU DARYL",
                      "TAGASTING FOSTING SAMUEL SEAN"
                    ].map((name, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center cursor-default"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800">{name.split(' ')[0]}</p>
                        <p className="text-xs text-gray-600">{name.split(' ').slice(1).join(' ')}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* 5. TECHNOLOGIES */}
              <section id="tech" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Stack Technique</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
                      <h3 className="font-bold text-purple-700 mb-3">Frontend</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2"><Code className="w-4 h-4 text-purple-600" /> Next.js 14 + App Router</li>
                        <li className="flex items-center gap-2"><Code className="w-4 h-4 text-purple-600" /> React + TypeScript</li>
                        <li className="flex items-center gap-2"><Code className="w-4 h-4 text-purple-600" /> Tailwind CSS + Framer Motion</li>
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                      <h3 className="font-bold text-blue-700 mb-3">Backend & Données</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /> API REST + WebSockets</li>
                        <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /> PostgreSQL + JSONB</li>
                        <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /> Export PDF/Word</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* 6. AVENIR */}
              <section id="avenir" className="scroll-mt-24 pb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-purple-700 mb-6">Perspectives d'Avenir</h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Évolutions prévues :</h3>
                    <ul className="space-y-3">
                      {[
                        "Intégration d'IA pour la génération automatique de granules",
                        "Support multilingue (FR, EN, ES)",
                        "Application mobile native (React Native)",
                        "Système de gamification et badges",
                        "Intégration avec Moodle / Google Classroom"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => copyEmail('xccm@enspy.ucac-icam.cm')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                    >
                      <Mail className="w-5 h-5" />
                      {copied ? 'Copié !' : 'Nous contacter'}
                    </button>
                  </div>
                </motion.div>
              </section>

            </div>
          </div>
        </div>
      </main>
      
    </>
  );
}