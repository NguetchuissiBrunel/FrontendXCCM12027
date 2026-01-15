import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readTime: string;
  sections: Array<{ title: string; body: string }>;
};

const articles: Article[] = [
  {
    slug: 'structurer-un-cours',
    title: 'Structurer un cours en granules pedagogiques',
    excerpt:
      'Un guide pratique pour transformer un contenu dense en modules clairs, reutilisables et faciles a partager.',
    tag: 'Guide',
    date: '13 novembre 2025',
    readTime: '8 min',
    sections: [
      {
        title: 'Pourquoi decouper en granules',
        body: 'Le decoupage facilite la reutilisation, la mise a jour et la collaboration entre enseignants.',
      },
      {
        title: 'Structurer par objectifs',
        body: 'Chaque granule doit repondre a un objectif pedagogique precis (definition, exemple, exercice).',
      },
      {
        title: 'Valider la progression',
        body: 'Organisez les granules en sequences courtes pour garantir une progression logique.',
      },
    ],
  },
  {
    slug: 'bien-demarrer-xccm1',
    title: 'Bien demarrer avec XCCM1',
    excerpt: 'Les bonnes pratiques pour creer vos premiers granules.',
    tag: 'Tutoriel',
    date: '12 novembre 2025',
    readTime: '6 min',
    sections: [
      {
        title: 'Creer votre premier cours',
        body: 'Commencez par definir le plan general et les premiers granules essentiels.',
      },
      {
        title: 'Organiser les ressources',
        body: 'Ajoutez des exemples, exercices et documents pour enrichir chaque granule.',
      },
      {
        title: 'Publier efficacement',
        body: 'Verifiez les meta donnees et lancez un export pour validation.',
      },
    ],
  },
  {
    slug: 'modeles-de-granules',
    title: 'Modeles de granules pour un cours de programmation',
    excerpt: 'Exemples concrets pour structurer definitions, exemples et exercices.',
    tag: 'Guide',
    date: '10 novembre 2025',
    readTime: '7 min',
    sections: [
      {
        title: 'Granule definition',
        body: 'Un format court avec un terme, une definition et un exemple minimal.',
      },
      {
        title: 'Granule exercice',
        body: 'Des exercices progressifs avec objectifs et correction.',
      },
      {
        title: 'Granule ressource',
        body: 'Liens, videos ou documents associes au sujet.',
      },
    ],
  },
  {
    slug: 'collaborer-enseignants',
    title: 'Collaborer entre enseignants sur XCCM1',
    excerpt: 'Synchroniser vos contenus et versionner les ressources pedagogiques.',
    tag: 'Collaboration',
    date: '8 novembre 2025',
    readTime: '5 min',
    sections: [
      {
        title: 'Partage et roles',
        body: 'Definissez les roles pour valider les contributions avant publication.',
      },
      {
        title: 'Versionner les granules',
        body: 'Gardez l historique des changements pour chaque module.',
      },
      {
        title: 'Aligner les pratiques',
        body: 'Mettez en place un guide commun pour assurer la coherence.',
      },
    ],
  },
  {
    slug: 'checklist-publication',
    title: 'Publier un cours: check-list rapide',
    excerpt: 'Les etapes essentielles avant la mise en ligne.',
    tag: 'Checklist',
    date: '5 novembre 2025',
    readTime: '4 min',
    sections: [
      {
        title: 'Verifier les objectifs',
        body: 'Assurez-vous que chaque granule correspond a un objectif clair.',
      },
      {
        title: 'Relire les contenus',
        body: 'Controlez l orthographe, les exemples et les liens.',
      },
      {
        title: 'Tester l export',
        body: 'Generez un PDF pour valider la mise en page.',
      },
    ],
  },
  {
    slug: 'choisir-format-export',
    title: 'Choisir le format d export (PDF, Word, Web)',
    excerpt: 'Conseils pour adapter vos ressources aux besoins des etudiants.',
    tag: 'Ressources',
    date: '2 novembre 2025',
    readTime: '6 min',
    sections: [
      {
        title: 'PDF pour la lecture',
        body: 'Ideal pour la diffusion rapide et la consultation hors ligne.',
      },
      {
        title: 'Word pour modifier',
        body: 'Utile pour les corrections ou reutilisations locales.',
      },
      {
        title: 'Web pour interagir',
        body: 'Pratique pour naviguer entre granules et ressources.',
      },
    ],
  },
  {
    slug: 'evaluer-comprehension',
    title: 'Evaluer la comprehension avec des granules',
    excerpt: 'Idees d exercices courts et progressifs pour mesurer les acquis.',
    tag: 'Pedagogie',
    date: '30 octobre 2025',
    readTime: '7 min',
    sections: [
      {
        title: 'Micro evaluatons',
        body: 'Integrez des questions rapides apres chaque granule.',
      },
      {
        title: 'Auto evaluation',
        body: 'Proposez des corriges pour permettre l auto correction.',
      },
      {
        title: 'Suivi des progres',
        body: 'Analysez les resultats pour adapter le cours.',
      },
    ],
  },
];

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

// ✅ Make the component async and await params
export default async function BlogArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // ✅ Await the params promise
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux guides
        </Link>

        <header className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
            <FileText className="h-3 w-3" />
            {article.tag}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{article.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          {article.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}