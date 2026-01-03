/**
 * TABLE OF CONTENTS COMPONENT - WITH DARK MODE
 * 
 * Hierarchical navigation tree for the editor's left sidebar.
 * Matches original XCCM implementation styling.
 * Dark mode support added.
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { FaChevronRight, FaChevronDown, FaFile } from 'react-icons/fa';
import { TableOfContentsItem, ITEM_COLORS } from '@/types/editor.types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  onItemClick?: (itemId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  onItemClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  const renderItem = (item: TableOfContentsItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItemId === item.id;
    const color = ITEM_COLORS[item.type];
    const indentation = depth * 20;

    return (
      <div key={item.id}>
        <div
          className={`group relative flex cursor-pointer items-center py-1 pr-2 transition-colors ${isActive
              ? 'bg-purple-50 dark:bg-purple-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          style={{ paddingLeft: `${indentation + 12}px` }}
          onClick={() => handleItemClick(item.id)}
        >
          {/* Colored vertical bar */}
          <div
            className="absolute top-0 bottom-0 w-1"
            style={{
              backgroundColor: color,
              left: `${indentation}px`
            }}
          />

          {/* Expand/collapse chevron */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? (
                <FaChevronDown className="text-xs" />
              ) : (
                <FaChevronRight className="text-xs" />
              )}
            </button>
          ) : (
            <span className="mr-1.5 w-5 shrink-0" />
          )}

          {/* File icon */}
          <FaFile className="mr-2 shrink-0 text-xs text-gray-400 dark:text-gray-500" />

          {/* Number */}
          {item.number && (
            <span
              className="mr-2 shrink-0 text-sm font-medium"
              style={{ color }}
            >
              {item.number}:
            </span>
          )}

          {/* Title */}
          <span
            className={`flex-1 truncate text-sm ${isActive ? 'font-semibold' : 'font-normal'
              }`}
            style={{ color: isActive ? '#a78bfa' : color }}
          >
            {item.title}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800">
      <div className="py-3">
        <h2 className="mb-3 px-3 text-sm font-semibold text-gray-900 dark:text-white">
          Table des Matières
        </h2>
        {items.length > 0 ? (
          <div>{items.map(item => renderItem(item, 0))}</div>
        ) : (
          <div className="px-3 text-sm text-gray-500 dark:text-gray-400">
            Glissez et déposez des éléments...
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;