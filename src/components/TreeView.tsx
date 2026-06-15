import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface TreeViewProps {
  data: any;
  name?: string | null;
  isRoot?: boolean;
}

export default function TreeView({ data, name = null, isRoot = true }: TreeViewProps) {
  const [expanded, setExpanded] = useState(true);

  if (data === undefined) return null;

  const isArray = Array.isArray(data);
  const isObject = data !== null && typeof data === 'object' && !isArray;

  if (!isObject && !isArray) {
    // Primitive
    let valClass = "text-[#B5CEA8]"; // number or bool by default
    let displayVal = String(data);
    if (typeof data === 'string') {
      valClass = "text-[#CE9178]";
      displayVal = `"${data}"`;
    } else if (data === null) {
      valClass = "text-gray-500";
      displayVal = "null";
    }

    return (
      <div className="flex font-mono text-[13px] leading-relaxed pl-4">
        {name !== null && <span className="text-[#9CDCFE] mr-2">{name}:</span>}
        <span className={valClass}>{displayVal}</span>
      </div>
    );
  }

  const items = isArray ? data : Object.keys(data);
  const isEmpty = items.length === 0;

  return (
    <div className={cn("font-mono text-[13px] leading-relaxed", !isRoot && "pl-4")}>
      <div 
        className="flex items-center cursor-pointer hover:bg-[#1E1E1E] rounded px-1 -ml-1 select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-4 h-4 flex items-center justify-center mr-1 text-[#FFB100] opacity-80">
          {!isEmpty && (expanded ? <span className="text-[10px]">▼</span> : <span className="text-[10px]">▶</span>)}
        </span>
        {name !== null && <span className={cn(isRoot ? "text-white" : "text-[#9CDCFE]", "mr-2")}>{name}{!isRoot && ':'}</span>}
        
        {!expanded && isEmpty && <span className="text-[#FFB100]">{isArray ? '[]' : '{}'}</span>}
        
        {expanded && <span className="text-[#FFB100]">{isArray ? '[' : '{'}</span>}
        
        {!expanded && !isEmpty && (
          <>
            <span className="text-gray-500 text-[10px] mx-1">
              {isArray ? '[' : '{'}{items.length} {items.length === 1 ? 'item' : 'items'}{isArray ? ']' : '}'}
            </span>
          </>
        )}
      </div>

      {expanded && !isEmpty && (
        <div className="border-l border-[#2A2A2A] ml-2 pl-2">
          {isArray 
            ? data.map((item: any, idx: number) => <TreeView key={idx} data={item} name={String(idx)} isRoot={false} />)
            : items.map((key: string) => <TreeView key={key} data={data[key]} name={key} isRoot={false} />)
          }
        </div>
      )}

      {expanded && !isEmpty && (
        <div className="text-[#FFB100]">{isArray ? ']' : '}'}</div>
      )}
    </div>
  );
}
