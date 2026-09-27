import { cloneTree, createTreeNode } from '../utils/treeLayout';

function snapshotTree(root, nodeStatuses = {}) {
  if (!root) return null;
  const status = nodeStatuses[root.id] || null;
  return {
    id: root.id,
    val: root.val,
    status: status?.status || null,
    badge: status?.badge || null,
    customColor: status?.color || null,
    left: snapshotTree(root.left, nodeStatuses),
    right: snapshotTree(root.right, nodeStatuses),
  };
}

// ==========================================
// 1. BST INSERTION (Complete Line-by-Line & Backtracking)
// ==========================================
export function generateBstInsertSteps(initialTree, insertVal) {
  const steps = [];
  let treeState = cloneTree(initialTree);
  const val = Number(insertVal);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function insertHelper(node, parentNode, isLeft) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';
    
    // Push Frame (Line 9)
    const frame = {
      id: currentCallId,
      func: `insertIntoBST`,
      args: { root: nodeLabel, val },
      line: 9,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `insert(${nodeLabel}, ${val})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 9: Function Entry
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : (parentNode ? parentNode.id : null),
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Calling TreeNode* insertIntoBST(root = ${nodeLabel}, val = ${val}).`,
      variables: { root: nodeLabel, val },
      actionType: 'CALL',
      output: [],
    });

    // Line 11: Base Case Check
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : (parentNode ? parentNode.id : null),
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, val, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node 
        ? `Line 11: Base case check 'root == nullptr' is FALSE (root is Node(${node.val})). Continuing traversal.`
        : `Line 11: Base case HIT! 'root == nullptr' is TRUE. Found empty insertion slot for ${val}.`,
      variables: { root: nodeLabel, val },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      // Line 12: return new TreeNode(val);
      const newNode = createTreeNode(val, null, null, `node_new_${val}`);
      
      steps.push({
        line: 12,
        tree: snapshotTree(treeState),
        activeNodeId: newNode.id,
        highlightNodeIds: [newNode.id],
        pointers: { root: 'nullptr', 'new Node': `Node(${val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 12: Allocating new node in heap memory: 'return new TreeNode(${val});'. This address will be returned to parent.`,
        variables: { 'new Node': `TreeNode(${val})` },
        actionType: 'CREATE_NODE',
        output: [],
      });

      if (parentNode) {
        if (isLeft) parentNode.left = newNode;
        else parentNode.right = newNode;
      } else {
        treeState = newNode;
      }

      frame.returnVal = `Node(${val})`;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = `Node(${val})`; }

      steps.push({
        line: 12,
        tree: snapshotTree(treeState, { [newNode.id]: { status: 'created' } }),
        activeNodeId: newNode.id,
        highlightNodeIds: [newNode.id],
        pointers: { root: `Node(${val})`, returnVal: `Node(${val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 12: Returning pointer to Node(${val}) back to parent caller. Stack frame popping.`,
        variables: { returnVal: `Node(${val})` },
        actionType: 'RETURN',
        output: [],
      });

      stack.pop();
      return newNode;
    }

    if (val < node.val) {
      // Line 16: val < root->val
      steps.push({
        line: 16,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${val} < ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 16: ${val} < ${node.val} is TRUE. According to BST rule, key belongs in LEFT subtree.`,
        variables: { val, 'root->val': node.val, branch: 'LEFT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 17: root->left = insertIntoBST(root->left, val);
      frame.line = 17;
      steps.push({
        line: 17,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 17: Calling root->left = insertIntoBST(root->left, ${val}). Frame on Node(${node.val}) PAUSES.`,
        variables: { calling: `insertIntoBST(${node.left ? node.left.val : 'nullptr'}, ${val})` },
        actionType: 'CALL',
        output: [],
      });

      node.left = insertHelper(node.left, node, true);

      // Back on Line 17 (Backtracking / return received!)
      steps.push({
        line: 17,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' }, [node.left.id]: { status: 'created' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id, node.left.id],
        pointers: { root: `Node(${node.val})`, 'root->left': `Node(${node.left.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 17 (Backtrack): Resumed on Node(${node.val}). Pointer assigned: root->left = Node(${node.left.val}). Connection established!`,
        variables: { 'root->left': `Node(${node.left.val})` },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

    } else if (val > node.val) {
      // Line 18: val > root->val
      steps.push({
        line: 18,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${val} > ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 18: ${val} > ${node.val} is TRUE. According to BST rule, key belongs in RIGHT subtree.`,
        variables: { val, 'root->val': node.val, branch: 'RIGHT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 19: root->right = insertIntoBST(root->right, val);
      frame.line = 19;
      steps.push({
        line: 19,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 19: Calling root->right = insertIntoBST(root->right, ${val}). Frame on Node(${node.val}) PAUSES.`,
        variables: { calling: `insertIntoBST(${node.right ? node.right.val : 'nullptr'}, ${val})` },
        actionType: 'CALL',
        output: [],
      });

      node.right = insertHelper(node.right, node, false);

      // Back on Line 19 (Backtracking!)
      steps.push({
        line: 19,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' }, [node.right.id]: { status: 'created' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id, node.right.id],
        pointers: { root: `Node(${node.val})`, 'root->right': `Node(${node.right.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 19 (Backtrack): Resumed on Node(${node.val}). Pointer assigned: root->right = Node(${node.right.val}). Connection established!`,
        variables: { 'root->right': `Node(${node.right.val})` },
        actionType: 'POINTER_UPDATE',
        output: [],
      });
    }

    // Line 23: return root;
    frame.line = 23;
    frame.returnVal = `Node(${node.val})`;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = `Node(${node.val})`; }

    steps.push({
      line: 23,
      tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnVal: `Node(${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 23: Returning root Node(${node.val}) pointer up the call stack to maintain tree structure.`,
      variables: { returnVal: `Node(${node.val})` },
      actionType: 'RETURN',
      output: [],
    });

    stack.pop();
    return node;
  }

  insertHelper(treeState, null, false);
  return steps;
}


// ==========================================
// 2. BST DELETION (Full 3 Cases + In-Order Successor Loop + Backtracking)
// ==========================================
export function generateBstDeleteSteps(initialTree, deleteKey) {
  const steps = [];
  let treeState = cloneTree(initialTree);
  const key = Number(deleteKey);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function findMinHelper(node) {
    const minCallId = `call_${++callIdCounter}`;
    const frame = {
      id: minCallId,
      func: `findMin`,
      args: { node: `Node(${node.val})` },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    let curr = node;
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { [curr.id]: { status: 'active' } }),
      activeNodeId: curr.id,
      highlightNodeIds: [curr.id],
      pointers: { 'findMin(node)': `Node(${curr.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: In-order successor lookup: findMin(root->right = Node(${curr.val})). Traversing to leftmost node.`,
      variables: { curr: `Node(${curr.val})` },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: while (node && node->left != nullptr)
    while (curr && curr.left) {
      steps.push({
        line: 2,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'active' }, [curr.left.id]: { status: 'highlight' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id, curr.left.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->left != nullptr': 'true' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: node->left != nullptr is TRUE. Moving deeper left: node = node->left.`,
        variables: { curr: `Node(${curr.val})`, 'nextLeft': `Node(${curr.left.val})` },
        actionType: 'LOOP',
        output: [],
      });

      // Line 3: node = node->left;
      curr = curr.left;
      steps.push({
        line: 3,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'active' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: { node: `Node(${curr.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 3: node = node->left. Current pointer is now Node(${curr.val}).`,
        variables: { node: `Node(${curr.val})` },
        actionType: 'POINTER_UPDATE',
        output: [],
      });
    }

    // Line 5: return node;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { [curr.id]: { status: 'inorder_successor' } }),
      activeNodeId: curr.id,
      highlightNodeIds: [curr.id],
      pointers: { 'In-order Successor': `Node(${curr.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5: In-order Successor is Node(${curr.val})! It is smallest in right subtree and has NO left child. Returning node pointer.`,
      variables: { successorVal: curr.val },
      actionType: 'RETURN',
      output: [],
    });

    stack.pop();
    return curr;
  }

  function deleteHelper(node, parentNode, isLeft) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `deleteNode`,
      args: { root: nodeLabel, key },
      line: 8,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `deleteNode(${nodeLabel}, ${key})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 8: Function Entry
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, key },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Calling TreeNode* deleteNode(root = ${nodeLabel}, key = ${key}).`,
      variables: { root: nodeLabel, key },
      actionType: 'CALL',
      output: [],
    });

    // Line 9: Base Case Check
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, key, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node 
        ? `Line 9: 'root == nullptr' is FALSE (root = Node(${node.val})). Proceeding to key comparison.`
        : `Line 9: Base Case HIT! 'root == nullptr' is TRUE. Key ${key} not in tree. Returning nullptr.`,
      variables: { root: nodeLabel, key },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      frame.returnVal = 'nullptr';
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 'nullptr'; }
      stack.pop();
      return null;
    }

    if (key < node.val) {
      // Line 11: key < root->val
      steps.push({
        line: 11,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${key} < ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 11: ${key} < ${node.val} is TRUE. Target to delete is in LEFT subtree.`,
        variables: { key, 'root->val': node.val, branch: 'LEFT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 12: root->left = deleteNode(root->left, key);
      frame.line = 12;
      steps.push({
        line: 12,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 12: Calling root->left = deleteNode(root->left, ${key}). Execution on Node(${node.val}) PAUSES.`,
        variables: { key, target: 'root->left' },
        actionType: 'CALL',
        output: [],
      });

      node.left = deleteHelper(node.left, node, true);

      // Back on Line 12 (Backtracking!)
      steps.push({
        line: 12,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 12 (Backtrack): Resumed on Node(${node.val}). Left subtree deletion returned. Updated pointer root->left = ${node.left ? `Node(${node.left.val})` : 'nullptr'}.`,
        variables: { 'root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

    } else if (key > node.val) {
      // Line 13: key > root->val
      steps.push({
        line: 13,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${key} > ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 13: ${key} > ${node.val} is TRUE. Target to delete is in RIGHT subtree.`,
        variables: { key, 'root->val': node.val, branch: 'RIGHT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 14: root->right = deleteNode(root->right, key);
      frame.line = 14;
      steps.push({
        line: 14,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 14: Calling root->right = deleteNode(root->right, ${key}). Execution on Node(${node.val}) PAUSES.`,
        variables: { key, target: 'root->right' },
        actionType: 'CALL',
        output: [],
      });

      node.right = deleteHelper(node.right, node, false);

      // Back on Line 14 (Backtracking!)
      steps.push({
        line: 14,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 14 (Backtrack): Resumed on Node(${node.val}). Right subtree deletion returned. Updated pointer root->right = ${node.right ? `Node(${node.right.val})` : 'nullptr'}.`,
        variables: { 'root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

    } else {
      // MATCH FOUND! (Line 15)
      steps.push({
        line: 15,
        tree: snapshotTree(treeState, { [node.id]: { status: 'matched' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'TARGET MATCHED': key },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `🎯 Line 15: MATCH FOUND! root->val (${node.val}) == ${key}. Now checking which of the 3 Deletion Cases applies.`,
        variables: { 'root->val': node.val, hasLeft: !!node.left, hasRight: !!node.right },
        actionType: 'MATCH',
        output: [],
      });

      // Check Case 1 / 2: root->left == nullptr
      if (node.left === null) {
        // Line 19: if (root->left == nullptr)
        steps.push({
          line: 19,
          tree: snapshotTree(treeState, { [node.id]: { status: 'matched' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { root: `Node(${node.val})`, 'root->left == nullptr': 'true' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 19: Case 1/2 (No left child): 'root->left == nullptr' is TRUE.`,
          variables: { 'root->left': null },
          actionType: 'CHECK',
          output: [],
        });

        // Line 20: TreeNode* temp = root->right;
        const temp = node.right;
        steps.push({
          line: 20,
          tree: snapshotTree(treeState, { [node.id]: { status: 'matched' }, ...(temp ? { [temp.id]: { status: 'created' } } : {}) }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id, ...(temp ? [temp.id] : [])],
          pointers: { root: `Node(${node.val})`, temp: temp ? `Node(${temp.val})` : 'nullptr' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 20: Saving temp = root->right (${temp ? `Node(${temp.val})` : 'nullptr'}). This pointer will replace root.`,
          variables: { temp: temp ? `Node(${temp.val})` : 'nullptr' },
          actionType: 'POINTER_UPDATE',
          output: [],
        });

        // Line 21: delete root;
        steps.push({
          line: 21,
          tree: snapshotTree(treeState, { [node.id]: { status: 'deleted' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { 'DELETING': `Node(${node.val})`, temp: temp ? `Node(${temp.val})` : 'nullptr' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 21: C++ Memory Deallocation: 'delete root;'. Heap memory for Node(${node.val}) is freed.`,
          variables: { deletedNode: node.val },
          actionType: 'DELETE',
          output: [],
        });

        if (parentNode) {
          if (isLeft) parentNode.left = temp;
          else parentNode.right = temp;
        } else {
          treeState = temp;
        }

        // Line 22: return temp;
        frame.returnVal = temp ? `Node(${temp.val})` : 'nullptr';
        const rNode = recursionNodes.find(n => n.id === currentCallId);
        if (rNode) { rNode.status = 'returned'; rNode.returnVal = frame.returnVal; }

        steps.push({
          line: 22,
          tree: snapshotTree(treeState, temp ? { [temp.id]: { status: 'active' } } : {}),
          activeNodeId: temp ? temp.id : null,
          highlightNodeIds: temp ? [temp.id] : [],
          pointers: { returnVal: temp ? `Node(${temp.val})` : 'nullptr' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 22: Returning temp (${temp ? `Node(${temp.val})` : 'nullptr'}) up to caller frame to rewire parent.`,
          variables: { returnVal: temp ? `Node(${temp.val})` : 'nullptr' },
          actionType: 'RETURN',
          output: [],
        });

        stack.pop();
        return temp;

      } else if (node.right === null) {
        // Line 23: else if (root->right == nullptr)
        steps.push({
          line: 23,
          tree: snapshotTree(treeState, { [node.id]: { status: 'matched' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { root: `Node(${node.val})`, 'root->right == nullptr': 'true' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 23: Case 2 (No right child): 'root->right == nullptr' is TRUE.`,
          variables: { 'root->right': null },
          actionType: 'CHECK',
          output: [],
        });

        // Line 24: TreeNode* temp = root->left;
        const temp = node.left;
        steps.push({
          line: 24,
          tree: snapshotTree(treeState, { [node.id]: { status: 'matched' }, [temp.id]: { status: 'created' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id, temp.id],
          pointers: { root: `Node(${node.val})`, temp: `Node(${temp.val})` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 24: Saving temp = root->left (Node(${temp.val})).`,
          variables: { temp: `Node(${temp.val})` },
          actionType: 'POINTER_UPDATE',
          output: [],
        });

        // Line 25: delete root;
        steps.push({
          line: 25,
          tree: snapshotTree(treeState, { [node.id]: { status: 'deleted' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { 'DELETING': `Node(${node.val})`, temp: `Node(${temp.val})` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 25: C++ Memory Deallocation: 'delete root;'. Heap memory for Node(${node.val}) is freed.`,
          variables: { deletedNode: node.val },
          actionType: 'DELETE',
          output: [],
        });

        if (parentNode) {
          if (isLeft) parentNode.left = temp;
          else parentNode.right = temp;
        } else {
          treeState = temp;
        }

        // Line 26: return temp;
        frame.returnVal = `Node(${temp.val})`;
        const rNode = recursionNodes.find(n => n.id === currentCallId);
        if (rNode) { rNode.status = 'returned'; rNode.returnVal = frame.returnVal; }

        steps.push({
          line: 26,
          tree: snapshotTree(treeState, { [temp.id]: { status: 'active' } }),
          activeNodeId: temp.id,
          highlightNodeIds: [temp.id],
          pointers: { returnVal: `Node(${temp.val})` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 26: Returning temp Node(${temp.val}) to caller frame to replace deleted node.`,
          variables: { returnVal: `Node(${temp.val})` },
          actionType: 'RETURN',
          output: [],
        });

        stack.pop();
        return temp;

      } else {
        // CASE 3: TWO CHILDREN!
        steps.push({
          line: 29,
          tree: snapshotTree(treeState, { [node.id]: { status: 'matched' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { root: `Node(${node.val})`, left: `Node(${node.left.val})`, right: `Node(${node.right.val})` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `⚡ Line 29: CASE 3 (Two Children): Node(${node.val}) has both left & right children! Must find In-order Successor (min in right subtree).`,
          variables: { case: '2 Children', left: node.left.val, right: node.right.val },
          actionType: 'CASE_3_START',
          output: [],
        });

        // Line 30: TreeNode* succ = findMin(root->right);
        frame.line = 30;
        const succ = findMinHelper(node.right);
        const succVal = succ.val;

        // Line 31: root->val = succ->val;
        node.val = succVal;
        steps.push({
          line: 31,
          tree: snapshotTree(treeState, { [node.id]: { status: 'created' }, [succ.id]: { status: 'inorder_successor' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id, succ.id],
          pointers: { root: `Node(${succVal}) [overwritten]`, 'succ->val': succVal },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 31: root->val = succ->val. Overwrote node value with successor's value (${succVal}). Now deleting duplicate successor from right subtree!`,
          variables: { 'root->val': succVal, 'succ->val': succVal },
          actionType: 'OVERWRITE_VAL',
          output: [],
        });

        // Line 32: root->right = deleteNode(root->right, succ->val);
        frame.line = 32;
        steps.push({
          line: 32,
          tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { root: `Node(${node.val})`, 'deleting successor': succVal },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 32: Calling root->right = deleteNode(root->right, ${succVal}) to remove duplicate successor.`,
          variables: { deleteSuccessor: succVal },
          actionType: 'CALL',
          output: [],
        });

        node.right = deleteHelper(node.right, node, false);

        // Back on Line 32 (Backtracking!)
        steps.push({
          line: 32,
          tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
          activeNodeId: node.id,
          highlightNodeIds: [node.id],
          pointers: { root: `Node(${node.val})`, 'root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 32 (Backtrack): Successor deleted! Right subtree rewired: root->right = ${node.right ? `Node(${node.right.val})` : 'nullptr'}.`,
          variables: { 'root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
          actionType: 'POINTER_UPDATE',
          output: [],
        });
      }
    }

    // Line 34: return root;
    frame.line = 34;
    frame.returnVal = `Node(${node.val})`;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = frame.returnVal; }

    steps.push({
      line: 34,
      tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnVal: `Node(${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 34: Returning root Node(${node.val}) pointer to caller frame.`,
      variables: { returnVal: `Node(${node.val})` },
      actionType: 'RETURN',
      output: [],
    });

    stack.pop();
    return node;
  }

  deleteHelper(treeState, null, false);
  return steps;
}


// ==========================================
// 3. INORDER TRAVERSAL (Complete Left -> Process Root -> Right + Backtracking)
// ==========================================
export function generateInorderSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const result = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const visitedMap = {};

  function inorderHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    // Line 1: Function Call Entry
    const frame = {
      id: currentCallId,
      func: `inorder`,
      args: { root: nodeLabel, 'res.size()': result.length },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `inorder(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering void inorder(root = ${nodeLabel}, res).`,
      variables: { root: nodeLabel, resultSoFar: [...result] },
      actionType: 'CALL',
      output: [...result],
    });

    // Line 2: if (root == nullptr) return;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 2: Base case 'root == nullptr' is FALSE (root = Node(${node.val})). Recursing left.`
        : `Line 2: Base Case HIT! 'root == nullptr' is TRUE. Returning immediately from empty subtree.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [...result],
    });

    if (!node) {
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; }
      stack.pop();
      return;
    }

    // Line 5: inorder(root->left, res);
    frame.line = 5;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Step 1: Left Subtree): Calling inorder(root->left). Execution on Node(${node.val}) PAUSES until left subtree finishes.`,
      variables: { step: '1. Left Subtree', node: node.val },
      actionType: 'CALL',
      output: [...result],
    });

    inorderHelper(node.left);

    // Backtrack on Line 5
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Left Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Backtrack): Left subtree of Node(${node.val}) finished! Resuming execution at Node(${node.val}).`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 8: res.push_back(root->val);
    result.push(node.val);
    visitedMap[node.id] = { status: 'visited' };

    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'matched' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'res.push_back': node.val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Step 2: Process Root): Appending ${node.val} to result list: [${result.join(', ')}].`,
      variables: { 'res.push_back': node.val, result: [...result] },
      actionType: 'PROCESS_NODE',
      output: [...result],
    });

    // Line 11: inorder(root->right, res);
    frame.line = 11;
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Step 3: Right Subtree): Calling inorder(root->right). Frame on Node(${node.val}) PAUSES.`,
      variables: { step: '3. Right Subtree', node: node.val },
      actionType: 'CALL',
      output: [...result],
    });

    inorderHelper(node.right);

    // Backtrack on Line 11
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Right Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Backtrack): Right subtree of Node(${node.val}) finished!`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 12: Function Exit (})
    frame.line = 12;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Frame Complete' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Inorder traversal for subtree Node(${node.val}) complete. Popping stack frame and returning to caller.`,
      variables: { completedNode: node.val },
      actionType: 'RETURN',
      output: [...result],
    });

    stack.pop();
  }

  inorderHelper(treeState);
  return steps;
}


// ==========================================
// 4. PREORDER TRAVERSAL (Root First -> Left -> Right + Backtracking)
// ==========================================
export function generatePreorderSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const result = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const visitedMap = {};

  function preorderHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `preorder`,
      args: { root: nodeLabel, 'res.size()': result.length },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `preorder(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering void preorder(root = ${nodeLabel}, res).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [...result],
    });

    // Line 2: if (root == nullptr) return;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 2: 'root == nullptr' is FALSE (root = Node(${node.val})). Processing root immediately!`
        : `Line 2: Base Case: 'root == nullptr' is TRUE. Returning.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [...result],
    });

    if (!node) {
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; }
      stack.pop();
      return;
    }

    // Line 5: res.push_back(root->val);
    result.push(node.val);
    visitedMap[node.id] = { status: 'visited' };

    frame.line = 5;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'matched' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'res.push_back': node.val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Step 1: Process Root FIRST): Appending ${node.val} to result: [${result.join(', ')}].`,
      variables: { added: node.val, result: [...result] },
      actionType: 'PROCESS_NODE',
      output: [...result],
    });

    // Line 8: preorder(root->left, res);
    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Step 2: Left Subtree): Calling preorder(root->left).`,
      variables: { step: '2. Left Subtree' },
      actionType: 'CALL',
      output: [...result],
    });

    preorderHelper(node.left);

    // Backtrack on Line 8
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Left Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Backtrack): Resumed at Node(${node.val}) after left subtree finished.`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 11: preorder(root->right, res);
    frame.line = 11;
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Step 3: Right Subtree): Calling preorder(root->right).`,
      variables: { step: '3. Right Subtree' },
      actionType: 'CALL',
      output: [...result],
    });

    preorderHelper(node.right);

    // Backtrack on Line 11
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Right Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Backtrack): Resumed at Node(${node.val}) after right subtree finished.`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 12: Exit
    frame.line = 12;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Preorder on Node(${node.val}) subtree complete. Popping stack frame.`,
      variables: { completed: node.val },
      actionType: 'RETURN',
      output: [...result],
    });

    stack.pop();
  }

  preorderHelper(treeState);
  return steps;
}


// ==========================================
// 5. POSTORDER TRAVERSAL (Left -> Right -> Root Last + Backtracking)
// ==========================================
export function generatePostorderSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const result = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const visitedMap = {};

  function postorderHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `postorder`,
      args: { root: nodeLabel, 'res.size()': result.length },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `postorder(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering void postorder(root = ${nodeLabel}, res).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [...result],
    });

    // Line 2: Base case
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...visitedMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 2: 'root == nullptr' is FALSE. Must traverse left & right subtrees before touching Node(${node.val}).`
        : `Line 2: Base Case: 'root == nullptr' is TRUE. Returning.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [...result],
    });

    if (!node) {
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; }
      stack.pop();
      return;
    }

    // Line 5: postorder(root->left, res);
    frame.line = 5;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Step 1: Left Subtree): Calling postorder(root->left). Frame on Node(${node.val}) PAUSES.`,
      variables: { step: '1. Left Subtree' },
      actionType: 'CALL',
      output: [...result],
    });

    postorderHelper(node.left);

    // Backtrack on Line 5
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Left Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Backtrack): Resumed at Node(${node.val}) after left subtree finished.`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 8: postorder(root->right, res);
    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Step 2: Right Subtree): Calling postorder(root->right). Frame on Node(${node.val}) PAUSES.`,
      variables: { step: '2. Right Subtree' },
      actionType: 'CALL',
      output: [...result],
    });

    postorderHelper(node.right);

    // Backtrack on Line 8
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Right Subtree Completed' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Backtrack): Resumed at Node(${node.val}) after right subtree finished.`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [...result],
    });

    // Line 11: res.push_back(root->val);
    result.push(node.val);
    visitedMap[node.id] = { status: 'visited' };

    frame.line = 11;
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'matched' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'res.push_back': node.val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Step 3: Process Root LAST): Both subtrees finished! Appending ${node.val}: [${result.join(', ')}].`,
      variables: { 'res.push_back': node.val, result: [...result] },
      actionType: 'PROCESS_NODE',
      output: [...result],
    });

    // Line 12: Exit
    frame.line = 12;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Postorder traversal on Node(${node.val}) subtree complete. Popping stack frame.`,
      variables: { completed: node.val },
      actionType: 'RETURN',
      output: [...result],
    });

    stack.pop();
  }

  postorderHelper(treeState);
  return steps;
}


// ==========================================
// 6. MAXIMUM DEPTH / HEIGHT (With Full Backtracking & Result Aggregation)
// ==========================================
export function generateMaxDepthSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function maxDepthHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    // Line 1: Function Entry
    const frame = {
      id: currentCallId,
      func: `maxDepth`,
      args: { root: nodeLabel },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `maxDepth(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering int maxDepth(root = ${nodeLabel}).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [],
    });

    // Line 3: if (root == nullptr) return 0;
    steps.push({
      line: 3,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 3: 'root == nullptr' is FALSE (root = Node(${node.val})). Computing left and right subtree heights.`
        : `Line 3: Base Case HIT! 'root == nullptr' is TRUE. Height of empty node is 0. Returning 0.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      // Line 4: return 0;
      frame.line = 4;
      frame.returnVal = 0;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 0; }

      steps.push({
        line: 4,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { returnVal: 0 },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: return 0; Popping stack frame back to parent.`,
        variables: { returnVal: 0 },
        actionType: 'RETURN',
        output: [],
      });

      stack.pop();
      return 0;
    }

    // Line 8: int leftHeight = maxDepth(root->left);
    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Calling leftHeight = maxDepth(root->left). Execution on Node(${node.val}) PAUSES.`,
      variables: { root: node.val, calculating: 'leftHeight' },
      actionType: 'CALL',
      output: [],
    });

    const leftHeight = maxDepthHelper(node.left);

    // Backtrack on Line 8
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftHeight },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Backtrack): Resumed at Node(${node.val}). Left subtree evaluated: leftHeight = ${leftHeight}.`,
      variables: { root: node.val, leftHeight },
      actionType: 'RECEIVE_RETURN',
      output: [],
    });

    // Line 9: int rightHeight = maxDepth(root->right);
    frame.line = 9;
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftHeight, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 9: Calling rightHeight = maxDepth(root->right). Frame on Node(${node.val}) PAUSES again.`,
      variables: { root: node.val, leftHeight, calculating: 'rightHeight' },
      actionType: 'CALL',
      output: [],
    });

    const rightHeight = maxDepthHelper(node.right);

    // Backtrack on Line 9
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftHeight, rightHeight },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 9 (Backtrack): Resumed at Node(${node.val}). Right subtree evaluated: rightHeight = ${rightHeight}.`,
      variables: { root: node.val, leftHeight, rightHeight },
      actionType: 'RECEIVE_RETURN',
      output: [],
    });

    // Line 12: return 1 + max(leftHeight, rightHeight);
    const currentHeight = 1 + Math.max(leftHeight, rightHeight);
    statusMap[node.id] = { status: 'visited', badge: `h=${currentHeight}` };

    frame.line = 12;
    frame.returnVal = currentHeight;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = currentHeight; }

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: `h=${currentHeight}` } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftHeight, rightHeight, formula: `1 + max(${leftHeight}, ${rightHeight}) = ${currentHeight}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Height calculated! 1 + max(leftH=${leftHeight}, rightH=${rightHeight}) = ${currentHeight}. Returning ${currentHeight}.`,
      variables: { leftHeight, rightHeight, height: currentHeight },
      actionType: 'RETURN',
      output: [currentHeight],
    });

    stack.pop();
    return currentHeight;
  }

  maxDepthHelper(treeState);
  return steps;
}


// ==========================================
// 7. INVERT TREE (Swap + Recurse Left & Right + Backtracking)
// ==========================================
export function generateInvertTreeSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function invertHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `invertTree`,
      args: { root: nodeLabel },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `invertTree(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering TreeNode* invertTree(root = ${nodeLabel}).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [],
    });

    // Line 3: if (root == nullptr) return nullptr;
    steps.push({
      line: 3,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 3: 'root == nullptr' is FALSE (root = Node(${node.val})). Swapping left and right pointers.`
        : `Line 3: Base Case: 'root == nullptr' is TRUE. Returning nullptr.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      frame.line = 4;
      frame.returnVal = 'nullptr';
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 'nullptr'; }

      steps.push({
        line: 4,
        tree: snapshotTree(treeState),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { returnVal: 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: return nullptr; Popping stack frame.`,
        variables: { returnVal: 'nullptr' },
        actionType: 'RETURN',
        output: [],
      });

      stack.pop();
      return null;
    }

    // Line 8: TreeNode* temp = root->left;
    const leftVal = node.left ? `Node(${node.left.val})` : 'nullptr';
    const rightVal = node.right ? `Node(${node.right.val})` : 'nullptr';
    const temp = node.left;

    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, temp: leftVal },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: TreeNode* temp = root->left (${leftVal}). Saved left child pointer in temp.`,
      variables: { temp: leftVal },
      actionType: 'POINTER_UPDATE',
      output: [],
    });

    // Line 9: root->left = root->right;
    node.left = node.right;
    frame.line = 9;
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'root->left': rightVal, temp: leftVal },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 9: root->left = root->right. Left pointer now points to ${rightVal}.`,
      variables: { 'root->left': rightVal, temp: leftVal },
      actionType: 'POINTER_UPDATE',
      output: [],
    });

    // Line 10: root->right = temp;
    node.right = temp;
    frame.line = 10;
    steps.push({
      line: 10,
      tree: snapshotTree(treeState, { [node.id]: { status: 'created' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'new left': node.left ? `Node(${node.left.val})` : 'nullptr', 'new right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 10: root->right = temp (${leftVal}). Pointer swap complete on Node(${node.val})!`,
      variables: { 'root->left': node.left ? node.left.val : null, 'root->right': node.right ? node.right.val : null },
      actionType: 'SWAP',
      output: [],
    });

    // Line 13: invertTree(root->left);
    frame.line = 13;
    steps.push({
      line: 13,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'inverting left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 13: Calling invertTree(root->left) to recursively invert left subtree.`,
      variables: { branch: 'LEFT' },
      actionType: 'CALL',
      output: [],
    });

    invertHelper(node.left);

    // Backtrack on Line 13
    steps.push({
      line: 13,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Left Inversion Complete' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 13 (Backtrack): Left subtree inversion finished! Resuming at Node(${node.val}).`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 14: invertTree(root->right);
    frame.line = 14;
    steps.push({
      line: 14,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'inverting right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 14: Calling invertTree(root->right) to recursively invert right subtree.`,
      variables: { branch: 'RIGHT' },
      actionType: 'CALL',
      output: [],
    });

    invertHelper(node.right);

    // Backtrack on Line 14
    steps.push({
      line: 14,
      tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, status: 'Right Inversion Complete' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 14 (Backtrack): Right subtree inversion finished! Both subtrees inverted.`,
      variables: { resumedAt: node.val },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 16: return root;
    frame.line = 16;
    frame.returnVal = `Node(${node.val})`;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = `Node(${node.val})`; }

    steps.push({
      line: 16,
      tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnVal: `Node(${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 16: Returning inverted Node(${node.val}) pointer up the call stack.`,
      variables: { returnVal: `Node(${node.val})` },
      actionType: 'RETURN',
      output: [],
    });

    stack.pop();
    return node;
  }

  invertHelper(treeState);
  return steps;
}

// Export remaining helpers
export {
  generateBstSearchSteps,
  generateValidateBstSteps,
  generateLevelOrderSteps,
  generateLcaBstSteps,
  generateLcaBinaryTreeSteps,
  generatePathSumSteps,
  generateDiameterSteps,
  generateBalancedTreeSteps,
  generateSymmetricTreeSteps,
} from './treeAlgorithmsExtra';
