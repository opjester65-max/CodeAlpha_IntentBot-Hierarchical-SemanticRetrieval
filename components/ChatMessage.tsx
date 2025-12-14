import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onSearch?: (query: string) => void;
  loadingSearch?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSearch, loadingSearch }) => {
  const isUser = message.role === 'user';
  
  // Determine Intent Badge Color
  const getIntentColor = (intent: string) => {
    if (intent.includes('Enrollment')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (intent.includes('Payment')) return 'bg-green-100 text-green-800 border-green-200';
    if (intent.includes('Technical')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (intent.includes('Unknown') || message.isOOS) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Determine Confidence Color
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] lg:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Message Bubble */}
        <div 
          className={`px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
          }`}
        >
          {message.content}

          {/* Fallback Action Button */}
          {message.isOOS && message.suggestedSearchQuery && !message.searchResults && (
            <div className="mt-4 pt-3 border-t border-slate-100">
               <p className="text-xs text-slate-500 mb-2">I can search the web for this info.</p>
               <button
                onClick={() => onSearch && onSearch(message.suggestedSearchQuery!)}
                disabled={loadingSearch}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-all w-full justify-center disabled:opacity-50"
               >
                 {loadingSearch ? (
                   <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                 ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 )}
                 Search Google for "{message.suggestedSearchQuery}"
               </button>
            </div>
          )}

          {/* Search Results Display */}
          {message.searchResults && message.searchResults.length > 0 && (
             <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {message.searchResults.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-50 text-blue-600 px-2 py-1 rounded border border-slate-200 hover:underline truncate max-w-[200px]"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* Metadata (Bot Only) */}
        {!isUser && message.intent && (
          <div className="flex items-center gap-3 mt-2 ml-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${getIntentColor(message.intent)}`}>
              {message.intent}
            </span>
            {message.confidence !== undefined && (
              <span className="text-[10px] text-slate-400 font-medium">
                Confidence: <span className={getConfidenceColor(message.confidence)}>{(message.confidence * 100).toFixed(0)}%</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
