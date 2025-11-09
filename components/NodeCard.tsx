
import React from 'react';
import type { PlaceType } from '../types';

interface NodeCardProps {
  place: PlaceType;
  onClick: () => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ place, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer
                 border border-slate-700 hover:border-cyan-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
    >
      <div className="text-5xl mb-4">{place.emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
      <p className="text-sm text-slate-400">{place.description}</p>
    </div>
  );
};
