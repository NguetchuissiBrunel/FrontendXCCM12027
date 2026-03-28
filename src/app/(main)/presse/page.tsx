import Link from 'next/link';
import { Calendar, ChevronRight, FileText, Mic2, Newspaper, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PressPage() {
  const t = useTranslations('pages.presse');

  const highlights = [
    {
      title: t('highlights.0.title'),
      date: t('highlights.0.date'),
      desc: t('highlights.0.desc'),
    },
    {
      title: t('highlights.1.title'),
      date: t('highlights.1.date'),
      desc: t('highlights.1.desc'),
    },
    {
      title: t('highlights.2.title'),
      date: t('highlights.2.date'),
      desc: t('highlights.2.desc'),
    },
  ];

  const resources = [
    {
      title: t('resources.0.title'),
      desc: t('resources.0.desc'),
      href: '/files/dossier-presse-xccm1.pdf',
    },
    {
      title: t('resources.1.title'),
      desc: t('resources.1.desc'),
      href: '/files/media-kit-xccm1.zip',
    },
    {
      title: t('resources.2.title'),
      desc: t('resources.2.desc'),
      href: '/files/presentation-xccm1.pdf',
    },
  ];

  const contacts = [
    {
      title: t('contacts.0.title'),
      name: t('contacts.0.name'),
      email: t('contacts.0.email'),
    },
    {
      title: t('contacts.1.title'),
      name: t('contacts.1.name'),
      email: t('contacts.1.email'),
    },
  ];

  const toRememberItems = [
    {
      title: t('toRemember.official.title'),
      desc: t('toRemember.official.desc'),
    },
    {
      title: t('toRemember.media.title'),
      desc: t('toRemember.media.desc'),
    },
    {
      title: t('toRemember.directContacts.title'),
      desc: t('toRemember.directContacts.desc'),
    },
  ];

  const keyFigureItems = [
    { label: t('keyFigures.courses'), value: '18' },
    { label: t('keyFigures.granules'), value: '320+' },
    { label: t('keyFigures.contributors'), value: '12' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Newspaper className="h-4 w-4" />
            {t('title')}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            {t('headline')}
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            {t('description')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              {t('contactPress')}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              {t('seePartners')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            {t('toRememberTitle')}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {toRememberItems.map((item) => (
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
                {t('recentReleasesTitle')}
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
                {t('mediaResourcesTitle')}
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
                      {t('download')}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t('keyFiguresTitle')}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {keyFigureItems.map((item) => (
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
                <h3 className="text-lg font-semibold">{t('mediaBriefTitle')}</h3>
                <p className="mt-2 text-sm text-slate-200">
                  {t('mediaBriefDesc')}
                </p>
                <Link
                  href="/files/media-kit-xccm1.zip"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {t('downloadKit')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  {t('pressContactsTitle')}
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
                  {t('officialRequestsTitle')}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {t('officialRequestsDesc')}
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-500 dark:border-slate-800 dark:text-slate-200"
                >
                  {t('contactTeam')}
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
