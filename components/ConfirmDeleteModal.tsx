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
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <h2 id="confirm-delete-title" className="text-xl font-bold text-white mb-2">Confirm Deletion</h2>
        <p className="text-sm text-slate-300 mb-6">
          Are you sure you want to delete the "<strong>{categoryName}</strong>" category? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm font-semibold text-white transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};