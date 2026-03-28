'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  Search,
  Shield,
  Users,
} from 'lucide-react';

export default function FaqPage() {
  const t = useTranslations('pages.faq');
  const [query, setQuery] = useState('');

  const content = useMemo(() => {
    const categoryKeys = ['general', 'comptes', 'contenus', 'export', 'securite'];

    return {
      categories: categoryKeys.map(key => ({
        id: key,
        label: t(`categories.${key}`)
      })),
      sections: categoryKeys.map(key => ({
        id: key,
        title: t(`sections.${key}.title`),
        items: [0, 1, 2].map(idx => ({
          q: t(`sections.${key}.items.${idx}.q`),
          a: t(`sections.${key}.items.${idx}.a`)
        }))
      })),
      title: t('title'),
      subtitle: t('subtitle'),
      searchPlaceholder: t('searchPlaceholder'),
      results: t('results'),
      highlightsTitle: t('highlightsTitle'),
      highlights: [
        { title: t('highlights.support.title'), desc: t('highlights.support.desc'), icon: Users },
        { title: t('highlights.guides.title'), desc: t('highlights.guides.desc'), icon: BookOpen },
        { title: t('highlights.securite.title'), desc: t('highlights.securite.desc'), icon: Shield },
      ],
      noResults: t('noResults'),
      helpTitle: t('helpTitle'),
      helpDescription: t('helpDescription'),
      contactSupport: t('contactSupport'),
      categoriesTitle: t('categoriesTitle'),
      guidesTitle: t('guidesTitle'),
      guides: [
        t('guides.0'),
        t('guides.1'),
        t('guides.2')
      ]
    };
  }, [t]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = content.sections
    .map((section) => {
      const inTitle = section.title.toLowerCase().includes(normalizedQuery);
      const items =
        !normalizedQuery || inTitle
          ? section.items
          : section.items.filter((item) =>
            `${item.q} ${item.a}`.toLowerCase().includes(normalizedQuery),
          );
      return { ...section, items };
    })
    .filter((section) => !normalizedQuery || section.items.length > 0);

  const resultsCount = filteredSections.reduce((acc, section) => acc + section.items.length, 0);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            {content.title}
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            {content.subtitle}
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Search className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              <input
                type="text"
                placeholder={content.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>
          </div>
          {normalizedQuery ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {content.results}: {resultsCount}
            </p>
          ) : null}
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
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <item.icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  {item.title}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.q}
                        <ChevronRight className="h-4 w-4 text-purple-600 transition-transform duration-200 group-open:rotate-90 dark:text-purple-300" />
                      </summary>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
            {normalizedQuery && resultsCount === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {content.noResults}
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">{content.helpTitle}</h3>
                <p className="mt-2 text-sm text-slate-200">
                  {content.helpDescription}
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {content.contactSupport}
                  <LifeBuoy className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  {content.categoriesTitle}
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  {content.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
                    >
                      {cat.label}
                      <ChevronRight className="h-4 w-4 text-purple-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  {content.guidesTitle}
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {content.guides.map((guide) => (
                    <Link key={guide} href="/blog" className="block hover:text-purple-600">
                      {guide}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
