'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  Mail,
  Scale,
  Shield,
  Users,
} from 'lucide-react';

export default function TermsOfServicePage() {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'xccm1-enspy@gmail.com';

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sections = [
    { id: 'acceptation', label: '1. Acceptation' },
    { id: 'description', label: '2. Service' },
    { id: 'comptes', label: '3. Comptes' },
    { id: 'contenu', label: '4. Contenu' },
    { id: 'propriete', label: '5. Propriété' },
    { id: 'responsabilite', label: '6. Responsabilité' },
    { id: 'resiliation', label: '7. Résiliation' },
    { id: 'contact', label: '8. Contact' },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Document contractuel
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              Conditions d&apos;utilisation
            </h1>
            <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
              Plateforme XCCM1 - ENSPY Yaoundé
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <Calendar className="h-4 w-4" />
                En vigueur depuis le 13 novembre 2025
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <Scale className="h-4 w-4" />
                Version 1.0
              </span>
            </div>
          </header>

          <div className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
            <button
              onClick={printPDF}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-600 hover:text-purple-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500"
            >
              <Download className="h-5 w-5" />
              Télécharger / Imprimer
            </button>
            <a
              href="https://github.com/Prrojet-XCCM1/FrontendXCCM12027/blob/main/LICENCE.md"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
            >
              <ExternalLink className="h-5 w-5" />
              Licence MIT
            </a>
            <button
              onClick={() => copyEmail(contactEmail)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-600 hover:text-purple-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
              Copier l&apos;e-mail
            </button>
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              À retenir
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Usage académique</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  XCCM1 est un prototype utilisé dans un cadre pédagogique.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Respect des contenus</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Aucune publication illégale, diffamatoire ou plagiée n'est autorisée.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Responsabilité limitée</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Le service est fourni "en l'etat" sans garantie de disponibilité.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section
                id="acceptation"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    1
                  </span>
                  Acceptation des conditions
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    En accédant ou en utilisant la plateforme <strong>XCCM1</strong>, vous acceptez
                    d&apos;être lié par les présentes conditions d&apos;utilisation.
                  </p>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <p className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" />
                      Si vous n&apos;acceptez pas ces conditions, vous ne pouvez pas utiliser XCCM1.
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="description"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Description du service
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-5 w-5 text-purple-500" />
                    <span>
                      <strong>XCCM1</strong> est une plateforme web académique de création,
                      structuration et partage de contenus pédagogiques sous forme de granules.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-5 w-5 text-purple-500" />
                    <span>
                      La plateforme est destinée aux <strong>enseignants</strong> et aux
                      <strong> étudiants</strong> de l&apos;ENSPY.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-5 w-5 text-purple-500" />
                    <span>
                      Prototype développé dans le cadre du cours{' '}
                      <strong>GIF4087-1 (2025-2026)</strong>.
                    </span>
                  </li>
                </ul>
              </section>

              <section
                id="comptes"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Comptes utilisateur
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Étudiants</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <li>Accès en lecture</li>
                      <li>Consultation des cours</li>
                      <li>Téléchargement PDF/Word</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Enseignants</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <li>Création de granules</li>
                      <li>Structuration hiérarchique</li>
                      <li>Exportation multi-format</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section
                id="contenu"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Contenu utilisateur
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span>
                      Les enseignants conservent la <strong>propriété intellectuelle</strong> de
                      leurs contenus.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span>
                      En publiant, vous accordez à XCCM1 une <strong>licence non-exclusive</strong>
                      pour affichage et distribution interne.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-300" />
                    <span>
                      Interdiction de publier du contenu <strong>illégal, diffamatoire ou
                      plagié</strong>.
                    </span>
                  </li>
                </ul>
              </section>

              <section
                id="propriete"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Propriété intellectuelle
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-medium text-slate-800 dark:text-white">
                      Le code source de XCCM1 est publié sous <strong>licence MIT</strong> à des fins
                      éducatives.
                    </p>
                    <a
                      href="https://github.com/enspy-xccm/xccm1/blob/main/LICENSE"
                      target="_blank"
                      rel="noopener"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Lire la licence complète
                    </a>
                  </div>
                  <ul className="space-y-2">
                    <li>Les marques, logos et éléments d'interface restent protégés.</li>
                    <li>
                      Les contenus pédagogiques publiés par les enseignants restent, sauf mention
                      contraire, la propriété de leurs auteurs.
                    </li>
                  </ul>
                </div>
              </section>

              <section
                id="responsabilite"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Limitation de responsabilité
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>XCCM1 est un <strong>prototype académique</strong>.</li>
                  <li>Aucune garantie de disponibilité ou de sécurité.</li>
                  <li>L&apos;ENSPY n&apos;est pas responsable des contenus publiés.</li>
                  <li>Utilisation à vos risques et périls.</li>
                </ul>
              </section>

              <section
                id="resiliation"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Lock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Résiliation
                </h2>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  L&apos;ENSPY se réserve le droit de <strong>suspendre ou supprimer</strong> tout
                  compte en cas de violation des présentes conditions.
                </p>
              </section>

              <section
                id="contact"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Contact
                </h2>
                <button
                  onClick={() => copyEmail(contactEmail)}
                  className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    {contactEmail}
                  </span>
                  {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </section>
            </div>

            <aside className="lg:col-span-1">
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
                      >
                        <ChevronRight className="h-4 w-4 text-purple-400" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md dark:border-purple-500">
                  <h3 className="text-lg font-semibold">Projet académique ENSPY</h3>
                  <p className="mt-2 text-sm text-slate-200">GIF4087-1 - 2025-2026</p>
                  <p className="mt-2 text-xs text-slate-300">
                    Supervisé par Dr. Bernabe BATCHAKUI
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    Besoin d&apos;aide
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Contactez l&apos;équipe XCCM1 pour toute question juridique ou technique.
                  </p>
                  <button
                    onClick={() => copyEmail(contactEmail)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Mail className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    )}
                    {contactEmail}
                  </button>
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
