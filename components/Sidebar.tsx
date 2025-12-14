import React from 'react';
import { KNOWLEDGE_BASE } from '../constants';
import { IntentCategory } from '../types';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const categories = Array.from(new Set(KNOWLEDGE_BASE.map(k => k.intent)));

  return (
    <aside className={`bg-slate-900 text-white flex-col border-r border-slate-700 ${className}`}>
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          Alpha-Assist
        </h1>
        <p className="text-xs text-slate-400 mt-1">Intent Bot v1.0</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Hierarchical Intents
        </h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat} className="group">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-medium mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  cat === IntentCategory.ENROLLMENT ? 'bg-blue-500' :
                  cat === IntentCategory.PAYMENT ? 'bg-green-500' :
                  cat === IntentCategory.TECHNICAL_SUPPORT ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}></span>
                {cat}
              </div>
              <div className="ml-4 pl-2 border-l border-slate-700 text-xs text-slate-500">
                {KNOWLEDGE_BASE.filter(k => k.intent === cat).length} FAQs
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="text-xs text-slate-400">
          <p className="mb-2 font-semibold">System Metrics</p>
          <div className="flex justify-between mb-1">
            <span>Model</span>
            <span className="text-slate-200">Gemini 2.5 Flash</span>
          </div>
          <div className="flex justify-between">
            <span>Threshold</span>
            <span className="text-slate-200">0.65</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
