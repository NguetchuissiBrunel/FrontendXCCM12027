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
  const professorRoutes = ['/profdashboard', '/editor'];
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/courses/'));
  
  // Vérifier si la route est pour étudiant
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));
  
  // Vérifier si la route est pour professeur
  const isProfessorRoute = professorRoutes.some(route => pathname.startsWith(route));
  
  // DEBUG: Ajouter des logs
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Pathname:', pathname);
  console.log('Has userCookie:', !!userCookie);
  console.log('isPublicRoute:', isPublicRoute);
  console.log('isStudentRoute:', isStudentRoute);
  console.log('isProfessorRoute:', isProfessorRoute);
  
  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
	console.log('Route publique - Accès autorisé');
    return NextResponse.next();
  }
  
  // Si pas de cookie utilisateur et il veut accéder à une route privée, rediriger vers login
  if (!userCookie) {
	console.log('Pas de cookie - Redirection vers login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const user = JSON.parse(userCookie);
    console.log('User role:', user.role);
    
    // Vérifier les permissions selon le rôle
    
    //Un prof veut accéder à une route d'étudiant, on le renvoit à son dashboard
    if (isStudentRoute && user.role !== 'student') {
	  console.log(`Accès refusé: ${user.role} essaie d'accéder à une route étudiant`);
      return NextResponse.redirect(new URL('/profdashboard', request.url));
    }
    
    //Un étudiant veut accéder à une route de prof, on le renvoit à son dashboard
    if (isProfessorRoute && user.role !== 'teacher') {
	  console.log(`Accès refusé: ${user.role} essaie d'accéder à une route professeur`);
      return NextResponse.redirect(new URL('/etudashboard', request.url));
    }
    
    console.log('Accès autorisé');
    // Tout est OK, laisser passer
    return NextResponse.next();
    
  } catch (error) {
    // Cookie invalide, rediriger vers login
    console.log('Cookie invalide - Redirection vers login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('currentUser');
    return response;
  }
}

// Configuration du middleware
export const config = {
  matcher: [
    '/profdashboard', '/editor', '/etudashboard/:path*', '/login', '/register', '/bibliotheque'
  ],
};
