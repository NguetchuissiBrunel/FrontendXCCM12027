// middleware.ts (à la racine du projet, au même niveau que app/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Récupérer les informations utilisateur depuis les cookies
  const userCookie = request.cookies.get('currentUser')?.value;
  
  // Routes publiques (accessibles sans authentification)
  const publicRoutes = ['/', '/login', '/register', '/bibliotheque', '/about', '/contact'];
  
  // Routes protégées pour les étudiants
  const studentRoutes = ['/etudashboard', '/etudashboard/profil', '/etudashboard/cours', '/etudashboard/echeances'];
  
  // Routes protégées pour les professeurs
  const professorRoutes = ['/profdashboard'];
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/courses/'));
  
  // Vérifier si la route est pour étudiant
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));
  
  // Vérifier si la route est pour professeur
  const isProfessorRoute = professorRoutes.some(route => pathname.startsWith(route));
  
  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Si pas de cookie utilisateur, rediriger vers login
  if (!userCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    const user = JSON.parse(userCookie);
    
    // Vérifier les permissions selon le rôle
    if (isStudentRoute && user.role !== 'student') {
      return NextResponse.redirect(new URL('/profdashboard', request.url));
    }
    
    if (isProfessorRoute && user.role !== 'teacher') {
      return NextResponse.redirect(new URL('/etudashboard', request.url));
    }
    
    // Tout est OK, laisser passer
    return NextResponse.next();
    
  } catch (error) {
    // Cookie invalide, rediriger vers login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('currentUser');
    return response;
  }
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'images)
     * - favicon.ico (favicon)
     * - images (dossier public/images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
