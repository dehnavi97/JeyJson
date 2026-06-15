import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface HttpClientPaneProps {
  onApplyResponse: (json: string) => void;
}

export default function HttpClientPane({ onApplyResponse }: HttpClientPaneProps) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    try {
      let parsedHeaders = {};
      try { parsedHeaders = JSON.parse(headers); } catch(e) {}
      
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method,
          headers: parsedHeaders,
          body: body ? String(body) : undefined
        })
      });
      const data = await res.json();
      setStatus(data.status);
      
      const resText = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
      setResponse(resText);
    } catch (e: any) {
      setStatus(0);
      setResponse(e.message || 'Error executing request.');
    } finally {
      setLoading(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0D]">
       <div className="h-14 border-b border-[#2A2A2A] bg-[#161616] p-2 flex gap-2 w-full">
            <select
               value={method}
               onChange={(e) => setMethod(e.target.value)}
               className="bg-[#121212] border border-[#2A2A2A] text-white text-xs rounded px-3 focus:outline-none focus:border-[#FFB100] h-full transition-colors font-bold"
            >
               {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
               type="text"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               placeholder="Enter API URL"
               className="flex-1 bg-[#121212] border border-[#2A2A2A] text-white text-sm rounded px-4 focus:outline-none focus:border-[#FFB100] h-full transition-colors font-mono"
            />
            <button
               onClick={handleSend}
               disabled={loading}
               className="bg-[#FFB100] hover:bg-[#D99500] text-[#0D0D0D] font-bold uppercase text-[10px] rounded px-6 flex items-center justify-center transition-colors h-full disabled:opacity-50"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />}
               {loading ? 'Sending' : 'Send'}
            </button>
       </div>

       <div className="flex flex-1 overflow-hidden">
          {/* Request Config Pane */}
          <div className="w-1/2 border-r border-[#2A2A2A] flex flex-col bg-[#0D0D0D]">
             <div className="p-3 bg-[#121212] border-b border-[#2A2A2A] text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                Request Headers (JSON)
             </div>
             <div className="h-[30%]">
                <Editor
                  language="json"
                  value={headers}
                  onChange={(v) => setHeaders(v || '')}
                  theme="jeyjson-dark"
                  options={{ minimap: { enabled: false }, lineNumbers: 'off' }}
                />
             </div>
             
             {['POST', 'PUT', 'PATCH'].includes(method) && (
               <>
                 <div className="p-3 bg-[#121212] border-y border-[#2A2A2A] text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Request Body
                 </div>
                 <div className="flex-1">
                    <Editor
                      language="json"
                      value={body}
                      onChange={(v) => setBody(v || '')}
                      theme="jeyjson-dark"
                      options={{ minimap: { enabled: false }, lineNumbers: 'off' }}
                    />
                 </div>
               </>
             )}
          </div>

          {/* Response Pane */}
          <div className="w-1/2 flex flex-col bg-[#0D0D0D]">
             <div className="p-3 bg-[#121212] border-b border-[#2A2A2A] text-[10px] font-bold tracking-wider text-gray-500 uppercase flex items-center justify-between">
                <span>Response</span>
                {status !== null && (
                   <span className={`px-2 py-0.5 rounded ${status >= 200 && status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                     Status: {status}
                   </span>
                )}
             </div>
             <div className="flex-1 relative">
                <Editor
                  language="json"
                  value={response}
                  theme="jeyjson-dark"
                  options={{ minimap: { enabled: false }, readOnly: true, lineNumbers: 'off' }}
                />
             </div>
             <div className="p-3 border-t border-[#2A2A2A] flex justify-end bg-[#121212]">
                <button
                   onClick={() => onApplyResponse(response)}
                   disabled={!response}
                   className="bg-[#222] hover:bg-[#333] text-gray-300 border border-[#2A2A2A] text-[10px] uppercase font-bold rounded px-4 py-2 disabled:opacity-50 transition-colors"
                >
                   Open in Editor
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
