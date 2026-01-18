import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, FileText, Sparkles, Users } from 'lucide-react';

  const featuredPost = {
  title: 'Structurer un cours en granules pedagogiques',
  excerpt:
    "Un guide pratique pour transformer un contenu dense en modules clairs, reutilisables et faciles a partager.",
  tag: 'Guide',
  date: '13 novembre 2025',
  readTime: '8 min',
  author: 'Equipe XCCM1',
  href: '/blog/structurer-un-cours',
};

  const posts = [
  {
    title: 'Bien demarrer avec XCCM1',
    excerpt: 'Les bonnes pratiques pour creer vos premiers granules.',
    tag: 'Tutoriel',
    date: '12 novembre 2025',
    readTime: '6 min',
    href: '/blog/bien-demarrer-xccm1',
  },
  {
    title: 'Modeles de granules pour un cours de programmation',
    excerpt: 'Exemples concrets pour structurer definitions, exemples et exercices.',
    tag: 'Guide',
    date: '10 novembre 2025',
    readTime: '7 min',
    href: '/blog/modeles-de-granules',
  },
  {
    title: 'Collaborer entre enseignants sur XCCM1',
    excerpt: 'Synchroniser vos contenus et versionner les ressources pedagogiques.',
    tag: 'Collaboration',
    date: '8 novembre 2025',
    readTime: '5 min',
    href: '/blog/collaborer-enseignants',
  },
  {
    title: 'Publier un cours: check-list rapide',
    excerpt: 'Les etapes essentielles avant la mise en ligne.',
    tag: 'Checklist',
    date: '5 novembre 2025',
    readTime: '4 min',
    href: '/blog/checklist-publication',
  },
  {
    title: 'Choisir le format d export (PDF, Word, Web)',
    excerpt: 'Conseils pour adapter vos ressources aux besoins des etudiants.',
    tag: 'Ressources',
    date: '2 novembre 2025',
    readTime: '6 min',
    href: '/blog/choisir-format-export',
  },
  {
    title: 'Evaluer la comprehension avec des granules',
    excerpt: 'Idees d exercices courts et progressifs pour mesurer les acquis.',
    tag: 'Pedagogie',
    date: '30 octobre 2025',
    readTime: '7 min',
    href: '/blog/evaluer-comprehension',
  },
];

const categories = [
  'Guides pratiques',
  'Pedagogie',
  'Export & formats',
  'Collaboration',
  'Methodologie',
];

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            Blog & Guides
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Ressources pour enseigner autrement
          </h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg dark:text-slate-300">
            Des articles, guides et checklists pour creer des contenus pedagogiques clairs et
            reutilisables avec XCCM1.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              24 articles publies
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              8 enseignants contributeurs
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              Derniere mise a jour: 13 novembre 2025
            </span>
          </div>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            A retenir
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Guides operationnels',
                desc: 'Des pas-a-pas pour chaque etape de creation de contenu.',
              },
              {
                title: 'Exemples concrets',
                desc: 'Modeles reutilisables issus des cours ENSPY.',
              },
              {
                title: 'Veille pedagogique',
                desc: 'Bonnes pratiques pour structurer, evaluer et publier.',
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
            <section className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6 shadow-sm dark:border-purple-500/30 dark:from-purple-500/10 dark:to-slate-900">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                <span className="rounded-full bg-white px-2.5 py-1 shadow-sm dark:bg-slate-900">
                  Article a la une
                </span>
                <span>{featuredPost.tag}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                {featuredPost.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {featuredPost.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{featuredPost.date}</span>
                <span>{featuredPost.readTime}</span>
                <span>{featuredPost.author}</span>
              </div>
              <Link
                href={featuredPost.href}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Lire le guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Derniers articles
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
                >
                  Voir tout
                </Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      <FileText className="h-3 w-3" />
                      {post.tag}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <Link
                      href={post.href}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
                    >
                      Lire
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-purple-600 bg-slate-900 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">Espace enseignants</h3>
                <p className="mt-2 text-sm text-slate-200">
                  Accedez aux guides rapides et a la bibliotheque de modeles.
                </p>
                <Link
                  href="/resources"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Explorer les ressources
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Categories
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Newsletter pedagogique
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Recevez un resume mensuel des nouveaux guides et cas d usage.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Votre e-mail ENSPY"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-purple-700">
                    S&apos;inscrire
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Guides recommandes
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <Link href="/blog/granules-exemples" className="block hover:text-purple-600">
                    Exemples de granules par niveau
                  </Link>
                  <Link href="/blog/qualite-contenu" className="block hover:text-purple-600">
                    Checklist qualite des contenus
                  </Link>
                  <Link href="/blog/export-pdf" className="block hover:text-purple-600">
                    Optimiser un export PDF
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
