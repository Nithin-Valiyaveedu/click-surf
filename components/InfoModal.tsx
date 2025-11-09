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
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="bg-slate-800 rounded-lg p-6 w-full max-w-lg shadow-2xl border border-slate-700 relative text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2
          id="info-modal-title"
          className="text-2xl font-bold text-white mb-4"
        >
          About ClickSurf 📍
        </h2>

        <div className="space-y-4 text-sm">
          <p>
            <strong>ClickSurf</strong> is a visual discovery AI tool that lets
            you explore your city in just a few clicks. It uses the power of the
            Google Gemini API to provide up-to-date, localized information about
            various places around you.
          </p>

          <div>
            <h3 className="font-semibold text-white mb-1">How it Works:</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Discover:</strong> Select a category to see popular
                spots near your current location, visualized as an interactive
                knowledge graph.
              </li>
              <li>
                <strong>Chat:</strong> Click on any discovered place to open a
                chat window and ask questions. The AI assistant, powered by
                Gemini, uses Google Search and Maps grounding to give you the
                latest info.
              </li>
              <li>
                <strong>Customize:</strong> Add your own categories to explore!
                If you want to find "Skate Parks" or "Vinyl Record Shops", just
                add them and let the AI do the work.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-1">Technology Stack:</h3>
            <p>
              This application is built with React and TypeScript, and it
              heavily features the{" "}
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
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
