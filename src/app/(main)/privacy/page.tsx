// src/app/privacy/page.tsx
'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Download,
  ExternalLink,
  Check,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Clock,
  Trash2,
  UserCheck
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const printPDF = () => window.print();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-600 rounded-full mb-5 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-purple-700 bg-clip-text text-transparent">
              Politique de Confidentialité
            </h1>
            <p className="mt-4 text-lg text-gray-600">XCCM1 – Plateforme Académique ENSPY</p>
            <p className="mt-2 text-sm text-gray-500">
              En vigueur le <strong>13 novembre 2025</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-12 print:hidden">
            <button
              onClick={printPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-2xl shadow-md hover:shadow-lg hover:border-purple-400 transition-all duration-300 text-sm font-semibold"
            >
              <Download className="w-5 h-5" />
              Télécharger PDF
            </button>
            {/* <a
              href="https://github.com/enspy-xccm/xccm1"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              Code Source
            </a> */}
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Introduction */}
              <section id="intro" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-700 font-bold">1</span>
                  </div>
                  Introduction
                </h2>
                <div className="prose prose-purple max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    XCCM1 est une <strong>plateforme académique open-source</strong> développée par les étudiants de
                    <strong> 4ᵉ année Génie Informatique</strong> à l'<strong>ENSPY Yaoundé</strong> sous la supervision du
                    <strong> Pr. Bernabe BATCHAKUI</strong>.
                  </p>
                  <p className="mt-4 text-gray-700">
                    Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données
                    dans le respect de la <strong>Loi n° 2010/012 du 21 décembre 2010</strong> relative à la cybersécurité et à la cybercriminalité au Cameroun.
                  </p>
                  <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-purple-50 rounded-2xl border-l-4 border-purple-500">
                    <p className="text-sm font-medium text-purple-800">
                      Aucune donnée n’est vendue, partagée ou utilisée à des fins commerciales.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Données collectées */}
              <section id="donnees" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-purple-700" />
                  </div>
                  Données collectées
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: UserCheck, title: "Identifiants", items: ["Email institutionnel", "Rôle (Étudiant/Enseignant)", "Nom & Prénom"] },
                    { icon: FileText, title: "Contenus pédagogiques", items: ["Cours créés", "Granules", "Compositions"] },
                    { icon: Clock, title: "Données techniques", items: ["Horodatage", "Adresse IP (anonymisée)", "Navigateur"] }
                  ].map((cat, i) => (
                    <div key={i} className="bg-gradient-to-br from-purple-50 to-purple-50 p-5 rounded-2xl border border-purple-100">
                      <div className="flex items-center gap-2 mb-3">
                        <cat.icon className="w-5 h-5 text-purple-700" />
                        <h3 className="font-semibold text-purple-900">{cat.title}</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {cat.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
                  <p className="text-sm text-amber-800">
                    <strong>Important :</strong> Aucun mot de passe n’est stocké en clair. Hashage avec <code className="font-mono">bcrypt</code>.
                  </p>
                </div>
              </section>

              {/* 3. Finalités */}
              <section id="finalites" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-700 font-bold">3</span>
                  </div>
                  Finalités du traitement
                </h2>
                <div className="space-y-4">
                  {[
                    "Authentification sécurisée des utilisateurs",
                    "Création et partage de contenus pédagogiques",
                    "Collaboration entre enseignants",
                    "Statistiques d’usage anonymisées (recherche académique)",
                    "Amélioration continue du prototype"
                  ].map((purpose, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl hover:from-purple-100 transition-colors">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{purpose}</p>
                      <span className="ml-auto text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        LÉGITIME
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Conservation */}
              <section id="conservation" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-700" />
                  </div>
                  Durée de conservation
                </h2>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  {[
                    { duration: "Jusqu’à suppression", type: "Compte utilisateur", color: "from-green-50 to-emerald-50" },
                    { duration: "6 mois", type: "Logs techniques", color: "from-yellow-50 to-amber-50" },
                    { duration: "Illimitée", type: "Contenus pédagogiques", color: "from-purple-50 to-purple-50" }
                  ].map((item, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${item.color} border-purple-200`}>
                      <p className="text-2xl font-bold text-purple-700">{item.duration}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.type}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Vos droits */}
              <section id="droits" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-700 font-bold">5</span>
                  </div>
                  Vos droits (Loi 2010/012)
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { right: "Accès", desc: "Consulter vos données" },
                    { right: "Rectification", desc: "Corriger une erreur" },
                    { right: "Suppression", desc: "Effacer votre compte" },
                    { right: "Opposition", desc: "Refuser un traitement" }
                  ].map((droit, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDetails(droit.right)}
                      className="text-left p-5 bg-gradient-to-r from-purple-50 to-purple-50 rounded-2xl border border-purple-200 hover:from-purple-100 hover:to-purple-100 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-purple-900">{droit.right}</h3>
                        {showDetails[droit.right] ? <EyeOff className="w-5 h-5 text-purple-600" /> : <Eye className="w-5 h-5 text-purple-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{droit.desc}</p>
                      {showDetails[droit.right] && (
                        <p className="mt-3 text-xs text-purple-700 animate-fade-in">
                          Envoyez un email à <strong>xccm@enspy.cm</strong>
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* 6. Sécurité */}
              <section id="securite" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-700" />
                  </div>
                  Mesures de sécurité
                </h2>
                <div className="space-y-4">
                  {[
                    "Chiffrement TLS 1.3 en transit",
                    "Hashage bcrypt des mots de passe",
                    "Anonymisation des IP",
                    "Aucun cookie tiers",
                    "Code audité publiquement sur GitHub"
                  ].map((measure, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <Check className="w-5 h-5 text-green-600" />
                      <code className="text-sm font-mono text-green-800">{measure}</code>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. Contact DPO */}
              <section id="contact" className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-purple-700 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-700" />
                  </div>
                  Contactez-nous
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => copyEmail('privacy@xccm.enspy.cm')}
                    className="w-full p-5 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-semibold">privacy@xccm.enspy.cm</p>
                        <p className="text-sm opacity-90">Délégué à la Protection des Données</p>
                      </div>
                    </div>
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  </button>
                  <a
                    href="https://github.com/enspy-xccm/xccm1/issues"
                    target="_blank"
                    rel="noopener"
                    className="block p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-center"
                  >
                    <p className="font-medium text-gray-800">Signaler un problème de confidentialité</p>
                    <p className="text-sm text-gray-600 mt-1">GitHub Issues → Confidentialité</p>
                  </a>
                </div>
              </section>

              {/* 8. Mise à jour */}
              <section className="bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Mise à jour de cette politique</h2>
                <p className="opacity-90">
                  Dernière révision : <strong>13 novembre 2025</strong><br />
                  Nous vous informerons par email en cas de modification substantielle.
                </p>
              </section>
            </div>

            {/* Sidebar - Navigation Rapide */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-purple-600 text-white p-6 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-bold mb-2">Prototype ENSPY</h3>
                  <p className="text-sm opacity-90">GIF4087-1 • 2025–2026</p>
                  <p className="text-xs mt-3 opacity-75">Aucune donnée commerciale</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                  <h3 className="font-bold text-purple-700 mb-4 text-lg">Sommaire</h3>
                  <nav className="space-y-2">
                    {[
                      { id: "intro", label: "Introduction" },
                      { id: "donnees", label: "Données collectées" },
                      { id: "finalites", label: "Finalités" },
                      { id: "conservation", label: "Conservation" },
                      { id: "droits", label: "Vos droits" },
                      { id: "securite", label: "Sécurité" },
                      { id: "contact", label: "Contact" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-colors text-sm font-medium text-purple-700 hover:text-purple-900 flex items-center justify-between group"
                      >
                        <span>{item.label}</span>
                        <div className="w-1 h-1 bg-purple-600 rounded-full group-hover:scale-150 transition-transform"></div>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-2">Conforme à la loi</h3>
                  <p className="text-xs text-amber-700">
                    Loi n° 2010/012<br />
                    Cybersécurité & Cybercriminalité<br />
                    République du Cameroun
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}