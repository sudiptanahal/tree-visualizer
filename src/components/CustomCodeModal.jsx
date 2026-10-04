import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Code2,
  Sparkles,
  Key,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Loader2,
  FileCode,
  Network,
  GitFork,
  Layers,
  Sliders,
  Plus,
} from 'lucide-react';
import { traceCodeWithGemini } from '../engine/geminiTracer';
import { runCustomCppCode, isRecursionOnlyCode } from '../engine/cppParserAndRunner';
import { parseArrayToTree } from '../utils/treeLayout';
import { extractCppParameters } from '../utils/cppParamExtractor';

const CODE_TEMPLATES = [
  // ================= MULTI-TREE TEMPLATES =================
  {
    id: 'merge_two_trees',
    name: '1. Merge Two Binary Trees (LeetCode 617)',
    category: 'multi_tree',
    tree: [1, 3, 2, 5],
    tree2: [2, 1, 3, null, 4, null, 7],
    params: {},
    code: `TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
    // 1. If one node is null, return the other
    if (root1 == nullptr) return root2;
    if (root2 == nullptr) return root1;
    
    // 2. Sum overlapping node values
    root1->val += root2->val;
    
    // 3. Recursively merge left and right child subtrees
    root1->left = mergeTrees(root1->left, root2->left);
    root1->right = mergeTrees(root1->right, root2->right);
    
    return root1;
}`
  },
  {
    id: 'same_tree',
    name: '2. Same Tree / Identical Check (LeetCode 100)',
    category: 'multi_tree',
    tree: [1, 2, 3],
    tree2: [1, 2, 3],
    params: {},
    code: `bool isSameTree(TreeNode* p, TreeNode* q) {
    // 1. Both empty -> identical
    if (p == nullptr && q == nullptr) return true;
    
    // 2. Structural mismatch -> not identical
    if (p == nullptr || q == nullptr) return false;
    
    // 3. Value mismatch -> not identical
    if (p->val != q->val) return false;
    
    // 4. Recursively check both left and right subtrees
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}`
  },
  {
    id: 'subtree_of_tree',
    name: '3. Subtree of Another Tree (LeetCode 572)',
    category: 'multi_tree',
    tree: [3, 4, 5, 1, 2],
    tree2: [4, 1, 2],
    params: {},
    code: `bool isSame(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q || p->val != q->val) return false;
    return isSame(p->left, q->left) && isSame(p->right, q->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (root == nullptr) return false;
    if (isSame(root, subRoot)) return true;
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}`
  },
  {
    id: 'merge_three_trees',
    name: '4. Merge 3 Binary Trees (Multi-Tree)',
    category: 'multi_tree',
    tree: [1, 3, 2, 5],
    tree2: [2, 1, 3, null, 4, null, 7],
    tree3: [3, null, 2, null, null, 1, 6],
    params: {},
    code: `TreeNode* mergeThreeTrees(TreeNode* t1, TreeNode* t2, TreeNode* t3) {
    // 1. If all 3 nodes are nullptr, return nullptr
    if (!t1 && !t2 && !t3) return nullptr;
    
    // 2. Sum overlapping node values across all 3 trees
    int sum = (t1 ? t1->val : 0) + (t2 ? t2->val : 0) + (t3 ? t3->val : 0);
    TreeNode* target = t1 ? t1 : (t2 ? t2 : t3);
    target->val = sum;
    
    // 3. Recurse for left and right children across all 3 trees
    target->left = mergeThreeTrees(t1 ? t1->left : nullptr, 
                                  t2 ? t2->left : nullptr, 
                                  t3 ? t3->left : nullptr);
                                  
    target->right = mergeThreeTrees(t1 ? t1->right : nullptr, 
                                   t2 ? t2->right : nullptr, 
                                   t3 ? t3->right : nullptr);
    
    return target;
}`
  },
  {
    id: 'same_three_trees',
    name: '5. 3-Way Tree Equivalence (Same 3 Trees)',
    category: 'multi_tree',
    tree: [1, 2, 3, 4, 5],
    tree2: [1, 2, 3, 4, 5],
    tree3: [1, 2, 3, 4, 5],
    params: {},
    code: `bool isSameThreeTrees(TreeNode* t1, TreeNode* t2, TreeNode* t3) {
    // 1. If all 3 are null -> identical empty branches
    if (!t1 && !t2 && !t3) return true;
    
    // 2. Structural mismatch across any of the 3 trees
    if (!t1 || !t2 || !t3) return false;
    
    // 3. Node value mismatch
    if (t1->val != t2->val || t2->val != t3->val) return false;
    
    // 4. Recurse across left and right children for all 3 trees
    return isSameThreeTrees(t1->left, t2->left, t3->left) &&
           isSameThreeTrees(t1->right, t2->right, t3->right);
}`
  },

  // ================= PURE RECURSION TEMPLATES =================
  {
    id: 'merge_sort',
    name: '4. Merge Sort (Divide & Conquer)',
    category: 'recursion',
    inputArray: [38, 27, 43, 3, 9, 82, 10],
    params: {},
    code: `void merge(vector<int>& arr, int l, int mid, int r);

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    merge(arr, l, mid, r);
}`
  },
  {
    id: 'fibonacci_rec',
    name: '5. Fibonacci Recursion Tree',
    category: 'recursion',
    inputArray: [],
    params: { n: 4 },
    code: `int fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fib(n - 1) + fib(n - 2);
}`
  },
  {
    id: 'subsets_backtrack',
    name: '6. Subsets / Power Set (Backtracking)',
    category: 'recursion',
    inputArray: [1, 2, 3],
    params: {},
    code: `void generateSubsets(vector<int>& nums, int index, vector<int>& current, vector<vector<int>>& result) {
    if (index == nums.size()) {
        result.push_back(current);
        return;
    }
    current.push_back(nums[index]);
    generateSubsets(nums, index + 1, current, result);
    current.pop_back();
    generateSubsets(nums, index + 1, current, result);
}`
  },

  // ================= SINGLE TREE DSA TEMPLATES =================
  {
    id: 'flatten_tree',
    name: '7. Flatten Binary Tree (LeetCode 114)',
    category: 'tree',
    tree: [1, 2, 5, 3, 4, null, 6],
    params: {},
    code: `void flatten(TreeNode* root) {
    TreeNode* curr = root;
    while (curr != nullptr) {
        if (curr->left != nullptr) {
            TreeNode* prev = curr->left;
            while (prev->right != nullptr) {
                prev = prev->right;
            }
            prev->right = curr->right;
            curr->right = curr->left;
            curr->left = nullptr;
        }
        curr = curr->right;
    }
}`
  },
  {
    id: 'invert_tree',
    name: '8. Invert Binary Tree (LeetCode 226)',
    category: 'tree',
    tree: [4, 2, 7, 1, 3, 6, 9],
    params: {},
    code: `TreeNode* invertTree(TreeNode* root) {
    if (root == nullptr) return nullptr;
    TreeNode* temp = root->left;
    root->left = root->right;
    root->right = temp;
    invertTree(root->left);
    invertTree(root->right);
    return root;
}`
  },
  {
    id: 'count_nodes',
    name: '9. Count Total Nodes (Binary Tree)',
    category: 'tree',
    tree: [3, 9, 20, null, null, 15, 7],
    params: {},
    code: `int countNodes(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}`
  },
];

export default function CustomCodeModal({
  isOpen,
  onClose,
  onApplyCustomSteps,
  apiKey,
  onSaveApiKey,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('merge_three_trees');
  const [code, setCode] = useState(CODE_TEMPLATES[3].code);
  const [treeInput, setTreeInput] = useState(JSON.stringify(CODE_TEMPLATES[3].tree));
  const [tree2Input, setTree2Input] = useState(JSON.stringify(CODE_TEMPLATES[3].tree2 || [2, 1, 3, null, 4, null, 7]));
  const [tree3Input, setTree3Input] = useState(JSON.stringify(CODE_TEMPLATES[3].tree3 || [3, null, 2, null, null, 1, 6]));
  const [showTree3, setShowTree3] = useState(true);
  const [paramsState, setParamsState] = useState({ targetSum: 22, n: 4, val: 5, key: 3, k: 2 });
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useAI, setUseAI] = useState(Boolean(apiKey));
  const [manualMode, setManualMode] = useState(null); // 'auto' | 'recursion' | 'tree' | 'multi_tree'

  // Auto-detect parameters from C++ code
  const detectedParams = useMemo(() => {
    return extractCppParameters(code);
  }, [code]);

  // Sync detected parameter defaults
  useEffect(() => {
    const updated = { ...paramsState };
    detectedParams.forEach((dp) => {
      if (updated[dp.name] === undefined) {
        updated[dp.name] = dp.default;
      }
    });
    setParamsState(updated);
  }, [detectedParams]);

  // Auto-detect whether the current code is Multi-Tree vs Pure Recursion vs Single Tree
  const autoDetectedMode = useMemo(() => {
    const codeLower = (code || '').toLowerCase();
    if (
      (codeLower.includes('treenode* root1') && codeLower.includes('treenode* root2')) ||
      (codeLower.includes('treenode* t1') && codeLower.includes('treenode* t2')) ||
      (codeLower.includes('treenode* p') && codeLower.includes('treenode* q')) ||
      (codeLower.includes('treenode* root') && codeLower.includes('treenode* subroot')) ||
      codeLower.includes('mergetrees') ||
      codeLower.includes('mergethreetrees') ||
      codeLower.includes('samethreetrees') ||
      codeLower.includes('issametree') ||
      codeLower.includes('issubtree')
    ) {
      return 'multi_tree';
    }
    if (isRecursionOnlyCode(code)) return 'recursion';
    return 'tree';
  }, [code]);

  const activeMode = manualMode || autoDetectedMode;

  useEffect(() => {
    if (apiKey) setLocalApiKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmplId) => {
    const tmpl = CODE_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setSelectedTemplateId(tmplId);
      setCode(tmpl.code);
      setTreeInput(JSON.stringify(tmpl.category === 'recursion' ? tmpl.inputArray : tmpl.tree));
      if (tmpl.tree2) {
        setTree2Input(JSON.stringify(tmpl.tree2));
      }
      if (tmpl.tree3) {
        setTree3Input(JSON.stringify(tmpl.tree3));
        setShowTree3(true);
      } else {
        setShowTree3(false);
      }
      if (tmpl.params) {
        setParamsState((prev) => ({ ...prev, ...tmpl.params }));
      }
      setManualMode(tmpl.category);
      setErrorMsg('');
    }
  };

  const handleRun = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      let parsedInput = [];
      try {
        if (treeInput.trim()) {
          parsedInput = JSON.parse(treeInput);
        }
      } catch (err) {
        throw new Error('Invalid Input Array JSON format for Tree 1 (e.g. [1, 3, 2, 5])');
      }

      let parsedTree2 = null;
      let parsedTree3 = null;
      if (activeMode === 'multi_tree') {
        try {
          if (tree2Input.trim()) {
            parsedTree2 = JSON.parse(tree2Input);
          }
        } catch (err) {
          throw new Error('Invalid Input Array JSON format for Tree 2 (e.g. [2, 1, 3, null, 4, null, 7])');
        }
        if (showTree3 && tree3Input.trim()) {
          try {
            parsedTree3 = JSON.parse(tree3Input);
          } catch (err) {
            throw new Error('Invalid Input Array JSON format for Tree 3 (e.g. [3, null, 2, 1, 6])');
          }
        }
      }

      const finalParams = { ...paramsState };

      let generatedSteps = [];

      if (localApiKey.trim()) {
        onSaveApiKey(localApiKey.trim());
      }

      if (useAI && localApiKey.trim()) {
        try {
          generatedSteps = await traceCodeWithGemini(code, parsedInput, finalParams, localApiKey.trim());
        } catch (aiErr) {
          console.warn('Gemini AI tracing failed, using fast built-in evaluator:', aiErr);
          generatedSteps = runCustomCppCode(code, parsedInput, finalParams, activeMode, parsedTree2, parsedTree3);
        }
      } else {
        generatedSteps = runCustomCppCode(code, parsedInput, finalParams, activeMode, parsedTree2, parsedTree3);
      }

      if (!generatedSteps || generatedSteps.length === 0) {
        throw new Error('Failed to generate steps for this code. Please check your syntax or template.');
      }

      const tmpl = CODE_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const algoName = tmpl ? tmpl.name.replace(/^\d+\.\s*/, '') : 'Custom C++ Solution';

      onApplyCustomSteps({
        code,
        name: algoName,
        isRecursion: activeMode === 'recursion',
        isMultiTree: activeMode === 'multi_tree',
        paramConfigs: detectedParams,
        params: finalParams,
        steps: generatedSteps,
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Execution error in custom C++ interpreter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30">
              <Code2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Custom C++ Code & Multi-Tree Runner</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                  C++20
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run single trees, multi-tree operations (Merge / Same Tree), or pure recursion with real-time graph mutations
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Mode Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Target Mode:</span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setManualMode('multi_tree')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeMode === 'multi_tree'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Multi-Tree (2 Trees)
                </button>
                <button
                  type="button"
                  onClick={() => setManualMode('tree')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeMode === 'tree'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  Single Tree
                </button>
                <button
                  type="button"
                  onClick={() => setManualMode('recursion')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeMode === 'recursion'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  Pure Recursion
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Active:{' '}
                <strong className={activeMode === 'multi_tree' ? 'text-purple-400' : activeMode === 'recursion' ? 'text-indigo-400' : 'text-sky-400'}>
                  {activeMode === 'multi_tree' ? 'Multi-Tree Operations (2 Trees)' : activeMode === 'recursion' ? 'Recursion Tree' : 'Single Binary Tree'}
                </strong>
              </span>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-sky-400" />
              Presets & Templates:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              <optgroup label="🌲 Multi-Tree Operations (2 Trees)">
                {CODE_TEMPLATES.filter((t) => t.category === 'multi_tree').map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="🌳 Single Binary Tree DSA">
                {CODE_TEMPLATES.filter((t) => t.category === 'tree').map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="🌿 Pure Recursion">
                {CODE_TEMPLATES.filter((t) => t.category === 'recursion').map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* C++ Code Editor Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                C++ Solution Code:
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {activeMode === 'multi_tree' ? 'Pass (TreeNode* root1, TreeNode* root2)' : 'Pass (TreeNode* root)'}
              </span>
            </div>
            <textarea
              rows={9}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setManualMode(null);
              }}
              placeholder="// Write or paste your C++ code here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed resize-none shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Inputs Grid */}
          {activeMode === 'multi_tree' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-sky-400 block mb-1">
                    Tree 1 (Alpha / Target):
                  </label>
                  <input
                    type="text"
                    value={treeInput}
                    onChange={(e) => setTreeInput(e.target.value)}
                    placeholder="[1, 3, 2, 5]"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-400 block mb-1">
                    Tree 2 (Beta / Source):
                  </label>
                  <input
                    type="text"
                    value={tree2Input}
                    onChange={(e) => setTree2Input(e.target.value)}
                    placeholder="[2, 1, 3, null, 4, null, 7]"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
                {showTree3 ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-emerald-400 block">
                        Tree 3 (Gamma / Source):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTree3(false)}
                        className="text-[10px] text-slate-500 hover:text-rose-400"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={tree3Input}
                      onChange={(e) => setTree3Input(e.target.value)}
                      placeholder="[3, null, 2, 1, 6]"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowTree3(true)}
                      className="w-full py-2 px-3 border border-dashed border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors"
                    >
                      + Add Tree 3 (Multi-Tree)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {activeMode === 'recursion' ? 'Input Array (JSON):' : 'Input Tree (Array JSON):'}
                </label>
                <input
                  type="text"
                  value={treeInput}
                  onChange={(e) => setTreeInput(e.target.value)}
                  placeholder="[3, 9, 20, null, null, 15, 7]"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Dynamic Function Arguments / Parameters */}
          {detectedParams.length > 0 && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Function Arguments & Parameters ({detectedParams.length} Detected):
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Extracted from C++ signature
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {detectedParams.map((dp) => (
                  <div key={dp.name} className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{dp.name}:</span>
                      <span className="text-[10px] text-slate-500">{dp.type}</span>
                    </label>
                    <input
                      type="number"
                      value={paramsState[dp.name] !== undefined ? paramsState[dp.name] : dp.default}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setParamsState((prev) => ({ ...prev, [dp.name]: val }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-sky-300 focus:outline-none shadow-inner"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Built-in Multi-Tree C++ Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Code...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Visualize {activeMode === 'multi_tree' ? 'Multi-Tree' : 'Code'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
