'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const contactEmail = 'xccm-enspy@gmail.com';
  const content = locale === 'fr'
    ? {
      copyFallback: 'Copiez cet e-mail :',
      sections: [
        { id: 'acceptation', label: '1. Acceptation' },
        { id: 'description', label: '2. Service' },
        { id: 'comptes', label: '3. Comptes' },
        { id: 'contenu', label: '4. Contenu' },
        { id: 'propriete', label: '5. Propriete' },
        { id: 'responsabilite', label: '6. Responsabilite' },
        { id: 'resiliation', label: '7. Resiliation' },
        { id: 'contact', label: '8. Contact' },
      ],
      badge: 'Document contractuel',
      title: "Conditions d'utilisation",
      subtitle: 'Plateforme XCCM - ENSPY Yaounde',
      effectiveDate: 'En vigueur depuis le 13 novembre 2025',
      version: 'Version 1.0',
      download: 'Telecharger / Imprimer',
      copyEmail: "Copier l'e-mail",
      keyTakeaways: 'A retenir',
      academicUse: 'Usage academique',
      academicUseDescription: 'XCCM est un prototype utilise dans un cadre pedagogique.',
      respect: 'Respect des contenus',
      respectDescription: "Aucune publication illegale, diffamatoire ou plagiee n'est autorisee.",
      liability: 'Responsabilite limitee',
      liabilityDescription: `Le service est fourni "en l'etat" sans garantie de disponibilite.`,
      acceptTitle: 'Acceptation des conditions',
      acceptBody: "En accedant ou en utilisant la plateforme XCCM, vous acceptez d'etre lie par les presentes conditions d'utilisation.",
      acceptWarning: "Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser XCCM.",
      serviceTitle: 'Description du service',
      serviceItems: [
        'XCCM est une plateforme web academique de creation, structuration et partage de contenus pedagogiques sous forme de granules.',
        "La plateforme est destinee aux enseignants et aux etudiants de l'ENSPY.",
        'Prototype developpe dans le cadre du cours GIF4087-1 (2025-2026).'
      ],
      accountsTitle: 'Comptes utilisateur',
      students: 'Etudiants',
      studentsItems: ['Acces en lecture', 'Consultation des cours', 'Telechargement PDF/Word'],
      teachers: 'Enseignants',
      teachersItems: ['Creation de granules', 'Structuration hierarchique', 'Exportation multi-format'],
      userContent: 'Contenu utilisateur',
      userContentItems: [
        'Les enseignants conservent la propriete intellectuelle de leurs contenus.',
        "En publiant, vous accordez a XCCM une licence non-exclusive pour affichage et distribution interne.",
        'Interdiction de publier du contenu illegal, diffamatoire ou plagie.'
      ],
      intellectual: 'Propriete intellectuelle',
      intellectualLead: 'Le code source de XCCM est publie sous licence MIT a des fins educatives.',
      readLicense: 'Lire la licence complete',
      intellectualItems: [
        "Les marques, logos et elements d'interface restent proteges.",
        'Les contenus pedagogiques publies par les enseignants restent, sauf mention contraire, la propriete de leurs auteurs.'
      ],
      limitation: 'Limitation de responsabilite',
      limitationItems: [
        'XCCM est un prototype academique.',
        'Aucune garantie de disponibilite ou de securite.',
        "L'ENSPY n'est pas responsable des contenus publies.",
        'Utilisation a vos risques et perils.'
      ],
      termination: 'Resiliation',
      terminationBody: "L'ENSPY se reserve le droit de suspendre ou supprimer tout compte en cas de violation des presentes conditions.",
      contact: 'Contact',
      summary: 'Sommaire',
      projectTitle: 'Projet academique ENSPY',
      projectSupervisor: 'Supervise par Dr. Bernabe BATCHAKUI',
      needHelp: "Besoin d'aide",
      helpBody: "Contactez l'equipe XCCM pour toute question juridique ou technique."
    }
    : {
      copyFallback: 'Copy this email:',
      sections: [
        { id: 'acceptation', label: '1. Acceptance' },
        { id: 'description', label: '2. Service' },
        { id: 'comptes', label: '3. Accounts' },
        { id: 'contenu', label: '4. Content' },
        { id: 'propriete', label: '5. Ownership' },
        { id: 'responsabilite', label: '6. Liability' },
        { id: 'resiliation', label: '7. Termination' },
        { id: 'contact', label: '8. Contact' },
      ],
      badge: 'Contract document',
      title: 'Terms of use',
      subtitle: 'XCCM platform - ENSPY Yaounde',
      effectiveDate: 'Effective since November 13, 2025',
      version: 'Version 1.0',
      download: 'Download / Print',
      copyEmail: 'Copy email',
      keyTakeaways: 'Key takeaways',
      academicUse: 'Academic use',
      academicUseDescription: 'XCCM is a prototype used in an academic context.',
      respect: 'Content compliance',
      respectDescription: 'No illegal, defamatory, or plagiarized publication is allowed.',
      liability: 'Limited liability',
      liabilityDescription: 'The service is provided "as is" with no availability guarantee.',
      acceptTitle: 'Acceptance of terms',
      acceptBody: 'By accessing or using the XCCM platform, you agree to be bound by these terms of use.',
      acceptWarning: 'If you do not accept these terms, you may not use XCCM.',
      serviceTitle: 'Service description',
      serviceItems: [
        'XCCM is an academic web platform for creating, structuring, and sharing learning content as granules.',
        'The platform is intended for ENSPY teachers and students.',
        'Prototype developed as part of course GIF4087-1 (2025-2026).'
      ],
      accountsTitle: 'User accounts',
      students: 'Students',
      studentsItems: ['Read-only access', 'Course consultation', 'PDF/Word downloads'],
      teachers: 'Teachers',
      teachersItems: ['Granule creation', 'Hierarchical structuring', 'Multi-format export'],
      userContent: 'User content',
      userContentItems: [
        'Teachers retain the intellectual property of their content.',
        'By publishing, you grant XCCM a non-exclusive license for internal display and distribution.',
        'Publishing illegal, defamatory, or plagiarized content is prohibited.'
      ],
      intellectual: 'Intellectual property',
      intellectualLead: 'The XCCM source code is published under the MIT license for educational purposes.',
      readLicense: 'Read the full license',
      intellectualItems: [
        'Brands, logos, and interface elements remain protected.',
        'Learning content published by teachers remains, unless otherwise stated, the property of its authors.'
      ],
      limitation: 'Limitation of liability',
      limitationItems: [
        'XCCM is an academic prototype.',
        'No guarantee of availability or security.',
        'ENSPY is not responsible for published content.',
        'Use at your own risk.'
      ],
      termination: 'Termination',
      terminationBody: 'ENSPY reserves the right to suspend or delete any account in the event of a breach of these terms.',
      contact: 'Contact',
      summary: 'Summary',
      projectTitle: 'ENSPY academic project',
      projectSupervisor: 'Supervised by Dr. Bernabe BATCHAKUI',
      needHelp: 'Need help',
      helpBody: 'Contact the XCCM team for any legal or technical question.'
    };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(content.copyFallback, email);
    }
  };

  const printPDF = () => window.print();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              {content.badge}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              {content.title}
            </h1>
            <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
              {content.subtitle}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <Calendar className="h-4 w-4" />
                {content.effectiveDate}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                <Scale className="h-4 w-4" />
                {content.version}
              </span>
            </div>
          </header>

          <div className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
            <button
              onClick={printPDF}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-600 hover:text-purple-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500"
            >
              <Download className="h-5 w-5" />
              {content.download}
            </button>
            <a
              href="https://github.com/Prrojet-XCCM/FrontendXCCM2027/blob/main/LICENCE.md"
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
              {content.copyEmail}
            </button>
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              {content.keyTakeaways}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{content.academicUse}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {content.academicUseDescription}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{content.respect}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {content.respectDescription}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{content.liability}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {content.liabilityDescription}
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
                  {content.acceptTitle}
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>{content.acceptBody}</p>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <p className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" />
                      {content.acceptWarning}
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
                  {content.serviceTitle}
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {content.serviceItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-5 w-5 text-purple-500" />
                      <span>{item}</span>
                    </li>
                  ))}
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
                  {content.accountsTitle}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{content.students}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      {content.studentsItems.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{content.teachers}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      {content.teachersItems.map((item) => <li key={item}>{item}</li>)}
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
                  {content.userContent}
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {content.userContentItems.map((item, index) => (
                    <li key={item} className="flex items-start gap-2">
                      {index < 2 ? (
                        <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-300" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
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
                  {content.intellectual}
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {content.intellectualLead}
                    </p>
                    <a
                      href="https://github.com/enspy-xccm/xccm/blob/main/LICENSE"
                      target="_blank"
                      rel="noopener"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {content.readLicense}
                    </a>
                  </div>
                  <ul className="space-y-2">
                    {content.intellectualItems.map((item) => <li key={item}>{item}</li>)}
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
                  {content.limitation}
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {content.limitationItems.map((item) => <li key={item}>{item}</li>)}
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
                  {content.termination}
                </h2>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  {content.terminationBody}
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
                  {content.contact}
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
                    {content.summary}
                  </h3>
                  <nav className="mt-4 space-y-2 text-sm">
                    {content.sections.map((item) => (
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
                  <h3 className="text-lg font-semibold">{content.projectTitle}</h3>
                  <p className="mt-2 text-sm text-slate-200">GIF4087-1 - 2025-2026</p>
                  <p className="mt-2 text-xs text-slate-300">
                    {content.projectSupervisor}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    {content.needHelp}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {content.helpBody}
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
