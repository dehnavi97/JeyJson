import React, { useRef, useEffect } from 'react';
import { DiffEditor, useMonaco } from '@monaco-editor/react';
import { AppTab } from '../types';

interface DiffPaneProps {
  tabs: AppTab[];
  activeTab: AppTab;
  theme: 'dark' | 'light';
  onUpdateActiveTab: (updates: Partial<AppTab>) => void;
}

export default function DiffPane({ tabs, activeTab, theme, onUpdateActiveTab }: DiffPaneProps) {
  const diffEditorRef = useRef<any>(null);
  const monaco = useMonaco();
  
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('jeyjson-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string.key.json', foreground: '9CDCFE' },
          { token: 'string.value.json', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'keyword', foreground: '569CD6' }
        ],
        colors: {
          'editor.background': '#0D0D0D',
          'editor.lineHighlightBackground': '#121212',
          'editorLineNumber.foreground': '#606060',
        }
      });
      monaco.editor.defineTheme('jeyjson-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#FFFFFF',
          'editor.lineHighlightBackground': '#F0F0F0',
        }
      });
      monaco.editor.setTheme(theme === 'light' ? 'jeyjson-light' : 'jeyjson-dark');
    }
  }, [monaco, theme]);

  const leftTab = tabs.find(t => t.id === activeTab.diffLeftTabId) || tabs[0];
  const rightTab = tabs.find(t => t.id === activeTab.diffRightTabId) || tabs[0];

  const handleEditorMount = (diffEditor: any, monacoInstance: any) => {
    diffEditorRef.current = diffEditor;
    monacoInstance.editor.setTheme(theme === 'light' ? 'jeyjson-light' : 'jeyjson-dark');
  };

  return (
    <div className={`flex flex-col h-full w-full ${theme === 'light' ? 'bg-white' : 'bg-[#0D0D0D]'}`}>
      <div className={`flex items-center px-4 py-3 gap-6 ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-[#121212] border-[#2A2A2A]'} border-b`}>
        <div className="flex-1 flex items-center gap-3">
          <span className="font-bold text-[10px] tracking-wider text-gray-500 uppercase shrink-0">Left Document</span>
          <select 
            className={`flex-1 min-w-0 text-xs px-2 py-1 rounded outline-none w-full ${theme === 'light' ? 'bg-white text-black border border-gray-300' : 'bg-[#1A1A1A] text-gray-300 border border-[#333]'}`}
            value={leftTab?.id || ''}
            onChange={(e) => onUpdateActiveTab({ diffLeftTabId: e.target.value })}
          >
            {tabs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <span className="font-bold text-[10px] tracking-wider text-gray-500 uppercase shrink-0">Right Document</span>
          <select 
            className={`flex-1 min-w-0 text-xs px-2 py-1 rounded outline-none w-full ${theme === 'light' ? 'bg-white text-black border border-gray-300' : 'bg-[#1A1A1A] text-gray-300 border border-[#333]'}`}
            value={rightTab?.id || ''}
            onChange={(e) => onUpdateActiveTab({ diffRightTabId: e.target.value })}
          >
            {tabs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex-1 relative">
        <DiffEditor
          original={leftTab?.content || ''}
          modified={rightTab?.content || ''}
          language="json"
          theme={theme === 'light' ? 'jeyjson-light' : 'jeyjson-dark'}
          onMount={handleEditorMount}
          options={{
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            originalEditable: false,
            readOnly: true,
            scrollBeyondLastLine: false,
            enableSplitViewResizing: true,
          }}
        />
      </div>
    </div>
  );
}
