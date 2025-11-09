import React from "react";
import { CloseIcon } from "./icons/CloseIcon";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-600/50 relative text-slate-300 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-300 transition-colors p-1 hover:bg-slate-700/50 rounded-full"
          aria-label="Close dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2
          id="info-modal-title"
          className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 pr-8"
        >
          About ClickSurf 📍
        </h2>

        <div className="space-y-5 text-sm leading-relaxed">
          <p className="text-base text-slate-200">
            <strong className="text-cyan-400">ClickSurf</strong> is a visual
            discovery AI tool that lets you explore your city in just a few
            clicks. It uses the power of the Google Gemini API to provide
            up-to-date, localized information about various places around you.
          </p>

          <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700/50">
            <h3 className="font-bold text-white mb-3 text-base flex items-center gap-2">
              <span className="text-xl">🎯</span>
              How it Works:
            </h3>
            <ul className="space-y-3 pl-2">
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold flex-shrink-0">→</span>
                <div>
                  <strong className="text-white">Discover:</strong> Select a
                  category to see popular spots near your current location,
                  visualized as an interactive knowledge graph.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold flex-shrink-0">→</span>
                <div>
                  <strong className="text-white">Chat:</strong> Click on any
                  discovered place to open a chat window and ask questions. The
                  AI assistant, powered by Gemini, uses Google Search and Maps
                  grounding to give you the latest info.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold flex-shrink-0">→</span>
                <div>
                  <strong className="text-white">Customize:</strong> Add your
                  own categories to explore! If you want to find "Skate Parks"
                  or "Vinyl Record Shops", just add them and let the AI do the
                  work.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700/50">
            <h3 className="font-bold text-white mb-3 text-base flex items-center gap-2">
              <span className="text-xl">⚡</span>
              Technology Stack:
            </h3>
            <p className="text-slate-200">
              This application is built with{" "}
              <span className="text-cyan-400 font-semibold">React</span> and{" "}
              <span className="text-cyan-400 font-semibold">TypeScript</span>,
              and it heavily features the{" "}
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors"
              >
                Google Gemini API
              </a>{" "}
              for its core functionalities, including place discovery, chat
              conversations, and dynamic category creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
