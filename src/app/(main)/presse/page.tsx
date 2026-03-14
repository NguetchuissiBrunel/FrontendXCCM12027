import Link from 'next/link';
import { Calendar, ChevronRight, FileText, Mic2, Newspaper, Users } from 'lucide-react';

const highlights = [
  {
    title: 'Communique de lancement',
    date: '13 novembre 2025',
    desc: "Presentation officielle de XCCM1 a l'ENSPY Yaounde.",
  },
  {
    title: 'Partenariats academiques',
    date: '10 novembre 2025',
    desc: 'Cooperation avec les equipes pedagogiques et laboratoires.',
  },
  {
    title: 'Impact pedagogique',
    date: '5 novembre 2025',
    desc: 'Amelioration de la modularite des contenus pour les etudiants.',
  },
];

const resources = [
  {
    title: 'Dossier de presse',
    desc: 'Elements de langage, chiffres cles, calendrier du projet.',
    href: '/files/dossier-presse-xccm1.pdf',
  },
  {
    title: 'Kit media',
    desc: 'Logos, captures d ecran, charte graphique.',
    href: '/files/media-kit-xccm1.zip',
  },
  {
    title: 'Presentation projet',
    desc: 'Slides officielles et feuille de route.',
    href: '/files/presentation-xccm1.pdf',
  },
];

const contacts = [
  {
    title: 'Presse & communication',
    name: 'Equipe XCCM1',
    email: 'presse@xccm.enspy.cm',
  },
  {
    title: 'Direction academique',
    name: 'Pr. Bernabe BATCHAKUI',
    email: 'bernabe.batchakui@enspy.ucac-icam.cm',
  },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Newspaper className="h-4 w-4" />
            Presse
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Actualites & ressources media
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            Retrouvez les informations officielles, communiques et contacts presse autour de
            XCCM1.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Contacter la presse
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              Voir les partenaires
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            A retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Message officiel',
                desc: 'Des contenus valides par l equipe de projet.',
              },
              {
                title: 'Materiel media',
                desc: 'Ressources pour faciliter la communication.',
              },
              {
                title: 'Contacts directs',
                desc: 'Interlocuteurs pour interviews et communiques.',
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
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Communiques recents
              </h2>
              <div className="mt-4 space-y-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Ressources media
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {resources.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                    <Link
                      href={item.href}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
                    >
                      Telecharger
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Chiffres cles
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Cours pilotes', value: '18' },
                  { label: 'Granules publies', value: '320+' },
                  { label: 'Contributeurs', value: '12' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">Brief media</h3>
                <p className="mt-2 text-sm text-slate-200">
                  Recuperer les logos, elements de langage et visuels officiels.
                </p>
                <Link
                  href="/files/media-kit-xccm1.zip"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Telecharger le kit
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Contacts presse
                </h3>
                <div className="mt-4 space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.email}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {contact.title}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {contact.name}
                      </p>
                      <Link
                        href={`mailto:${contact.email}`}
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
                      >
                        <Mic2 className="h-4 w-4" />
                        {contact.email}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Demandes officielles
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Pour une interview ou un dossier special, contactez l equipe communication.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                >
                  Contacter l equipe
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
