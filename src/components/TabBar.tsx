import React from 'react';
import { AppTab, AppSettings, FontFamily } from '../types';
import { X, Plus, FileJson } from 'lucide-react';
import { cn } from '../lib/utils';

interface TabBarProps {
  tabs: AppTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  settings: AppSettings;
  onChangeSettings: (s: AppSettings) => void;
}

export default function TabBar({ tabs, activeTabId, onSelectTab, onCloseTab, onAddTab, settings, onChangeSettings }: TabBarProps) {
  return (
    <header className="flex h-12 bg-[#121212] border-b border-[#2A2A2A] overflow-x-auto select-none no-scrollbar items-end px-4 gap-1">
      <div className="flex items-center gap-2 mr-4 h-full pb-3 mt-auto">
      </div>

      <div className="flex h-full items-end gap-1 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              "flex items-center px-4 h-9 gap-2 text-xs rounded-t transition-colors cursor-pointer group whitespace-nowrap",
              activeTabId === tab.id 
                ? "bg-[#1A1A1A] border-t-2 border-[#FFB100] text-white cursor-default" 
                : "border-t-2 border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <span className="opacity-50">{'{}'}</span>
            <span className="truncate max-w-[150px]">{tab.name}{tab.isDirty ? ' •' : ''}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className={cn(
                "ml-1 opacity-40 hover:opacity-100 transition-opacity",
                activeTabId === tab.id && "opacity-60"
              )}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button 
          onClick={() => onAddTab()}
          className="h-9 px-3 text-gray-600 hover:text-[#FFB100] text-lg flex items-center justify-center transition-colors mb-0.5"
          title="Add Tab"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/*<div className="ml-auto flex items-center gap-3 h-full mb-3 mt-auto pl-4">
        
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Theme</span>
          <select 
            className="bg-transparent text-xs text-[#FFB100] outline-none capitalize cursor-pointer font-bold"
            value={settings.theme || 'dark'}
            onChange={(e) => onChangeSettings({ ...settings, theme: e.target.value as any })}
          >
            <option className="bg-[#1A1A1A] text-gray-300" value="dark">Dark</option>
            <option className="bg-[#1A1A1A] text-gray-300" value="light">Light</option>
          </select>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Font</span>
          <select 
            className="bg-transparent text-xs text-[#FFB100] outline-none capitalize cursor-pointer font-bold"
            value={settings.fontId}
            onChange={(e) => onChangeSettings({ ...settings, fontId: e.target.value as FontFamily })}
          >
            <option className="bg-[#1A1A1A] text-gray-300" value="jetbrains">JetBrains Mono</option>
            <option className="bg-[#1A1A1A] text-gray-300" value="firacode">Fira Code</option>
            <option className="bg-[#1A1A1A] text-gray-300" value="inter">Inter</option>
            <option className="bg-[#1A1A1A] text-gray-300" value="source">Source Code Pro</option>
          </select>
        </div>
        
      </div>*/}
    </header>
  );
}
