'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import emailjs from 'emailjs-com';

// IDs POUR EMAILJS (à charger depuis .env.local)
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID!;

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Ajout pour le succès
  const [faqOpen, setFaqOpen] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage(''); // Réinitialiser le message de succès

    if (form.current) {
      // Préciser à TypeScript la structure de votre formulaire
      const currentForm = form.current as HTMLFormElement & {
        name: HTMLInputElement;
        email: HTMLInputElement;
        message: HTMLTextAreaElement;
      };

      const name = currentForm.name.value;
      const email = currentForm.email.value;
      const message = currentForm.message.value;

      if (!name || !email || !message) {
        setErrorMessage('Tous les champs sont requis.');
        setIsSubmitting(false);
        return;
      }

      if (!validateEmail(email)) {
        setErrorMessage('Veuillez entrer une adresse e-mail valide.');
        setIsSubmitting(false);
        return;
      }

      emailjs
        .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, USER_ID)
        .then(() => {
          setSuccessMessage('Message envoyé avec succès !');
          form.current?.reset();
        })
        .catch(() => {
          setErrorMessage("Erreur lors de l'envoi du message. Veuillez réessayer.");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const toggleFaq = () => {
    setFaqOpen(!faqOpen);
  };

  return (
    <div className="container mx-auto px-6 py-16 md:py-20 lg:py-28 bg-gradient-to-r from-purple-200 to-purple-500">
      <h1 className="text-center text-4xl font-bold text-white mb-8">Besoin d&apos;aide ?</h1>
      <div className="flex flex-col md:flex-row items-start gap-12 lg:gap-16">
        {/* Colonne de gauche : Étapes et Formulaire */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-violet-600 mb-6">Étapes de Lancement de l&apos;Application</h2>
            <ul className="list-inside space-y-4">
              <li className="flex items-start">
                <i className="fas fa-user-circle text-violet-600 mr-2"></i>
                <span>1. Inscrivez-vous sur notre site.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-download text-violet-600 mr-2"></i>
                <span>2. Téléchargez l&apos;application depuis la page de téléchargement.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-sign-in-alt text-violet-600 mr-2"></i>
                <span>3. Ouvrez l&apos;application et connectez-vous avec vos identifiants.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-cog text-violet-600 mr-2"></i>
                <span>4. Suivez les instructions à l&apos;écran pour configurer votre profil.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-smile text-violet-600 mr-2"></i>
                <span>5. Profitez des fonctionnalités de l&apos;application !</span>
              </li>
            </ul>
          </div>

          {/* Formulaire */}
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-violet-600">Contactez-nous</h2>
            {/* Affichage des messages d'état */}
            {errorMessage && <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>}
            {successMessage && <div className="mb-4 text-green-600 font-medium">{successMessage}</div>}
            
            <form ref={form} onSubmit={sendEmail}>
              <div className="-mx-4 flex flex-wrap">
                <div className="w-full px-4 md:w-1/2 mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Votre Nom</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Entrez votre nom ici..."
                    className="border w-full rounded-md border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div className="w-full px-4 md:w-1/2 mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Votre Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Entrez votre adresse mail ici..."
                    className="border w-full rounded-md border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div className="w-full px-4 mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Votre Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Entrez votre message ici..."
                    className="border w-full rounded-md border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  ></textarea>
                </div>
                <div className="w-full px-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 text-white font-medium bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Colonne de droite : Image et FAQ */}
        <div className="w-full md:w-1/2">
          <div className="flex items-center justify-center bg-white rounded-lg overflow-hidden mb-8">
            <Image
              src="/images/image9.jpg"
              alt="Contact illustration"
              width={500}
              height={600}
              className="object-cover"
            />
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-violet-600 mb-6">Questions Fréquemment Posées</h2>
            <div>
              <button onClick={toggleFaq} className="text-violet-600 mb-4">
                {faqOpen ? 'Moins d\'informations' : 'Plus d\'informations'}
              </button>
              {faqOpen && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Q: Comment réinitialiser mon mot de passe ?</h3>
                    {/* --- MODIFICATION &quot; --- */}
                    <p>R: Cliquez sur &quot;Mot de passe oublié ?&quot; sur la page de connexion et suivez les instructions.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Q: Où puis-je trouver plus d&apos;informations ?</h3>
                    <p>R: Consultez notre section FAQ ou contactez notre support client.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Q: L&apos;application est-elle gratuite ?</h3>
                    <p>R: Oui, l&apos;application est gratuite à télécharger et à utiliser avec des fonctionnalités premium disponibles.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;