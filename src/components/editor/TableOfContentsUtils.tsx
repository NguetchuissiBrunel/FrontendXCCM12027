import {
    BookOpen,
    Layers,
    FileText,
    Lightbulb,
    HelpCircle,
    LucideIcon
} from 'lucide-react';

// Types et interfaces
export type ItemType = 'course' | 'section' | 'chapter' | 'paragraph' | 'notion' | 'exercise';

export interface TableOfContentsItem {
    id: string;
    title: string;
    type: ItemType;
    level: number;
    number: string;
    children: TableOfContentsItem[];
    collapsed?: boolean;
    content?: string;
}

export interface ContextMenuPosition {
    x: number;
    y: number;
}

// Fonctions utilitaires pour les éléments de la table des matières
export const getItemIcon = (type: ItemType): LucideIcon => {
    switch (type) {
        case 'course': return BookOpen;
        case 'section': return Layers;
        case 'chapter': return BookOpen;
        case 'paragraph': return FileText;
        case 'notion': return Lightbulb;
        case 'exercise': return HelpCircle;
        default: return FileText;
    }
};

export const getItemColor = (type: ItemType) => {
    switch (type) {
        case 'course': return 'bg-blue-50 text-blue-800 border-blue-200';
        case 'section': return 'bg-purple-50 text-purple-800 border-purple-200';
        case 'chapter': return 'bg-green-50 text-green-800 border-green-200';
        case 'paragraph': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        case 'notion': return 'bg-red-50 text-red-800 border-red-200';
        case 'exercise': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
        default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
};

export const getTypeLabel = (type: ItemType) => {
    switch (type) {
        case 'course': return 'Cours';
        case 'section': return 'Partie';
        case 'chapter': return 'Chapitre';
        case 'paragraph': return 'Paragraphe';
        case 'notion': return 'Notion';
        case 'exercise': return 'Exercice';
        default: return '';
    }
};

export const getIndentation = (level: number) => {
    return `ml-${Math.min(level * 4, 16)}`;
};

// Fonctions pour la gestion de la hiérarchie et des numéros
export const recomputeAllNumbers = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
    const rootLevelItems = items.filter(item => item.level === 0 || item.level === 1); // Helper to catch top levels if multiple

    // Correction: Sometimes course is level 0, sections level 1.
    // We recompute starting from the provided list.

    // Create a deep copy to avoid mutating state directly if needed, though usually we replace state.
    const newItems = JSON.parse(JSON.stringify(items));

    let counters: number[] = [];

    // Recursive function is better for flat list if we had one, but here we have a tree.
    // Wait, the input is a tree or a flat list?
    // The interface has `children`, so it's a tree.

    const processNodes = (nodes: TableOfContentsItem[], parentNumber: string = '') => {
        nodes.forEach((node, index) => {
            const currentNum = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`;
            node.number = currentNum;
            if (node.children?.length > 0) {
                processNodes(node.children, currentNum);
            }
        });
    };

    processNodes(newItems);
    return newItems;
};

// Fonction pour déterminer quels types d'éléments peuvent être ajoutés à un élément parent
export const getAllowedChildTypes = (type: ItemType): ItemType[] => {
    switch (type) {
        case 'course': return ['section'];
        case 'section': return ['chapter'];
        case 'chapter': return ['paragraph'];
        case 'paragraph': return ['notion', 'exercise'];
        default: return [];
    }
};
