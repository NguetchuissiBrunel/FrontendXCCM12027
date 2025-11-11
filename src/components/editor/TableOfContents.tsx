/**
 * TABLE OF CONTENTS COMPONENT
 * 
 * Hierarchical navigation tree for the editor's left sidebar.
 * Displays the document structure with expand/collapse functionality.
 * 
 * Based on original XCCM implementation.
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { TableOfContentsItem, ITEM_COLORS } from '@/types/editor.types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  onItemClick?: (itemId: string) => void;
}

/**
 * TableOfContents Component
 * 
 * Features:
 * - Hierarchical tree structure
 * - Expand/collapse functionality
 * - Color-coded by content type
 * - Numbered items (1., 1.1., 1.1.1., etc.)
 * - Active item highlighting
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  items, 
  onItemClick 
}) => {
  // Track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['section-1']));
  
  // Track active/selected item
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  /**
   * Toggle expand/collapse state for an item
   */
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

  /**
   * Handle item click
   */
  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  /**
   * Render a single TOC item recursively
   */
  const renderItem = (item: TableOfContentsItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItemId === item.id;
    const color = ITEM_COLORS[item.type]; // Get hex color directly from ITEM_COLORS object
    
    // Calculate indentation based on depth
    const indentation = depth * 16; // 16px per level

    return (
      <div key={item.id}>
        {/* Item row */}
        <div
          className={`group flex cursor-pointer items-center py-1.5 pr-2 transition-colors ${
            isActive 
              ? 'bg-purple-50' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${indentation + 8}px` }}
          onClick={() => handleItemClick(item.id)}
        >
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="mr-1 flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <FaChevronDown className="text-xs" />
              ) : (
                <FaChevronRight className="text-xs" />
              )}
            </button>
          ) : (
            <span className="mr-1 w-5"></span>
          )}

          {/* Color indicator dot */}
          <span
            className="mr-2 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          ></span>

          {/* Number */}
          {item.number && (
            <span className="mr-2 shrink-0 text-xs font-medium text-gray-500">
              {item.number}
            </span>
          )}

          {/* Title */}
          <span
            className={`flex-1 truncate text-sm ${
              isActive 
                ? 'font-semibold text-purple-700' 
                : 'text-gray-700 group-hover:text-gray-900'
            }`}
          >
            {item.title}
          </span>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Table des Matières
        </h2>

        {/* TOC Tree */}
        {items.length > 0 ? (
          <div className="space-y-0.5">
            {items.map(item => renderItem(item, 0))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Glissez et déposez des éléments de la structure ici
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;