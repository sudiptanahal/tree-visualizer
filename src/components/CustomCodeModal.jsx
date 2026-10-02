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
  ArrowRightLeft,
} from 'lucide-react';
import { traceCodeWithGemini } from '../engine/geminiTracer';
import { runCustomCppCode, isRecursionOnlyCode } from '../engine/cppParserAndRunner';
import { parseArrayToTree } from '../utils/treeLayout';

const CODE_TEMPLATES = [
  // ================= PURE RECURSION TEMPLATES =================
  {
    id: 'merge_sort',
    name: '1. Merge Sort (Divide & Conquer)',
    category: 'recursion',
    inputArray: [38, 27, 43, 3, 9, 82, 10],
    params: {},
    code: `void merge(vector<int>& arr, int l, int mid, int r);

void mergeSort(vector<int>& arr, int l, int r) {
    // Base Case: 1 element or invalid range
    if (l >= r) {
        return;
    }
    
    // 1. Divide: Find midpoint
    int mid = l + (r - l) / 2;
    
    // 2. Recurse on Left and Right subarrays
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    
    // 3. Conquer: Merge the two sorted halves
    merge(arr, l, mid, r);
}`
  },
  {
    id: 'quick_sort',
    name: '2. Quick Sort (Partitioning & Recursion)',
    category: 'recursion',
    inputArray: [10, 80, 30, 90, 40, 50, 70],
    params: {},
    code: `int partition(vector<int>& arr, int low, int high);

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // 1. Partition array around pivot
        int pi = partition(arr, low, high);
        
        // 2. Recursively sort elements before and after pivot
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
  },
  {
    id: 'fibonacci_rec',
    name: '3. Fibonacci Recursion Tree',
    category: 'recursion',
    inputArray: [],
    params: { n: 4 },
    code: `int fib(int n) {
    // Base Cases
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    // Recursive Calls
    int left = fib(n - 1);
    int right = fib(n - 2);
    
    // Combine return values
    return left + right;
}`
  },
  {
    id: 'subsets_backtrack',
    name: '4. Subsets / Power Set (Backtracking Decision Tree)',
    category: 'recursion',
    inputArray: [1, 2, 3],
    params: {},
    code: `void generateSubsets(vector<int>& nums, int index, vector<int>& current, vector<vector<int>>& result) {
    // Base Case: explored all elements
    if (index == nums.size()) {
        result.push_back(current);
        return;
    }
    
    // Decision 1: Pick / Include nums[index]
    current.push_back(nums[index]);
    generateSubsets(nums, index + 1, current, result);
    
    // Decision 2: Backtrack & Don't Pick (Exclude)
    current.pop_back();
    generateSubsets(nums, index + 1, current, result);
}`
  },
  {
    id: 'tower_of_hanoi',
    name: '5. Tower of Hanoi (3-Pegs Recursion)',
    category: 'recursion',
    inputArray: [],
    params: { n: 3 },
    code: `void towerOfHanoi(int n, char fromRod, char toRod, char auxRod) {
    // Base Case: only 1 disk to move
    if (n == 1) {
        cout << "Move disk 1 from " << fromRod << " to " << toRod << endl;
        return;
    }
    
    // Step 1: Move n-1 disks from source to aux
    towerOfHanoi(n - 1, fromRod, auxRod, toRod);
    
    // Step 2: Move nth disk from source to destination
    cout << "Move disk " << n << " from " << fromRod << " to " << toRod << endl;
    
    // Step 3: Move n-1 disks from aux to destination
    towerOfHanoi(n - 1, auxRod, toRod, fromRod);
}`
  },

  // ================= TREE DSA TEMPLATES =================
  {
    id: 'count_nodes',
    name: '6. Count Total Nodes (Binary Tree)',
    category: 'tree',
    tree: [3, 9, 20, null, null, 15, 7],
    params: {},
    code: `int countNodes(TreeNode* root) {
    // Base Case: empty tree has 0 nodes
    if (root == nullptr) {
        return 0;
    }
    
    // Count nodes in left and right subtrees
    int leftCount = countNodes(root->left);
    int rightCount = countNodes(root->right);
    
    // Total is 1 (current node) + left + right
    return 1 + leftCount + rightCount;
}`
  },
  {
    id: 'sum_numbers',
    name: '7. Sum Root to Leaf Numbers (LeetCode 129)',
    category: 'tree',
    tree: [4, 9, 0, 5, 1],
    params: {},
    code: `int sumNumbersHelper(TreeNode* root, int currentSum) {
    if (root == nullptr) return 0;
    
    // Accumulate digits along root-to-leaf path
    currentSum = currentSum * 10 + root->val;
    
    // Leaf node: return full integer formed
    if (root->left == nullptr && root->right == nullptr) {
        return currentSum;
    }
    
    return sumNumbersHelper(root->left, currentSum) +
           sumNumbersHelper(root->right, currentSum);
}

int sumNumbers(TreeNode* root) {
    return sumNumbersHelper(root, 0);
}`
  },
  {
    id: 'kth_smallest',
    name: '8. Kth Smallest Element in BST (LeetCode 230)',
    category: 'tree',
    tree: [5, 3, 6, 2, 4, null, null, 1],
    params: { k: 3 },
    code: `int count = 0;
int result = -1;

void inorder(TreeNode* root, int k) {
    if (root == nullptr || result != -1) return;
    
    inorder(root->left, k);
    
    count++;
    if (count == k) {
        result = root->val; // Found Kth smallest!
        return;
    }
    
    inorder(root->right, k);
}

int kthSmallest(TreeNode* root, int k) {
    count = 0;
    result = -1;
    inorder(root, k);
    return result;
}`
  },
  {
    id: 'right_side_view',
    name: '9. Binary Tree Right Side View (LeetCode 199)',
    category: 'tree',
    tree: [1, 2, 3, null, 5, null, 4],
    params: {},
    code: `vector<int> rightSideView(TreeNode* root) {
    vector<int> result;
    if (root == nullptr) return result;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        int levelSize = q.size();
        for (int i = 0; i < levelSize; i++) {
            TreeNode* curr = q.front();
            q.pop();
            
            // Last element of the level is visible from right
            if (i == levelSize - 1) {
                result.push_back(curr->val);
            }
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
    }
    return result;
}`
  },
  {
    id: 'flatten_tree',
    name: '10. Flatten Binary Tree to Linked List (LeetCode 114)',
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
  }
];

export default function CustomCodeModal({
  isOpen,
  onClose,
  onApplyCustomSteps,
  apiKey,
  onSaveApiKey,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('merge_sort');
  const [code, setCode] = useState(CODE_TEMPLATES[0].code);
  const [treeInput, setTreeInput] = useState(JSON.stringify(CODE_TEMPLATES[0].inputArray));
  const [paramsInput, setParamsInput] = useState(JSON.stringify(CODE_TEMPLATES[0].params));
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useAI, setUseAI] = useState(Boolean(apiKey));
  const [manualMode, setManualMode] = useState(null); // 'auto' | 'recursion' | 'tree'

  // Auto-detect whether the current code is Pure Recursion vs Tree DSA
  const autoDetectedMode = useMemo(() => {
    return isRecursionOnlyCode(code) ? 'recursion' : 'tree';
  }, [code]);

  const activeMode = manualMode || autoDetectedMode;

  useEffect(() => {
    if (apiKey) setLocalApiKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmplId) => {
    const tmpl = CODE_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setSelectedTemplateId(tmplId);
      setCode(tmpl.code);
      setTreeInput(JSON.stringify(tmpl.category === 'recursion' ? tmpl.inputArray : tmpl.tree));
      setParamsInput(JSON.stringify(tmpl.params));
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
        throw new Error('Invalid Input Array JSON format (e.g. [38, 27, 43, 3, 9, 82, 10] or [3, 9, 20, null, 15])');
      }

      let parsedParams = {};
      try {
        if (paramsInput.trim()) {
          parsedParams = JSON.parse(paramsInput);
        }
      } catch (err) {
        throw new Error('Invalid Parameters JSON (e.g. {"n": 4} or {"k": 3})');
      }

      let generatedSteps = [];

      // Save API key if entered
      if (localApiKey.trim()) {
        onSaveApiKey(localApiKey.trim());
      }

      if (useAI && localApiKey.trim()) {
        try {
          generatedSteps = await traceCodeWithGemini(
            code,
            parsedInput,
            parsedParams,
            localApiKey.trim()
          );
        } catch (aiErr) {
          console.warn('Gemini AI tracing failed, using fast built-in evaluator:', aiErr);
          generatedSteps = runCustomCppCode(code, parsedInput, parsedParams, activeMode);
        }
      } else {
        generatedSteps = runCustomCppCode(code, parsedInput, parsedParams, activeMode);
      }

      if (!generatedSteps || generatedSteps.length === 0) {
        throw new Error('Failed to generate steps for this code. Please check your syntax or template.');
      }

      const tmpl = CODE_TEMPLATES.find(t => t.id === selectedTemplateId);
      const algoName = tmpl ? tmpl.name.replace(/^\d+\.\s*/, '') : (activeMode === 'recursion' ? 'Custom Recursion' : 'Custom C++ Tree');

      onApplyCustomSteps({
        steps: generatedSteps,
        code,
        name: algoName,
        isRecursion: activeMode === 'recursion',
        treeData: activeMode === 'tree' ? parseArrayToTree(parsedInput) : null,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Execution failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30 text-sky-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Custom C++ Code Visualizer & Runner
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Dynamic Execution
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Write or paste ANY custom C++ Tree or Pure Recursion code to visualize line-by-line execution
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
          {/* AI vs Local Engine Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-1">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="password"
                placeholder="Enter Gemini API Key for AI-powered tracing (optional)"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium underline"
              >
                Get Free Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={useAI && Boolean(localApiKey.trim())}
                  disabled={!localApiKey.trim()}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Use Gemini AI</span>
              </label>
            </div>
          </div>

          {/* Mode Selector & Auto-Detection Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Target Visualizer:</span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setManualMode('recursion')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeMode === 'recursion'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  Pure Recursion Tree
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
                  Binary Tree DSA
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Auto-Detected:{' '}
                <strong className={activeMode === 'recursion' ? 'text-purple-400' : 'text-sky-400'}>
                  {activeMode === 'recursion' ? 'Pure Recursion Tree (MergeSort / Subsets / Fib)' : 'Binary Tree (TreeNode*)'}
                </strong>
              </span>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-sky-400" />
              Templates:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              <optgroup label="🌲 Pure Recursion & Divide/Conquer">
                {CODE_TEMPLATES.filter(t => t.category === 'recursion').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="🌳 Binary Tree DSA (TreeNode*)">
                {CODE_TEMPLATES.filter(t => t.category === 'tree').map(t => (
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
                {activeMode === 'recursion' ? 'Paste recursive divide-and-conquer / backtracking function' : 'Paste any TreeNode* recursive / iterative function'}
              </span>
            </div>
            <textarea
              rows={11}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setManualMode(null); // let auto-detector react to user typing
              }}
              placeholder="// Write or paste your C++ code here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed resize-none shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {activeMode === 'recursion' ? 'Input Array / Numbers (JSON):' : 'Input Tree (LeetCode Array JSON):'}
              </label>
              <input
                type="text"
                value={treeInput}
                onChange={(e) => setTreeInput(e.target.value)}
                placeholder={activeMode === 'recursion' ? '[38, 27, 43, 3, 9, 82, 10]' : '[3, 9, 20, null, null, 15, 7]'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Extra Parameters (JSON):
              </label>
              <input
                type="text"
                value={paramsInput}
                onChange={(e) => setParamsInput(e.target.value)}
                placeholder='{"n": 4} or {"k": 3}'
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

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
            <span>Built-in Fast Local C++ Interpreter</span>
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
                  <span>Visualize Custom C++ Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
