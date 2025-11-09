import React, { useRef, useState, useEffect } from 'react';
import type { NodeItem } from '../types';
import { GraphNode } from './GraphNode';

interface KnowledgeGraphProps {
  nodes: NodeItem[];
  centerNodeLabel: React.ReactNode;
  onNodeClick: (node: NodeItem, position?: { x: number, y: number }) => void;
  onBackClick?: () => void;
  onNodeRemove?: (node: NodeItem) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, centerNodeLabel, onNodeClick, onBackClick, onNodeRemove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          setSize(entries[0].contentRect.width);
        }
      });
      observer.observe(container);
      return () => observer.disconnect();
    }
  }, []);
  
  if (size === 0) {
    return <div ref={containerRef} className="relative w-full h-full" />;
  }

  const nodeVisualSize = 120;
  const centerNodeSize = Math.max(100, size * 0.25); // Set a minimum size
  const radius = size / 2 - nodeVisualSize / 2;
  const center = size / 2;

  const nodePositions = nodes.map((_, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - (nodeVisualSize / 2);
    const y = center + radius * Math.sin(angle) - (nodeVisualSize / 2);
    return { x, y };
  });

  const handleNodeClick = (node: NodeItem, index: number) => {
    if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const pos = nodePositions[index];
        const absoluteX = containerRect.left + pos.x + nodeVisualSize;
        const absoluteY = containerRect.top + pos.y + (nodeVisualSize / 2);
        onNodeClick(node, { x: absoluteX, y: absoluteY });
    } else {
        onNodeClick(node);
    }
  };


  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Central Node */}
      <div
        className="absolute rounded-full flex flex-col items-center justify-center text-center border-2 border-cyan-500 shadow-xl bg-cyan-500/20 shadow-cyan-500/20"
        style={{ 
          width: `${centerNodeSize}px`,
          height: `${centerNodeSize}px`,
          top: `${center - centerNodeSize / 2}px`,
          left: `${center - centerNodeSize / 2}px`,
        }}
      >
        {typeof centerNodeLabel === 'string' ? (
          <div className="text-lg font-bold max-w-[120px] truncate" title={centerNodeLabel}>
            {centerNodeLabel}
          </div>
        ) : (
          centerNodeLabel
        )}
      </div>
      
      {onBackClick && (
          <button onClick={onBackClick} className="absolute top-2 left-2 z-10 bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-3 rounded-full text-sm transition-colors">
              &larr; Back
          </button>
      )}

      {/* Lines/Edges */}
      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
        {nodePositions.map((pos, index) => (
          <line
            key={`line-${index}`}
            x1={center}
            y1={center}
            x2={pos.x + (nodeVisualSize / 2)}
            y2={pos.y + (nodeVisualSize / 2)}
            stroke="rgba(71, 85, 105, 0.5)"
            strokeWidth="2"
            className="animate-fade-in"
          />
        ))}
      </svg>

      {/* Place Nodes */}
      {nodes.map((node, index) => (
        <GraphNode
          key={node.id}
          node={node}
          onClick={(clickedNode) => handleNodeClick(clickedNode, index)}
          onRemove={onNodeRemove}
          style={{
            top: `${nodePositions[index].y}px`,
            left: `${nodePositions[index].x}px`,
            width: `${nodeVisualSize}px`,
          }}
          animationDelay={`${index * 0.1}s`}
        />
      ))}
    </div>
  );
};
