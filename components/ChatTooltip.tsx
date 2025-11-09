import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession, extractGroundingSources } from '../services/geminiService';
import type { DiscoveredPlace, ChatMessage, UserLocation, GroundingSource } from '../types';
import { SendIcon } from './icons/SendIcon';
import { CloseIcon } from './icons/CloseIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ChatTooltipProps {
  place: DiscoveredPlace;
  position: { x: number; y: number };
  userLocation: UserLocation | null;
  onClose: () => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-2">
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
  </div>
);

const SourceLinks: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => (
    <div className="mt-2 pt-2 border-t border-slate-600/30 flex flex-wrap gap-2 items-center">
        <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        {sources.map((source, index) => (
            <a
                key={index}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-slate-800/60 hover:bg-slate-700/80 text-cyan-300 hover:text-cyan-200 px-2.5 py-1 rounded-full transition-all duration-200 truncate border border-slate-600/50 hover:border-cyan-500/50 hover:scale-105"
                title={source.title}
            >
                {new URL(source.uri).hostname}
            </a>
        ))}
    </div>
);

export const ChatTooltip: React.FC<ChatTooltipProps> = ({ place, position, userLocation, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = useCallback(() => {
    setIsLoading(true);
    chatRef.current = createChatSession(place.name, userLocation);
    const initialPrompt = `Hello! Give me a brief, welcoming summary of what ${place.name} is known for.`;
    
    chatRef.current.sendMessage({ message: initialPrompt })
      .then(response => {
        setMessages([{
          id: 'init-1',
          role: 'model',
          text: response.text,
          sources: extractGroundingSources(response),
        }]);
      }).catch(err => {
        console.error("Gemini API error:", err);
        setMessages([{ id: 'error-1', role: 'model', text: 'Sorry, I encountered an error.' }]);
      }).finally(() => setIsLoading(false));
  }, [place.name, userLocation]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: userInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMessage.text });
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        sources: extractGroundingSources(response),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Gemini API error on send:", err);
      setMessages(prev => [...prev, { id: 'error-2', role: 'model', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const style: React.CSSProperties = isMobile ? {
    zIndex: 50,
  } : {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    transform: 'translate(20px, -50%)',
    zIndex: 10,
  };

  const containerClasses = isMobile
    ? "fixed bottom-0 left-0 right-0 h-[80vh] w-full rounded-t-2xl shadow-2xl border-t"
    : "w-80 h-96 rounded-2xl shadow-2xl border";

  return (
    <>
      {isMobile && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />}
      <div 
        style={style} 
        className={`${containerClasses} bg-slate-800/95 backdrop-blur-xl flex flex-col border-slate-600/50 animate-fade-in shadow-2xl`}
      >
        <header className="flex items-center justify-between gap-3 p-4 border-b border-slate-700/50 flex-shrink-0 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-xl flex-shrink-0">{place.emoji}</div>
            <h2 className="text-base font-bold text-cyan-100 truncate">{place.name}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1 hover:bg-slate-700/50 rounded-full flex-shrink-0"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm bg-gradient-to-b from-slate-900/20 to-slate-900/40">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] p-3 rounded-2xl shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-md' 
                  : 'bg-slate-700/80 backdrop-blur-sm text-slate-100 rounded-bl-md border border-slate-600/50'
              }`}>
                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && <SourceLinks sources={msg.sources} />}
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-slate-700/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-2 border border-slate-600/50">
                <TypingIndicator/>
              </div>
            </div>
          )}
          {isLoading && messages.length === 0 && (
            <div className="text-slate-400 text-center p-6 animate-pulse">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="mt-2">Connecting to assistant...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700/50 flex-shrink-0 bg-slate-900/30">
          <div className="flex items-center bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600/50 overflow-hidden hover:border-cyan-500/50 transition-colors">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg m-1 p-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <SendIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
