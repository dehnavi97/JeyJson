import React from 'react';
import { HistoryEntry } from '../types';
import { X, Trash2, Clock } from 'lucide-react';

interface HistoryPaneProps {
  history: HistoryEntry[];
  onClose: () => void;
  onRestore: (content: string) => void;
  onClear: () => void;
}

export default function HistoryPane({ history, onClose, onRestore, onClear }: HistoryPaneProps) {
  return (
    <div className="absolute top-0 left-16 md:left-56 bottom-0 w-80 bg-[#121212] border-r border-[#222] z-40 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
         <div className="flex items-center text-gray-200 font-semibold">
           <Clock className="w-4 h-4 mr-2 text-[#FFB100]" />
           Local History
         </div>
         <div className="flex items-center gap-1">
           <button onClick={onClear} title="Clear History" className="p-1.5 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded transition-colors">
              <Trash2 className="w-4 h-4" />
           </button>
           <button onClick={onClose} className="p-1.5 hover:bg-[#222] text-gray-400 hover:text-white rounded transition-colors">
              <X className="w-4 h-4" />
           </button>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
         {history.length === 0 ? (
            <div className="text-center text-sm text-gray-600 mt-10">No history yet.<br/>Formats & parses will appear here.</div>
         ) : (
           history.map((entry) => (
             <button
               key={entry.id}
               onClick={() => onRestore(entry.content)}
               className="w-full text-left p-3 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#2A2A2A] transition-colors group"
             >
               <div className="text-xs text-gray-500 mb-1 font-mono">{entry.timestamp}</div>
               <div className="text-sm text-gray-300 font-mono line-clamp-2 leading-relaxed">
                 {entry.snippetPreview}
               </div>
             </button>
           ))
         )}
      </div>
    </div>
  );
}
