'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
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

  const toggleDetails = (id: string) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const printPDF = () => window.print();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'donnees', label: 'Données collectées' },
    { id: 'finalites', label: 'Finalités' },
    { id: 'conservation', label: 'Conservation' },
    { id: 'droits', label: 'Vos droits' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
              <Shield className="h-4 w-4" />
              Politique de confidentialité
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              Protection des données
            </h1>
            <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
              XCCM1 - Plateforme académique ENSPY
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                En vigueur le 13 novembre 2025
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Loi n° 2010/012
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
            <button
              onClick={() => copyEmail(contactEmail)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-600 hover:text-purple-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
              Copier l&apos;e-mail DPO
            </button>
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              À retenir
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Usage académique',
                  desc: 'Plateforme expérimentale, sans finalité commerciale.',
                },
                {
                  title: 'Données minimisées',
                  desc: 'Collecte strictement nécessaire au fonctionnement.',
                },
                {
                  title: 'Transparence',
                  desc: 'Aucune vente ni partage des données.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section
                id="intro"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    1
                  </span>
                  Introduction
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    XCCM1 est une <strong>plateforme académique open-source</strong> développée par
                    les étudiants de <strong>4ᵉ année Génie Informatique</strong> à l&apos;ENSPY
                    Yaoundé, sous la supervision du <strong>Dr. Bernabe BATCHAKUI</strong>.
                  </p>
                  <p>
                    Cette politique de confidentialité explique comment nous collectons, utilisons
                    et protégeons vos données dans le respect de la{' '}
                    <strong>Loi n° 2010/012 du 21 décembre 2010</strong> relative à la cybersécurité
                    et à la cybercriminalité au Cameroun.
                  </p>
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      Aucune donnée n&apos;est vendue, partagée ou utilisée à des fins commerciales.
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="donnees"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Lock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Données collectées
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: UserCheck,
                      title: 'Identifiants',
                      items: ['Email institutionnel', 'Rôle (Étudiant/Enseignant)', 'Nom & Prénom'],
                    },
                    {
                      icon: FileText,
                      title: 'Contenus pédagogiques',
                      items: ['Cours créés', 'Granules', 'Compositions'],
                    },
                    {
                      icon: Clock,
                      title: 'Données techniques',
                      items: ['Horodatage', 'Adresse IP (anonymisée)', 'Navigateur'],
                    },
                  ].map((cat) => (
                    <div
                      key={cat.title}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {cat.title}
                        </h3>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {cat.items.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-600 dark:bg-purple-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important :</strong> Aucun mot de passe n&apos;est stocké en clair.
                    Hashage avec <code className="font-mono">bcrypt</code>.
                  </p>
                </div>
              </section>

              <section
                id="finalites"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    3
                  </span>
                  Finalités du traitement
                </h2>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    'Authentification sécurisée des utilisateurs',
                    'Création et partage de contenus pédagogiques',
                    'Collaboration entre enseignants',
                    'Statistiques d’usage anonymisées (recherche académique)',
                    'Amélioration continue du prototype',
                  ].map((purpose) => (
                    <div
                      key={purpose}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <p>{purpose}</p>
                      <span className="ml-auto rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                        LÉGITIME
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="conservation"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Durée de conservation
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    { duration: 'Jusqu’à suppression', type: 'Compte utilisateur' },
                    { duration: '6 mois', type: 'Logs techniques' },
                    { duration: 'Illimitée', type: 'Contenus pédagogiques' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950"
                    >
                      <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300">
                        {item.duration}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {item.type}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="droits"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    5
                  </span>
                  Vos droits (Loi 2010/012)
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { right: 'Accès', desc: 'Consulter vos données' },
                    { right: 'Rectification', desc: 'Corriger une erreur' },
                    { right: 'Suppression', desc: 'Effacer votre compte' },
                    { right: 'Opposition', desc: 'Refuser un traitement' },
                  ].map((droit) => (
                    <button
                      key={droit.right}
                      onClick={() => toggleDetails(droit.right)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-purple-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-purple-500/40"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {droit.right}
                        </h3>
                        {showDetails[droit.right] ? (
                          <EyeOff className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {droit.desc}
                      </p>
                      {showDetails[droit.right] && (
                        <p className="mt-3 text-xs font-medium text-purple-700 dark:text-purple-300">
                          Envoyez un e-mail a <strong>{contactEmail}</strong>.
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <section
                id="securite"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Mesures de sécurité
                </h2>
                <div className="mt-4 space-y-3">
                  {[
                    'Chiffrement TLS 1.3 en transit',
                    'Hashage bcrypt des mots de passe',
                    'Anonymisation des IP',
                    'Aucun cookie tiers',
                    'Code audité publiquement sur GitHub',
                  ].map((measure) => (
                    <div
                      key={measure}
                      className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                    >
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium">{measure}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="contact"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </span>
                  Contactez-nous
                </h2>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => copyEmail(contactEmail)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-600 px-4 py-3 text-left text-white shadow-md transition hover:bg-purple-700"
                  >
                    <span className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <span>
                        <p className="text-sm font-semibold">{contactEmail}</p>
                        <p className="text-xs opacity-90">
                          Délégué à la Protection des Données
                        </p>
                      </span>
                    </span>
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-200" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    Pour toute demande liée aux données personnelles, merci d&apos;indiquer votre
                    nom, votre rôle (étudiant/enseignant) et l&apos;objet de la demande.
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-purple-600 p-6 text-white shadow-md">
                <h2 className="text-xl font-semibold">Mise à jour de cette politique</h2>
                <p className="mt-3 text-sm text-purple-100">
                  Dernière révision : <strong>13 novembre 2025</strong>. Nous vous informerons par
                  e-mail en cas de modification substantielle.
                </p>
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                  <h3 className="text-lg font-semibold">Prototype ENSPY</h3>
                  <p className="mt-2 text-sm text-slate-200">GIF4087-1 - 2025-2026</p>
                  <p className="mt-2 text-xs text-slate-300">
                    Aucune donnée commerciale
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    Sommaire
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

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Conforme à la loi
                  </h3>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-100">
                    Loi n° 2010/012
                    <br />
                    Cybersécurité & Cybercriminalité
                    <br />
                    République du Cameroun
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Suppression de compte
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Demande de suppression via {contactEmail}.
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
