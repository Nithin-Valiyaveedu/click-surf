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
        className={`relative w-24 h-24 bg-slate-800 rounded-full flex flex-col items-center justify-center
           border-2 group-hover:border-cyan-500 transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/30
           ${isAddNew ? "border-dashed border-slate-500" : "border-slate-700"}
           ${!isAddNew ? "animate-float" : ""}`}
        style={!isAddNew ? { animationDelay } : {}}
      >
        {onRemove && !isAddNew && (
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300
                       hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
            aria-label={`Remove ${node.name}`}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
        <div className="text-4xl">{node.emoji}</div>
      </div>
      <h3
        className="mt-2 text-sm font-bold text-white transition-colors duration-300 group-hover:text-cyan-400 max-w-[120px] truncate"
        title={node.name}
      >
        {node.name}
      </h3>
    </div>
  );
};
