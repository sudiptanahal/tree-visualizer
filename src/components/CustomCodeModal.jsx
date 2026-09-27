import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { traceCodeWithGemini } from '../engine/geminiTracer';
import { runCustomCppCode } from '../engine/cppParserAndRunner';
import { parseArrayToTree } from '../utils/treeLayout';

const CODE_TEMPLATES = [
  {
    id: 'count_nodes',
    name: '1. Count Total Nodes',
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
    name: '2. Sum Root to Leaf Numbers (LeetCode 129)',
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
    name: '3. Kth Smallest Element in BST (LeetCode 230)',
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
    name: '4. Binary Tree Right Side View (LeetCode 199)',
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
    name: '5. Flatten Binary Tree to Linked List (LeetCode 114)',
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
    id: 'custom_blank',
    name: '6. Blank Custom Template',
    tree: [1, 2, 3, 4, 5],
    params: {},
    code: `// Write your custom C++ tree code here:
int customSolve(TreeNode* root) {
    if (root == nullptr) {
        return 0;
    }
    
    int leftVal = customSolve(root->left);
    int rightVal = customSolve(root->right);
    
    return root->val + leftVal + rightVal;
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
  const [selectedTemplateId, setSelectedTemplateId] = useState('count_nodes');
  const [code, setCode] = useState(CODE_TEMPLATES[0].code);
  const [treeInput, setTreeInput] = useState(JSON.stringify(CODE_TEMPLATES[0].tree));
  const [paramsInput, setParamsInput] = useState(JSON.stringify(CODE_TEMPLATES[0].params));
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useAI, setUseAI] = useState(Boolean(apiKey));

  useEffect(() => {
    if (apiKey) setLocalApiKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmplId) => {
    const tmpl = CODE_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setSelectedTemplateId(tmplId);
      setCode(tmpl.code);
      setTreeInput(JSON.stringify(tmpl.tree));
      setParamsInput(JSON.stringify(tmpl.params));
      setErrorMsg('');
    }
  };

  const handleRun = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      let parsedTree = [];
      try {
        parsedTree = JSON.parse(treeInput);
        if (!Array.isArray(parsedTree)) throw new Error('Tree input must be an array');
      } catch (err) {
        throw new Error('Invalid Tree Array JSON format (e.g. [3, 9, 20, null, null, 15, 7])');
      }

      let parsedParams = {};
      try {
        if (paramsInput.trim()) {
          parsedParams = JSON.parse(paramsInput);
        }
      } catch (err) {
        throw new Error('Invalid Parameters JSON (e.g. {"k": 3})');
      }

      let generatedSteps = [];

      // Save API key if entered
      if (localApiKey.trim()) {
        onSaveApiKey(localApiKey.trim());
      }

      if (useAI && localApiKey.trim()) {
        // Trace via Gemini AI
        try {
          generatedSteps = await traceCodeWithGemini(
            code,
            parsedTree,
            parsedParams,
            localApiKey.trim()
          );
        } catch (aiErr) {
          console.warn('Gemini AI failed, falling back to local runner:', aiErr);
          // Fallback to local runner
          generatedSteps = runCustomCppCode(code, parsedTree, parsedParams);
        }
      } else {
        // Built-in smart C++ runner
        generatedSteps = runCustomCppCode(code, parsedTree, parsedParams);
      }

      if (!generatedSteps || generatedSteps.length === 0) {
        throw new Error('Could not generate execution steps for this C++ code.');
      }

      // Apply to main visualizer
      onApplyCustomSteps({
        code,
        steps: generatedSteps,
        initialTree: parsedTree,
        name: 'Custom C++ Solution',
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error tracing custom C++ code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Custom C++ Code Visualizer &amp; Runner</span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded">
                  Dynamic Execution
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Write or paste ANY custom C++ Tree/Graph code to visualize line-by-line execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Banner / Mode Switcher */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="password"
              value={localApiKey}
              onChange={(e) => {
                setLocalApiKey(e.target.value);
                setUseAI(true);
              }}
              placeholder="Enter Gemini API Key for AI-powered tracing (optional)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline underline-offset-2"
            >
              <span>Get Free Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={useAI && Boolean(localApiKey.trim())}
                onChange={(e) => setUseAI(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>Use Gemini AI</span>
            </label>
          </div>
        </div>

        {/* Body: Template Picker + Editor */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Starter Template Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-sky-400" /> Templates:
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {CODE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* C++ Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">
                C++ Solution Code:
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Paste any recursive / iterative function
              </span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-56 bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-purple-500 selection:bg-purple-900"
              placeholder="// Paste your C++ TreeNode* solution here..."
            />
          </div>

          {/* Input Tree & Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                Input Tree (LeetCode Array):
              </label>
              <input
                type="text"
                value={treeInput}
                onChange={(e) => setTreeInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-purple-500"
                placeholder="[3, 9, 20, null, null, 15, 7]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                Extra Parameters (JSON):
              </label>
              <input
                type="text"
                value={paramsInput}
                onChange={(e) => setParamsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-purple-500"
                placeholder='{"k": 3}'
              />
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            {useAI && localApiKey.trim() ? (
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini API AI Tracer
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Built-in Fast Local C++ Interpreter
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleRun}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Simulating C++ Trace...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
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
