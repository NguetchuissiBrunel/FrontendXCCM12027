// Build offline : on evite le telechargement de la police depuis Google Fonts
// au moment du build (next/font/google). On expose la meme interface (.className)
// en s'appuyant sur la pile de polices par defaut de Tailwind (font-sans).
// Pour retrouver Inter, auto-heberger la police via next/font/local.
export const dashboardFont = { className: 'font-sans' };
