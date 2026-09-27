# TreeViz — Tree, Graph & Recursion Visualizer for C++ DSA

A web visualizer designed specifically to make Tree, Graph, and Recursion DSA problems in C++ intuitive, easy to debug, and simple to understand line-by-line.

---

## 🌟 Key Features

### 1. Line-by-Line C++ Code Execution
- Every step of the algorithm directly highlights the exact corresponding line in clean C++ code.
- Interactive Breakpoints: Click on any line number (🔴) to pause playback when that line is hit.
- Inline pointer and variable indicators (`root = Node(5)`, `val = 3`).

### 2. Live Memory & Pointer Model
- **Node Creation (`new TreeNode`)**: Visualizes memory allocation on the heap and returning the new node address.
- **Node Deletion (`delete root`)**: Visualizes the 3 core BST deletion cases (Leaf node, Single child bypass, Two children with In-order Successor replacement).
- **Pointer Rewiring (`root->left = ...`)**: Shows parent nodes updating their child pointers with returned addresses.
- **Left / Right Subtree Indicators (`L` / `R`)**: Clear branch markers.

### 3. Dual Call Stack & Recursion Tree
- **Call Stack Panel**: Shows active stack frames, function arguments, active caller line, and return values bubbling back up.
- **Recursion Call Graph**: A visual tree representing the invocation tree (e.g. `maxDepth(Node 3) -> maxDepth(Node 9) & maxDepth(Node 20)`).

### 4. Comprehensive Curated Library of Classic DSA Problems
- **Binary Search Tree (BST)**:
  - BST Insertion (`insertIntoBST`)
  - BST Deletion (`deleteNode` — all 3 cases with in-order successor)
  - BST Search (`searchBST`)
  - Validate BST (`isValidBST`)
- **Tree Traversals**:
  - Inorder Traversal (LNR — sorted order for BST)
  - Preorder Traversal (NLR)
  - Postorder Traversal (LRN — bottom-up)
  - Level Order Traversal (BFS with `std::queue<TreeNode*>`)
- **Classic Tree DSA Interview Problems**:
  - Maximum Depth / Height of Binary Tree
  - Invert / Mirror Binary Tree
  - Lowest Common Ancestor (LCA) in BST
  - Lowest Common Ancestor (LCA) in General Binary Tree
  - Path Sum (`hasPathSum`)
  - Diameter of Binary Tree
  - Check Balanced Binary Tree (`isBalanced`)
  - Symmetric / Mirror Tree (`isSymmetric`)
- **Graph Algorithms**:
  - Breadth-First Search (BFS with Queue & Visited Array)
  - Depth-First Search (DFS with Recursion Stack & Visited Array)
  - Cycle Detection in Undirected Graph (Back-edge detection)
- **Recursion Fundamentals**:
  - Fibonacci Recursion Call Tree (`fib(n) = fib(n-1) + fib(n-2)`)

### 5. Custom Tree & Graph Builder
- Input trees using standard LeetCode array format `[3, 9, 20, null, null, 15, 7]`.
- Input trees using BST insertion sequence `8, 3, 10, 1, 6, 14, 4, 7, 13`.
- Quick presets: Balanced BST, Degenerate / Skewed tree, Perfect tree, Symmetric tree.

### 6. Interactive DSA Concept Guide & Cheat Sheet
- Deep-dive into C++ pointer mechanics (`TreeNode*` vs `TreeNode*&`).
- The 3 BST Deletion Cases explained with diagrams.
- The "U-Turn" Call Stack Recursion Model.
- Common Interview Patterns & Formulas.

---

## ⌨️ Keyboard Shortcuts
- `Space`: Play / Pause Auto-step
- `Right Arrow` / `F10`: Step Next
- `Left Arrow` / `F9`: Step Previous
- `R`: Reset to Beginning
- `F`: Continue to Breakpoint
