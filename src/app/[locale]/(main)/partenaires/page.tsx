'use client';

import Link from 'next/link';
import { Building2, ChevronRight, Globe, Handshake, Rocket, Users } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function PartnersPage() {
  const locale = useLocale();
  const content = locale === 'fr'
    ? {
        badge: 'Partenaires',
        title: 'Construire XCCM1 ensemble',
        description: 'Des partenaires academiques et techniques pour renforcer la creation de contenus pedagogiques modulaires.',
        becomePartner: 'Devenir partenaire',
        contactUs: 'Nous contacter',
        highlightsTitle: 'A retenir',
        highlights: [
          { title: 'Cadre ENSPY', desc: 'Un projet academique supervise et aligne sur les objectifs pedagogiques.' },
          { title: 'Co-creation', desc: 'Partage d expertises entre enseignants, chercheurs et etudiants.' },
          { title: 'Impact durable', desc: 'Des contenus reutilisables et une methodologie transferrable.' }
        ],
        partnersTitle: 'Nos partenaires',
        offersTitle: 'Ce que nous proposons',
        openTitle: 'Collaboration ouverte',
        openDescription: 'Nous construisons un reseau de partenaires academiques et techniques.',
        propose: 'Proposer un partenariat',
        priorities: 'Domaines prioritaires',
        quickContact: 'Contact rapide',
        quickDescription: 'Ecrivez a l equipe XCCM1 pour discuter d un partenariat.',
        contactTeam: "Contacter l'equipe",
        prioritiesItems: ['Structuration pedagogique', 'Evaluation des apprentissages', 'Interoparabilite des contenus', 'Accessibilite numerique'],
        partners: [
          { name: 'ENSPY', type: 'Institution', description: 'Ecole Nationale Superieure Polytechnique, cadre academique du projet.' },
          { name: 'Departement Genie Informatique', type: 'Academique', description: 'Encadrement pedagogique et validation scientifique.' },
          { name: 'Laboratoires partenaires', type: 'Recherche', description: 'Appui sur les methodes de structuration et d evaluation.' },
          { name: 'Communautes open-source', type: 'Technique', description: 'Partage de bonnes pratiques et retours utilisateurs.' }
        ],
        offers: [
          { title: 'Partenariat academique', desc: 'Co-creation de contenus pedagogiques et experimentation terrain.', icon: Building2 },
          { title: 'Recherche & innovation', desc: 'Etudes sur les granules, l evaluation et la collaboration.', icon: Rocket },
          { title: 'Formation enseignants', desc: 'Accompagnement a l adoption des pratiques modulaires.', icon: Users },
          { title: 'Ouverture internationale', desc: 'Echanges et compatibilite avec d autres universites.', icon: Globe }
        ]
      }
    : {
        badge: 'Partners',
        title: 'Building XCCM1 together',
        description: 'Academic and technical partners helping strengthen modular learning content creation.',
        becomePartner: 'Become a partner',
        contactUs: 'Contact us',
        highlightsTitle: 'Key points',
        highlights: [
          { title: 'ENSPY framework', desc: 'An academic project supervised and aligned with teaching goals.' },
          { title: 'Co-creation', desc: 'Shared expertise between teachers, researchers and students.' },
          { title: 'Long-term impact', desc: 'Reusable content and a transferable methodology.' }
        ],
        partnersTitle: 'Our partners',
        offersTitle: 'What we offer',
        openTitle: 'Open collaboration',
        openDescription: 'We are building a network of academic and technical partners.',
        propose: 'Propose a partnership',
        priorities: 'Priority areas',
        quickContact: 'Quick contact',
        quickDescription: 'Write to the XCCM1 team to discuss a partnership.',
        contactTeam: 'Contact the team',
        prioritiesItems: ['Learning content structuring', 'Assessment of learning', 'Content interoperability', 'Digital accessibility'],
        partners: [
          { name: 'ENSPY', type: 'Institution', description: 'National Advanced School of Engineering, the academic framework of the project.' },
          { name: 'Computer Engineering Department', type: 'Academic', description: 'Teaching supervision and scientific validation.' },
          { name: 'Partner laboratories', type: 'Research', description: 'Support on structuring and assessment methods.' },
          { name: 'Open-source communities', type: 'Technical', description: 'Sharing best practices and user feedback.' }
        ],
        offers: [
          { title: 'Academic partnership', desc: 'Co-creation of learning content and field experimentation.', icon: Building2 },
          { title: 'Research & innovation', desc: 'Studies on granules, assessment and collaboration.', icon: Rocket },
          { title: 'Teacher training', desc: 'Support for adopting modular practices.', icon: Users },
          { title: 'International openness', desc: 'Exchanges and compatibility with other universities.', icon: Globe }
        ]
      };

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Handshake className="h-4 w-4" />
            {content.badge}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            {content.title}
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            {content.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              {content.becomePartner}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              {content.contactUs}
              <ChevronRight className="h-4 w-4" />
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
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {content.partnersTitle}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {content.partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {partner.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      {partner.type}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {partner.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {content.offersTitle}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {content.offers.map((offer) => (
                  <div
                    key={offer.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <offer.icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      {offer.title}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{offer.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">{content.openTitle}</h3>
                <p className="mt-2 text-sm text-slate-200">
                  {content.openDescription}
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {content.propose}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  {content.priorities}
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {content.prioritiesItems.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  {content.quickContact}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {content.quickDescription}
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                >
                  {content.contactTeam}
                  <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
