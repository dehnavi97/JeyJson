import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface FirstRunModalProps {
  onDismiss: () => void;
  onAccept: () => void;
}

export default function FirstRunModal({ onDismiss, onAccept }: FirstRunModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger entrance animation safely
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500">
      <div 
        className={`bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-2xl p-6 w-[400px] flex flex-col transform transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-[#FFB100] flex items-center justify-center shrink-0">
                <span className="text-[#0D0D0D] font-black text-sm">J</span>
             </div>
             <div>
               <h2 className="text-white font-bold tracking-tight text-lg uppercase leading-tight">Default Editor</h2>
               <p className="text-xs text-[#FFB100] font-bold uppercase tracking-wider mt-0.5">OS Integration</p>
             </div>
          </div>
          <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 transition-colors bg-[#1A1A1A] p-1.5 rounded-md hover:bg-[#2A2A2A]">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Make <strong className="text-white">JeyJson</strong> your default editor for <strong className="text-white">JSON</strong>, <strong className="text-white">XML</strong>, and <strong className="text-white">YAML</strong> files? This enables you to double-click these files directly from your OS to open them instantly in this workspace.
        </p>

        <div className="flex items-center gap-3 mt-auto justify-end border-t border-[#2A2A2A] pt-4">
          <button 
            onClick={onDismiss} 
            className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            Maybe Later
          </button>
          <button 
            onClick={onAccept} 
            className="px-5 py-2 text-xs font-bold uppercase tracking-wide rounded bg-[#FFB100] text-black hover:bg-[#D99500] flex items-center transition-all"
          >
            <Check className="w-4 h-4 mr-2 stroke-[3]" />
            Set Default
          </button>
        </div>
      </div>
    </div>
  );
}
