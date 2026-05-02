"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string | number;
  label: string;
}

interface Edge {
  source: string | number;
  target: string | number;
}

interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

interface MindMapGraphProps {
  data: string | MindMapData;
}

export const MindMapGraph: React.FC<MindMapGraphProps> = ({ data }) => {
  const parsedData = useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as MindMapData;
      } catch (e) {
        console.error("Failed to parse mindmap data", e);
        return { nodes: [], edges: [] };
      }
    }
    return data;
  }, [data]);

  const layoutNodes = useMemo(() => {
    if (!parsedData.nodes.length) return [];
    
    const nodes = [...parsedData.nodes];
    const childrenMap: Map<string | number, (string | number)[]> = new Map();
    const parentsMap: Map<string | number, string | number> = new Map();
    
    parsedData.edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
      childrenMap.get(edge.source)?.push(edge.target);
      parentsMap.set(edge.target, edge.source);
    });

    // Find root nodes (no parents)
    const roots = nodes.filter(n => !parentsMap.has(n.id));
    if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0]);

    const levels: Map<string | number, number> = new Map();
    const positionsInLevel: Map<string | number, number> = new Map();
    const levelCounts: Record<number, number> = {};

    const traverse = (nodeId: string | number, currentLevel: number) => {
      if (levels.has(nodeId)) return;
      levels.set(nodeId, currentLevel);
      
      const idx = levelCounts[currentLevel] || 0;
      positionsInLevel.set(nodeId, idx);
      levelCounts[currentLevel] = idx + 1;

      const children = childrenMap.get(nodeId) || [];
      children.forEach(childId => traverse(childId, currentLevel + 1));
    };

    roots.forEach(root => traverse(root.id, 0));

    // Fill gaps for unvisited nodes
    nodes.forEach(node => {
      if (!levels.has(node.id)) {
        levels.set(node.id, 0);
        const idx = levelCounts[0] || 0;
        positionsInLevel.set(node.id, idx);
        levelCounts[0] = idx + 1;
      }
    });

    const nodeWidth = 160;
    const nodeHeight = 40;
    const horizontalGap = 220;
    const verticalGap = 70;

    return nodes.map(node => {
      const level = levels.get(node.id) || 0;
      const index = positionsInLevel.get(node.id) || 0;
      const totalInLevel = levelCounts[level] || 1;

      // X: Horizontal position (Left to Right)
      const x = 50 + level * horizontalGap;
      // Y: Vertical position (Centered for each level)
      const y = 300 + (index - (totalInLevel - 1) / 2) * verticalGap;
      
      return { ...node, x, y, width: nodeWidth, height: nodeHeight };
    });
  }, [parsedData]);

  const positionedNodes = useMemo(() => {
    const map = new Map();
    layoutNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [layoutNodes]);

  // Helper to create curved Bezier paths
  const getPath = (source: any, target: any) => {
    const startX = source.x + source.width;
    const startY = source.y + source.height / 2;
    const endX = target.x;
    const endY = target.y + target.height / 2;
    const cp1X = startX + (endX - startX) / 2;
    const cp2X = startX + (endX - startX) / 2;
    return `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="w-full h-[700px] bg-[#f8f9fa] dark:bg-[#1a1c1e] rounded-2xl overflow-auto border border-gray-200 dark:border-gray-800 relative">
      <svg width={Math.max(1000, layoutNodes.length * 50)} height="1000" viewBox="0 0 1200 1000" className="min-w-full">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {parsedData.edges.map((edge, i) => {
          const source = positionedNodes.get(edge.source);
          const target = positionedNodes.get(edge.target);
          if (!source || !target) return null;

          return (
            <motion.path
              key={`edge-${i}`}
              d={getPath(source, target)}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((node, i) => (
          <motion.g
            key={`node-${node.id}`}
            initial={{ x: node.x - 20, opacity: 0 }}
            animate={{ x: node.x, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: i * 0.03 }}
            whileHover={{ scale: 1.02 }}
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx="6"
              ry="6"
              fill="#2d3748"
              filter="url(#shadow)"
              className="transition-colors hover:fill-[#1a202c]"
            />
            <foreignObject x={node.x + 5} y={node.y} width={node.width - 10} height={node.height}>
              <div className="h-full flex items-center justify-center text-center px-1">
                <span className="text-[10px] font-medium text-white leading-[1.1] line-clamp-2">
                  {node.label}
                </span>
              </div>
            </foreignObject>
            
            {/* Small dot on the left of children nodes */}
            <circle cx={node.x} cy={node.y + node.height/2} r="3" fill="#cbd5e1" />
          </motion.g>
        ))}
      </svg>
      
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
          Knowledge Tree Visualization
        </span>
      </div>
    </div>
  );
};
