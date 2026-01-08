'use client';
import Link from 'next/link';

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

                {/* Video Container */}
                <div className="relative max-w-4xl mx-auto bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video border-4 border-white dark:border-gray-800">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/wH2nF_nB0ys?rel=0"
                        title="Démonstration XCCM"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Features highlight below video */}
                <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-purple-900/20">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Interface Intuitive</h3>
                        <p className="text-gray-600 dark:text-gray-400">Prise en main immédiate sans formation technique requise.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-purple-900/20">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyses Détaillées</h3>
                        <p className="text-gray-600 dark:text-gray-400">Suivez la progression de vos étudiants en temps réel.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-purple-900/20">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Personnalisation</h3>
                        <p className="text-gray-600 dark:text-gray-400">Adaptez la plateforme à votre image et vos besoins.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
