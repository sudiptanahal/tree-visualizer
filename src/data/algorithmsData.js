// Metadata, C++ source code templates, complexities, and presets for all algorithms

export const ALGORITHM_CATEGORIES = [
  { id: 'bst', name: 'Binary Search Tree (BST)' },
  { id: 'traversals', name: 'Tree Traversals' },
  { id: 'tree_dsa', name: 'Classic Tree DSA' },
  { id: 'recursion', name: 'Recursion Deep-Dive' },
  { id: 'graph', name: 'Graph Algorithms' },
];

export const ALGORITHMS = {
  // ================= BST OPERATIONS =================
  'bst_insert': {
    id: 'bst_insert',
    name: 'BST Insertion',
    category: 'bst',
    subtitle: 'Insert a new key while maintaining BST invariant',
    difficulty: 'Easy',
    timeComplexity: 'O(H) — O(log N) avg, O(N) worst',
    spaceComplexity: 'O(H) call stack frames',
    defaultTree: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
    defaultParams: { value: 5 },
    paramConfigs: [
      { name: 'value', label: 'Value to Insert', type: 'number', default: 5, min: 0, max: 99 }
    ],
    summary: 'In C++, insertion recursively traverses down left or right depending on node->val. When root == nullptr, creates a new TreeNode and returns it to be attached to the parent pointer.',
    cppCode: `// Definition for a binary tree node.
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* insertIntoBST(TreeNode* root, int val) {
    // Base Case: empty spot found, allocate new node
    if (root == nullptr) {
        return new TreeNode(val);
    }
    
    // Recurse Left or Right
    if (val < root->val) {
        root->left = insertIntoBST(root->left, val);
    } else if (val > root->val) {
        root->right = insertIntoBST(root->right, val);
    }
    
    // Return unchanged root pointer to rewire parent
    return root;
}`
  },

  'bst_delete': {
    id: 'bst_delete',
    name: 'BST Deletion (All 3 Cases)',
    category: 'bst',
    subtitle: 'Leaf, 1 Child, and 2 Children with In-order Successor',
    difficulty: 'Medium',
    timeComplexity: 'O(H) — O(log N) avg, O(N) worst',
    spaceComplexity: 'O(H) call stack frames',
    defaultTree: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
    defaultParams: { key: 3 },
    paramConfigs: [
      { name: 'key', label: 'Key to Delete', type: 'number', default: 3, min: 0, max: 99 }
    ],
    summary: 'Deletion handles 3 distinct pointer cases: (1) Leaf node: delete and return nullptr; (2) One child: delete and return child; (3) Two children: find in-order successor (min in right subtree), copy its value, then recursively delete successor!',
    cppCode: `TreeNode* findMin(TreeNode* node) {
    while (node && node->left != nullptr) {
        node = node->left;
    }
    return node;
}

TreeNode* deleteNode(TreeNode* root, int key) {
    if (root == nullptr) return nullptr;
    
    if (key < root->val) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->val) {
        root->right = deleteNode(root->right, key);
    } else {
        // Node found! Handle 3 Cases:
        
        // Case 1 & 2: 0 or 1 child
        if (root->left == nullptr) {
            TreeNode* temp = root->right;
            delete root;
            return temp;
        } else if (root->right == nullptr) {
            TreeNode* temp = root->left;
            delete root;
            return temp;
        }
        
        // Case 3: 2 children -> Find in-order successor
        TreeNode* succ = findMin(root->right);
        root->val = succ->val; // Copy successor val
        root->right = deleteNode(root->right, succ->val);
    }
    return root;
}`
  },

  'bst_search': {
    id: 'bst_search',
    name: 'BST Search',
    category: 'bst',
    subtitle: 'Find node with target key in O(log N)',
    difficulty: 'Easy',
    timeComplexity: 'O(H) — O(log N) avg',
    spaceComplexity: 'O(H) call stack',
    defaultTree: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
    defaultParams: { val: 6 },
    paramConfigs: [
      { name: 'val', label: 'Target Value', type: 'number', default: 6, min: 0, max: 99 }
    ],
    summary: 'Compares target with root->val. If smaller, searches left; if larger, searches right. If equal, returns node.',
    cppCode: `TreeNode* searchBST(TreeNode* root, int val) {
    // Base Case: not found (null) or found target
    if (root == nullptr || root->val == val) {
        return root;
    }
    
    // Target is smaller -> go Left
    if (val < root->val) {
        return searchBST(root->left, val);
    }
    
    // Target is larger -> go Right
    return searchBST(root->right, val);
}`
  },

  'validate_bst': {
    id: 'validate_bst',
    name: 'Validate BST',
    category: 'bst',
    subtitle: 'Check if binary tree satisfies BST property for all subtrees',
    difficulty: 'Medium',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [5, 1, 7, null, null, 6, 8],
    defaultParams: {},
    paramConfigs: [],
    summary: 'A valid BST requires every node in left subtree < root, and every node in right subtree > root. We pass valid range (minVal, maxVal) down the recursion.',
    cppCode: `bool isValid(TreeNode* root, long minVal, long maxVal) {
    if (root == nullptr) return true;
    
    // Check if current node violates bounds
    if (root->val <= minVal || root->val >= maxVal) {
        return false;
    }
    
    // Left subtree must be < root->val
    // Right subtree must be > root->val
    return isValid(root->left, minVal, root->val) &&
           isValid(root->right, root->val, maxVal);
}

bool isValidBST(TreeNode* root) {
    return isValid(root, LONG_MIN, LONG_MAX);
}`
  },

  // ================= TRAVERSALS =================
  'inorder_traversal': {
    id: 'inorder_traversal',
    name: 'Inorder Traversal (LNR)',
    category: 'traversals',
    subtitle: 'Left Subtree -> Root -> Right Subtree (Sorted order for BST)',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) call stack',
    defaultTree: [4, 2, 6, 1, 3, 5, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Visits Left subtree completely first, processes current Root node, then visits Right subtree. For BSTs, inorder traversal visits elements in ascending order!',
    cppCode: `void inorder(TreeNode* root, vector<int>& res) {
    if (root == nullptr) return; // Base Case
    
    // 1. Traverse Left Subtree
    inorder(root->left, res);
    
    // 2. Process Current Node
    res.push_back(root->val);
    
    // 3. Traverse Right Subtree
    inorder(root->right, res);
}

vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    inorder(root, res);
    return res;
}`
  },

  'preorder_traversal': {
    id: 'preorder_traversal',
    name: 'Preorder Traversal (NLR)',
    category: 'traversals',
    subtitle: 'Root -> Left Subtree -> Right Subtree (Top-Down copying/serialization)',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) call stack',
    defaultTree: [1, 2, 3, 4, 5, 6, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Processes current Root node first, then recursively traverses Left subtree, then Right subtree.',
    cppCode: `void preorder(TreeNode* root, vector<int>& res) {
    if (root == nullptr) return; // Base Case
    
    // 1. Process Current Node
    res.push_back(root->val);
    
    // 2. Traverse Left Subtree
    preorder(root->left, res);
    
    // 3. Traverse Right Subtree
    preorder(root->right, res);
}

vector<int> preorderTraversal(TreeNode* root) {
    vector<int> res;
    preorder(root, res);
    return res;
}`
  },

  'postorder_traversal': {
    id: 'postorder_traversal',
    name: 'Postorder Traversal (LRN)',
    category: 'traversals',
    subtitle: 'Left -> Right -> Root (Bottom-up calculations & memory deletion)',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) call stack',
    defaultTree: [1, 2, 3, 4, 5, 6, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Visits Left and Right subtrees before processing the Root node. Essential for bottom-up computation (like subtree sizes, height) and tree deletion in C++.',
    cppCode: `void postorder(TreeNode* root, vector<int>& res) {
    if (root == nullptr) return; // Base Case
    
    // 1. Traverse Left Subtree
    postorder(root->left, res);
    
    // 2. Traverse Right Subtree
    postorder(root->right, res);
    
    // 3. Process Current Node
    res.push_back(root->val);
}

vector<int> postorderTraversal(TreeNode* root) {
    vector<int> res;
    postorder(root, res);
    return res;
}`
  },

  'level_order_traversal': {
    id: 'level_order_traversal',
    name: 'Level Order Traversal (BFS)',
    category: 'traversals',
    subtitle: 'Breadth-First Search using std::queue level by level',
    difficulty: 'Medium',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W) — max width of tree in queue',
    defaultTree: [3, 9, 20, null, null, 15, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Uses a queue (`std::queue<TreeNode*>`) to traverse node-by-node level by level from top to bottom, left to right.',
    cppCode: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> result;
    if (root == nullptr) return result;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode* curr = q.front();
            q.pop();
            currentLevel.push_back(curr->val);
            
            if (curr->left != nullptr) q.push(curr->left);
            if (curr->right != nullptr) q.push(curr->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`
  },

  // ================= CLASSIC TREE DSA =================
  'max_depth': {
    id: 'max_depth',
    name: 'Maximum Depth / Height',
    category: 'tree_dsa',
    subtitle: 'Calculate tree height using Divide & Conquer recursion',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) call stack',
    defaultTree: [3, 9, 20, null, null, 15, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Maximum depth is 1 + max(depth(left), depth(right)). Highlights how call stack pauses while waiting for left subtree to return, then waits for right subtree.',
    cppCode: `int maxDepth(TreeNode* root) {
    // Base Case: empty tree has height 0
    if (root == nullptr) {
        return 0;
    }
    
    // Recursively find height of left & right subtrees
    int leftHeight = maxDepth(root->left);
    int rightHeight = maxDepth(root->right);
    
    // Current height is 1 + maximum of both
    return 1 + max(leftHeight, rightHeight);
}`
  },

  'invert_tree': {
    id: 'invert_tree',
    name: 'Invert / Mirror Binary Tree',
    category: 'tree_dsa',
    subtitle: 'Swap left and right children recursively (Famous Google Interview Question)',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [4, 2, 7, 1, 3, 6, 9],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Recursively inverts left and right subtrees, then swaps root->left and root->right pointers.',
    cppCode: `TreeNode* invertTree(TreeNode* root) {
    // Base Case: empty node
    if (root == nullptr) {
        return nullptr;
    }
    
    // Swap left and right child pointers
    TreeNode* temp = root->left;
    root->left = root->right;
    root->right = temp;
    
    // Recursively invert both subtrees
    invertTree(root->left);
    invertTree(root->right);
    
    return root;
}`
  },

  'lca_bst': {
    id: 'lca_bst',
    name: 'LCA in BST',
    category: 'tree_dsa',
    subtitle: 'Lowest Common Ancestor utilizing BST order property',
    difficulty: 'Medium',
    timeComplexity: 'O(H)',
    spaceComplexity: 'O(H)',
    defaultTree: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5],
    defaultParams: { p: 2, q: 8 },
    paramConfigs: [
      { name: 'p', label: 'Node P value', type: 'number', default: 2, min: 0, max: 99 },
      { name: 'q', label: 'Node Q value', type: 'number', default: 8, min: 0, max: 99 }
    ],
    summary: 'If both p and q are smaller than root, LCA is in left subtree. If both are greater, LCA is in right subtree. If they split (one left, one right, or one is root), root is the LCA!',
    cppCode: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (root == nullptr) return nullptr;
    
    // Both in left subtree
    if (p->val < root->val && q->val < root->val) {
        return lowestCommonAncestor(root->left, p, q);
    }
    
    // Both in right subtree
    if (p->val > root->val && q->val > root->val) {
        return lowestCommonAncestor(root->right, p, q);
    }
    
    // Split point found -> root is LCA!
    return root;
}`
  },

  'lca_binary_tree': {
    id: 'lca_binary_tree',
    name: 'LCA in Binary Tree (General)',
    category: 'tree_dsa',
    subtitle: 'Find LCA without BST property using post-order recursion',
    difficulty: 'Medium',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4],
    defaultParams: { p: 5, q: 4 },
    paramConfigs: [
      { name: 'p', label: 'Node P value', type: 'number', default: 5, min: 0, max: 99 },
      { name: 'q', label: 'Node Q value', type: 'number', default: 4, min: 0, max: 99 }
    ],
    summary: 'Searches for p and q. If current node is p or q, returns it. If both left and right return non-null, current node is the LCA!',
    cppCode: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    // Base Case: null or found target node
    if (root == nullptr || root == p || root == q) {
        return root;
    }
    
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    
    // If both left and right found one of p or q, root is LCA!
    if (left != nullptr && right != nullptr) {
        return root;
    }
    
    // Otherwise return whichever subtree found a target
    return (left != nullptr) ? left : right;
}`
  },

  'path_sum': {
    id: 'path_sum',
    name: 'Path Sum (Root to Leaf)',
    category: 'tree_dsa',
    subtitle: 'Check if there exists a root-to-leaf path with target sum',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1],
    defaultParams: { targetSum: 22 },
    paramConfigs: [
      { name: 'targetSum', label: 'Target Sum', type: 'number', default: 22, min: 0, max: 100 }
    ],
    summary: 'Subtracts root->val from targetSum as we traverse down. When reaching a leaf node, checks if remaining targetSum == root->val.',
    cppCode: `bool hasPathSum(TreeNode* root, int targetSum) {
    if (root == nullptr) return false;
    
    // Leaf node check: if remaining sum equals node value
    if (root->left == nullptr && root->right == nullptr) {
        return targetSum == root->val;
    }
    
    // Recurse with remaining sum
    int remaining = targetSum - root->val;
    return hasPathSum(root->left, remaining) ||
           hasPathSum(root->right, remaining);
}`
  },

  'diameter_tree': {
    id: 'diameter_tree',
    name: 'Diameter of Binary Tree',
    category: 'tree_dsa',
    subtitle: 'Longest path between any two nodes in a tree',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [1, 2, 3, 4, 5],
    defaultParams: {},
    paramConfigs: [],
    summary: 'At each node, the longest path passing through it is leftHeight + rightHeight. We maintain a global diameter while computing heights bottom-up.',
    cppCode: `int maxDiameter = 0;

int calculateHeight(TreeNode* root) {
    if (root == nullptr) return 0;
    
    int leftH = calculateHeight(root->left);
    int rightH = calculateHeight(root->right);
    
    // Update global maximum diameter (edges = leftH + rightH)
    maxDiameter = max(maxDiameter, leftH + rightH);
    
    return 1 + max(leftH, rightH);
}

int diameterOfBinaryTree(TreeNode* root) {
    maxDiameter = 0;
    calculateHeight(root);
    return maxDiameter;
}`
  },

  'balanced_tree': {
    id: 'balanced_tree',
    name: 'Check Balanced Binary Tree',
    category: 'tree_dsa',
    subtitle: 'Height-balanced: |leftHeight - rightHeight| <= 1 for all nodes',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [3, 9, 20, null, null, 15, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Returns height if balanced; returns -1 immediately if unbalanced, pruning unnecessary computations.',
    cppCode: `int checkHeight(TreeNode* root) {
    if (root == nullptr) return 0;
    
    int leftH = checkHeight(root->left);
    if (leftH == -1) return -1; // Left unbalanced
    
    int rightH = checkHeight(root->right);
    if (rightH == -1) return -1; // Right unbalanced
    
    if (abs(leftH - rightH) > 1) return -1; // Unbalanced!
    
    return 1 + max(leftH, rightH);
}

bool isBalanced(TreeNode* root) {
    return checkHeight(root) != -1;
}`
  },

  'symmetric_tree': {
    id: 'symmetric_tree',
    name: 'Symmetric / Mirror Tree',
    category: 'tree_dsa',
    subtitle: 'Check if tree is a mirror of itself around the root',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    defaultTree: [1, 2, 2, 3, 4, 4, 3],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Compares left subtree and right subtree simultaneously: left->left must mirror right->right, and left->right must mirror right->left.',
    cppCode: `bool isMirror(TreeNode* t1, TreeNode* t2) {
    if (t1 == nullptr && t2 == nullptr) return true;
    if (t1 == nullptr || t2 == nullptr) return false;
    
    return (t1->val == t2->val) &&
           isMirror(t1->left, t2->right) &&
           isMirror(t1->right, t2->left);
}

bool isSymmetric(TreeNode* root) {
    if (root == nullptr) return true;
    return isMirror(root->left, root->right);
}`
  },

  // ================= RECURSION VISUALIZER =================
  'fibonacci_recursion': {
    id: 'fibonacci_recursion',
    name: 'Fibonacci Recursion Tree',
    category: 'recursion',
    subtitle: 'Visualizing how recursive calls fork and evaluate bottom-up',
    difficulty: 'Easy',
    timeComplexity: 'O(2^N) exponential',
    spaceComplexity: 'O(N) stack depth',
    defaultTree: [],
    defaultParams: { n: 4 },
    paramConfigs: [
      { name: 'n', label: 'N', type: 'number', default: 4, min: 1, max: 6 }
    ],
    summary: 'Builds a full recursion execution tree to demonstrate how f(n-1) must fully resolve before f(n-2) begins, and how return values bubble up to the caller.',
    cppCode: `int fib(int n) {
    // Base Cases
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    // Recursive Calls
    int left = fib(n - 1);
    int right = fib(n - 2);
    
    // Combine results
    return left + right;
}`
  },

  // ================= GRAPH ALGORITHMS =================
  'graph_bfs': {
    id: 'graph_bfs',
    name: 'Graph Breadth-First Search (BFS)',
    category: 'graph',
    subtitle: 'Level-by-level traversal using Queue & Visited Array',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    defaultGraph: {
      nodes: [0, 1, 2, 3, 4, 5],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 4 },
        { from: 3, to: 5 },
        { from: 4, to: 5 }
      ],
      startNode: 0
    },
    defaultParams: { startNode: 0 },
    paramConfigs: [
      { name: 'startNode', label: 'Start Vertex', type: 'number', default: 0, min: 0, max: 5 }
    ],
    summary: 'Enqueues starting node, marks visited. While queue is not empty, pops front vertex and explores all unvisited adjacent neighbors.',
    cppCode: `void bfs(int start, vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    queue<int> q;
    
    // 1. Mark start node visited and push to queue
    visited[start] = true;
    q.push(start);
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << "Visited: " << u << endl;
        
        // Explore all adjacent neighbors
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`
  },

  'graph_dfs': {
    id: 'graph_dfs',
    name: 'Graph Depth-First Search (DFS)',
    category: 'graph',
    subtitle: 'Deep exploration with recursion & backtracking',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) recursion stack',
    defaultGraph: {
      nodes: [0, 1, 2, 3, 4, 5],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 4 },
        { from: 3, to: 5 },
        { from: 4, to: 5 }
      ],
      startNode: 0
    },
    defaultParams: { startNode: 0 },
    paramConfigs: [
      { name: 'startNode', label: 'Start Vertex', type: 'number', default: 0, min: 0, max: 5 }
    ],
    summary: 'Marks current node as visited, recursively visits each unvisited neighbor. When dead end is reached, backtracks up the call stack.',
    cppCode: `void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {
    // 1. Mark current node as visited
    visited[u] = true;
    cout << "Visited: " << u << endl;
    
    // 2. Recursively explore each unvisited neighbor
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited);
        }
    }
    // 3. Backtrack up call stack
}`
  },

  'cycle_detection_undirected': {
    id: 'cycle_detection_undirected',
    name: 'Cycle Detection (Undirected Graph)',
    category: 'graph',
    subtitle: 'DFS with parent tracking to detect back-edges',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    defaultGraph: {
      nodes: [0, 1, 2, 3, 4],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 1 } // creates cycle 1-2-3-4-1
      ],
      startNode: 0
    },
    defaultParams: { startNode: 0 },
    paramConfigs: [],
    summary: 'If an adjacent neighbor is already visited and is NOT the parent of current node, a cycle exists (back-edge found).',
    cppCode: `bool hasCycleDFS(int u, int parent, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    
    for (int v : adj[u]) {
        if (!visited[v]) {
            if (hasCycleDFS(v, u, adj, visited)) {
                return true;
            }
        } else if (v != parent) {
            // Visited neighbor that is NOT parent => Cycle!
            return true;
        }
    }
    return false;
}`
  }
};
