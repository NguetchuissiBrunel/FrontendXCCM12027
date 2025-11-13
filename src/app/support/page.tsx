// src/app/support/page.tsx
'use client';

import  Footer  from '@/components/layout/Footer';
import  Navbar  from '@/components/layout/Navbar';
import { Search, HelpCircle, Mail, Phone, MessageCircle, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Connexion',
    question: 'Comment me connecter à XCCM1 ?',
    answer: 'Utilisez votre adresse email institutionnelle (@enspy.ucac-icam.cm) et votre mot de passe ENSPY. En cas de problème, contactez votre administrateur.',
    keywords: ['connexion', 'login', 'mot de passe', 'compte']
  },
  {
    id: '2',
    category: 'Granules',
    question: 'Qu’est-ce qu’une "granule" ?',
    answer: 'Une granule est une unité modulaire de contenu pédagogique (vidéo, PDF, quiz). Elle peut être réutilisée dans plusieurs cours.',
    keywords: ['granule', 'contenu', 'module', 'réutilisable']
  },
  {
    id: '3',
    category: 'Export',
    question: 'Comment exporter un cours en PDF ?',
    answer: 'Dans l’interface éditeur → "Exporter" → Choisir "PDF Complet" ou "Granules Sélectionnées". Le fichier est généré en 10 secondes.',
    keywords: ['export', 'pdf', 'télécharger', 'imprimer']
  },
  {
    id: '4',
    category: 'Multi-Format',
    question: 'Quels formats sont supportés ?',
    answer: 'PDF, Word (.docx), Markdown, HTML, et JSON pour les développeurs. Tous les exports respectent la mise en page.',
    keywords: ['format', 'word', 'markdown', 'html', 'json']
  },
  {
    id: '5',
    category: 'Rôles',
    question: 'Quelle est la différence entre Éditeur et Lecteur ?',
    answer: 'L’Éditeur peut créer/modifier des cours. Le Lecteur peut seulement consulter et exporter.',
    keywords: ['rôle', 'éditeur', 'lecteur', 'permission']
  },
  {
    id: '6',
    category: 'Problèmes',
    question: 'Mon cours ne s’affiche pas, que faire ?',
    answer: 'Vérifiez votre connexion, videz le cache du navigateur, ou contactez le support à xccm@enspy.ucac-icam.cm.',
    keywords: ['problème', 'affichage', 'bug', 'cache']
  },
];

const categories = ['Toutes', 'Connexion', 'Granules', 'Export', 'Multi-Format', 'Rôles', 'Problèmes'];

export default function SupportTechnique() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [filteredFAQs, setFilteredFAQs] = useState(faqs);

  useEffect(() => {
    const filtered = faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'Toutes' || faq.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
    setFilteredFAQs(filtered);
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <Navbar />
      
      {/* HERO avec Background Image */}
      {/* HERO avec Image LOCALE */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Image locale avec Next.js Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/FAQ.webp"
            alt="Cahier de Charge XCCM1 - ENSPY Yaoundé"
            fill
            className="object-cover object-center"
            priority
            quality={95}
          />
          {/* Overlay sombre pour lisibilité */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Support Technique
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 opacity-90">
            XCCM1 – ENSPY 
          </p>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-5 text-lg rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Catégories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Résultats */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {filteredFAQs.length} résultat{filteredFAQs.length > 1 ? 's' : ''} trouvé{filteredFAQs.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* FAQ Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer"
                onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {faq.category}
                  </span>
                  <HelpCircle className={`w-5 h-5 transition-transform ${openFAQ === faq.id ? 'rotate-12 text-purple-600' : 'text-gray-400'}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className={`text-sm text-gray-600 transition-all duration-300 ${openFAQ === faq.id ? 'block' : 'hidden'}`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">Aucun résultat trouvé pour "<strong>{searchQuery}</strong>"</p>
              <p className="text-gray-500 mt-2">Essayez avec d'autres mots-clés ou contactez le support.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Rapide */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Besoin d’aide immédiate ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="mailto:xccm@enspy.ucac-icam.cm"
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
            >
              <Mail className="w-10 h-10 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Email</p>
              <p className="text-white/80 text-sm">xccm@enspy.ucac-icam.cm</p>
            </a>
            <a
              href="tel:+237222236100"
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
            >
              <Phone className="w-10 h-10 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Téléphone</p>
              <p className="text-white/80 text-sm">(+237) 222 23 61 00</p>
            </a>
            <a
              href="https://wa.me/237699999999"
              target="_blank"
              rel="noopener"
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
            >
              <MessageCircle className="w-10 h-10 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">WhatsApp</p>
              <p className="text-white/80 text-sm">Support 24/7</p>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}