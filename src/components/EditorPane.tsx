import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Play, Copy, Minimize2, CheckCircle2 } from 'lucide-react';
import TreeView from './TreeView';

interface EditorPaneProps {
  content: string;
  tabId: string;
  theme: 'dark' | 'light';
  onChange: (value: string) => void;
  onSaveToHistory: (content: string) => void;
}

export default function EditorPane({ content, tabId, theme, onChange, onSaveToHistory }: EditorPaneProps) {
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const monaco = useMonaco();

  useEffect(() => {
    try {
      if (content.trim()) {
        const obj = JSON.parse(content);
        setParsedData(obj);
        setErrorLine(null);
      } else {
        setParsedData(null);
        setErrorLine(null);
      }
    } catch (e: any) {
      setParsedData(null);
      const match = e.message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        const lines = content.substring(0, pos).split('\n');
        setErrorLine(lines.length);
      }
    }
  }, [content]);

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

  const handleEditorMount = (editor: any, monacoInstance: any) => {
    monacoInstance.editor.setTheme(theme === 'light' ? 'jeyjson-light' : 'jeyjson-dark');
  };

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      onChange(formatted);
      onSaveToHistory(formatted);
    } catch (e) {
      // Ignore if invalid
    }
  };

  const handleMinify = () => {
    try {
      const minified = JSON.stringify(JSON.parse(content));
      onChange(minified);
      onSaveToHistory(minified);
    } catch (e) {
      // Ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Utility Toolbar */}
      <div className="h-10 bg-[#161616] border-b border-[#2A2A2A] flex items-center px-4 gap-4">
        <button onClick={handleFormat} className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#FFB100] hover:bg-[#FFB100]/10 px-2 py-1 rounded transition-colors">
          <Play className="w-3 h-3" /> Prettify
        </button>
        <button onClick={handleMinify} className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 hover:text-gray-200 px-2 py-1">
          <Minimize2 className="w-3 h-3" /> Minify
        </button>
        
        <div className="h-4 w-[1px] bg-[#2A2A2A]"></div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1">
            {!errorLine && content.trim() ? (
               <>
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-[10px] text-green-500 uppercase font-bold">Valid JSON</span>
               </>
            ) : errorLine || !content.trim() ? (
               <>
                 <span className="w-2 h-2 rounded-full bg-red-500"></span>
                 <span className="text-[10px] text-red-500 uppercase font-bold">{!content.trim() ? "Empty" : "Invalid JSON"}</span>
               </>
            ) : null}
          </div>
          <button onClick={handleCopy} className="text-[10px] uppercase font-bold bg-[#FFB100] hover:bg-[#D99500] text-[#0D0D0D] px-3 py-1 rounded flex items-center gap-1 transition-colors">
            {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Editor Context */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Monaco Editor Pane */}
        <div className="w-full md:w-[60%] border-r border-[#2A2A2A] h-full relative">
          {errorLine && (
            <div className="absolute top-2 right-2 z-10 bg-red-900/80 text-red-200 text-xs px-3 py-1.5 rounded flex items-center shadow-lg border border-red-700/50">
              Invalid JSON near line {errorLine}
            </div>
          )}
          <Editor
            height="100%"
            defaultLanguage="json"
            path={`tab-${tabId}.json`}
            value={content}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              formatOnPaste: true,
              wordWrap: 'on',
              fontFamily: 'inherit',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Tree View Pane */}
        <div className="w-full md:w-[40%] h-full bg-[#121212] flex flex-col">
          <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center bg-transparent">
            <span className="text-[10px] uppercase font-bold text-gray-500">Tree Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {parsedData ? (
              <TreeView data={parsedData} />
            ) : content.trim() ? (
               <div className="text-gray-500 text-sm flex items-center justify-center p-8 text-center">
                 Cannot render tree view. <br/> The JSON is currently invalid.
               </div>
            ) : (
               <div className="text-gray-600 text-sm italic">Empty document...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
