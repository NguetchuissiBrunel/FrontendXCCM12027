// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

// Composant pour simuler les étoiles de notation
const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 mb-2">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

// Composant pour le placeholder d'image
const ImagePlaceholder = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={`bg-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4 ${className}`}
    style={{ minHeight: '350px' }} // Hauteur minimale pour la section Hero
  >
    <div className="text-center text-gray-500 italic">
      {children}
    </div>
  </div>
);


export default function HomePage() {
  return (
   <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-16">
      {/* Tout le contenu de la page commence ici, il sera désormais décalé de 4rem */}
      {/* Hero Section */}
      <section className="relative bg-white pt-10 pb-20 overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            
            {/* Texte Hero */}
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Créez vos cours</span>
                <span className="block text-purple-600">facilement et partagez</span>
                <span className="block">vos connaissances</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Notre plateforme vous permet de créer, organiser et partager vos contenus pédagogiques de manière intuitive, avec un éditeur de texte familier et des fonctionnalités de collaboration avancées.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-md"
                >
                  Demander une démo
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-purple-600 text-base font-medium rounded-lg text-purple-600 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </div>
            </div>

            {/* Image Hero (Placeholder) */}
            <div className="mt-12 lg:mt-0">
              <Image 
                src="/images/image1.png" 
                alt="acceuil" 
                width={1000}
                height={1000}
                className="w-full h-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Maintenu) */}
      <section className="py-16 bg-gray-60 sm:py-20 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Une nouvelle façon de créer du contenu pédagogique
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez les fonctionnalités qui révolutionnent la création de cours en ligne
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-8 border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Éditeur Intuitif</h3>
              <p className="text-gray-600">Créez du contenu avec notre éditeur WYSIWYG moderne. Mise en forme avancée, insertion d'images et de tableaux en quelques clics.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-8 border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contenu Modulaire</h3>
              <p className="text-gray-600">Structurez vos cours en granules réutilisables. Assemblez et réorganisez votre contenu comme des blocs de construction.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-8 border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600">Travaillez en équipe sur vos cours. Partagez vos granules et collaborez avec d'autres enseignants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section - Adaptée à la capture 2 */}
      <section className="py-16 bg-white sm:py-20 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            Offres Spéciales
          </h2>

          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            
            {/* Image Placeholder pour les Offres */}
            <div className="lg:col-span-1 mb-10 lg:mb-0">
                <Image 
                  src="/images/image7.jpg" 
                  alt="acceuil2" 
                  width={1000} 
                  height={1000} 
                  className="w-full h-auto rounded-xl shadow-lg" 
                />
            </div>

            {/* Cartes des Offres */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course 1: Développement Web Moderne */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <p className="text-sm font-semibold text-purple-600 mb-1 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-end space-x-1">
                   <span>Développement Web Moderne</span>
                </Link>
                  
                </p>
                <p className="text-sm text-gray-500">Prof. A. Cooper, Harvard University | Année: 2024</p>
                <StarRating rating={5} />
                <p className="text-gray-700 mt-2">
                  Apprenez les technologies modernes du développement web.
                </p>
              </div>

              {/* Course 2: Créativité et Innovation */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <p className="text-sm font-semibold text-purple-600 mb-1 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v18" /></svg>
                  <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-end space-x-1">
                   <span>Créativité et Innovation</span>
                </Link>
                 

                </p>
                <p className="text-sm text-gray-500">Prof. R. Vermont, University of California | Année: 2023</p>
                <StarRating rating={5} />
                <p className="text-gray-700 mt-2">
                  Techniques pour stimuler la créativité et favoriser l'innovation.
                </p>
              </div>
              
              {/* Course 3: Introduction à l'IA */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <p className="text-sm font-semibold text-purple-600 mb-1 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1v-3m0 0h-3m3 0h-1m-1-5a2 2 0 11-4 0 2 2 0 014 0zM12 9V5" /></svg>
                  <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-end space-x-1">
                   <span>Introduction à l'IA</span>
                  </Link>
                 
                </p>
                <p className="text-sm text-gray-500">Prof. J. Williams, Stanford University | Année: 2024</p>
                <StarRating rating={5} />
                <p className="text-gray-700 mt-2">
                  Explorez les fondements et les applications de l'intelligence artificielle.
                </p>
              </div>

              <div className="text-right mt-6">
                <Link href="/courses" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-end space-x-1">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-16 bg-gray-60 sm:py-20 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            Témoignages et Avis
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                {/* Avatar Placeholder */}
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold text-sm">MD</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Marie Anne</h4>
                  <p className="text-sm text-gray-500">Enseignante en informatique</p>
                </div>
              </div>
              <StarRating rating={5} />
              <p className="text-gray-700 mb-4 text-sm">
                La plateforme a transformé ma façon d'enseigner. L'interface intuitive et les outils de collaboration m'ont permis de créer des cours plus engageants pour mes étudiants.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                <span>15 décembre 2024</span>
                <div className='flex items-center space-x-3'>
                    <span className='flex items-center space-x-1'>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" /></svg>
                        <span>24</span>
                    </span>
                    <button className="text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>Commenter</span>
                    </button>
              </div>
            </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                {/* Avatar Placeholder */}
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold text-sm">TB</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Thomas Bernard</h4>
                  <p className="text-sm text-gray-500">Professeur universitaire</p>
                </div>
              </div>
              <StarRating rating={5} />
              <p className="text-gray-700 mb-4 text-sm">
                Excellent support pédagogique ! La qualité des ressources et la facilité de partage sont remarquables. Je recommande vivement à tous les enseignants.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                <span>18 décembre 2024</span>
                <div className='flex items-center space-x-3'>
                    <span className='flex items-center space-x-1'>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" /></svg>
                        <span>18</span>
                    </span>
                    <button className="text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>Commenter</span>
                    </button>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                {/* Avatar Placeholder */}
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold text-sm">SL</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sophie Laurent</h4>
                  <p className="text-sm text-gray-500">Formatrice professionnelle</p>
                </div>
              </div>
              <StarRating rating={5} />
              <p className="text-gray-700 mb-4 text-sm">
                Un outil indispensable pour la formation moderne. La possibilité de personnaliser les contenus et de suivre la progression des apprenants est particulièrement appréciable.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                <span>20 décembre 2024</span>
                <div className='flex items-center space-x-3'>
                    <span className='flex items-center space-x-1'>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" /></svg>
                        <span>31</span>
                    </span>
                    <button className="text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>Commenter</span>
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Testimonial CTA - Partagez votre expérience */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Partagez votre expérience</h3>
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto">
              <textarea 
                placeholder="Écrivez votre commentaire ici..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              />
              <button className="mt-4 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md">
                Publier
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}