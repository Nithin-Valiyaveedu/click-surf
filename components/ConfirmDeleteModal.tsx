import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, categoryName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-600/50 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 id="confirm-delete-title" className="text-xl font-bold text-white">Confirm Deletion</h2>
        </div>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          Are you sure you want to delete the <span className="text-cyan-400 font-semibold">"{categoryName}"</span> category? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition-all hover:scale-105 border border-slate-600"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};