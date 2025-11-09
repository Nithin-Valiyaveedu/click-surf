import React from "react";
import type { NodeItem } from "../types";
import { CloseIcon } from "./icons/CloseIcon";

interface GraphNodeProps {
  node: NodeItem;
  onClick: (node: NodeItem) => void;
  onRemove?: (node: NodeItem) => void;
  style: React.CSSProperties;
  animationDelay: string;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  onClick,
  onRemove,
  style,
  animationDelay,
}) => {
  const isAddNew = node.id === "add-new-category";
  const isDiscoveredPlace = 'rating' in node;
  const rating = isDiscoveredPlace ? (node as any).rating : undefined;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(node);
    }
  };

  return (
    <div
      onClick={() => onClick(node)}
      className="absolute flex flex-col items-center justify-center text-center cursor-pointer group"
      style={style}
    >
      <div
        className={`relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex flex-col items-center justify-center
           border-2 group-hover:border-cyan-400 transform group-hover:scale-110 transition-all duration-300 shadow-xl
           ${
             isAddNew
               ? "border-dashed border-slate-600 hover:border-cyan-500/50"
               : "border-slate-700"
           }
           ${!isAddNew ? "animate-float" : ""}`}
        style={{
          ...((!isAddNew && { animationDelay }) || {}),
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-all duration-300 blur-sm"></div>

        {/* Rating badge for discovered places */}
        {rating && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 z-10">
            <span>⭐</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        )}

        {onRemove && !isAddNew && (
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300
                       hover:from-red-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 z-10 shadow-lg"
            aria-label={`Remove ${node.name}`}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
        <div className="text-4xl relative z-10">{node.emoji}</div>
      </div>
      <h3
        className="mt-3 text-sm font-bold text-slate-200 transition-all duration-300 group-hover:text-cyan-300 group-hover:scale-105 max-w-[120px] truncate px-2 py-1 rounded-md bg-slate-900/30 backdrop-blur-sm"
        title={node.name}
      >
        {node.name}
      </h3>
    </div>
  );
};
