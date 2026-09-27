import React, { useState } from 'react';
import { X, Sparkles, Check, RefreshCw } from 'lucide-react';
import { parseArrayToTree, buildBSTFromNumbers, treeToArray } from '../utils/treeLayout';

export default function TreeBuilderModal({ isOpen, onClose, onApplyTree, currentTree }) {
  const [mode, setMode] = useState('array'); // 'array' | 'bst' | 'preset'
  const [arrayInput, setArrayInput] = useState('[8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]');
  const [bstInput, setBstInput] = useState('8, 3, 10, 1, 6, 14, 4, 7, 13');
  const [previewError, setPreviewError] = useState('');

  if (!isOpen) return null;

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

  const handleApply = () => {
    setPreviewError('');
    try {
      let newTree = null;
      if (mode === 'array') {
        const parsed = JSON.parse(arrayInput);
        if (!Array.isArray(parsed)) throw new Error('Input must be a valid JSON array');
        newTree = parseArrayToTree(parsed);
      } else if (mode === 'bst') {
        const nums = bstInput
          .split(/[\s,]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(Number);
        if (nums.some(isNaN)) throw new Error('Please enter valid numbers separated by commas');
        newTree = buildBSTFromNumbers(nums);
      }
      onApplyTree(newTree);
      onClose();
    } catch (err) {
      setPreviewError(err.message || 'Invalid tree format');
    }
  };

  const handleSelectPreset = (presetData) => {
    const tree = parseArrayToTree(presetData);
    onApplyTree(tree);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Custom Tree Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setMode('array')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              mode === 'array'
                ? 'bg-slate-900 text-sky-400 border-slate-800'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            LeetCode Array Format
          </button>
          <button
            onClick={() => setMode('bst')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              mode === 'bst'
                ? 'bg-slate-900 text-sky-400 border-slate-800'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            BST Value Sequence
          </button>
          <button
            onClick={() => setMode('preset')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              mode === 'preset'
                ? 'bg-slate-900 text-sky-400 border-slate-800'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Quick Presets
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'array' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Level-Order Array (LeetCode Format):
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Enter array nodes in level order from top to bottom. Use <code className="text-sky-300 font-mono">null</code> for missing children.
                </p>
                <textarea
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500"
                  placeholder="[3, 9, 20, null, null, 15, 7]"
                />
              </div>

              <div className="flex gap-2 flex-wrap text-[11px]">
                <button
                  onClick={() => setArrayInput('[4, 2, 7, 1, 3]')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                >
                  [4, 2, 7, 1, 3]
                </button>
                <button
                  onClick={() => setArrayInput('[3, 9, 20, null, null, 15, 7]')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                >
                  [3, 9, 20, null, null, 15, 7]
                </button>
                <button
                  onClick={() => setArrayInput('[1, 2, 2, 3, 4, 4, 3]')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                >
                  [1, 2, 2, 3, 4, 4, 3]
                </button>
              </div>
            </div>
          )}

          {mode === 'bst' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  BST Insert Sequence:
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Enter comma-separated numbers. Nodes will be inserted one by one into a Binary Search Tree.
                </p>
                <input
                  type="text"
                  value={bstInput}
                  onChange={(e) => setBstInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500"
                  placeholder="8, 3, 10, 1, 6, 14, 4, 7, 13"
                />
              </div>

              <div className="flex gap-2 flex-wrap text-[11px]">
                <button
                  onClick={() => setBstInput('50, 30, 70, 20, 40, 60, 80')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                >
                  50, 30, 70, 20, 40, 60, 80
                </button>
                <button
                  onClick={() => setBstInput('8, 3, 10, 1, 6, 14, 4, 7, 13')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                >
                  8, 3, 10, 1, 6, 14, 4, 7, 13
                </button>
              </div>
            </div>
          )}

          {mode === 'preset' && (
            <div className="grid grid-cols-2 gap-3">
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(p.data)}
                  className="p-3 bg-slate-950/70 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-sky-300">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded truncate">
                    [{p.data.join(', ')}]
                  </div>
                </div>
              ))}
            </div>
          )}

          {previewError && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
              {previewError}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode !== 'preset' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950/80 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-900/30 transition-all"
            >
              <Check className="w-4 h-4" />
              Apply Tree
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
