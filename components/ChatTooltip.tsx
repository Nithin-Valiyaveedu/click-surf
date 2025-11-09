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
    <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
        <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        {sources.map((source, index) => (
            <a
                key={index}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-slate-700 hover:bg-slate-600 text-cyan-300 px-2 py-0.5 rounded-full transition-colors duration-200 truncate"
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
      {isMobile && <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={onClose} />}
      <div 
        style={style} 
        className={`${containerClasses} bg-slate-800/90 backdrop-blur-md flex flex-col border-slate-700 animate-fade-in`}
      >
        <header className="flex items-center justify-between p-3 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-sm font-bold truncate pr-2">{place.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && <SourceLinks sources={msg.sources} />}
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && <div className="flex justify-start"><TypingIndicator/></div>}
          {isLoading && messages.length === 0 && <div className="text-slate-400 text-center p-4">Contacting assistant...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-700 flex-shrink-0">
          <div className="flex items-center bg-slate-700 rounded-md pr-1.5">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-transparent p-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md p-1.5 transition-colors"
            >
              <SendIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
