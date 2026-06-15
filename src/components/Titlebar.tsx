import React, { useEffect, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function Titlebar({ theme }: { theme?: 'dark' | 'light' }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: any;
    async function checkMaximize() {
      if ((window as any).__TAURI__) {
        try {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          const appWindow = getCurrentWindow();
          setIsMaximized(await appWindow.isMaximized());
          
          unlisten = await appWindow.onResized(async () => {
            setIsMaximized(await appWindow.isMaximized());
          });
        } catch(e) {
          console.warn("Tauri Window API not available");
        }
      }
    }
    checkMaximize();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const minimize = async () => {
    if ((window as any).__TAURI__) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().minimize();
    }
  };

  const toggleMaximize = async () => {
    if ((window as any).__TAURI__) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().toggleMaximize();
    }
  };

  const close = async () => {
    if ((window as any).__TAURI__) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().close();
    }
  };

  return (
    <div 
      data-tauri-drag-region 
      className={`h-9 flex select-none items-center justify-between z-[100] transition-colors shrink-0 ${theme === 'light' ? 'bg-[#E5E5E5] border-b border-gray-300' : 'bg-[#0A0A0A] border-b border-[#2A2A2A]'}`}
    >
      <div className="flex items-center gap-2 pl-3 pointer-events-none" data-tauri-drag-region>
        <div className="w-5 h-5 bg-[#FFB100] rounded-sm flex items-center justify-center shrink-0">
          <span className="text-[#0D0D0D] font-black text-xs">J</span>
        </div>
        <span className={`font-bold tracking-tight text-xs uppercase opacity-80 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`} data-tauri-drag-region>
          JeyJson
        </span>
      </div>

      <div className="flex h-full">
        <div onClick={minimize} className={`flex items-center justify-center w-11 h-full cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-700 hover:bg-black/5 hover:text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <Minus className="w-4 h-4" />
        </div>
        <div onClick={toggleMaximize} className={`flex items-center justify-center w-11 h-full cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-700 hover:bg-black/5 hover:text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <Square className="w-3.5 h-3.5" />
        </div>
        <div onClick={close} className={`flex items-center justify-center w-11 h-full cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-700 hover:bg-red-500 hover:text-white' : 'text-gray-400 hover:bg-red-500 hover:text-white'}`}>
          <X className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
