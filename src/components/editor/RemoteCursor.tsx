'use client';

import React from 'react';

interface RemoteCursorProps {
    userId: string;
    userName: string;
    x: number;
    y: number;
    color: string;
}

export default function RemoteCursor({ userName, x, y, color }: RemoteCursorProps) {
    return (
        <div
            style={{
                position: 'absolute', // Absolute permet au curseur de défiler avec la page
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 50, // Juste au-dessus du texte
                pointerEvents: 'none',
                transition: 'transform 100ms ease-out', // Smooth transition for typing/moving
                willChange: 'transform'
            }}
            className="flex flex-col items-start"
        >
            {/* Étiquette du nom (Caret Flag) */}
            <div
                className="px-1.5 py-0.5 rounded-t-sm rounded-br-sm text-[10px] font-bold text-white shadow-sm whitespace-nowrap"
                style={{ 
                    backgroundColor: color || '#8B5CF6', 
                    transform: 'translateY(-100%)', // Place au-dessus de la ligne
                    opacity: 0.9
                }}
            >
                {userName}
            </div>
            
            {/* Ligne verticale du curseur (Caret Line) */}
            <div
                style={{
                    width: '2px',
                    height: '20px', // Hauteur approximative d'une ligne de texte
                    backgroundColor: color || '#8B5CF6',
                }}
                className="animate-pulse" // Clignotement léger optionnel
            />
        </div>
    );
}
