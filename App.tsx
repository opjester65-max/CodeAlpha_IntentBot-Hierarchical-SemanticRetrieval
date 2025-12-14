import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { Message, IntentCategory } from './types';
import { analyzeIntent, performWebSearch } from './services/gemini';
import { INTENT_THRESHOLD } from './constants';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hello! I am Alpha-Assist. How can I help you with Enrollment, Payment, or Tech Support today?',
      intent: IntentCategory.GREETING,
      confidence: 1.0
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, isSearching]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // 1. Semantic Intent Classification
      const analysis = await analyzeIntent(userMsg.content);
      
      const isOOS = analysis.confidence < INTENT_THRESHOLD;
      
      const botMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        content: isOOS 
          ? "I'm not quite sure I have that information in my knowledge base." 
          : (analysis.answer || "I'm sorry, I couldn't retrieve the answer."),
        intent: analysis.intent,
        confidence: analysis.confidence,
        isOOS: isOOS,
        suggestedSearchQuery: isOOS ? (analysis.suggestedSearchQuery || userMsg.content) : undefined
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        content: "I encountered a system error processing your request.",
        intent: 'Error',
        confidence: 0
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebSearch = async (query: string) => {
    if (isSearching) return;
    setIsSearching(true);

    // Find the last bot message to update
    setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsgIndex = newMsgs.length - 1;
        if(lastMsgIndex >= 0) {
            // Optimistic update or loading state could go here
        }
        return newMsgs;
    });

    try {
      const searchResult = await performWebSearch(query);
      
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        
        // We append a new message for the search result or update the existing one?
        // Better UX: Append a new "Answer" message derived from search.
        const searchMsg: Message = {
          id: uuidv4(),
          role: 'bot',
          content: searchResult.text,
          intent: 'External Search',
          confidence: 1.0,
          searchResults: searchResult.links
        };
        
        return [...newMsgs, searchMsg];
      });
    } catch (error) {
       console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar - Hidden on mobile, visible on lg */}
      <Sidebar className="hidden lg:flex w-72 shrink-0 h-full" />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Header (Mobile only) */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Alpha-Assist
          </span>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded">v1.0</span>
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scrollbar-hide scroll-smooth"
        >
          <div className="max-w-3xl mx-auto w-full pb-4">
             {messages.map((msg) => (
               <ChatMessage 
                 key={msg.id} 
                 message={msg} 
                 onSearch={handleWebSearch}
                 loadingSearch={isSearching}
               />
             ))}
             
             {isProcessing && (
               <div className="flex justify-start w-full mb-6 animate-pulse">
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    <span className="text-xs text-slate-400 ml-2 font-medium">Classifying Intent...</span>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about enrollment, payments, or support..."
                className="w-full bg-slate-100 text-slate-800 border-0 rounded-xl px-5 py-4 pr-14 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner text-sm md:text-base outline-none"
                disabled={isProcessing || isSearching}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing || isSearching}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              AI can make mistakes. Please verify important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
