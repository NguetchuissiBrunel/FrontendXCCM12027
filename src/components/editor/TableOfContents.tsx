'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GripVertical, Trash2, Edit2, Eye,
  ChevronDown, ChevronRight, ArrowLeftCircle, ArrowRightCircle,
  FileText
} from 'lucide-react';
import {
  TableOfContentsItem, ItemType, ContextMenuPosition,
  getItemIcon, getItemColor, getIndentation,
  recomputeAllNumbers, getAllowedChildTypes
} from './TableOfContentsUtils';
import ActionMenu from './ActionMenu';
import { useLocale } from 'next-intl';
import { useCollaboration } from '@/contexts/CollaborationContext';
import throttle from 'lodash.throttle';
import { XCCM_KNOWLEDGE_MIME } from '@/types/editor.types';

interface TableOfContentsProps {
  className?: string;
  onSave?: (items: TableOfContentsItem[]) => void;
  items: TableOfContentsItem[];
  onItemClick?: (itemId: string) => void;
  onItemMove?: (itemId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onAddItem?: (type: ItemType, title?: string, parentId?: string) => void;
  onItemRename?: (itemId: string, newTitle: string) => void;
  onItemDelete?: (itemId: string) => void;
  onItemDuplicate?: (itemId: string) => void;
  onItemPaste?: (targetId: string, item: TableOfContentsItem) => void;
  onItemCopy?: (item: TableOfContentsItem) => void;
  selectedText?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  className = '',
  onSave,
  items: initialItems = [],
  onItemClick,
  onAddItem,
  onItemRename,
  onItemDelete,
  onItemDuplicate,
  onItemPaste,
  onItemCopy,
  onItemMove,
  selectedText = ''
}) => {
  const locale = useLocale();
  const { stompClient, isConnected, courseId } = useCollaboration();

  const sendMoveAction = useCallback(
    throttle((itemId: string, targetId: string, position: string) => {
      if (isConnected && stompClient && courseId) {
        stompClient.publish({
          destination: `/app/projet/${courseId}/move`,
          body: JSON.stringify({ type: 'MOVE', itemId, targetId, position })
        });
      }
    }, 50),
    [isConnected, stompClient, courseId]
  );

  // Traductions
  const t = useMemo(() => {
    if (locale === 'fr') {
      return {
        title: 'Table des matières',
        emptyMessage: 'Glissez et déposez des éléments de la structure ici',
        rename: 'Renommer',
        delete: 'Supprimer',
        dropNotAllowed: 'Déplacement non autorisé',
        untitled: 'Sans titre',
      };
    } else {
      return {
        title: 'Table of Contents',
        emptyMessage: 'Drag and drop elements from the structure here',
        rename: 'Rename',
        delete: 'Delete',
        dropNotAllowed: 'Move not allowed',
        untitled: 'Untitled',
      };
    }
  }, [locale]);

  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>(initialItems || []);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [expandedTitles, setExpandedTitles] = useState<string[]>([]);
  const resizableRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [history, setHistory] = useState<TableOfContentsItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [draggedItem, setDraggedItem] = useState<TableOfContentsItem | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [dropAllowed, setDropAllowed] = useState<boolean>(true);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: ContextMenuPosition;
    item: TableOfContentsItem | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    item: null
  });

  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState<string>('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [clipboard, setClipboard] = useState<TableOfContentsItem | null>(null);

  useEffect(() => {
    if (initialItems) {
      setTocItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible && !(e.target as HTMLElement).closest('.context-menu')) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [contextMenu.visible]);

  const addToHistory = useCallback((items: TableOfContentsItem[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, JSON.parse(JSON.stringify(items))];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousItems = history[historyIndex - 1];
      setTocItems(JSON.parse(JSON.stringify(previousItems)));
      setHistoryIndex(prev => prev - 1);
      if (onSave) onSave(previousItems);
    }
  }, [history, historyIndex, onSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  useEffect(() => {
    if (initialItems && tocItems.length === 0) {
      setTocItems(initialItems);
      setHistory([JSON.parse(JSON.stringify(initialItems))]);
      setHistoryIndex(0);
    }
  }, [initialItems]);

  useEffect(() => {
    if (renamingItemId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingItemId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const data = e.dataTransfer.getData(XCCM_KNOWLEDGE_MIME);
      if (data) {
        const item = JSON.parse(data);
        const rootAllowed = ['course', 'section'].includes(item.type);
        if (rootAllowed) {
          setTocItems(prev => {
            const newItem: TableOfContentsItem = {
              id: `${item.id}-${Date.now()}`,
              title: item.title || item.data?.title || t.untitled,
              type: item.type,
              level: item.type === 'course' ? 0 : 1,
              number: '',
              children: [],
              collapsed: false,
              content: item.content
            };
            const updatedItems = [...prev, newItem];
            const renumbered = recomputeAllNumbers(updatedItems);
            addToHistory(renumbered);
            if (onSave) onSave(renumbered);
            return renumbered;
          });
        }
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const removeItem = useCallback((itemId: string) => {
    const removeItemRecursively = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
      return items.filter(item => item.id !== itemId).map(item => ({
        ...item,
        children: removeItemRecursively(item.children)
      }));
    };

    const updatedItems = removeItemRecursively(tocItems);
    const renumberedItems = recomputeAllNumbers(updatedItems);
    setTocItems(renumberedItems);
    addToHistory(renumberedItems);

    if (onSave) onSave(renumberedItems);
    if (onItemDelete) onItemDelete(itemId);
    closeContextMenu();
  }, [tocItems, onSave, onItemDelete]);

  const handleAddItem = useCallback((type: ItemType, parentId?: string) => {
    if (onAddItem) onAddItem(type, selectedText || undefined, parentId);
    closeContextMenu();
  }, [onAddItem, selectedText]);

  const toggleCollapse = useCallback((itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTocItems(prevItems => {
      const toggleCollapseRecursively = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
        return items.map(item => {
          if (item.id === itemId) return { ...item, collapsed: !item.collapsed };
          return { ...item, children: toggleCollapseRecursively(item.children) };
        });
      };

      const updatedItems = toggleCollapseRecursively(prevItems);

      if (onSave) onSave(updatedItems);
      return updatedItems;
    });
  }, [onSave]);

  const toggleTitleExpansion = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTitles(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = startWidth + (e.clientX - startX);
    setWidth(Math.max(250, Math.min(newWidth, 600)));
  }, [isResizing, startWidth, startX]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: TableOfContentsItem) => {
    e.preventDefault();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 220;
    const menuHeight = 300;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > viewportWidth) {
      x = Math.max(0, viewportWidth - menuWidth - 10);
    }

    if (y + menuHeight > viewportHeight) {
      y = Math.max(0, viewportHeight - menuHeight - 10);
    }

    setContextMenu({
      visible: true,
      position: { x, y },
      item
    });
  }, []);

  const copyItem = useCallback((itemId: string) => {
    const findItem = (items: TableOfContentsItem[]): TableOfContentsItem | null => {
      for (const item of items) {
        if (item.id === itemId) return { ...item };
        const found = findItem(item.children);
        if (found) return found;
      }
      return null;
    };

    const itemToCopy = findItem(tocItems);
    if (itemToCopy) {
      setClipboard(itemToCopy);
      if (onItemCopy) {
        onItemCopy(itemToCopy);
      }
    }
    closeContextMenu();
  }, [tocItems, onItemCopy, closeContextMenu]);

  const pasteItem = useCallback((targetId: string) => {
    if (!clipboard) return;
    if (onItemPaste) {
      onItemPaste(targetId, clipboard);
    }
    closeContextMenu();
  }, [clipboard, onItemPaste, closeContextMenu]);

  const duplicateItem = useCallback((itemId: string) => {
    if (onItemDuplicate) {
      onItemDuplicate(itemId);
    }
    closeContextMenu();
  }, [onItemDuplicate, closeContextMenu]);

  const viewItem = useCallback((itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
    closeContextMenu();
  }, [closeContextMenu, onItemClick]);

  const renameItem = useCallback((itemId: string) => {
    const findItem = (items: TableOfContentsItem[]): TableOfContentsItem | null => {
      for (const item of items) {
        if (item.id === itemId) return item;
        const found = findItem(item.children);
        if (found) return found;
      }
      return null;
    };

    const itemToRename = findItem(tocItems);
    if (itemToRename) {
      setRenamingItemId(itemId);
      setNewItemTitle(itemToRename.title);
    }

    closeContextMenu();
  }, [tocItems, closeContextMenu]);

  const saveRename = useCallback((itemId: string) => {
    setTocItems(prevItems => {
      const updateItemTitle = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, title: newItemTitle || item.title };
          }
          return { ...item, children: updateItemTitle(item.children) };
        });
      };

      const updatedItems = updateItemTitle(prevItems);
      addToHistory(updatedItems);
      if (onSave) onSave(updatedItems);
      return updatedItems;
    });

    if (onItemRename) onItemRename(itemId, newItemTitle || '');
    setRenamingItemId(null);
  }, [newItemTitle, onSave, onItemRename]);

  const cancelRename = useCallback(() => {
    setRenamingItemId(null);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, item: TableOfContentsItem) => {
    e.stopPropagation();

    if (item.type === 'exercise') {
      e.preventDefault();
      return;
    }

    setDraggedItem(item);
    e.dataTransfer.setData(XCCM_KNOWLEDGE_MIME, JSON.stringify(item));
    e.dataTransfer.setData('internal-xccm-id', item.id);
    e.dataTransfer.effectAllowed = 'move';

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('dragging');
    }

    closeContextMenu();
  }, [closeContextMenu]);

  const handleItemDragOver = useCallback((e: React.DragEvent, item: TableOfContentsItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === item.id) return;

    const isTargetExercise = item.type === 'exercise';

    if (isTargetExercise) {
      setDragOverItemId(item.id);
      setDropAllowed(false);
      setDropPosition(null);
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    const isSibling = draggedItem.type === item.type;
    const isChild = getAllowedChildTypes(item.type).includes(draggedItem.type);
    const canDrop = isSibling || isChild;

    setDragOverItemId(item.id);
    setDropAllowed(canDrop);

    if (canDrop) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      if (isSibling && isChild) {
        if (relativeY < rect.height * 0.4) setDropPosition('before');
        else if (relativeY > rect.height * 0.7) setDropPosition('after');
        else setDropPosition('inside');
      } else if (isSibling) {
        if (relativeY < rect.height / 2) setDropPosition('before');
        else setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
      e.dataTransfer.dropEffect = 'move';
    } else {
      setDropPosition(null);
      e.dataTransfer.dropEffect = 'none';
    }
  }, [draggedItem, dropPosition]);

  const handleItemDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemId(null);
    setDropPosition(null);
    setDropAllowed(true);
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, targetItem: TableOfContentsItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const isSibling = draggedItem.type === targetItem.type;
    const isChild = getAllowedChildTypes(targetItem.type).includes(draggedItem.type);

    if (isSibling || isChild) {
      const position = dropPosition || (isChild ? 'inside' : 'after');
      if (onItemMove) {
        onItemMove?.(draggedItem.id, targetItem.id, position);
      }
      sendMoveAction(draggedItem.id, targetItem.id, position);
    }

    setDraggedItem(null);
    setDragOverItemId(null);
    setDropPosition(null);
    setDropAllowed(true);

    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }, [draggedItem, onItemMove, dropPosition]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedItem(null);
    setDragOverItemId(null);
    setDropPosition(null);
    setDropAllowed(true);

    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }, []);

  const canDropItem = useCallback((sourceItem: TableOfContentsItem, targetItem: TableOfContentsItem): boolean => {
    if (!sourceItem || !targetItem) return false;
    const allowedChildTypes = getAllowedChildTypes(targetItem.type);
    const isSibling = sourceItem.type === targetItem.type;
    return (allowedChildTypes && allowedChildTypes.includes(sourceItem.type)) || isSibling;
  }, []);

  const renderItemIcon = (itemType: ItemType) => {
    const IconComponent = getItemIcon(itemType);
    return <IconComponent size={14} />;
  };

  const memoizedTocItems = useMemo(() => {
    if (!tocItems || tocItems.length === 0) return null;

    const renderItems = (itemsList: TableOfContentsItem[]) => itemsList.map((item) => {
      const isDragTarget = dragOverItemId === item.id;

      let dragClasses = '';
      if (isDragTarget) {
        if (!dropAllowed) {
          dragClasses = 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 cursor-no-drop';
        } else {
          if (dropPosition === 'inside') {
            dragClasses = 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 scale-[1.02]';
          } else {
            dragClasses = 'bg-purple-50 dark:bg-purple-900/10 border-purple-300 dark:border-purple-800';
          }
        }
      }

      return (
        <div key={item.id} className="mb-1 relative">
          {isDragTarget && dropAllowed && dropPosition === 'before' && (
            <div className="absolute -top-1 left-0 right-0 h-1 bg-purple-500 rounded-full z-10" />
          )}

          <div
            className={`group flex items-center p-2 border-l-4 ${getItemColor(item.type)} rounded-r shadow-sm transition-all duration-200 hover:shadow-md ${getIndentation(item.level)} ${dragClasses} ${!isDragTarget ? 'bg-white dark:bg-gray-800' : ''}`}
            onContextMenu={(e) => handleContextMenu(e, item)}
            onClick={() => onItemClick && onItemClick(item.id)}
            draggable={item.type !== 'exercise'}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleItemDragOver(e, item)}
            onDragLeave={handleItemDragLeave}
            onDrop={(e) => handleItemDrop(e, item)}
            onDragEnd={handleDragEnd}
          >
            {isDragTarget && !dropAllowed && (
              <div className="absolute inset-0 bg-red-400/5 dark:bg-red-400/10 pointer-events-none rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 opacity-80 uppercase tracking-tighter">{t.dropNotAllowed}</span>
              </div>
            )}
            <div className="mr-1.5 text-gray-400 cursor-move opacity-50 group-hover:opacity-100 dark:text-gray-500">
              <GripVertical size={14} />
            </div>

            {item.children && item.children.length > 0 ? (
              <button
                className="mr-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-150 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={(e) => toggleCollapse(item.id, e)}
              >
                {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <div className="mr-1.5 w-4"></div>
            )}

            <div className="mr-2 text-gray-600 dark:text-gray-400">
              {renderItemIcon(item.type)}
            </div>

            {renamingItemId === item.id ? (
              <div className="flex-grow flex">
                <input
                  ref={renameInputRef}
                  type="text"
                  className="w-full text-sm py-0.5 px-1 border border-purple-300 focus:border-purple-500 rounded outline-none dark:bg-gray-700 dark:text-white"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onBlur={() => saveRename(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(item.id);
                    if (e.key === 'Escape') cancelRename();
                  }}
                />
              </div>
            ) : (
              <div className="flex-grow font-medium overflow-hidden">
                {expandedTitles.includes(item.id) ? (
                  <p className="text-sm dark:text-white" onClick={(e) => toggleTitleExpansion(item.id, e)}>{item.title}</p>
                ) : (
                  <div className="flex items-center">
                    <p className="text-sm truncate dark:text-white">{item.title.length > 30 ? item.title.substring(0, 30) : item.title}</p>
                    {item.title.length > 30 && (
                      <button
                        className="ml-1 text-purple-500 hover:text-purple-700 text-xs"
                        onClick={(e) => toggleTitleExpansion(item.id, e)}
                      >
                        ...
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                onClick={(e) => { e.stopPropagation(); renameItem(item.id); }}
                title={t.rename}
              >
                <Edit2 size={14} />
              </button>
              <button
                className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                title={t.delete}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {isDragTarget && dropAllowed && dropPosition === 'after' && (
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-purple-500 rounded-full z-10" />
          )}

          {!item.collapsed && item.children && item.children.length > 0 && (
            <div className="mt-1">
              {renderItems(item.children)}
            </div>
          )}
        </div>
      );
    });

    return renderItems(tocItems);
  }, [
    tocItems,
    dragOverItemId,
    dropPosition,
    dropAllowed,
    renamingItemId,
    expandedTitles,
    t,
    handleContextMenu,
    handleDragStart,
    handleItemDragOver,
    handleItemDragLeave,
    handleItemDrop,
    handleDragEnd,
    toggleCollapse,
    toggleTitleExpansion,
    saveRename,
    cancelRename,
    newItemTitle,
    renameItem,
    removeItem,
    onItemClick
  ]);

  return (
    <div
      className={`relative h-full flex transition-all duration-300 ease-in-out`}
      style={{ width: '100%' }}
    >
      <div
        ref={resizableRef}
        className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-full flex flex-col`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white">{t.title}</h3>
        </div>

        <div className="p-2 flex-grow overflow-y-auto">
          {tocItems && tocItems.length > 0 ? (
            <div>{memoizedTocItems}</div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="font-medium text-sm">{t.emptyMessage}</p>
              <FileText className="mx-auto mt-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {contextMenu.visible && contextMenu.item && (
        <ActionMenu
          visible={contextMenu.visible}
          position={contextMenu.position}
          item={contextMenu.item}
          onClose={closeContextMenu}
          onAddItem={handleAddItem}
          onCopyItem={copyItem}
          onPasteItem={pasteItem}
          onDuplicateItem={duplicateItem}
          onDeleteItem={removeItem}
          onViewItem={viewItem}
          onRenameItem={renameItem}
          canPaste={!!clipboard}
          onDragStart={(itemId) => {
            closeContextMenu();
          }}
        />
      )}
    </div>
  );
};

export default React.memo(TableOfContents);