// src/app/terms/page.tsx
'use client';

import  Footer  from '@/components/layout/Footer';
import  Navbar  from '@/components/layout/Navbar';
import { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Shield, 
  Users, 
  FileText, 
  AlertCircle,
  ChevronRight,
  Calendar,
  Globe,
  Lock,
  BookOpen,
  Mail
} from 'lucide-react';

export default function TermsOfService() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printPDF = () => window.print();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full mb-5 shadow-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-800 bg-clip-text text-transparent">
              Conditions d'Utilisation
            </h1>
            <p className="mt-3 text-gray-600 text-lg">Plateforme XCCM1 – ENSPY Yaoundé</p>
            <p className="mt-1 text-sm text-gray-500 flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4" />
              En vigueur depuis le <strong>13 novembre 2025</strong>
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 print:hidden">
            <button
              onClick={printPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-lg hover:border-purple-400 transition-all duration-300 font-medium"
            >
              <Download className="w-5 h-5" />
              Télécharger en PDF
            </button>
            <a
              href="https://github.com/enspy-xccm/xccm1/blob/main/LICENSE"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Voir la Licence MIT
            </a>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Acceptation */}
              <section id="acceptation" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-700 font-bold">1</span>
                  </div>
                  Acceptation des Conditions
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <p>
                    En accédant ou en utilisant la plateforme <strong>XCCM1</strong>, vous acceptez d'être lié par les présentes <strong>Conditions d'Utilisation</strong>.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <p className="text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Attention :</strong> Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser XCCM1.
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Description */}
              <section id="description" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-700" />
                  </div>
                  Description du Service
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span><strong>XCCM1</strong> est une plateforme web académique permettant la création, structuration et partage de contenus pédagogiques sous forme de <em>granules</em>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span>Destinée aux <strong>enseignants</strong> et <strong>étudiants</strong> de l'ENSPY.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span>Prototype développé dans le cadre du cours <strong>GIF4087-1</strong> (2025–2026).</span>
                  </li>
                </ul>
              </section>

              {/* 3. Comptes */}
              <section id="comptes" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-700" />
                  </div>
                  Comptes Utilisateur
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">Étudiants</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Accès en lecture</li>
                      <li>Consultation des cours</li>
                      <li>Téléchargement PDF/Word</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">Enseignants</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Création de granules</li>
                      <li>Structuration hiérarchique</li>
                      <li>Exportation multi-format</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Contenu */}
              <section id="contenu" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-700" />
                  </div>
                  Contenu Utilisateur
                </h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Les enseignants conservent la <strong>propriété intellectuelle</strong> de leurs contenus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>En publiant, vous accordez à XCCM1 une <strong>licence non-exclusive</strong> pour affichage et distribution interne.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <span>Interdiction de publier du contenu <strong>illégal, diffamatoire ou plagiarisé</strong>.</span>
                  </li>
                </ul>
              </section>

              {/* 5. Propriété Intellectuelle */}
              <section id="propriete" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-700" />
                  </div>
                  Propriété Intellectuelle
                </h2>
                <div className="bg-gradient-to-r from-purple-50 to-purple-50 p-5 rounded-xl border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-purple-900">
                    Le code source de XCCM1 est publié sous <strong>licence MIT</strong> à des fins éducatives.
                  </p>
                  <a
                    href="https://github.com/enspy-xccm/xccm1/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 mt-2 text-purple-600 hover:underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir la licence complète
                  </a>
                </div>
              </section>

              {/* 6. Responsabilité */}
              <section id="responsabilite" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-purple-700" />
                  </div>
                  Limitation de Responsabilité
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• XCCM1 est un <strong>prototype académique</strong></li>
                  <li>• Aucune garantie de disponibilité ou de sécurité</li>
                  <li>• L'ENSPY n'est pas responsable des contenus publiés</li>
                  <li>• Utilisation à vos risques et périls</li>
                </ul>
              </section>

              {/* 7. Résiliation */}
              <section id="resiliation" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-purple-700" />
                  </div>
                  Résiliation
                </h2>
                <p className="text-sm text-gray-700">
                  L'ENSPY se réserve le droit de <strong>suspendre ou supprimer</strong> tout compte en cas de violation des présentes conditions.
                </p>
              </section>

              {/* 8. Contact */}
              <section id="contact" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-700" />
                  </div>
                  Contact
                </h2>
                <button
                  onClick={() => copyEmail('xccm@enspy.ucac-icam.cm')}
                  className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-100 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-700" />
                    <span className="font-medium text-purple-900">xccm@enspy.ucac-icam.cm</span>
                  </div>
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-purple-600 group-hover:text-purple-800" />}
                </button>
              </section>
            </div>

            {/* Sidebar - Navigation Rapide */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                  <h3 className="font-bold text-lg mb-2">Prototype ENSPY</h3>
                  <p className="text-sm opacity-90">GIF4087-1 • 2025–2026</p>
                  <p className="text-xs mt-2 opacity-75">Supervisé par Dr. Bernabe BATCHAKUI</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-purple-700 mb-4">Sommaire</h3>
                  <nav className="space-y-2 text-sm">
                    {[
                      { id: 'acceptation', label: '1. Acceptation' },
                      { id: 'description', label: '2. Service' },
                      { id: 'comptes', label: '3. Comptes' },
                      { id: 'contenu', label: '4. Contenu' },
                      { id: 'propriete', label: '5. Propriété' },
                      { id: 'responsabilite', label: '6. Responsabilité' },
                      { id: 'resiliation', label: '7. Résiliation' },
                      { id: 'contact', label: '8. Contact' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                  <p className="text-xs text-green-800 font-medium">
                    Dernière mise à jour : 13 novembre 2025
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}