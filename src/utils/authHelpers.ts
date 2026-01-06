// utils/authHelpers.ts
import Cookies from 'js-cookie';
import { OpenAPI } from '@/lib/core/OpenAPI';

// Configuration des cookies (sécurisé)
const COOKIE_OPTIONS = {
    expires: 7, // 7 jours
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    sameSite: 'lax' as const,
    path: '/',
};

/**
 * Configure le token JWT dans OpenAPI et dans les cookies
 */
export function setAuthToken(token: string): void {
    if (!token) {
        console.error('⚠️ Tentative de définir un token vide');
        return;
    }

    // Configurer le token dans OpenAPI pour toutes les requêtes futures
    OpenAPI.TOKEN = token;

    // Stocker le token dans les cookies
    Cookies.set('authToken', token, COOKIE_OPTIONS);

    console.log('✅ Token configuré avec succès');
}

/**
 * Récupère le token JWT depuis les cookies
 */
export function getAuthToken(): string | null {
    const token = Cookies.get('authToken');

    if (token) {
        // S'assurer que OpenAPI.TOKEN est synchronisé
        OpenAPI.TOKEN = token;
    }

    return token || null;
}

/**
 * Supprime le token JWT
 */
export function clearAuthToken(): void {
    // Supprimer de OpenAPI
    OpenAPI.TOKEN = undefined;

    // Supprimer des cookies
    Cookies.remove('authToken', { path: '/' });

    console.log('🗑️ Token supprimé');
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
    const token = getAuthToken();
    return !!token;
}

/**
 * Configure automatiquement le token au chargement de l'application
 */
export function initializeAuth(): void {
    const token = getAuthToken();

    if (token) {
        OpenAPI.TOKEN = token;
        console.log('🔐 Token restauré depuis les cookies');
    }
}

export interface JWTPayload {
    sub?: string;
    id?: string;
    email?: string;
    role?: string;
    exp?: number;
    iat?: number;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    city?: string;
    university?: string;
    specialization?: string;
    grade?: string;
    subjects?: string[];
    certification?: string;
    [key: string]: any;
}

/**
 * Décode le payload d'un JWT (sans vérification de signature)
 * Utile pour extraire des informations comme le rôle, l'expiration, etc.
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error);
        return null;
    }
}

/**
 * Vérifie si le token est expiré
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
        return true;
    }

    // exp est en secondes, Date.now() est en millisecondes
    const expirationDate = decoded.exp * 1000;
    return Date.now() >= expirationDate;
}
