import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  RefreshCw,
  GitFork,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Palette,
  Eye,
} from 'lucide-react';
import { parseArrayToTree, buildBSTFromNumbers, treeToArray } from '../utils/treeLayout';

export default function TreeBuilderModal({ isOpen, onClose, onApplyTree, currentTree }) {
  const [mode, setMode] = useState('multi'); // 'multi' | 'array' | 'bst' | 'preset'
  const [arrayInput, setArrayInput] = useState('[8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]');
  const [bstInput, setBstInput] = useState('8, 3, 10, 1, 6, 14, 4, 7, 13');

  // Dynamic Multi-Tree list (supports 2, 3, 4, ... N trees)
  const [multiTrees, setMultiTrees] = useState([
    { id: 't1', title: 'Tree 1 (Alpha - Target)', theme: 'sky', input: '[1, 3, 2, 5]' },
    { id: 't2', title: 'Tree 2 (Beta - Source)', theme: 'purple', input: '[2, 1, 3, null, 4, null, 7]' },
    { id: 't3', title: 'Tree 3 (Gamma - Source)', theme: 'emerald', input: '[3, null, 2, null, null, 1, 6]' },
  ]);

  const [previewError, setPreviewError] = useState('');

  if (!isOpen) return null;

  const THEMES = [
    { id: 'sky', label: 'Sky Blue', color: 'bg-sky-500' },
    { id: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
    { id: 'rose', label: 'Rose Pink', color: 'bg-rose-500' },
    { id: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
  ];

  const presets = [
    {
      name: 'Balanced BST',
      desc: 'Standard balanced binary search tree',
      data: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
    },
    {
      name: 'Perfect Binary Tree',
      desc: 'All internal nodes have 2 children, leaves at same level',
      data: [4, 2, 6, 1, 3, 5, 7],
    },
    {
      name: 'Symmetric / Mirror Tree',
      desc: 'Tree mirrored around root',
      data: [1, 2, 2, 3, 4, 4, 3],
    },
    {
      name: 'Left-Skewed Tree',
      desc: 'Degenerate tree resembling a linked list',
      data: [5, 4, null, 3, null, null, null, 2, null, null, null, null, null, null, null, 1],
    },
    {
      name: 'LeetCode Max Depth Tree',
      desc: 'Classic interview tree example',
      data: [3, 9, 20, null, null, 15, 7],
    },
    {
      name: 'Path Sum Tree',
      desc: 'Tree with various path sums',
      data: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1],
    },
  ];

  const multiPresets = [
    {
      name: '3-Tree Merge Studio (Alpha + Beta + Gamma)',
      desc: '3 binary trees merged simultaneously with values summed & subtrees spliced',
      trees: [
        { id: 't1', title: 'Tree 1 (Alpha - Target)', theme: 'sky', input: '[1, 3, 2, 5]' },
        { id: 't2', title: 'Tree 2 (Beta - Source)', theme: 'purple', input: '[2, 1, 3, null, 4, null, 7]' },
        { id: 't3', title: 'Tree 3 (Gamma - Source)', theme: 'emerald', input: '[3, null, 2, null, null, 1, 6]' },
      ],
    },
    {
      name: '3-Way Identical Tree Comparison',
      desc: '3 identical binary trees compared in lockstep',
      trees: [
        { id: 't1', title: 'Tree 1 (Alpha)', theme: 'sky', input: '[1, 2, 3, 4, 5]' },
        { id: 't2', title: 'Tree 2 (Beta)', theme: 'purple', input: '[1, 2, 3, 4, 5]' },
        { id: 't3', title: 'Tree 3 (Gamma)', theme: 'emerald', input: '[1, 2, 3, 4, 5]' },
      ],
    },
    {
      name: 'LeetCode 617: Merge Two Trees Pair',
      desc: 'Overlapping nodes merge, non-overlapping nodes splice directly',
      trees: [
        { id: 't1', title: 'Tree 1 (Target)', theme: 'sky', input: '[1, 3, 2, 5]' },
        { id: 't2', title: 'Tree 2 (Source)', theme: 'purple', input: '[2, 1, 3, null, 4, null, 7]' },
      ],
    },
    {
      name: 'LeetCode 100: Same Tree Pair',
      desc: 'Both trees have identical topology and node values',
      trees: [
        { id: 't1', title: 'Tree 1 (p)', theme: 'sky', input: '[1, 2, 3]' },
        { id: 't2', title: 'Tree 2 (q)', theme: 'purple', input: '[1, 2, 3]' },
      ],
    },
    {
      name: 'LeetCode 572: Subtree of Another Tree',
      desc: 'Tree 2 is an exact subtree present inside Tree 1',
      trees: [
        { id: 't1', title: 'Main Tree (root)', theme: 'sky', input: '[3, 4, 5, 1, 2]' },
        { id: 't2', title: 'Target Subtree (subRoot)', theme: 'purple', input: '[4, 1, 2]' },
      ],
    },
    {
      name: '4-Tree Distributed Hierarchy',
      desc: '4 distinct trees for multi-source distributed tree operations',
      trees: [
        { id: 't1', title: 'Cluster 1', theme: 'sky', input: '[10, 5, 15]' },
        { id: 't2', title: 'Cluster 2', theme: 'purple', input: '[20, 10, 30]' },
        { id: 't3', title: 'Cluster 3', theme: 'emerald', input: '[5, 2, 8]' },
        { id: 't4', title: 'Cluster 4', theme: 'amber', input: '[15, 12, 18]' },
      ],
    },
  ];

  const handleAddTree = () => {
    if (multiTrees.length >= 6) return;
    const newIdx = multiTrees.length + 1;
    const themeKeys = ['sky', 'purple', 'emerald', 'amber', 'rose', 'indigo'];
    const nextTheme = themeKeys[(newIdx - 1) % themeKeys.length];
    setMultiTrees((prev) => [
      ...prev,
      {
        id: `t${newIdx}`,
        title: `Tree ${newIdx}`,
        theme: nextTheme,
        input: `[${newIdx}, ${newIdx + 1}, ${newIdx + 2}]`,
      },
    ]);
  };

  const handleRemoveTree = (indexToRemove) => {
    if (multiTrees.length <= 2) return;
    setMultiTrees((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateTree = (index, field, value) => {
    setMultiTrees((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [field]: value } : t))
    );
  };

  const handleApply = () => {
    setPreviewError('');
    try {
      if (mode === 'multi') {
        const parsedList = [];
        for (let i = 0; i < multiTrees.length; i++) {
          const item = multiTrees[i];
          let arr;
          try {
            arr = JSON.parse(item.input);
          } catch {
            throw new Error(`Tree ${i + 1} (${item.title}): Invalid JSON array format.`);
          }
          if (!Array.isArray(arr)) {
            throw new Error(`Tree ${i + 1} (${item.title}) must be an array (e.g. [1, 2, 3]).`);
          }
          const treeRoot = parseArrayToTree(arr, item.id);
          parsedList.push({
            id: item.id,
            title: item.title,
            theme: item.theme,
            tree: treeRoot,
          });
        }

        onApplyTree(parsedList);
        onClose();
        return;
      }

      let newTree = null;
      if (mode === 'array') {
        const parsed = JSON.parse(arrayInput);
        if (!Array.isArray(parsed)) throw new Error('Input must be a valid JSON array');
        newTree = parseArrayToTree(parsed, 'node');
      } else if (mode === 'bst') {
        const nums = bstInput
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map(Number);
        if (nums.some(isNaN)) throw new Error('Please enter valid numbers separated by commas');
        newTree = buildBSTFromNumbers(nums, 'node_bst');
      }
      onApplyTree(newTree, null);
      onClose();
    } catch (err) {
      setPreviewError(err.message || 'Invalid tree format');
    }
  };

  const handleSelectPreset = (presetData) => {
    const tree = parseArrayToTree(presetData, 'node');
    onApplyTree(tree, null);
    onClose();
  };

  const handleSelectMultiPreset = (p) => {
    setMultiTrees(p.trees);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Custom Tree & Multi-Tree Studio
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  N-Trees Supported
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Design custom single trees or multi-tree configurations (2, 3, or more trees) for simultaneous visualization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 pt-3 gap-2">
          <button
            onClick={() => setMode('multi')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              mode === 'multi'
                ? 'bg-slate-800/90 text-purple-300 border-purple-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            Multi-Tree Studio ({multiTrees.length} Trees)
          </button>
          <button
            onClick={() => setMode('array')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              mode === 'array'
                ? 'bg-slate-800/90 text-sky-300 border-sky-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <GitFork className="w-4 h-4 text-sky-400" />
            Level-Order Array
          </button>
          <button
            onClick={() => setMode('bst')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              mode === 'bst'
                ? 'bg-slate-800/90 text-emerald-300 border-emerald-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Auto BST from Numbers
          </button>
          <button
            onClick={() => setMode('preset')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              mode === 'preset'
                ? 'bg-slate-800/90 text-amber-300 border-amber-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Standard Presets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {previewError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded-xl text-rose-200 text-xs font-medium flex items-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              {previewError}
            </div>
          )}

          {/* MULTI-TREE STUDIO MODE */}
          {mode === 'multi' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-sky-950/40 p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-200">
                    Multi-Tree Architecture ({multiTrees.length} Active Trees)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure 2, 3, 4, or more binary trees. They will render side-by-side with synchronized step pointers, value merging, and subtree splicing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTree}
                  disabled={multiTrees.length >= 6}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tree ({multiTrees.length}/6)
                </button>
              </div>

              {/* Dynamic Tree Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {multiTrees.map((tree, idx) => {
                  const themeObj = THEMES.find((t) => t.id === tree.theme) || THEMES[0];
                  return (
                    <div
                      key={tree.id || idx}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 relative group hover:border-slate-700 transition-all shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${themeObj.color} shadow-sm`}></span>
                          <input
                            type="text"
                            value={tree.title}
                            onChange={(e) => handleUpdateTree(idx, 'title', e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-200 border-b border-transparent hover:border-slate-700 focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                        {multiTrees.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTree(idx)}
                            title="Remove tree"
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Level-Order Array (JSON):
                        </label>
                        <textarea
                          rows={2}
                          value={tree.input}
                          onChange={(e) => handleUpdateTree(idx, 'input', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs font-mono text-slate-200 resize-none focus:outline-none"
                          placeholder="[1, 2, 3, null, 4]"
                        />
                      </div>

                      {/* Theme Selector */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500">Theme:</span>
                        {THEMES.map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => handleUpdateTree(idx, 'theme', th.id)}
                            title={th.label}
                            className={`w-4 h-4 rounded-full ${th.color} transition-transform ${
                              tree.theme === th.id
                                ? 'scale-125 ring-2 ring-white/80'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Multi-Tree Presets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Quick Multi-Tree Presets:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {multiPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectMultiPreset(p)}
                      className="p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="font-bold text-xs text-purple-300 group-hover:text-purple-200">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {p.desc}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-2">
                        {p.trees.length} Trees: {p.trees.map((t) => t.title).join(' · ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SINGLE ARRAY MODE */}
          {mode === 'array' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Level-Order Traversal Array (JSON):
                </label>
                <textarea
                  rows={3}
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-xs font-mono text-slate-200 resize-none focus:outline-none"
                  placeholder="[8, 3, 10, 1, 6, null, 14]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: LeetCode standard level-order array with <code className="text-sky-400">null</code> for empty nodes.
                </p>
              </div>
            </div>
          )}

          {/* AUTO BST MODE */}
          {mode === 'bst' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Comma-Separated Numbers (Constructs Valid BST):
                </label>
                <input
                  type="text"
                  value={bstInput}
                  onChange={(e) => setBstInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  placeholder="8, 3, 10, 1, 6, 14, 4, 7, 13"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Numbers will be sequentially inserted into a Binary Search Tree following standard BST invariant (<code className="text-emerald-400">left &lt; root &lt; right</code>).
                </p>
              </div>
            </div>
          )}

          {/* STANDARD SINGLE PRESETS */}
          {mode === 'preset' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.data)}
                  className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-amber-300 group-hover:text-amber-200">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{p.desc}</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                    {JSON.stringify(p.data)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            {mode === 'multi'
              ? `Ready to visualize ${multiTrees.length} trees side-by-side with synchronized operations.`
              : 'Applies tree structure to active visualizer.'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              Apply {mode === 'multi' ? `All ${multiTrees.length} Trees` : 'Tree'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
