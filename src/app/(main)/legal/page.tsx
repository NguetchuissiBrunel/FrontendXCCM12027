'use client';

import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Mail,
  Phone,
} from 'lucide-react';

export default function LegalMentionsPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copiez cet e-mail :', email);
    }
  };

  const printPDF = () => window.print();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'editeur', label: 'Éditeur' },
    { id: 'equipe', label: 'Équipe' },
    { id: 'hebergement', label: 'Hébergement' },
    { id: 'propriete', label: 'Propriété' },
    { id: 'donnees', label: 'Données' },
    { id: 'responsabilite', label: 'Responsabilité' },
    { id: 'contact', label: 'Contact' },
    { id: 'droit', label: 'Droit applicable' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-16 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <header className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-600 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-transparent bg-gradient-to-r from-purple-700 to-purple-700 bg-clip-text md:text-5xl">
            Mentions Légales
          </h1>
          <p className="mt-3 text-gray-600 dark:text-slate-300">Plateforme XCCM1 – ENSPY Yaoundé</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Mise à jour : <strong>13 novembre 2025</strong>
          </p>
        </header>

        <div className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
          <button
            onClick={printPDF}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-600 hover:text-purple-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500"
          >
            <Download className="h-5 w-5" />
            Télécharger / Imprimer
          </button>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            À retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Projet académique',
                desc: 'Prototype ENSPY destiné à un usage pédagogique.',
              },
              {
                title: 'Open-source',
                desc: 'Code publié à des fins éducatives (licence MIT).',
              },
              {
                title: 'Données encadrées',
                desc: 'Traitements conformes à la loi 2010/012.',
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
          <div className="space-y-8 lg:col-span-2">
            <section
              id="editeur"
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-purple-700 dark:text-purple-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                  1
                </span>
                Éditeur du site
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-slate-300">
                <p>Projet académique réalisé sous la direction de :</p>
                <div className="rounded-xl border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-purple-50 p-4 dark:from-purple-500/10 dark:to-purple-500/10">
                  <strong className="block text-purple-800 dark:text-purple-200">École Nationale Supérieure Polytechnique</strong>
                  <span className="text-sm">BP 8390 Yaoundé, Cameroun</span>
                  <br />
                  <span className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" /> (+237) 222 23 61 00
                  </span>
                  <br />
                  <a
                    href="http://www.enspy.ucac-icam.cm"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-300"
                  >
                    <ExternalLink className="h-3 w-3" /> www.enspy.cm
                  </a>
                </div>
                <p className="mt-3">
                  <strong>Responsable :</strong> Pr. Bernabe BATCHAKUI
                  <br />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Superviseur – Génie Informatique</span>
                  <br />
                  <button
                    onClick={() => copyEmail('bernabe.batchakui@enspy.ucac-icam.cm')}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-300"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : 'bernabe.batchakui@enspy.ucac-icam.cm'}
                  </button>
                </p>
              </div>
            </section>

            <section
              id="equipe"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  2
                </span>
                Équipe de développement
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Étudiants 4ᵉ année – Génie Informatique (2025-2026)
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'AZANGUE LEONEL DELMAT', mat: '22P206' },
                  { name: 'BALA ANDEGUE FRANCOIS LIONNEL', mat: '22P448' },
                  { name: 'NKOLO ANTAGANA STACY', mat: '22P582' },
                  { name: 'NANA NDOUNDAM GABRIELLE', mat: '22P482' },
                  { name: 'NANKENG TSAMO PIERRE MARCELLE', mat: '22P292' },
                  { name: 'NCHANG ROY FRU', mat: '22P596' },
                  { name: 'NGUETCHUISSI TCHUGOUA BRUNEL LANDRY', mat: '22P584' },
                  { name: 'SOUNTSA DJIELE PIO VIANNEY', mat: '22P572' },
                  { name: 'OSSOMBE PIERRE RENE RAOUL', mat: '21P064' },
                  { name: 'NKAMLA CHEDJOU JOHAN', mat: '22P607' },
                  { name: 'NTIH TCHIO TAMOGOU DARYL', mat: '22P250' },
                  { name: 'TAGASTING FOSTING SAMUEL SEAN', mat: '22P215' },
                ].map((dev) => (
                  <div
                    key={dev.mat}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {dev.name}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-purple-700 shadow-sm dark:bg-slate-900 dark:text-purple-300">
                      {dev.mat}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="hebergement"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  3
                </span>
                Hébergement
              </h2>
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <strong className="block text-emerald-800 dark:text-emerald-200">Vercel Inc.</strong>
                <span className="text-xs text-emerald-700 dark:text-emerald-200">
                  340 S Lemon Ave #4133, Walnut, CA 91789, USA
                </span>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
                >
                  <ExternalLink className="h-3 w-3" />
                  vercel.com
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Hébergement temporaire à des fins académiques.
              </p>
            </section>

            <section
              id="propriete"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  4
                </span>
                Propriété intellectuelle
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Code source et concept de granules : propriété collective ENSPY + auteurs.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Publié sous <strong>licence MIT</strong> (éducation & recherche).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-600" />
                  La propriété des contenus pédagogiques reste aux <strong>enseignants</strong>.
                </li>
              </ul>
            </section>

            <section
              id="donnees"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  5
                </span>
                Protection des données
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Conforme à la <strong>Loi n° 2010/012</strong> (Cameroun).
              </p>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                {[
                  { label: 'Collectées', value: 'email, rôle, compositions' },
                  { label: 'Finalité', value: 'authentification, création de cours' },
                  { label: 'Conservation', value: 'jusqu’à suppression' },
                  { label: 'Droits', value: 'accès, suppression sur demande' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <strong className="text-slate-900 dark:text-white">{item.label} :</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="responsabilite"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  6
                </span>
                Responsabilité
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Prototype académique. Aucune garantie de disponibilité ou de sécurité commerciale.
              </p>
            </section>

              {/* 7. Contact */}
            <section
              id="contact"
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-purple-700 dark:text-purple-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                  7
                </span>
                Contact & Ressources
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => copyEmail('xccm@enspy.cm')}
                  className="flex w-full items-center justify-between rounded-lg bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-700 dark:text-purple-200" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">xccm@enspy.cm</span>
                  </div>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-purple-600 dark:text-purple-200" />}
                </button>
                <a
                  href="https://github.com/enspy-xccm/xccm1"
                  target="_blank"
                  rel="noopener"
                  className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition-colors group hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-black">
                      <span className="text-xs font-bold text-white">G</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">github.com/enspy-xccm/xccm1</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-purple-600 dark:text-slate-300" />
                </a>
              </div>
            </section>

            <section
              id="droit"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  8
                </span>
                Droit applicable
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Droit camerounais. Tribunaux de Yaoundé compétents.
              </p>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">Prototype académique</h3>
                <p className="mt-2 text-sm text-slate-200">Projet GIF4087-1 - ENSPY 2025</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Navigation rapide
                </h3>
                <nav className="mt-4 space-y-2 text-sm">
                  {sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
                    >
                      <ChevronRight className="h-4 w-4 text-purple-400" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Contact rapide
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Pour toute demande officielle, contactez l&apos;équipe XCCM1 par e-mail.
                </p>
                <button
                  onClick={() => copyEmail('xccm@enspy.cm')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Mail className="h-4 w-4 text-purple-600 dark:text-purple-300" />}
                  xccm@enspy.cm
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
