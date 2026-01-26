'use client';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
            Découvrez la puissance de <span className="text-purple-600 dark:text-purple-400">XCCM</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Voyez comment notre solution peut transformer votre expérience d'enseignement et d'apprentissage en quelques minutes.
          </p>
        </div>

        {/* Videos Container – two YouTube players side by side on md+ screens */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Video 1 – Demo Enseignant */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
              Demo Enseignant
            </h2>
            <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video border-4 border-white dark:border-gray-800">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/FEKs-hZSn0w?si=scrMTemVvES1Vsb-"
                title="Démonstration XCCM - Enseignant"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Video 2 – Demo Etudiant */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
              Demo Etudiant
            </h2>
            <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video border-4 border-white dark:border-gray-800">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/M4-6o6sYizI?si=oJHLl0gFpHxkQ3yN"
                title="Démonstration XCCM - Étudiant"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Optional context line */}
        <div className="text-center mb-10">
          <p className="text-lg text-purple-700 dark:text-purple-300">
            Découvrez XCCM du point de vue de l’enseignant et de l’étudiant
          </p>
        </div>

        {/* Features highlight */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-purple-600 dark:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-t-lg"></div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Interface Intuitive</h3>
            <p className="text-gray-700 dark:text-gray-300">Prise en main immédiate sans formation technique requise.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-purple-600 dark:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-t-lg"></div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Analyses Détaillées</h3>
            <p className="text-gray-700 dark:text-gray-300">Suivez la progression de vos étudiants en temps réel.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-purple-600 dark:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-t-lg"></div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Personnalisation</h3>
            <p className="text-gray-700 dark:text-gray-300">Adaptez la plateforme à votre image et vos besoins.</p>
          </div>
        </div>
      </div>
    </div>
  );
}