import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => Promise<void>;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await onAdd(categoryName.trim());
      setCategoryName(''); // Reset on success
    } catch (err: any) {
      setError(err.message || 'Could not create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="add-category-title"
    >
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="add-category-title" className="text-xl font-bold text-white">Add New Category</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close dialog">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-slate-400 mb-4">
            Enter a category like "Coffee Shops" or "Bookstores" and we'll generate the rest!
          </p>
          <label htmlFor="category-name-input" className="sr-only">Category Name</label>
          <input
            id="category-name-input"
            type="text"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            placeholder="e.g., Bookstores"
            className="w-full bg-slate-700 p-2.5 text-sm text-slate-200 placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
            disabled={isLoading}
          />
          {error && <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!categoryName.trim() || isLoading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md text-sm font-semibold text-white transition-colors flex items-center justify-center min-w-[80px]">
              {isLoading ? <LoadingSpinner /> : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};