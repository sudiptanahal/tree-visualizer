import React, { useState } from 'react';
import { X, BookOpen, GitFork, ArrowDownRight, CheckCircle2, AlertTriangle, Layers, Code, Sparkles } from 'lucide-react';

export default function DSAConceptGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('pointers');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Tree & Graph DSA Master Guide</h2>
              <p className="text-xs text-slate-400">Essential C++ pointer mechanics, recursion stack frames & interview concepts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'pointers', label: '1. C++ Pointers in Trees' },
            { id: 'bst_delete', label: '2. BST Deletion (3 Cases)' },
            { id: 'recursion_flow', label: '3. Recursion "U-Turn" Call Stack' },
            { id: 'traversals', label: '4. Traversals Comparison' },
            { id: 'interview_tips', label: '5. Interview Patterns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-t border-x whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-sky-400 border-slate-800'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs leading-relaxed">
          {/* TAB 1: C++ POINTERS IN TREES */}
          {activeTab === 'pointers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Code className="w-4 h-4" /> Why do we write <code className="text-amber-300 font-mono">root-&gt;left = insert(root-&gt;left, val)</code> in C++?
              </h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px]">
                <p className="text-slate-400 font-sans">
                  In C++, pointer arguments are passed <strong className="text-white">BY VALUE</strong> by default. When you pass <code className="text-rose-400">root-&gt;left</code> to a function, the function receives a copy of the pointer address, NOT the pointer itself.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-rose-400 font-bold block mb-1">❌ Common Beginner Mistake:</span>
                    <pre className="text-slate-400">
{`void insert(TreeNode* root, int val) {
    if (root == nullptr) {
        root = new TreeNode(val); // BUG!
        // Only modifies local copy 'root'!
        // Parent remains nullptr!
    }
}`}
                    </pre>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/40">
                    <span className="text-emerald-400 font-bold block mb-1">✅ The Standard C++ Pattern:</span>
                    <pre className="text-slate-200">
{`TreeNode* insert(TreeNode* root, int val) {
    if (root == nullptr) 
        return new TreeNode(val);
    
    // Parent receives new address:
    root->left = insert(root->left, val);
    return root; // Rewires parent
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">1. Heap Allocation</span>
                  <p className="text-[11px] text-slate-400">
                    <code className="text-sky-300 font-mono">new TreeNode(x)</code> creates memory on the heap that persists after function returns.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-rose-400 font-bold block mb-1">2. Heap Deallocation</span>
                  <p className="text-[11px] text-slate-400">
                    <code className="text-rose-400 font-mono">delete root;</code> frees the memory block. Must return child pointer to reconnect parent.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">3. Base Case Return</span>
                  <p className="text-[11px] text-slate-400">
                    <code className="text-emerald-300 font-mono">if (!root) return nullptr;</code> signals to caller that branch ended.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BST DELETION (3 CASES) */}
          {activeTab === 'bst_delete' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-sky-400">
                Understanding BST Deletion: The 3 Core Pointer Cases
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {/* Case 1 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 block mb-1">Case 1: Leaf Node (0 Children)</span>
                    <p className="text-[11px] text-slate-400">
                      The node has no children (<code className="text-sky-300 font-mono">!root-&gt;left &amp;&amp; !root-&gt;right</code>).
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-slate-900 rounded text-[11px] font-mono text-emerald-300 border border-slate-800">
                    delete root;<br/>
                    return nullptr;
                  </div>
                </div>

                {/* Case 2 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-400 block mb-1">Case 2: One Child (Left OR Right)</span>
                    <p className="text-[11px] text-slate-400">
                      Node has only one subtree. We bypass the deleted node by returning its sole child.
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-slate-900 rounded text-[11px] font-mono text-emerald-300 border border-slate-800">
                    TreeNode* temp = root-&gt;right;<br/>
                    delete root;<br/>
                    return temp;
                  </div>
                </div>

                {/* Case 3 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-400 block mb-1">Case 3: Two Children</span>
                    <p className="text-[11px] text-slate-400">
                      Cannot simply delete! Find <strong className="text-white">In-order Successor</strong> (minimum in right subtree), copy its value, and delete successor!
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-slate-900 rounded text-[11px] font-mono text-emerald-300 border border-slate-800">
                    succ = findMin(root-&gt;right);<br/>
                    root-&gt;val = succ-&gt;val;<br/>
                    root-&gt;right = delete(root-&gt;right, succ-&gt;val);
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl text-xs text-sky-200">
                💡 <strong className="text-sky-300">Why does In-order Successor work?</strong> The successor is guaranteed to be greater than all nodes in the left subtree and smaller than all remaining nodes in the right subtree. Furthermore, the successor is guaranteed to have NO left child (at most 1 right child), making its deletion trivial (Case 1 or 2)!
              </div>
            </div>
          )}

          {/* TAB 3: RECURSION FLOW */}
          {activeTab === 'recursion_flow' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-sky-400">
                The "U-Turn" Call Stack Model: How Tree Recursion Actually Executes
              </h3>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <p className="text-slate-300 font-sans">
                  Students often imagine recursion happening all at once. In reality, execution happens sequentially on the C++ Call Stack:
                </p>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <span><strong>Dive Left (Push Stack):</strong> Function calls <code className="text-sky-300">f(root-&gt;left)</code>. Caller frame PAUSES on that line until entire left subtree finishes.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <span><strong>Base Case Hit (The U-Turn):</strong> Reaches <code className="text-amber-300">root == nullptr</code>. Returns base value (e.g. 0 or nullptr) and pops frame.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <span><strong>Dive Right:</strong> Parent resumes, stores <code className="text-purple-300">leftResult</code>, then calls <code className="text-purple-300">f(root-&gt;right)</code> and pauses again.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">4</span>
                    <span><strong>Combine &amp; Bubble Up:</strong> Parent combines <code className="text-emerald-300">1 + max(leftH, rightH)</code> and returns up to its parent.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRAVERSALS COMPARISON */}
          {activeTab === 'traversals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-sky-400">
                Tree Traversals at a Glance
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sky-400">Inorder Traversal</span>
                    <span className="text-[10px] font-mono text-slate-500">Left → Root → Right</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    For a Binary Search Tree (BST), Inorder traversal processes keys in <strong className="text-emerald-400">strictly sorted ascending order</strong>!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-purple-400">Preorder Traversal</span>
                    <span className="text-[10px] font-mono text-slate-500">Root → Left → Right</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Visits root first before children. Used for <strong className="text-purple-300">tree cloning, serialization</strong>, and prefix expression trees.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400">Postorder Traversal</span>
                    <span className="text-[10px] font-mono text-slate-500">Left → Right → Root</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Processes children first. Essential for <strong className="text-emerald-300">bottom-up calculations</strong> (height, diameter) and C++ tree deletion.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400">Level Order (BFS)</span>
                    <span className="text-[10px] font-mono text-slate-500">std::queue</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Uses a queue to visit nodes level-by-level from top to bottom. Finds <strong className="text-amber-300">shortest paths</strong> in unweighted graphs/trees.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTERVIEW PATTERNS */}
          {activeTab === 'interview_tips' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-sky-400">
                Core Tree DSA Interview Patterns &amp; Formulas
              </h3>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-sky-300 font-bold block mb-1 font-sans">Pattern 1: Height / Depth (Divide &amp; Conquer)</span>
                  <p className="text-slate-400 font-mono">
                    height(root) = 1 + max(height(root-&gt;left), height(root-&gt;right));
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-300 font-bold block mb-1 font-sans">Pattern 2: Diameter of Binary Tree</span>
                  <p className="text-slate-400 font-mono">
                    diameterThroughNode = leftHeight + rightHeight;<br/>
                    globalMax = max(globalMax, diameterThroughNode);
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-purple-300 font-bold block mb-1 font-sans">Pattern 3: Path Sum / Accumulation</span>
                  <p className="text-slate-400 font-mono">
                    if (isLeaf(root)) return remainingSum == root-&gt;val;<br/>
                    return hasPath(root-&gt;left, rem - root-&gt;val) || hasPath(root-&gt;right, rem - root-&gt;val);
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
          >
            Got it, Let's Visualize!
          </button>
        </div>
      </div>
    </div>
  );
}
