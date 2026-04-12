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
                position: 'fixed',
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 9999, // Au-dessus de tout
                pointerEvents: 'none',
                transition: 'transform 75ms linear',
                willChange: 'transform'
            }}
            className="flex flex-col items-start"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    transform: 'rotate(-25deg) scale(1.1)',
                    transformOrigin: 'top left',
                    filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))'
                }}
            >
                <path
                    d="M4.5 1.5L20 9L11.5 11.5L9 20L4.5 1.5Z"
                    fill={color || '#8B5CF6'}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
            <div
                className="px-2 py-0.5 mt-1 rounded text-[10px] font-bold text-white shadow-sm whitespace-nowrap"
                style={{ backgroundColor: color || '#8B5CF6', marginLeft: '12px' }}
            >
                {userName}
            </div>
        </div>
    );
}
