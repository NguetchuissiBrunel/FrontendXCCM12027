'use client';

import  Footer  from '@/components/layout/Footer';
import  Navbar  from '@/components/layout/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { Copy, Download, Mail, Phone, MapPin, ExternalLink, Check } from 'lucide-react';

export default function LegalMentions() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printPDF = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
     
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Hero */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              Mentions Légales
            </h1>
            <p className="mt-3 text-gray-600">Plateforme XCCM1 – ENSPY Yaoundé</p>
            <p className="mt-1 text-sm text-gray-500">Mise à jour : <strong>13 novembre 2025</strong></p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-12 print:hidden">
            <button
              onClick={printPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:border-purple-400 transition-all duration-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
            {/* <a
              href="https://github.com/enspy-xccm/xccm1"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Voir sur GitHub
            </a> */}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Éditeur */}
              <section id="editeur" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">1</span>
                  </div>
                  Éditeur du site
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>Projet académique réalisé sous la direction de :</p>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-l-4 border-purple-500">
                    <strong className="block text-purple-800">École Nationale Supérieure Polytechnique</strong>
                    <span className="text-sm">BP 8390 Yaoundé, Cameroun</span><br />
                    <span className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> (+237) 222 23 61 00</span><br />
                    <a href="http://www.enspy.ucac-icam.cm" target="_blank" rel="noopener" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> www.enspy.ucac-icam.cm
                    </a>
                  </div>
                  <p className="mt-3">
                    <strong>Responsable :</strong> Dr. Bernabe BATCHAKUI<br />
                    <span className="text-sm text-gray-600">Superviseur – Génie Informatique</span><br />
                    <button
                      onClick={() => copyEmail('bernabe.batchakui@enspy.ucac-icam.cm')}
                      className="mt-1 inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : 'bernabe.batchakui@enspy.ucac-icam.cm'}
                    </button>
                  </p>
                </div>
              </section>

              {/* 2. Équipe */}
              <section id="equipe" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">2</span>
                  </div>
                  Équipe de développement
                </h2>
                <p className="text-sm text-gray-600 mb-4">Étudiants 4ᵉ année – Génie Informatique (2025–2026)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: "AZANGUE LEONEL DELMAT", mat: "22P206" },
                    { name: "BALA ANDEGUE FRANCOIS LIONNEL", mat: "22P448" },
                    { name: "NKOLO ANTAGANA STACY", mat: "22P582" },
                    { name: "NANA NDOUNDAM GABRIELLE", mat: "22P482" },
                    { name: "NANKENG TSAMO PIERRE MARCELLE", mat: "22P292" },
                    { name: "NCHANG ROY FRU", mat: "22P596" },
                    { name: "NGUETCHUISSI TCHUGOUA BRUNEL LANDRY", mat: "22P584" },
                    { name: "SOUNTSA DJIELE PIO VIANNEY", mat: "22P572" },
                    { name: "OSSOMBE PIERRE RENE RAOUL", mat: "21P064" },
                    { name: "NKAMLA CHEDJOU JOHAN", mat: "22P607" },
                    { name: "NTIH TCHIO TAMOGOU DARYL", mat: "22P250" },
                    { name: "TAGASTING FOSTING SAMUEL SEAN", mat: "22P215" },
                  ].map((dev) => (
                    <div
                      key={dev.mat}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all duration-200 cursor-default"
                    >
                      <span className="text-sm font-medium text-gray-800">{dev.name}</span>
                      <span className="font-mono text-xs text-purple-700 bg-white px-2 py-1 rounded-full">{dev.mat}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Hébergement */}
              <section id="hebergement" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">3</span>
                  </div>
                  Hébergement
                </h2>
                <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                  <strong className="block text-green-800">Vercel Inc.</strong>
                  <span className="text-sm">340 S Lemon Ave #4133, Walnut, CA 91789, USA</span><br />
                  <a href="https://vercel.com" target="_blank" rel="noopener" className="text-sm text-green-700 hover:underline flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" /> vercel.com
                  </a>
                </div>
                <p className="mt-3 text-sm text-gray-600">Hébergement temporaire à des fins académiques</p>
              </section>

              {/* 4. Propriété intellectuelle */}
              <section id="propriete" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">4</span>
                  </div>
                  Propriété intellectuelle
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Code source et concept de <strong>"granules"</strong> : propriété collective ENSPY + auteurs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Publié sous <strong>licence MIT</strong> (éducation & recherche)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Cont La propriété des contenus pédagogiques reste aux <strong>enseignants</strong>
                  </li>
                </ul>
              </section>

              {/* 5. Données */}
              <section id="donnees" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">5</span>
                  </div>
                  Protection des données
                </h2>
                <p className="text-sm text-gray-600 mb-3">Conforme à la <strong>Loi n° 2010/012</strong> (Cameroun)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong>Collectées</strong>: email, rôle, compositions
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong>Finalité</strong>: authentification, création de cours
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong>Conservation</strong>: jusqu’à suppression
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong>Droits</strong>: accès, suppression sur demande
                  </div>
                </div>
              </section>

              {/* 6. Responsabilité */}
              <section id="responsabilite" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">6</span>
                  </div>
                  Responsabilité
                </h2>
                <p className="text-sm text-gray-700">Prototype académique. Aucune garantie de disponibilité ou de sécurité commerciale.</p>
              </section>

              {/* 7. Contact */}
              <section id="contact" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">7</span>
                  </div>
                  Contact & Ressources
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => copyEmail('xccm@enspy.ucac-icam.cm')}
                    className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-700" />
                      <span className="font-medium">xccm@enspy.ucac-icam.cm</span>
                    </div>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-purple-600" />}
                  </button>
                  <a
                    href="https://github.com/enspy-xccm/xccm1"
                    target="_blank"
                    rel="noopener"
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="font-medium">github.com/enspy-xccm/xccm1</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                  </a>
                </div>
              </section>

              {/* 8. Droit applicable */}
              <section id="droit" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">8</span>
                  </div>
                  Droit applicable
                </h2>
                <p className="text-sm text-gray-700">Droit camerounais. Tribunaux de Yaoundé compétents.</p>
              </section>
            </div>

            {/* Sidebar - Navigation Rapide */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Prototype Académique</h3>
                  <p className="text-sm opacity-90">Projet GIF4087-1 – ENSPY 2025</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-purple-700 mb-3">Navigation rapide</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => scrollToSection('editeur')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        1. Éditeur
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('equipe')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        2. Équipe
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('hebergement')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        3. Hébergement
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('propriete')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        4. Propriété
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('donnees')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        5. Données
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('responsabilite')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        6. Responsabilité
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        7. Contact
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('droit')}
                        className="text-purple-600 hover:underline w-full text-left"
                      >
                        8. Droit applicable
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}