import React, { useState, useEffect } from 'react';
import { Copy, ArrowRightLeft } from 'lucide-react';
import YAML from 'yaml';
import { js2xml } from 'xml-js';

// Simple fallback naive to_csv converter 
function jsonToCsv(json: any): string {
  if (!json) return '';
  let arr = Array.isArray(json) ? json : [json];
  if (arr.length === 0) return '';
  
  // Extract all unique headers
  const headers = Array.from(new Set(arr.flatMap(obj => Object.keys(obj))));
  
  const csvRows = [];
  // Header row
  csvRows.push(headers.join(','));
  
  // Data rows
  for (const obj of arr) {
    const values = headers.map(header => {
      const val = obj[header];
      if (val === null || val === undefined) return '';
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape quotes
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\\n');
}

interface ConverterPaneProps {
  content: string;
}

export default function ConverterPane({ content }: ConverterPaneProps) {
  const [outputFormat, setOutputFormat] = useState<'yaml'|'xml'|'csv'>('yaml');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!content.trim()) {
      setOutput('');
      setError('');
      return;
    }
    
    try {
      const obj = JSON.parse(content);
      setError('');
      if (outputFormat === 'yaml') {
        setOutput(YAML.stringify(obj));
      } else if (outputFormat === 'xml') {
        // Requires root element for xml
        const xmlObj = { root: obj };
        setOutput(js2xml(xmlObj, { compact: true, spaces: 2 }));
      } else if (outputFormat === 'csv') {
        setOutput(jsonToCsv(obj));
      }
    } catch (e: any) {
      setError(e.message || 'Invalid JSON input');
      setOutput('');
    }
  }, [content, outputFormat]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0D]">
      <div className="h-10 bg-[#161616] border-b border-[#2A2A2A] flex items-center px-4 justify-between">
         <div className="flex items-center gap-4">
           <span className="text-gray-400 text-[10px] uppercase font-bold">Convert JSON to</span>
           <div className="flex gap-2">
              {(['yaml', 'xml', 'csv'] as const).map(fmt => (
                 <button
                   key={fmt}
                   onClick={() => setOutputFormat(fmt)}
                   className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                     outputFormat === fmt ? 'bg-[#FFB100] text-[#0D0D0D]' : 'text-gray-400 hover:text-gray-200'
                   }`}
                 >
                   {fmt}
                 </button>
              ))}
           </div>
         </div>
         <button onClick={copyToClipboard} disabled={!output} className="text-[10px] uppercase font-bold bg-[#FFB100] hover:bg-[#D99500] text-[#0D0D0D] px-3 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50">
           <Copy className="w-3 h-3" /> Copy Output
         </button>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden relative">
        {error ? (
          <div className="h-full flex items-center justify-center text-red-500 font-mono text-sm mix-blend-screen bg-red-900/10 border border-red-900/50 rounded-lg p-6">
            Error parsing Input JSON: {error}
          </div>
        ) : (
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            className="w-full h-full bg-[#121212] border border-[#2A2A2A] rounded p-4 font-mono text-sm text-[#D4D4D4] resize-none focus:outline-none focus:border-[#444] custom-scrollbar"
          />
        )}
      </div>
    </div>
  );
}
