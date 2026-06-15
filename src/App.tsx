import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppTab, AppSettings, TabMode, HistoryEntry } from './types';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import EditorPane from './components/EditorPane';
import DiffPane from './components/DiffPane';
import ConverterPane from './components/ConverterPane';
import ToCodePane from './components/ToCodePane';
import HttpClientPane from './components/HttpClientPane';
import HistoryPane from './components/HistoryPane';
import FirstRunModal from './components/FirstRunModal';

import Titlebar from './components/Titlebar';

const DEFAULT_JSON = `{\n  "hello": "world",\n  "status": "success",\n  "workspace": "JeyJson"\n}`;

export default function App() {
  const [tabs, setTabs] = useState<AppTab[]>(() => {
    const saved = localStorage.getItem('jeyjson_tabs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{ id: uuidv4(), name: 'Untitled 1', content: DEFAULT_JSON, mode: 'editor', filePath: null, isDirty: false }];
  });

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  
  const [showFirstRun, setShowFirstRun] = useState(false);
  const addTabRef = useRef<any>(null);
  const addToHistoryRef = useRef<any>(null);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    // const saved = localStorage.getItem('jeyjson_settings');
    // if (saved) {
    //   try { return JSON.parse(saved); } catch (e) {}
    // }
    return { fontId: 'jetbrains', theme: 'dark' };
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('jeyjson_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  
  const [historyOpen, setHistoryOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem('jeyjson_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('jeyjson_settings', JSON.stringify(settings));
    const isLight = settings.theme === 'light';
    
    // Explicit HTML dark/light configuration for aggressive CSS overriding
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(isLight ? 'light' : 'dark');
    
    document.body.className = `font-${settings.fontId} ${isLight ? 'bg-white text-black' : 'bg-[#0A0A0A] text-white'} overflow-hidden`;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('jeyjson_history', JSON.stringify(history));
  }, [history]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<AppTab>) => {
    setTabs(prev => prev.map(t => Math.abs(t.id.localeCompare(activeTabId)) === 0 ? { ...t, ...updates } : t));
  };

  const addTab = (content: string = '', name?: string, filePath?: string | null) => {
    const finalContent = typeof content === 'string' ? content : '';
    const newTab: AppTab = {
      id: uuidv4(),
      name: name || `Untitled ${tabs.length + 1}`,
      content: finalContent,
      mode: 'editor',
      filePath: filePath || null,
      isDirty: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (id: string) => {
    const newTabs = tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      const defTab: AppTab = { id: uuidv4(), name: 'Untitled 1', content: '', mode: 'editor', filePath: null, isDirty: false };
      setTabs([defTab]);
      setActiveTabId(defTab.id);
    } else {
      setTabs(newTabs);
      if (activeTabId === id) setActiveTabId(newTabs[0].id);
    }
  };

  const addToHistory = (content: string) => {
    if (typeof content !== 'string' || !content.trim() || content === '{}' || content === '[]') return;
    const newEntry: HistoryEntry = {
      id: uuidv4(),
      timestamp: new Date().toLocaleString(),
      content,
      snippetPreview: content.substring(0, 50).replace(/\n/g, '') + '...'
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 50));
  };

  // Drag and Drop Logic
  useEffect(() => {
    addTabRef.current = addTab;
    addToHistoryRef.current = addToHistory;
  });

  useEffect(() => {
    const isFirstRun = localStorage.getItem('jeyjson_first_run') === null;
    if (isFirstRun) {
      setShowFirstRun(true);
    }
  }, []);

  const handleSetDefault = async () => {
    setShowFirstRun(false);
    localStorage.setItem('jeyjson_first_run', 'false');
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_default_handler');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissFirstRun = () => {
    setShowFirstRun(false);
    localStorage.setItem('jeyjson_first_run', 'false');
  };

  // Tauri File Open Listener
  useEffect(() => {
    let unlisten: any;

    async function listenForTauriEvents() {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { readTextFile } = await import('@tauri-apps/plugin-fs');

        unlisten = await listen('open-file-event', async (event: any) => {
          const filePath = event.payload as string;
          try {
            const content = await readTextFile(filePath);
            const fileName = filePath.split(/[/\\]/).pop() || 'Opened File';
            if (addTabRef.current) addTabRef.current(content, fileName, filePath);
            if (addToHistoryRef.current) addToHistoryRef.current(content);
          } catch (err) {
            console.error("Failed to read opened file via Tauri:", err);
          }
        });
      } catch(e) {
        console.warn('Tauri event listening failed', e);
      }
    }

    listenForTauriEvents();

    return () => {
      if (typeof unlisten === 'function') unlisten();
    };
  }, []);

  const saveFile = async () => {
    if (!activeTab) return;
    try {
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      const { save } = await import('@tauri-apps/plugin-dialog');
      
      let targetPath = activeTab.filePath;
      
      if (!targetPath) {
        targetPath = await save({
          filters: [{
            name: 'Accepted Formats',
            extensions: ['json', 'xml', 'yaml', 'yml', 'txt']
          }]
        });
      }
      
      if (targetPath) {
        await writeTextFile(targetPath, activeTab.content);
        const newName = targetPath.split(/[/\\]/).pop() || activeTab.name;
        updateActiveTab({ filePath: targetPath, isDirty: false, name: newName });
      }
    } catch(e) {
      console.error('Failed to save file', e);
    }
  };

  const openFile = async () => {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const { open } = await import('@tauri-apps/plugin-dialog');
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Accepted Formats',
          extensions: ['json', 'xml', 'yaml', 'yml', 'txt']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        const content = await readTextFile(selected);
        const fileName = selected.split(/[/\\]/).pop() || 'Opened File';
        addTab(content, fileName, selected);
        addToHistory(content);
      }
    } catch(e) {
      console.error('Failed to open file', e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        openFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          addTab(content, file.name);
          addToHistory(content);
        };
        reader.readAsText(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [tabs.length]); // bind to tabs.length to avoid stale closures if tabs dependency matters, though addTab acts on setter.

  return (
    <div className={`flex flex-col h-screen w-full text-foreground relative border ${settings.theme === 'light' ? 'bg-[#f0f0f0] border-gray-300 border-x-0 border-b-0' : 'bg-[#0A0A0A] border-[#2A2A2A] border-x-0 border-b-0'} overflow-hidden`}>
      <Titlebar theme={settings.theme} />
      {showFirstRun && (
        <FirstRunModal 
          onDismiss={handleDismissFirstRun} 
          onAccept={handleSetDefault} 
        />
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-[#FFB100]/10 backdrop-blur-[2px] border-4 border-dashed border-[#FFB100] z-50 flex items-center justify-center rounded-xl pointer-events-none">
          <div className="bg-[#111] px-8 py-4 rounded-xl shadow-2xl flex flex-col items-center">
            <span className="text-[#FFB100] font-bold text-2xl tracking-tight mb-2">Drop JSON File Here</span>
            <span className="text-gray-400 font-mono text-sm">Will open in a new tab</span>
          </div>
        </div>
      )}

      {/* Top Header / Tab Bar */}
      <TabBar 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onSelectTab={setActiveTabId} 
        onCloseTab={closeTab} 
        onAddTab={addTab} 
        settings={settings}
        onChangeSettings={setSettings}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for global navigation */}
        <Sidebar 
          activeMode={activeTab?.mode || 'editor'} 
          onChangeMode={(mode) => updateActiveTab({ mode })}
          onToggleHistory={() => setHistoryOpen(!historyOpen)}
        />
        
        {/* History Slide-out */}
        {historyOpen && (
          <HistoryPane 
            history={history} 
            onClose={() => setHistoryOpen(false)}
            onRestore={(content) => {
              updateActiveTab({ content, mode: 'editor' });
              setHistoryOpen(false);
            }}
            onClear={() => setHistory([])}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col min-w-0 ${settings.theme === 'light' ? 'bg-white' : 'bg-[#0D0D0D]'} relative z-10`}>
          <div className="flex-1 flex overflow-hidden relative">
            {activeTab?.mode === 'editor' && (
              <EditorPane 
                content={activeTab.content} 
                tabId={activeTab.id}
                theme={settings.theme || 'dark'}
                onChange={(c) => updateActiveTab({ content: c, isDirty: true })}
                onSaveToHistory={addToHistory}
              />
            )}
            {activeTab?.mode === 'diff' && (
               <DiffPane 
                 tabs={tabs}
                 activeTab={activeTab}
                 theme={settings.theme || 'dark'}
                 onUpdateActiveTab={updateActiveTab}
               />
            )}
            {activeTab?.mode === 'converter' && (
               <ConverterPane content={activeTab.content} />
            )}
            {activeTab?.mode === 'to-code' && (
               <ToCodePane content={activeTab.content} />
            )}
            {activeTab?.mode === 'http' && (
               <HttpClientPane 
                 onApplyResponse={(responseJson) => {
                    updateActiveTab({ content: responseJson, mode: 'editor' });
                    addToHistory(responseJson);
                 }}
               />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-[#FFB100] text-[#0D0D0D] flex items-center px-4 text-[10px] font-bold uppercase tracking-wider shrink-0 z-20 relative">
        <span>✅ System Online</span>
        <div className="ml-auto flex gap-4">
          <span className="opacity-80 font-mono tracking-normal lowercase">{activeTab?.mode}</span>
          <span>UTF-8</span>
          <span className="opacity-80">JeyJson Pro v1.0</span>
        </div>
      </footer>
    </div>
  );
}
