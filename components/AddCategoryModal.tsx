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
      className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="add-category-title"
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-600/50 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="text-2xl">➕</div>
            <h2 id="add-category-title" className="text-xl font-bold text-white">Add New Category</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1 hover:bg-slate-700/50 rounded-full" 
            aria-label="Close dialog"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Enter a category like <span className="text-cyan-400 font-semibold">"Coffee Shops"</span> or <span className="text-cyan-400 font-semibold">"Bookstores"</span> and we'll generate the rest with AI magic! ✨
          </p>
          <label htmlFor="category-name-input" className="sr-only">Category Name</label>
          <input
            id="category-name-input"
            type="text"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            placeholder="e.g., Bookstores"
            className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 p-3 text-sm text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            autoFocus
            disabled={isLoading}
          />
          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 px-3 py-2 rounded-lg animate-fade-in" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isLoading} 
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!categoryName.trim() || isLoading} 
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex items-center justify-center min-w-[80px] shadow-lg disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};