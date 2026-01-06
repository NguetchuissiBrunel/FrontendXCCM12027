import React, { useEffect, useRef } from 'react';
import {
    Trash2, Copy, ClipboardPaste,
    GripVertical, Edit2, FileText, BookOpen,
    Layers, Lightbulb, HelpCircle, X,
    ArrowUpRight
} from 'lucide-react';
import { TableOfContentsItem, ItemType } from './TableOfContentsUtils';

interface ContextMenuPosition {
    x: number;
    y: number;
}

interface ActionMenuProps {
    visible: boolean;
    position: ContextMenuPosition;
    item: TableOfContentsItem;
    onClose: () => void;
    onAddItem: (type: ItemType, parentId?: string) => void;
    onCopyItem: (itemId: string) => void;
    onPasteItem: (targetId: string) => void;
    onDuplicateItem: (itemId: string) => void;
    onDeleteItem: (itemId: string) => void;
    onViewItem: (itemId: string) => void;
    onDragStart: (itemId: string) => void;
    onRenameItem: (itemId: string) => void;
    canPaste: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
    visible,
    position,
    item,
    onClose,
    onAddItem,
    onCopyItem,
    onPasteItem,
    onDuplicateItem,
    onDeleteItem,
    onViewItem,
    onDragStart,
    onRenameItem,
    canPaste
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible || !menuRef.current) return;

        // Calcul optimisé de la position pour s'assurer que le menu est entièrement visible
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let adjustedX = position.x;
        let adjustedY = position.y;

        // Ajustement horizontal
        if (position.x + menuRect.width > viewportWidth) {
            adjustedX = Math.max(5, position.x - menuRect.width);
        }

        // Ajustement vertical
        if (position.y + menuRect.height > viewportHeight) {
            adjustedY = Math.max(5, viewportHeight - menuRect.height - 10); // 10px de marge
        }

        // Application des ajustements
        if (menuRef.current) {
            menuRef.current.style.left = `${adjustedX}px`;
            menuRef.current.style.top = `${adjustedY}px`;
        }
    }, [visible, position]);

    // Déterminer les types d'éléments enfants autorisés
    const getAllowedChildTypes = (type: ItemType): ItemType[] => {
        switch (type) {
            case 'course':
                return ['section'];
            case 'section':
                return ['chapter'];
            case 'chapter':
                return ['paragraph'];
            case 'paragraph':
                return ['notion', 'exercise'];
            default:
                return [];
        }
    };

    const getItemTypeIcon = (type: ItemType) => {
        switch (type) {
            case 'course':
                return <BookOpen size={14} className="text-blue-600" />;
            case 'section':
                return <Layers size={14} className="text-purple-600" />;
            case 'chapter':
                return <BookOpen size={14} className="text-green-600" />;
            case 'paragraph':
                return <FileText size={14} className="text-yellow-600" />;
            case 'notion':
                return <Lightbulb size={14} className="text-red-600" />;
            case 'exercise':
                return <HelpCircle size={14} className="text-indigo-600" />;
            default:
                return <FileText size={14} className="text-gray-600" />;
        }
    };

    const getItemColor = (type: ItemType): string => {
        switch (type) {
            case 'course':
                return 'border-blue-500';
            case 'section':
                return 'border-purple-500';
            case 'chapter':
                return 'border-green-500';
            case 'paragraph':
                return 'border-yellow-500';
            case 'notion':
                return 'border-red-500';
            case 'exercise':
                return 'border-indigo-500';
            default:
                return 'border-gray-500';
        }
    };

    const allowedChildTypes = getAllowedChildTypes(item.type);

    const renderAddButtons = () => {
        if (allowedChildTypes.length === 0) return null;

        return (
            <div className="border-t border-gray-100 pt-1.5 mt-1 px-1">
                <div className="text-xs font-medium text-purple-600 mb-1 px-1">Ajouter</div>
                <div className="flex flex-wrap gap-1 px-1">
                    {allowedChildTypes.includes('section') && (
                        <button
                            className="p-1 text-xs rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center justify-center"
                            onClick={() => onAddItem('section', item.id)}
                            title="Ajouter une partie"
                        >
                            <Layers size={12} />
                        </button>
                    )}
                    {allowedChildTypes.includes('chapter') && (
                        <button
                            className="p-1 text-xs rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center justify-center"
                            onClick={() => onAddItem('chapter', item.id)}
                            title="Ajouter un chapitre"
                        >
                            <BookOpen size={12} />
                        </button>
                    )}
                    {allowedChildTypes.includes('paragraph') && (
                        <button
                            className="p-1 text-xs rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors flex items-center justify-center"
                            onClick={() => onAddItem('paragraph', item.id)}
                            title="Ajouter un paragraphe"
                        >
                            <FileText size={12} />
                        </button>
                    )}
                    {allowedChildTypes.includes('notion') && (
                        <button
                            className="p-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                            onClick={() => onAddItem('notion', item.id)}
                            title="Ajouter une notion"
                        >
                            <Lightbulb size={12} />
                        </button>
                    )}
                    {allowedChildTypes.includes('exercise') && (
                        <button
                            className="p-1 text-xs rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center justify-center"
                            onClick={() => onAddItem('exercise', item.id)}
                            title="Ajouter un exercice"
                        >
                            <HelpCircle size={12} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            ref={menuRef}
            className="context-menu absolute bg-white rounded-lg shadow-lg border border-purple-200 py-1 z-50 w-40 overflow-hidden backdrop-blur-sm bg-opacity-98"
            style={{
                top: position.y,
                left: position.x,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.15)'
            }}
        >
            <div className={`px-2 py-1 mb-0.5 border-l-2 ${getItemColor(item.type)} bg-gradient-to-r from-purple-50 to-white`}>
                <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-800 truncate flex items-center gap-1">
                        {getItemTypeIcon(item.type)}
                        <span className="truncate max-w-24">{item.title}</span>
                    </div>
                    <button
                        className="text-gray-400 hover:text-purple-600 p-0.5 rounded-full hover:bg-purple-50 transition-colors"
                        onClick={onClose}
                    >
                        <X size={12} />
                    </button>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 pl-5">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.number}
                </div>
            </div>

            <div className="p-0.5 pt-1">
                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 text-gray-700 transition-colors"
                    onClick={() => onViewItem(item.id)}
                >
                    <ArrowUpRight size={12} className="text-indigo-500" />
                    <span>Ouvrir</span>
                </button>

                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 text-gray-700 transition-colors"
                    onClick={() => onRenameItem(item.id)}
                >
                    <Edit2 size={12} className="text-violet-500" />
                    <span>Renommer</span>
                </button>

                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 text-gray-700 transition-colors"
                    onClick={() => onCopyItem(item.id)}
                >
                    <Copy size={12} className="text-blue-500" />
                    <span>Copier</span>
                </button>

                <button
                    className={`flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 transition-colors ${canPaste ? 'text-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
                    onClick={() => canPaste && onPasteItem(item.id)}
                    disabled={!canPaste}
                >
                    <ClipboardPaste size={12} className={canPaste ? 'text-green-500' : 'text-gray-400'} />
                    <span>Coller</span>
                </button>

                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 text-gray-700 transition-colors"
                    onClick={() => onDuplicateItem(item.id)}
                >
                    <Copy size={12} className="text-purple-500" />
                    <span>Dupliquer</span>
                </button>

                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-purple-50 text-gray-700 transition-colors"
                    onClick={() => onDragStart(item.id)}
                >
                    <GripVertical size={12} className="text-gray-500" />
                    <span>Déplacer</span>
                </button>
            </div>

            <div className="border-t border-gray-100 mx-1 my-0.5"></div>

            <div className="p-0.5">
                <button
                    className="flex items-center w-full gap-1.5 px-2 py-0.5 text-xs rounded-md hover:bg-red-50 text-red-600 transition-colors"
                    onClick={() => onDeleteItem(item.id)}
                >
                    <Trash2 size={12} className="text-red-500" />
                    <span>Supprimer</span>
                </button>
            </div>

            {renderAddButtons()}
        </div>
    );
};

export default ActionMenu;
