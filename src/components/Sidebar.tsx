import React from 'react';
import { TabMode } from '../types';
import { Braces, GitCompare, ArrowLeftRight, FileCode2, Send, History } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeMode: TabMode;
  onChangeMode: (mode: TabMode) => void;
  onToggleHistory: () => void;
}

export default function Sidebar({ activeMode, onChangeMode, onToggleHistory }: SidebarProps) {
  
  const navItems: { mode: TabMode, icon: React.FC<any>, label: string }[] = [
    { mode: 'editor', icon: Braces, label: 'Editor & Tree' },
    { mode: 'diff', icon: GitCompare, label: 'JSON Diff' },
    { mode: 'converter', icon: ArrowLeftRight, label: 'Format Converter' },
    { mode: 'to-code', icon: FileCode2, label: 'JSON to Code' },
    { mode: 'http', icon: Send, label: 'HTTP Client' },
  ];

  return (
    <aside className="w-14 bg-[#121212] border-r border-[#2A2A2A] flex flex-col items-center py-4 gap-6 h-full relative z-20 transition-all duration-300">
      
      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => onChangeMode(item.mode)}
            title={item.label}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-colors group relative",
              activeMode === item.mode 
                ? "bg-[#1A1A1A] text-[#FFB100]" 
                : "text-gray-600 hover:text-gray-300"
            )}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full px-2 mt-auto text-gray-600 hover:text-gray-300">
        <button
          onClick={onToggleHistory}
          title="History Log"
          className="flex items-center justify-center p-2 rounded-lg transition-colors"
        >
          <History className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
}
