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

    const nodeWidth = 200;
    const nodeHeight = 60;
    const horizontalGap = 280;
    const verticalGap = 100;

    return nodes.map(node => {
      const level = levels.get(node.id) || 0;
      const index = positionsInLevel.get(node.id) || 0;
      const totalInLevel = levelCounts[level] || 1;

      // X: Horizontal position (Left to Right)
      const x = 80 + level * horizontalGap;
      // Y: Vertical position (Centered for each level)
      const y = 350 + (index - (totalInLevel - 1) / 2) * verticalGap;
      
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

  const getNodeColor = (level: number) => {
    const colors = [
      '#6366f1', // Indigo (Root)
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f43f5e', // Rose
      '#f59e0b', // Amber
    ];
    return colors[level % colors.length];
  };

  return (
    <div className="w-full h-[700px] bg-white dark:bg-[#0f1115] rounded-3xl overflow-auto border border-gray-100 dark:border-gray-800/50 shadow-2xl relative scrollbar-hide">
      <svg width={Math.max(1200, layoutNodes.length * 60)} height="1000" viewBox="0 0 1400 1000" className="min-w-full">
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {parsedData.edges.map((edge, i) => {
          const source = positionedNodes.get(edge.source);
          const target = positionedNodes.get(edge.target);
          if (!source || !target) return null;

          return (
            <g key={`edge-group-${i}`}>
              <motion.path
                d={getPath(source, target)}
                fill="none"
                stroke={getNodeColor(positionedNodes.get(edge.source)?.level || 0)}
                strokeWidth="2"
                strokeOpacity="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
              <motion.circle
                r="3"
                fill={getNodeColor(positionedNodes.get(edge.source)?.level || 0)}
                initial={{ offset: 0 }}
                animate={{ cx: [source.x + source.width, target.x], cy: [source.y + source.height/2, target.y + target.height/2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((node: any, i) => {
          const color = getNodeColor(node.level || 0);
          return (
            <motion.g
              key={`node-${node.id}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              {/* Glow effect */}
              <rect
                x={node.x - 2}
                y={node.y - 2}
                width={node.width + 4}
                height={node.height + 4}
                rx="14"
                fill={color}
                fillOpacity="0.15"
                filter="url(#glow)"
              />
              
              {/* Main Node Body */}
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="12"
                fill={color}
                className="transition-all duration-300"
              />
              
              {/* Glossy Overlay */}
              <rect
                x={node.x + 1}
                y={node.y + 1}
                width={node.width - 2}
                height={node.height / 2}
                rx="11"
                fill="url(#nodeGradient)"
              />

              <foreignObject x={node.x + 10} y={node.y} width={node.width - 20} height={node.height}>
                <div className="h-full flex items-center justify-center text-center">
                  <span className="text-[13px] font-bold text-white leading-tight drop-shadow-md">
                    {node.label}
                  </span>
                </div>
              </foreignObject>
              
              {/* Decorative side bar */}
              <rect
                x={node.x}
                y={node.y + 10}
                width="4"
                height={node.height - 20}
                rx="2"
                fill="rgba(255,255,255,0.3)"
              />
            </motion.g>
          );
        })}
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
