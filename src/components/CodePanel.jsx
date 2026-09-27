import React, { useRef, useEffect } from 'react';
import { Copy, Check, Code2, Circle } from 'lucide-react';

export default function CodePanel({
  cppCode = '',
  currentLine = 1,
  breakpoints = new Set(),
  onToggleBreakpoint = () => {},
  variables = {},
  actionType = '',
}) {
  const [copied, setCopied] = React.useState(false);
  const codeContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && codeContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentLine]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cppCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = cppCode.split('\n');

  // Syntax highlighting helper
  const renderHighlightedCode = (text) => {
    // Basic regex syntax colorizer for C++
    const tokens = [];
    let remaining = text;

    // Handle comments
    const commentIdx = remaining.indexOf('//');
    let comment = '';
    if (commentIdx !== -1) {
      comment = remaining.slice(commentIdx);
      remaining = remaining.slice(0, commentIdx);
    }

    const keywords = ['struct', 'int', 'bool', 'void', 'long', 'return', 'if', 'else', 'while', 'for', 'new', 'delete', 'nullptr', 'NULL', 'true', 'false', 'vector', 'queue', 'cout', 'endl', 'max', 'abs', 'LONG_MIN', 'LONG_MAX'];
    const typeTokens = ['TreeNode*', 'TreeNode', 'auto', 'size_t'];

    const words = remaining.split(/(\s+|[(),;-><+*!=&|{}[\]])/);

    const renderedWords = words.map((w, i) => {
      if (keywords.includes(w)) {
        return <span key={i} className="text-purple-400 font-semibold">{w}</span>;
      }
      if (typeTokens.includes(w)) {
        return <span key={i} className="text-emerald-400 font-semibold">{w}</span>;
      }
      if (/^\d+$/.test(w)) {
        return <span key={i} className="text-amber-300">{w}</span>;
      }
      if (['left', 'right', 'val'].includes(w)) {
        return <span key={i} className="text-sky-300 font-medium">{w}</span>;
      }
      if (['root', 'temp', 'succ', 'curr', 'p', 'q', 'u', 'v', 'adj', 'visited'].includes(w)) {
        return <span key={i} className="text-rose-300 font-medium">{w}</span>;
      }
      if (['->', '==', '!=', '<', '>', '<=', '>=', '=', '+', '-', '*', '&', '&&', '||'].includes(w)) {
        return <span key={i} className="text-slate-400 font-bold">{w}</span>;
      }
      return <span key={i} className="text-slate-200">{w}</span>;
    });

    return (
      <>
        {renderedWords}
        {comment && <span className="text-slate-500 italic">{comment}</span>}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200 font-mono tracking-wide">solution.cpp</span>
          <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded font-mono">C++20</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded transition-colors"
          title="Copy C++ Code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-mono">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Lines Body */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-y-auto overflow-x-auto py-2 font-mono text-xs leading-relaxed select-text"
      >
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const isActive = lineNum === currentLine;
          const hasBreakpoint = breakpoints.has(lineNum);

          let lineBgClass = 'hover:bg-slate-900/50';
          if (isActive) {
            if (actionType === 'DELETE') {
              lineBgClass = 'highlight-delete-line bg-rose-950/40 text-rose-200 font-semibold';
            } else if (actionType === 'RETURN') {
              lineBgClass = 'highlight-return-line bg-emerald-950/40 text-emerald-200 font-semibold';
            } else {
              lineBgClass = 'highlight-active-line bg-sky-950/40 text-sky-100 font-semibold';
            }
          }

          return (
            <div
              key={lineNum}
              ref={isActive ? activeLineRef : null}
              className={`flex items-center group py-0.5 px-2 transition-colors ${lineBgClass}`}
            >
              {/* Breakpoint Marker */}
              <button
                onClick={() => onToggleBreakpoint(lineNum)}
                className="w-5 flex items-center justify-center cursor-pointer select-none"
                title={`Toggle breakpoint at line ${lineNum}`}
              >
                {hasBreakpoint ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700/0 group-hover:bg-slate-700 transition-colors" />
                )}
              </button>

              {/* Line Number */}
              <span
                onClick={() => onToggleBreakpoint(lineNum)}
                className={`w-7 text-right pr-3 select-none text-[11px] cursor-pointer ${
                  isActive ? 'text-sky-400 font-bold' : 'text-slate-600 group-hover:text-slate-400'
                }`}
              >
                {lineNum}
              </span>

              {/* Active Pointer Arrow */}
              <span className="w-4 flex items-center justify-center select-none text-sky-400">
                {isActive && '▶'}
              </span>

              {/* Code Content */}
              <div className="flex-1 whitespace-pre pl-1">
                {renderHighlightedCode(lineText)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakpoint Hint */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Click line numbers to toggle breakpoints (🔴)</span>
        <span className="text-slate-400 font-mono">Line {currentLine} / {lines.length}</span>
      </div>
    </div>
  );
}
