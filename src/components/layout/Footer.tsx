import Link from 'next/link';

// Icônes (inchangées)
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.5l1 4-3.5 1.5M16 12l2.5-3.5 4 1-1.5 3.5m-14 0l-3.5 1.5 4 1 2.5-3.5m10 3.5l-3.5 1.5 4 1 2.5-3.5m-3 3.5l-2.5 3.5-4-1 1.5-3.5m-7 3.5L5 19a2 2 0 002 2h3.5l1-4-3.5-1.5zM12 12c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z" /></svg>
);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 12H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* CORRECTION : Grille plus responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          
          {/* Section 1: Brand & Contact Info */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1 lg:border-r lg:border-gray-700 lg:pr-6 xl:pr-8">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-extrabold text-lg">XC</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">XCCM</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Plateforme de création et de partage de contenu pédagogique. 
              Innovez dans l'éducation avec nos outils.
            </p>
            
            <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <MailIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <a href="mailto:contact@xccm.com" className="hover:text-purple-300">contact@xccm.com</a>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <PhoneIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <span>+237 (123) 456-789</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                    <MapPinIcon className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
                    <span>237, Melen Polytechnique <br/> Yaounde, Cameroun </span>
                </div>
            </div>
          </div>

          {/* Section 2 & 3: Navigation Links */}
          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pl-6 xl:pl-8">
            
            <div>
              <h3 className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Services</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/courses" className="text-sm text-gray-400 hover:text-white transition-colors">Création de Cours</Link></li>
                <li><Link href="/collaboration" className="text-sm text-gray-400 hover:text-white transition-colors">Espaces Collaboratifs</Link></li>
                <li><Link href="/library" className="text-sm text-gray-400 hover:text-white transition-colors">Bibliothèque de Contenu</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Tarification</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Entreprise</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">À Propos</Link></li>
                <li><Link href="/jobs" className="text-sm text-gray-400 hover:text-white transition-colors">Carrières (Jobs)</Link></li>
                <li><Link href="/press" className="text-sm text-gray-400 hover:text-white transition-colors">Presse</Link></li>
                <li><Link href="/partners" className="text-sm text-gray-400 hover:text-white transition-colors">Partenaires</Link></li>
              </ul>
            </div>
             
            <div>
              <h3 className="text-sm font-semibold text-purple-400 tracking-wider uppercase">Ressources</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">Centre d'Aide</Link></li>
                <li><Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog & Guides</Link></li>
                <li><Link href="/support" className="text-sm text-gray-400 hover:text-white transition-colors">Support Technique</Link></li>
              </ul>
            </div>
          </div>

          {/* Section 4: Newsletter */}
          <div className="md:col-span-2 lg:col-span-1 lg:border-l lg:border-gray-700 lg:pl-6 xl:pl-8">
            <h3 className="text-lg font-semibold text-white mb-4">Abonnez-vous à notre Newsletter</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              Recevez les dernières nouvelles, mises à jour et offres spéciales directement dans votre boîte de réception.
            </p>
            <form className="flex flex-col space-y-4"> 
              <input
                type="email"
                placeholder="Votre adresse email"
                aria-label="Adresse email pour la newsletter"
                className="w-full min-w-0 appearance-none rounded-lg border border-transparent bg-gray-700 py-3 px-4 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md text-sm"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar: Social & Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social Icons */}
            <div className="flex space-x-6 order-2 md:order-1">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 order-3 md:order-2 text-sm">
                <Link href="/legal" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Mentions légales
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Politique de confidentialité
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Conditions d'utilisation
                </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-400 order-1 md:order-3 text-center md:text-left">
              &copy; {new Date().getFullYear()} XCCM. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;