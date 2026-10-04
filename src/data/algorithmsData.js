// Metadata, C++ source code templates, complexities, and presets for all algorithms

export const ALGORITHM_CATEGORIES = [
  { id: 'multi_tree', name: 'Multi-Tree Operations (2+ Trees)' },
  { id: 'bst', name: 'Binary Search Tree (BST)' },
  { id: 'traversals', name: 'Tree Traversals' },
  { id: 'tree_dsa', name: 'Classic Tree DSA' },
  { id: 'recursion', name: 'Recursion Deep-Dive' },
  { id: 'graph', name: 'Graph Algorithms' },
];

export const ALGORITHMS = {
  // ================= MULTI-TREE OPERATIONS =================
  'merge_two_trees': {
    id: 'merge_two_trees',
    name: 'Merge Two Binary Trees (LeetCode 617)',
    category: 'multi_tree',
    subtitle: 'Sum overlapping node values and splice subtrees in-place',
    difficulty: 'Easy',
    timeComplexity: 'O(min(N, M))',
    spaceComplexity: 'O(min(H1, H2)) call stack frames',
    multiTree: true,
    defaultTree: [1, 3, 2, 5],
    defaultTree2: [2, 1, 3, null, 4, null, 7],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Traverses both trees simultaneously. If both nodes exist, sums their values (root1->val += root2->val). If one node is null, returns the other node pointer to splice the entire subtree.',
    cppCode: `TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
    // 1. If one node is null, return the other
    if (root1 == nullptr) return root2;
    if (root2 == nullptr) return root1;
    
    // 2. Sum overlapping node values in-place
    root1->val += root2->val;
    
    // 3. Recursively merge left and right child subtrees
    root1->left = mergeTrees(root1->left, root2->left);
    root1->right = mergeTrees(root1->right, root2->right);
    
    return root1;
}`
  },

  'same_tree': {
    id: 'same_tree',
    name: 'Same Tree / Identical Check (LeetCode 100)',
    category: 'multi_tree',
    subtitle: 'Simultaneous structural and value equality verification',
    difficulty: 'Easy',
    timeComplexity: 'O(min(N, M))',
    spaceComplexity: 'O(min(H1, H2)) call stack frames',
    multiTree: true,
    defaultTree: [1, 2, 3],
    defaultTree2: [1, 2, 3],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Two binary trees are considered identical if they are structurally identical and have the exact same node values at every position.',
    cppCode: `bool isSameTree(TreeNode* p, TreeNode* q) {
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

  'subtree_of_tree': {
    id: 'subtree_of_tree',
    name: 'Subtree of Another Tree (LeetCode 572)',
    category: 'multi_tree',
    subtitle: 'Check if subRoot matches any subtree topology in root',
    difficulty: 'Easy',
    timeComplexity: 'O(N * M)',
    spaceComplexity: 'O(H) call stack frames',
    multiTree: true,
    defaultTree: [3, 4, 5, 1, 2],
    defaultTree2: [4, 1, 2],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Traverses the main tree. For each candidate node, invokes an identical tree comparator to check if the subtree matches subRoot completely.',
    cppCode: `bool isSame(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q || p->val != q->val) return false;
    return isSame(p->left, q->left) && isSame(p->right, q->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (root == nullptr) return false;
    if (isSame(root, subRoot)) return true;
    
    // Search in left or right subtrees
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}`
  },

  'merge_three_trees': {
    id: 'merge_three_trees',
    name: 'Merge 3 Binary Trees (Multi-Tree)',
    category: 'multi_tree',
    subtitle: 'Simultaneously sum 3 trees and splice subtrees across all 3 inputs',
    difficulty: 'Medium',
    timeComplexity: 'O(N1 + N2 + N3)',
    spaceComplexity: 'O(max(H1, H2, H3)) call stack frames',
    multiTree: true,
    defaultMultiTrees: [
      { id: 't1', title: 'Tree 1 (Alpha - Target)', theme: 'sky', data: [1, 3, 2, 5] },
      { id: 't2', title: 'Tree 2 (Beta - Source)', theme: 'purple', data: [2, 1, 3, null, 4, null, 7] },
      { id: 't3', title: 'Tree 3 (Gamma - Source)', theme: 'emerald', data: [3, null, 2, null, null, 1, 6] },
    ],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Traverses 3 binary trees simultaneously in parallel. Sums overlapping node values (t1->val += t2->val + t3->val) and splices non-null subtrees from donor trees into the target tree.',
    cppCode: `TreeNode* mergeThreeTrees(TreeNode* t1, TreeNode* t2, TreeNode* t3) {
    // 1. If all 3 nodes are nullptr, return nullptr
    if (!t1 && !t2 && !t3) return nullptr;
    
    // 2. Compute summed value of all present nodes
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

  'same_three_trees': {
    id: 'same_three_trees',
    name: '3-Way Tree Equivalence (Same 3 Trees)',
    category: 'multi_tree',
    subtitle: 'Simultaneous 3-way structural and node equality comparison',
    difficulty: 'Medium',
    timeComplexity: 'O(min(N1, N2, N3))',
    spaceComplexity: 'O(max(H1, H2, H3)) call stack frames',
    multiTree: true,
    defaultMultiTrees: [
      { id: 't1', title: 'Tree 1 (Alpha)', theme: 'sky', data: [1, 2, 3, 4, 5] },
      { id: 't2', title: 'Tree 2 (Beta)', theme: 'purple', data: [1, 2, 3, 4, 5] },
      { id: 't3', title: 'Tree 3 (Gamma)', theme: 'emerald', data: [1, 2, 3, 4, 5] },
    ],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Compares 3 trees at every position. Validates that all 3 trees match both topologically and in node values at every node.',
    cppCode: `bool isSameThreeTrees(TreeNode* t1, TreeNode* t2, TreeNode* t3) {
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

  'flatten_binary_tree': {
    id: 'flatten_binary_tree',
    name: 'Flatten Binary Tree to Linked List',
    category: 'tree_dsa',
    subtitle: 'LeetCode 114 — In-place pointer rewiring into right-skewed Linked List',
    difficulty: 'Medium',
    timeComplexity: 'O(N) time with O(1) auxiliary space',
    spaceComplexity: 'O(1) extra memory (in-place pointer transformation)',
    defaultTree: [1, 2, 5, 3, 4, null, 6],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Flattens a binary tree into a linked list in-place along right child pointers matching pre-order traversal order (1 -> 2 -> 3 -> 4 -> 5 -> 6), setting all left pointers to nullptr.',
    cppCode: `// LeetCode 114: Flatten Binary Tree to Linked List
void flatten(TreeNode* root) {
    TreeNode* curr = root;
    while (curr != nullptr) {
        if (curr->left != nullptr) {
            // Find rightmost node in left subtree (predecessor)
            TreeNode* prev = curr->left;
            while (prev->right != nullptr) {
                prev = prev->right;
            }
            
            // 1. Splice curr's right subtree to predecessor's right
            prev->right = curr->right;
            // 2. Move left subtree to right
            curr->right = curr->left;
            // 3. Nullify left child pointer
            curr->left = nullptr;
        }
        // Move to next node in right chain
        curr = curr->right;
    }
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

  // ================= RECURSION DEEP-DIVE =================
  'merge_sort': {
    id: 'merge_sort',
    name: 'Merge Sort (Divide & Conquer)',
    category: 'recursion',
    subtitle: 'Recursive array splitting and bottom-up sorted merging',
    difficulty: 'Medium',
    timeComplexity: 'O(N log N) in all cases',
    spaceComplexity: 'O(N) aux memory + O(log N) stack',
    defaultTree: [],
    defaultArray: [38, 27, 43, 3, 9, 82, 10],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Divide & conquer: recursively splits array in half down to single-element base cases, then combines sorted subarrays bottom-up using two pointers.',
    cppCode: `void merge(vector<int>& arr, int l, int mid, int r);

void mergeSort(vector<int>& arr, int l, int r) {
    // Base Case: 1 element or invalid range
    if (l >= r) {
        return;
    }
    
    // 1. Divide: Find midpoint
    int mid = l + (r - l) / 2;
    
    // 2. Recurse on Left and Right halves
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    
    // 3. Conquer: Merge the two sorted halves
    merge(arr, l, mid, r);
}`
  },

  'quick_sort': {
    id: 'quick_sort',
    name: 'Quick Sort (Partitioning & Recursion)',
    category: 'recursion',
    subtitle: 'Pivot partitioning and recursive sub-array sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(N log N) avg, O(N^2) worst',
    spaceComplexity: 'O(log N) call stack',
    defaultTree: [],
    defaultArray: [10, 80, 30, 90, 40, 50, 70],
    defaultParams: {},
    paramConfigs: [],
    summary: 'Selects a pivot, partitions elements smaller to the left and larger to the right, then recursively applies quicksort to both partitions.',
    cppCode: `int partition(vector<int>& arr, int low, int high);

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

  'subsets_backtracking': {
    id: 'subsets_backtracking',
    name: 'Subsets / Power Set (Backtracking)',
    category: 'recursion',
    subtitle: 'Binary decision tree: Pick vs Don’t Pick',
    difficulty: 'Medium',
    timeComplexity: 'O(2^N)',
    spaceComplexity: 'O(N) recursion depth',
    defaultTree: [],
    defaultArray: [1, 2, 3],
    defaultParams: {},
    paramConfigs: [],
    summary: 'At each index, makes a binary decision: either include nums[i] in the current subset and recurse, or backtrack and exclude it.',
    cppCode: `void generateSubsets(vector<int>& nums, int index, vector<int>& current, vector<vector<int>>& result) {
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

  'tower_of_hanoi': {
    id: 'tower_of_hanoi',
    name: 'Tower of Hanoi (3-Pegs Recursion)',
    category: 'recursion',
    subtitle: 'Classic 3-rod disk movement recursion tree',
    difficulty: 'Easy',
    timeComplexity: 'O(2^N - 1)',
    spaceComplexity: 'O(N) stack frames',
    defaultTree: [],
    defaultParams: { n: 3 },
    paramConfigs: [
      { name: 'n', label: 'Disks (N)', type: 'number', default: 3, min: 1, max: 4 }
    ],
    summary: 'Recursively moves n-1 disks from source to auxiliary, moves the largest disk directly to destination, and then moves the n-1 disks from auxiliary to destination.',
    cppCode: `void towerOfHanoi(int n, char fromRod, char toRod, char auxRod) {
    // Base Case
    if (n == 1) {
        cout << "Move disk 1: " << fromRod << " -> " << toRod << endl;
        return;
    }
    
    // 1. Move n-1 disks source -> aux
    towerOfHanoi(n - 1, fromRod, auxRod, toRod);
    
    // 2. Move nth disk source -> dest
    cout << "Move disk " << n << ": " << fromRod << " -> " << toRod << endl;
    
    // 3. Move n-1 disks aux -> dest
    towerOfHanoi(n - 1, auxRod, toRod, fromRod);
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
