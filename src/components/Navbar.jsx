import React from 'react';
import {
  Binary,
  Layers,
  Sparkles,
  BookOpen,
  Code2,
  ChevronDown,
  GitBranch,
  Network,
} from 'lucide-react';
import { ALGORITHMS, ALGORITHM_CATEGORIES } from '../data/algorithmsData';

export default function Navbar({
  selectedAlgoId,
  onSelectAlgo,
  algoParams,
  onChangeParam,
  onOpenTreeBuilder,
  onOpenCustomCode,
  onOpenGuide,
  viewMode,
  onChangeViewMode,
  onRebuildSteps,
  isCustomCodeActive = false,
}) {
  const currentAlgo = ALGORITHMS[selectedAlgoId] || ALGORITHMS['bst_insert'];
  const isGraph = currentAlgo.category === 'graph';
  const isRecursionOnly = currentAlgo.category === 'recursion';

  return (
    <header className="bg-slate-950/95 border-b border-slate-800/90 px-4 py-2.5 backdrop-blur-md sticky top-0 z-30 select-none shadow-xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 shadow-lg shadow-sky-500/25 border border-sky-400/30">
            <Binary className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 font-mono">
                <span>TreeViz</span>
                <span className="text-[10px] text-sky-400 font-bold bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800/60 font-sans">
                  C++ DSA
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Tree · Graph · Recursion Call Stack Debugger
            </p>
          </div>
        </div>

        {/* Center: Algorithm Picker & Parameters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category / Algorithm Dropdown */}
          <div className="relative">
            <select
              value={selectedAlgoId}
              onChange={(e) => onSelectAlgo(e.target.value)}
              className={`bg-slate-900 hover:bg-slate-850 text-slate-100 text-xs font-semibold rounded-xl border ${
                isCustomCodeActive ? 'border-purple-500 text-purple-300' : 'border-slate-700/80'
              } px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-sky-500 shadow-inner cursor-pointer`}
            >
              {isCustomCodeActive && (
                <option value="custom_cpp_code">⚡ Custom C++ Code Solution</option>
              )}
              {ALGORITHM_CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={`── ${cat.name} ──`}>
                  {Object.values(ALGORITHMS)
                    .filter((algo) => algo.category === cat.id)
                    .map((algo) => (
                      <option key={algo.id} value={algo.id}>
                        {algo.name} ({algo.difficulty})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Dynamic Parameters Inputs */}
          {!isCustomCodeActive && currentAlgo.paramConfigs && currentAlgo.paramConfigs.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              {currentAlgo.paramConfigs.map((cfg) => (
                <div key={cfg.name} className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{cfg.label}:</span>
                  <input
                    type="number"
                    min={cfg.min}
                    max={cfg.max}
                    value={algoParams[cfg.name] !== undefined ? algoParams[cfg.name] : cfg.default}
                    onChange={(e) => onChangeParam(cfg.name, Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-sky-400 text-center focus:outline-none focus:border-sky-500"
                  />
                </div>
              ))}
              <button
                onClick={onRebuildSteps}
                className="px-2 py-0.5 bg-sky-600/30 hover:bg-sky-600/60 text-sky-300 text-[11px] font-bold rounded border border-sky-500/30 transition-colors"
                title="Apply parameter changes"
              >
                Apply
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          {!isGraph && !isRecursionOnly && (
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onChangeViewMode('tree')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'tree'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tree Memory View"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Tree View</span>
              </button>

              <button
                onClick={() => onChangeViewMode('recursion')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'recursion'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Recursion Call Tree View"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Call Tree</span>
              </button>

              <button
                onClick={() => onChangeViewMode('dual')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'dual'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Dual View (Tree + Call Tree)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dual</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Custom C++ Code Button + Tree Builder + DSA Guide */}
        <div className="flex items-center gap-2">
          {/* Custom C++ Code Button */}
          <button
            onClick={onOpenCustomCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600/30 to-sky-600/30 hover:from-purple-600/50 hover:to-sky-600/50 text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-500/50 transition-all shadow-lg shadow-purple-950/40"
            title="Write and visualize any custom C++ code"
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Custom C++ Code</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          {!isGraph && (
            <button
              onClick={onOpenTreeBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tree Input</span>
            </button>
          )}

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 hover:text-white rounded-xl text-xs font-bold border border-sky-700/60 transition-all shadow-lg shadow-sky-950/40"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>DSA Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
}
