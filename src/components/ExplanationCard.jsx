import React from 'react';
import { Lightbulb, Terminal, AlertCircle, HelpCircle } from 'lucide-react';

export default function ExplanationCard({
  explanation = '',
  actionType = '',
  pointers = {},
  variables = {},
  currentLine = 1,
  algorithmMeta = {},
}) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-3.5 shadow-2xl flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Line {currentLine} Execution Breakdown
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {algorithmMeta.name || 'Tree Algorithm'}
        </span>
      </div>

      {/* Main Plain English Explanation */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
        <p className="font-medium text-slate-100">{explanation}</p>
      </div>

      {/* C++ Pointer / Memory Insight */}
      <div className="flex items-start gap-2 bg-sky-950/30 border border-sky-800/40 rounded-lg p-2.5 text-[11px] text-sky-200 leading-relaxed">
        <Terminal className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-300">C++ Memory Pointer Insight: </span>
          {actionType === 'CREATE_NODE' && (
            <span>Heap memory allocated with <code className="text-amber-300 bg-slate-900 px-1 py-0.2 rounded font-mono">new TreeNode(val)</code>. Returns address to be assigned to parent's left/right pointer.</span>
          )}
          {actionType === 'DELETE' && (
            <span><code className="text-rose-400 bg-slate-900 px-1 py-0.2 rounded font-mono">delete root;</code> frees heap memory at this node address to prevent memory leaks.</span>
          )}
          {actionType === 'POINTER_UPDATE' && (
            <span>Rewiring pointer: Parent updates its <code className="text-emerald-300 bg-slate-900 px-1 py-0.2 rounded font-mono">root-&gt;left / root-&gt;right</code> pointer with the returned subtree root address.</span>
          )}
          {actionType === 'BASE_CASE' && (
            <span>Base case reached. Call stack pauses and begins unwinding (returning return value back up to caller frame).</span>
          )}
          {actionType === 'SWAP' && (
            <span>Pointer swap reassigns pointers <code className="text-purple-300 bg-slate-900 px-1 py-0.2 rounded font-mono">TreeNode* temp = root-&gt;left; root-&gt;left = root-&gt;right;</code> directly in memory.</span>
          )}
          {(!['CREATE_NODE', 'DELETE', 'POINTER_UPDATE', 'BASE_CASE', 'SWAP'].includes(actionType)) && (
            <span>Stack frame stores local parameters <code className="text-slate-300 font-mono">root</code> and returns pointer address to maintain binary tree connectivity.</span>
          )}
        </div>
      </div>
    </div>
  );
}
