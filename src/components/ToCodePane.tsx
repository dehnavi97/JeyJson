import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import Editor from '@monaco-editor/react';

type TargetLanguage = 'typescript' | 'csharp' | 'python';

function generateTypescript(obj: any, name = "Root"): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `type ${name} = any[];\n`;
    return `type ${name} = ${generateTypescript(obj[0], name + 'Item')}[]\n`;
  }
  if (typeof obj !== 'object' || obj === null) {
    return `type ${name} = ${typeof obj};\n`;
  }
  
  let out = `export interface ${name} {\n`;
  for (const [key, val] of Object.entries(obj)) {
    let t = typeof val;
    if (val === null) t = 'any';
    else if (Array.isArray(val)) {
      if (val.length === 0) t = 'any[]';
      else {
        t = typeof val[0];
        if (t === 'object' && val[0] !== null) {
           t = name + '_' + key + 'Item[]';
        } else {
           t = t + '[]';
        }
      }
    } else if (typeof val === 'object') {
      t = name + '_' + key;
    }
    out += `  ${key}: ${t};\n`;
  }
  out += `}\n`;
  return out;
}

function generateCSharp(obj: any, name = "Root"): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return `public class ${name} {}`;
  
  let out = `public class ${name} {\n`;
  for (const [key, val] of Object.entries(obj)) {
    let t = "object";
    if (typeof val === "string") t = "string";
    if (typeof val === "number") t = "double";
    if (typeof val === "boolean") t = "bool";
    if (Array.isArray(val)) t = "List<object>";
    
    // Capitalize key for property
    const propName = key.charAt(0).toUpperCase() + key.slice(1);
    out += `    public ${t} ${propName} { get; set; }\n`;
  }
  out += `}\n`;
  return out;
}

function generatePython(obj: any, name = "Root"): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return `class ${name}:\n    pass`;
  
  let out = `from dataclasses import dataclass\nfrom typing import Any, List\n\n@dataclass\nclass ${name}:\n`;
  const entries = Object.entries(obj);
  if (entries.length === 0) out += `    pass\n`;
  
  for (const [key, val] of entries) {
    let t = "Any";
    if (typeof val === "string") t = "str";
    if (typeof val === "number") {
       t = Number.isInteger(val) ? "int" : "float";
    }
    if (typeof val === "boolean") t = "bool";
    if (Array.isArray(val)) t = "List[Any]";
    out += `    ${key}: ${t}\n`;
  }
  return out;
}

interface ToCodePaneProps {
  content: string;
}

export default function ToCodePane({ content }: ToCodePaneProps) {
  const [lang, setLang] = useState<TargetLanguage>('typescript');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!content.trim()) {
      setOutput(''); return;
    }
    try {
      const parsed = JSON.parse(content);
      if (lang === 'typescript') setOutput(generateTypescript(parsed));
      if (lang === 'csharp') setOutput(generateCSharp(parsed));
      if (lang === 'python') setOutput(generatePython(parsed));
    } catch {
      setOutput('// Invalid JSON -> Cannot generate code.');
    }
  }, [content, lang]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0D]">
       <div className="h-10 bg-[#161616] border-b border-[#2A2A2A] flex items-center px-4 justify-between">
         <div className="flex items-center gap-4">
           <span className="text-gray-400 text-[10px] uppercase font-bold">Export Classes Mode</span>
           <div className="flex gap-2">
              {(['typescript', 'csharp', 'python'] as TargetLanguage[]).map(fmt => (
                 <button
                   key={fmt}
                   onClick={() => setLang(fmt)}
                   className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                     lang === fmt ? 'bg-[#FFB100] text-[#0D0D0D]' : 'text-gray-400 hover:text-gray-200'
                   }`}
                 >
                   {fmt === 'csharp' ? 'C#' : fmt}
                 </button>
              ))}
           </div>
         </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={lang}
          value={output}
          theme="jeyjson-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
