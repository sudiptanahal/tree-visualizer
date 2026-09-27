import { cloneTree } from '../utils/treeLayout';

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
// BST SEARCH
// ==========================================
export function generateBstSearchSteps(initialTree, searchVal) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const val = Number(searchVal);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function searchHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `searchBST`,
      args: { root: nodeLabel, val },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `searchBST(${nodeLabel}, ${val})`,
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
      pointers: { root: nodeLabel, val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering TreeNode* searchBST(root = ${nodeLabel}, val = ${val}).`,
      variables: { root: nodeLabel, val },
      actionType: 'CALL',
      output: [],
    });

    // Line 3: if (root == nullptr || root->val == val)
    const isFound = node && node.val === val;
    const isNull = !node;

    steps.push({
      line: 3,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: isFound ? 'matched' : 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, targetVal: val },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: isFound
        ? `🎯 Line 3: Target found! root->val (${node.val}) == ${val}. Condition TRUE.`
        : isNull
          ? `Line 3: root == nullptr is TRUE. Key ${val} not found in this branch.`
          : `Line 3: root is Node(${node.val}) != nullptr and != ${val}. Moving to comparison.`,
      variables: { root: nodeLabel, val, matched: isFound },
      actionType: (isFound || isNull) ? 'BASE_CASE' : 'CHECK',
      output: isFound ? [node.val] : [],
    });

    if (isNull || isFound) {
      frame.line = 4;
      frame.returnVal = node ? `Node(${node.val})` : 'nullptr';
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = frame.returnVal; }

      steps.push({
        line: 4,
        tree: snapshotTree(treeState, node ? { [node.id]: { status: 'matched' } } : {}),
        activeNodeId: node ? node.id : null,
        highlightNodeIds: node ? [node.id] : [],
        pointers: { returnVal: frame.returnVal },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: return root; Returning ${frame.returnVal} up the call stack.`,
        variables: { returnVal: frame.returnVal },
        actionType: 'RETURN',
        output: isFound ? [node.val] : [],
      });

      stack.pop();
      return node;
    }

    if (val < node.val) {
      // Line 8: val < root->val
      steps.push({
        line: 8,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${val} < ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 8: ${val} < ${node.val} is TRUE. Searching LEFT subtree.`,
        variables: { val, 'root->val': node.val, branch: 'LEFT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 9: return searchBST(root->left, val);
      frame.line = 9;
      steps.push({
        line: 9,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 9: return searchBST(root->left, ${val}). Recursing left.`,
        variables: { target: val },
        actionType: 'CALL',
        output: [],
      });

      const res = searchHelper(node.left);

      // Backtrack on Line 9
      steps.push({
        line: 9,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, returnedVal: res ? `Node(${res.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 9 (Backtrack): Resumed at Node(${node.val}). Returning result from left search: ${res ? `Node(${res.val})` : 'nullptr'}.`,
        variables: { returnVal: res ? `Node(${res.val})` : 'nullptr' },
        actionType: 'RETURN',
        output: res ? [res.val] : [],
      });

      stack.pop();
      return res;

    } else {
      // Line 13: return searchBST(root->right, val);
      frame.line = 13;
      steps.push({
        line: 13,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${val} > ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 13: ${val} > ${node.val} is TRUE. Searching RIGHT subtree: return searchBST(root->right, ${val}).`,
        variables: { val, 'root->val': node.val, branch: 'RIGHT' },
        actionType: 'COMPARE',
        output: [],
      });

      const res = searchHelper(node.right);

      // Backtrack on Line 13
      steps.push({
        line: 13,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, returnedVal: res ? `Node(${res.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 13 (Backtrack): Resumed at Node(${node.val}). Returning result from right search: ${res ? `Node(${res.val})` : 'nullptr'}.`,
        variables: { returnVal: res ? `Node(${res.val})` : 'nullptr' },
        actionType: 'RETURN',
        output: res ? [res.val] : [],
      });

      stack.pop();
      return res;
    }
  }

  searchHelper(treeState);
  return steps;
}

// ==========================================
// PATH SUM (Complete Root to Leaf with Backtracking)
// ==========================================
export function generatePathSumSteps(initialTree, targetSumVal) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const targetSum = Number(targetSumVal);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function pathSumHelper(node, remainingSum) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `hasPathSum`,
      args: { root: nodeLabel, targetSum: remainingSum },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `hasPathSum(${nodeLabel}, ${remainingSum})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active', badge: `rem=${remainingSum}` } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, targetSum: remainingSum },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering bool hasPathSum(root = ${nodeLabel}, targetSum = ${remainingSum}).`,
      variables: { root: nodeLabel, targetSum: remainingSum },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (root == nullptr) return false;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active', badge: `rem=${remainingSum}` } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 2: 'root == nullptr' is FALSE (root = Node(${node.val})). Checking leaf status.`
        : `Line 2: Base Case: 'root == nullptr' is TRUE. Returning false.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    // Line 5: Leaf check (root->left == nullptr && root->right == nullptr)
    const isLeaf = (node.left === null && node.right === null);
    frame.line = 5;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, isLeaf: isLeaf ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5: Leaf node check: 'root->left == nullptr && root->right == nullptr' is ${isLeaf ? 'TRUE (Leaf)' : 'FALSE (Internal node)'}.`,
      variables: { isLeaf },
      actionType: 'CHECK',
      output: [],
    });

    if (isLeaf) {
      // Line 6: return targetSum == root->val;
      const match = (remainingSum === node.val);
      statusMap[node.id] = { status: match ? 'matched' : 'visited', badge: match ? 'MATCH!' : `rem=${remainingSum}` };

      frame.line = 6;
      frame.returnVal = match;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = match; }

      steps.push({
        line: 6,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val}) [Leaf]`, 'targetSum == root->val': `${remainingSum} == ${node.val} (${match ? 'TRUE 🎯' : 'FALSE'})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: match
          ? `🎯 Line 6: Leaf Node reached and targetSum (${remainingSum}) == root->val (${node.val})! Valid root-to-leaf path found! Returning TRUE.`
          : `Line 6: Leaf Node reached but remaining targetSum (${remainingSum}) != root->val (${node.val}). Returning FALSE.`,
        variables: { isLeaf: true, match, returnVal: match },
        actionType: match ? 'MATCH' : 'RETURN',
        output: [match],
      });

      stack.pop();
      return match;
    }

    // Line 10: int remaining = targetSum - root->val;
    const newRemaining = remainingSum - node.val;
    statusMap[node.id] = { status: 'active', badge: `rem=${newRemaining}` };

    frame.line = 10;
    steps.push({
      line: 10,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, remaining: `${remainingSum} - ${node.val} = ${newRemaining}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 10: Subtracted current node value: int remaining = targetSum - root->val (${remainingSum} - ${node.val} = ${newRemaining}).`,
      variables: { remaining: newRemaining },
      actionType: 'COMPUTE',
      output: [],
    });

    // Line 11: hasPathSum(root->left, remaining)
    frame.line = 11;
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling left': node.left ? `Node(${node.left.val})` : 'nullptr', newRemaining },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Checking left subtree: hasPathSum(root->left, ${newRemaining}). Frame on Node(${node.val}) PAUSES.`,
      variables: { branch: 'LEFT', remaining: newRemaining },
      actionType: 'CALL',
      output: [],
    });

    const leftRes = pathSumHelper(node.left, newRemaining);

    // Backtrack on Line 11
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: leftRes ? 'TRUE 🎯' : 'FALSE' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Backtrack): Left subtree returned ${leftRes ? 'TRUE' : 'FALSE'}.`,
      variables: { leftRes },
      actionType: 'BACKTRACK',
      output: [],
    });

    if (leftRes) {
      frame.line = 11;
      frame.returnVal = true;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = true; }
      stack.pop();
      return true;
    }

    // Line 12: hasPathSum(root->right, remaining)
    frame.line = 12;
    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling right': node.right ? `Node(${node.right.val})` : 'nullptr', newRemaining },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Left subtree returned false. Checking right subtree: hasPathSum(root->right, ${newRemaining}).`,
      variables: { branch: 'RIGHT', remaining: newRemaining },
      actionType: 'CALL',
      output: [],
    });

    const rightRes = pathSumHelper(node.right, newRemaining);

    // Backtrack on Line 12
    const finalRes = leftRes || rightRes;
    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, finalResult: finalRes ? 'TRUE' : 'FALSE' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12 (Backtrack): Both subtrees evaluated for Node(${node.val}). Final result is ${finalRes ? 'TRUE' : 'FALSE'}.`,
      variables: { leftRes, rightRes, finalRes },
      actionType: 'RETURN',
      output: [finalRes],
    });

    frame.line = 12;
    frame.returnVal = finalRes;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = finalRes; }
    stack.pop();
    return finalRes;
  }

  pathSumHelper(treeState, targetSum);
  return steps;
}

// ==========================================
// LEVEL ORDER TRAVERSAL (BFS)
// ==========================================
export function generateLevelOrderSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const result = [];
  const visitedMap = {};

  if (!treeState) return steps;

  const queue = [treeState];
  const queueDisplay = () => queue.map(n => `Node(${n.val})`);

  // Line 1: Function entry
  steps.push({
    line: 1,
    tree: snapshotTree(treeState),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { root: `Node(${treeState.val})` },
    callStack: [{ id: 'main', func: 'levelOrder', args: { root: `Node(${treeState.val})` }, line: 1 }],
    recursionTree: [],
    explanation: `Line 1: Entering vector<vector<int>> levelOrder(root = Node(${treeState.val})).`,
    variables: { result: [] },
    actionType: 'CALL',
    output: [],
    extraInfo: { queue: [] }
  });

  // Line 6: queue<TreeNode*> q; q.push(root);
  steps.push({
    line: 6,
    tree: snapshotTree(treeState, { [treeState.id]: { status: 'highlight' } }),
    activeNodeId: treeState.id,
    highlightNodeIds: [treeState.id],
    pointers: { 'q.front()': `Node(${treeState.val})`, queueSize: 1 },
    callStack: [{ id: 'main', func: 'levelOrder', args: { root: `Node(${treeState.val})` }, line: 6 }],
    recursionTree: [],
    explanation: `Line 6: Initialized std::queue<TreeNode*> q; Pushed root Node(${treeState.val}) onto queue.`,
    variables: { queue: queueDisplay(), result: [] },
    actionType: 'QUEUE_PUSH',
    output: [],
    extraInfo: { queue: queueDisplay() }
  });

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];

    // Line 9: while (!q.empty())
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, visitedMap),
      activeNodeId: queue[0] ? queue[0].id : null,
      highlightNodeIds: queue.map(n => n.id),
      pointers: { 'q.empty()': 'false', 'levelSize': levelSize },
      callStack: [{ id: 'main', func: 'levelOrder', args: { 'levelSize': levelSize }, line: 9 }],
      recursionTree: [],
      explanation: `Line 9: While loop iteration: Starting new level. Queue has ${levelSize} node(s) for this depth level.`,
      variables: { levelSize, queue: queueDisplay() },
      actionType: 'LOOP',
      output: [...result],
      extraInfo: { queue: queueDisplay() }
    });

    for (let i = 0; i < levelSize; i++) {
      const curr = queue.shift();
      currentLevel.push(curr.val);
      visitedMap[curr.id] = { status: 'matched' };

      // Line 14: TreeNode* curr = q.front(); q.pop();
      steps.push({
        line: 14,
        tree: snapshotTree(treeState, { ...visitedMap, [curr.id]: { status: 'active' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: { curr: `Node(${curr.val})`, 'currentLevel': `[${currentLevel.join(', ')}]` },
        callStack: [{ id: 'main', func: 'levelOrder', args: { 'i': i, 'levelSize': levelSize }, line: 14 }],
        recursionTree: [],
        explanation: `Line 14-15: Popped Node(${curr.val}) from front of queue. Added ${curr.val} to currentLevel vector.`,
        variables: { curr: curr.val, currentLevel: [...currentLevel], queue: queueDisplay() },
        actionType: 'QUEUE_POP',
        output: [...result, currentLevel],
        extraInfo: { queue: queueDisplay() }
      });

      // Line 18: if (curr->left != nullptr) q.push(curr->left);
      if (curr.left) {
        queue.push(curr.left);
        steps.push({
          line: 18,
          tree: snapshotTree(treeState, { ...visitedMap, [curr.left.id]: { status: 'highlight' } }),
          activeNodeId: curr.left.id,
          highlightNodeIds: [curr.id, curr.left.id],
          pointers: { curr: `Node(${curr.val})`, 'pushed to queue': `Node(${curr.left.val})` },
          callStack: [{ id: 'main', func: 'levelOrder', args: { 'curr->left': curr.left.val }, line: 18 }],
          recursionTree: [],
          explanation: `Line 18: curr->left != nullptr is TRUE. Pushing left child Node(${curr.left.val}) into queue.`,
          variables: { 'pushed': curr.left.val, queue: queueDisplay() },
          actionType: 'QUEUE_PUSH',
          output: [...result, currentLevel],
          extraInfo: { queue: queueDisplay() }
        });
      }

      // Line 19: if (curr->right != nullptr) q.push(curr->right);
      if (curr.right) {
        queue.push(curr.right);
        steps.push({
          line: 19,
          tree: snapshotTree(treeState, { ...visitedMap, [curr.right.id]: { status: 'highlight' } }),
          activeNodeId: curr.right.id,
          highlightNodeIds: [curr.id, curr.right.id],
          pointers: { curr: `Node(${curr.val})`, 'pushed to queue': `Node(${curr.right.val})` },
          callStack: [{ id: 'main', func: 'levelOrder', args: { 'curr->right': curr.right.val }, line: 19 }],
          recursionTree: [],
          explanation: `Line 19: curr->right != nullptr is TRUE. Pushing right child Node(${curr.right.val}) into queue.`,
          variables: { 'pushed': curr.right.val, queue: queueDisplay() },
          actionType: 'QUEUE_PUSH',
          output: [...result, currentLevel],
          extraInfo: { queue: queueDisplay() }
        });
      }
    }

    result.push(currentLevel);
    // Line 21: result.push_back(currentLevel);
    steps.push({
      line: 21,
      tree: snapshotTree(treeState, visitedMap),
      activeNodeId: null,
      highlightNodeIds: [],
      pointers: { 'result.push_back': `[${currentLevel.join(', ')}]` },
      callStack: [{ id: 'main', func: 'levelOrder', args: {}, line: 21 }],
      recursionTree: [],
      explanation: `Line 21: Completed entire level! Appended level vector [${currentLevel.join(', ')}] to result.`,
      variables: { completedLevel: currentLevel, totalResult: JSON.parse(JSON.stringify(result)) },
      actionType: 'LEVEL_COMPLETE',
      output: JSON.parse(JSON.stringify(result)),
      extraInfo: { queue: queueDisplay() }
    });
  }

  // Line 23: return result;
  steps.push({
    line: 23,
    tree: snapshotTree(treeState, visitedMap),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { status: 'Complete' },
    callStack: [{ id: 'main', func: 'levelOrder', args: {}, line: 23 }],
    recursionTree: [],
    explanation: `Line 23: return result; Level order BFS complete. Returning total 2D array.`,
    variables: { finalResult: JSON.parse(JSON.stringify(result)) },
    actionType: 'RETURN',
    output: JSON.parse(JSON.stringify(result)),
    extraInfo: { queue: [] }
  });

  return steps;
}

// ==========================================
// LCA IN BST
// ==========================================
export function generateLcaBstSteps(initialTree, pVal, qVal) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const p = Number(pVal);
  const q = Number(qVal);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function lcaHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `lowestCommonAncestor`,
      args: { root: nodeLabel, p, q },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `LCA(${nodeLabel}, p=${p}, q=${q})`,
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
      pointers: { root: nodeLabel, p, q },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering lowestCommonAncestor(root = ${nodeLabel}, p = ${p}, q = ${q}).`,
      variables: { root: nodeLabel, p, q },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (root == nullptr) return nullptr;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, node ? { [node.id]: { status: 'active' } } : {}),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 2: Checking root != nullptr at Node(${node ? node.val : 'null'}).`,
      variables: { root: nodeLabel, p, q },
      actionType: 'CHECK',
      output: [],
    });

    if (!node) {
      stack.pop();
      return null;
    }

    if (p < node.val && q < node.val) {
      // Line 5: both < root->val
      steps.push({
        line: 5,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${p} < ${node.val} AND ${q} < ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 5: Both p (${p}) and q (${q}) are LESS than root (${node.val}). LCA must lie in LEFT subtree!`,
        variables: { root: node.val, p, q, direction: 'LEFT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 6: return lowestCommonAncestor(root->left, p, q);
      frame.line = 6;
      steps.push({
        line: 6,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'recursing left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 6: return lowestCommonAncestor(root->left, p, q); Recursing left.`,
        variables: { recurse: 'LEFT' },
        actionType: 'CALL',
        output: [],
      });

      const res = lcaHelper(node.left);

      // Backtrack on Line 6
      steps.push({
        line: 6,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, returnedLCA: res ? `Node(${res.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 6 (Backtrack): Resumed at Node(${node.val}). Returning LCA ${res ? `Node(${res.val})` : 'nullptr'}.`,
        variables: { returnVal: res ? `Node(${res.val})` : 'nullptr' },
        actionType: 'RETURN',
        output: res ? [res.val] : [],
      });

      stack.pop();
      return res;

    } else if (p > node.val && q > node.val) {
      // Line 10: both > root->val
      steps.push({
        line: 10,
        tree: snapshotTree(treeState, { [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, condition: `${p} > ${node.val} AND ${q} > ${node.val} (TRUE)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 10: Both p (${p}) and q (${q}) are GREATER than root (${node.val}). LCA must lie in RIGHT subtree!`,
        variables: { root: node.val, p, q, direction: 'RIGHT' },
        actionType: 'COMPARE',
        output: [],
      });

      // Line 11: return lowestCommonAncestor(root->right, p, q);
      frame.line = 11;
      steps.push({
        line: 11,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'recursing right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 11: return lowestCommonAncestor(root->right, p, q); Recursing right.`,
        variables: { recurse: 'RIGHT' },
        actionType: 'CALL',
        output: [],
      });

      const res = lcaHelper(node.right);

      // Backtrack on Line 11
      steps.push({
        line: 11,
        tree: snapshotTree(treeState, { [node.id]: { status: 'visited' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, returnedLCA: res ? `Node(${res.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 11 (Backtrack): Resumed at Node(${node.val}). Returning LCA ${res ? `Node(${res.val})` : 'nullptr'}.`,
        variables: { returnVal: res ? `Node(${res.val})` : 'nullptr' },
        actionType: 'RETURN',
        output: res ? [res.val] : [],
      });

      stack.pop();
      return res;

    } else {
      // Line 15: Split point found!
      frame.line = 15;
      steps.push({
        line: 15,
        tree: snapshotTree(treeState, { [node.id]: { status: 'matched' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { LCA: `Node(${node.val})`, p, q },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `🎯 Line 15: Split point found! One value is on the left and the other is on the right (or one is Node(${node.val}) itself). Therefore, Node(${node.val}) is the Lowest Common Ancestor! Returning root.`,
        variables: { LCA: node.val },
        actionType: 'MATCH',
        output: [node.val],
      });

      frame.returnVal = `Node(${node.val})`;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = `Node(${node.val})`; }

      stack.pop();
      return node;
    }
  }

  lcaHelper(treeState);
  return steps;
}

// ==========================================
// LCA IN BINARY TREE (GENERAL)
// ==========================================
export function generateLcaBinaryTreeSteps(initialTree, pVal, qVal) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  const p = Number(pVal);
  const q = Number(qVal);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function lcaHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `lowestCommonAncestor`,
      args: { root: nodeLabel, p, q },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `LCA(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, p, q },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering lowestCommonAncestor(root = ${nodeLabel}, p = ${p}, q = ${q}).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [],
    });

    // Line 3: if (root == nullptr || root == p || root == q)
    const isTarget = node && (node.val === p || node.val === q);
    steps.push({
      line: 3,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: isTarget ? 'matched' : 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, p, q },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: !node 
        ? `Line 3: root is nullptr. Base case -> return nullptr.`
        : (isTarget 
            ? `🎯 Line 3: Target found: Node(${node.val}) matches target (${node.val === p ? 'p' : 'q'})! Returning Node(${node.val}).`
            : `Line 3: root is Node(${node.val}) (not p or q). Recursing left and right.`),
      variables: { root: nodeLabel, isTarget },
      actionType: (!node || isTarget) ? 'BASE_CASE' : 'CHECK',
      output: [],
    });

    if (!node || isTarget) {
      frame.line = 4;
      const ret = node ? `Node(${node.val})` : 'nullptr';
      frame.returnVal = ret;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = ret; }
      stack.pop();
      return node;
    }

    // Line 7: TreeNode* left = lowestCommonAncestor(root->left, p, q);
    frame.line = 7;
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Calling TreeNode* left = lowestCommonAncestor(root->left, p, q). Frame on Node(${node.val}) PAUSES.`,
      variables: { branch: 'LEFT' },
      actionType: 'CALL',
      output: [],
    });

    const left = lcaHelper(node.left);

    // Backtrack on Line 7
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: left ? `Node(${left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7 (Backtrack): Resumed at Node(${node.val}). Left search returned ${left ? `Node(${left.val})` : 'nullptr'}.`,
      variables: { left: left ? left.val : null },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 8: TreeNode* right = lowestCommonAncestor(root->right, p, q);
    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: left ? `Node(${left.val})` : 'nullptr', 'calling right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Calling TreeNode* right = lowestCommonAncestor(root->right, p, q). Frame on Node(${node.val}) PAUSES again.`,
      variables: { left: left ? left.val : null, branch: 'RIGHT' },
      actionType: 'CALL',
      output: [],
    });

    const right = lcaHelper(node.right);

    // Backtrack on Line 8
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, left: left ? `Node(${left.val})` : 'nullptr', right: right ? `Node(${right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Backtrack): Resumed at Node(${node.val}). Right search returned ${right ? `Node(${right.val})` : 'nullptr'}.`,
      variables: { left: left ? left.val : null, right: right ? right.val : null },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 11: if (left != nullptr && right != nullptr) return root;
    frame.line = 11;
    if (left && right) {
      statusMap[node.id] = { status: 'matched', badge: 'LCA!' };
      steps.push({
        line: 12,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: node.id,
        highlightNodeIds: [node.id, left.id, right.id],
        pointers: { LCA: `Node(${node.val})`, left: `Node(${left.val})`, right: `Node(${right.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `🎯 Line 12: Both left (found Node(${left.val})) and right (found Node(${right.val})) are non-null! Current Node(${node.val}) is the LCA! Returning root.`,
        variables: { LCA: node.val },
        actionType: 'MATCH',
        output: [node.val],
      });

      frame.returnVal = `Node(${node.val})`;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = `Node(${node.val})`; }
      stack.pop();
      return node;
    }

    // Line 16: return (left != nullptr) ? left : right;
    const ret = left ? left : right;
    const retLabel = ret ? `Node(${ret.val})` : 'nullptr';
    frame.line = 16;
    frame.returnVal = retLabel;

    steps.push({
      line: 16,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnVal: retLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 16: Propagating found target (${retLabel}) up the call chain.`,
      variables: { returnVal: retLabel },
      actionType: 'RETURN',
      output: [],
    });

    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = retLabel; }
    stack.pop();
    return ret;
  }

  lcaHelper(treeState);
  return steps;
}

// ==========================================
// VALIDATE BST
// ==========================================
export function generateValidateBstSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function validateHelper(node, minVal, maxVal) {
    const currentCallId = `call_${++callIdCounter}`;
    const minStr = minVal === -Infinity ? '-INF' : minVal;
    const maxStr = maxVal === Infinity ? '+INF' : maxVal;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `isValid`,
      args: { root: nodeLabel, minVal: minStr, maxVal: maxStr },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `isValid(${nodeLabel}, (${minStr}, ${maxStr}))`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active', badge: `(${minStr},${maxStr})` } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, validInterval: `(${minStr}, ${maxStr})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering isValid(root = ${nodeLabel}, min = ${minStr}, max = ${maxStr}).`,
      variables: { root: nodeLabel, minVal: minStr, maxVal: maxStr },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (root == nullptr) return true;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active', badge: `(${minStr},${maxStr})` } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node
        ? `Line 2: 'root == nullptr' is FALSE (root is Node(${node.val})). Checking boundary interval.`
        : `Line 2: Base Case: 'root == nullptr' is TRUE. Empty subtree is valid. Returning true.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      frame.returnVal = true;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = true; }
      stack.pop();
      return true;
    }

    // Line 5: if (root->val <= minVal || root->val >= maxVal) return false;
    frame.line = 5;
    const isInvalid = (node.val <= minVal || node.val >= maxVal);
    if (isInvalid) {
      statusMap[node.id] = { status: 'deleted', badge: 'VIOLATION!' };

      steps.push({
        line: 6,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, VIOLATION: `Value ${node.val} not in range (${minStr}, ${maxStr})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `❌ Line 6: BST INVARIANT VIOLATED! Node(${node.val}) is not strictly within (${minStr}, ${maxStr}). Returning false.`,
        variables: { 'root->val': node.val, minVal: minStr, maxVal: maxStr, isValid: false },
        actionType: 'INVALID',
        output: [false],
      });

      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    statusMap[node.id] = { status: 'visited', badge: `OK` };

    // Line 11: left check
    frame.line = 11;
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'left range': `(${minStr}, ${node.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Checking left subtree: Calling isValid(root->left, ${minStr}, ${node.val}). Frame on Node(${node.val}) PAUSES.`,
      variables: { nextMin: minStr, nextMax: node.val },
      actionType: 'CALL',
      output: [],
    });

    const leftValid = validateHelper(node.left, minVal, node.val);

    // Backtrack on Line 11
    steps.push({
      line: 11,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftValid: leftValid ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11 (Backtrack): Resumed at Node(${node.val}). Left subtree validity: ${leftValid ? 'TRUE' : 'FALSE'}.`,
      variables: { leftValid },
      actionType: 'BACKTRACK',
      output: [],
    });

    if (!leftValid) {
      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    // Line 12: right check
    frame.line = 12;
    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'right range': `(${node.val}, ${maxStr})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Checking right subtree: Calling isValid(root->right, ${node.val}, ${maxStr}). Frame on Node(${node.val}) PAUSES.`,
      variables: { nextMin: node.val, nextMax: maxStr },
      actionType: 'CALL',
      output: [],
    });

    const rightValid = validateHelper(node.right, node.val, maxVal);

    // Backtrack on Line 12
    const overall = leftValid && rightValid;
    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, rightValid: rightValid ? 'true' : 'false', overall: overall ? 'VALID' : 'INVALID' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12 (Backtrack): Resumed at Node(${node.val}). Both subtrees evaluated. Overall subtree is ${overall ? 'VALID BST' : 'INVALID'}. Returning ${overall}.`,
      variables: { leftValid, rightValid, overall },
      actionType: 'RETURN',
      output: [overall],
    });

    frame.returnVal = overall;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = overall; }
    stack.pop();
    return overall;
  }

  validateHelper(treeState, -Infinity, Infinity);
  return steps;
}

// ==========================================
// DIAMETER OF BINARY TREE
// ==========================================
export function generateDiameterSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  let maxDiameter = 0;
  const statusMap = {};

  function heightHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `calculateHeight`,
      args: { root: nodeLabel },
      line: 3,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `calcHeight(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 3: Entry
    steps.push({
      line: 3,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, maxDiameter },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 3: Entering int calculateHeight(root = ${nodeLabel}).`,
      variables: { root: nodeLabel, maxDiameter },
      actionType: 'CALL',
      output: [maxDiameter],
    });

    // Line 4: if (root == nullptr) return 0;
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node ? `Line 4: root is Node(${node.val}) != nullptr. Subtree heights needed.` : `Line 4: Base Case: root == nullptr. Height is 0. Returning 0.`,
      variables: { root: nodeLabel, maxDiameter },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [maxDiameter],
    });

    if (!node) {
      frame.returnVal = 0;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 0; }
      stack.pop();
      return 0;
    }

    // Line 6: int leftH = calculateHeight(root->left);
    frame.line = 6;
    steps.push({
      line: 6,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calc leftH': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 6: Calling calculateHeight(root->left). Frame on Node(${node.val}) PAUSES.`,
      variables: { calculating: 'leftH' },
      actionType: 'CALL',
      output: [maxDiameter],
    });

    const leftH = heightHelper(node.left);

    // Backtrack on Line 6
    steps.push({
      line: 6,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 6 (Backtrack): Resumed at Node(${node.val}). leftH = ${leftH}.`,
      variables: { leftH },
      actionType: 'BACKTRACK',
      output: [maxDiameter],
    });

    // Line 7: int rightH = calculateHeight(root->right);
    frame.line = 7;
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, 'calc rightH': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Calling calculateHeight(root->right). Frame on Node(${node.val}) PAUSES again.`,
      variables: { leftH, calculating: 'rightH' },
      actionType: 'CALL',
      output: [maxDiameter],
    });

    const rightH = heightHelper(node.right);

    // Backtrack on Line 7
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, rightH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7 (Backtrack): Resumed at Node(${node.val}). rightH = ${rightH}.`,
      variables: { leftH, rightH },
      actionType: 'BACKTRACK',
      output: [maxDiameter],
    });

    // Line 10: maxDiameter = max(maxDiameter, leftH + rightH);
    frame.line = 10;
    const pathThroughNode = leftH + rightH;
    maxDiameter = Math.max(maxDiameter, pathThroughNode);
    const currentH = 1 + Math.max(leftH, rightH);
    statusMap[node.id] = { status: 'visited', badge: `h=${currentH}` };

    steps.push({
      line: 10,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: `d=${pathThroughNode}` } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, rightH, 'pathThroughNode': `${leftH} + ${rightH} = ${pathThroughNode}`, maxDiameter },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 10: Path passing through Node(${node.val}) is leftH + rightH = ${leftH} + ${rightH} = ${pathThroughNode}. Updated global maxDiameter = ${maxDiameter}.`,
      variables: { leftH, rightH, pathThroughNode, maxDiameter },
      actionType: 'UPDATE_DIAMETER',
      output: [maxDiameter],
    });

    // Line 12: return 1 + max(leftH, rightH);
    frame.line = 12;
    frame.returnVal = currentH;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = currentH; }

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnHeight: currentH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Returning height 1 + max(${leftH}, ${rightH}) = ${currentH} to parent frame.`,
      variables: { returnHeight: currentH, maxDiameter },
      actionType: 'RETURN',
      output: [maxDiameter],
    });

    stack.pop();
    return currentH;
  }

  heightHelper(treeState);
  return steps;
}

// ==========================================
// CHECK BALANCED TREE
// ==========================================
export function generateBalancedTreeSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function checkHeightHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `checkHeight`,
      args: { root: nodeLabel },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `checkHeight(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering int checkHeight(root = ${nodeLabel}).`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (root == nullptr) return 0;
    steps.push({
      line: 2,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': node === null ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: node ? `Line 2: root is Node(${node.val}). Checking balance of subtrees.` : `Line 2: Base Case: root == nullptr. Height is 0. Returning 0.`,
      variables: { root: nodeLabel },
      actionType: node ? 'CHECK' : 'BASE_CASE',
      output: [],
    });

    if (!node) {
      frame.returnVal = 0;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 0; }
      stack.pop();
      return 0;
    }

    // Line 4: int leftH = checkHeight(root->left);
    frame.line = 4;
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'check left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 4: Calling int leftH = checkHeight(root->left). Frame on Node(${node.val}) PAUSES.`,
      variables: { checking: 'leftH' },
      actionType: 'CALL',
      output: [],
    });

    const leftH = checkHeightHelper(node.left);

    // Backtrack on Line 4
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 4 (Backtrack): Resumed at Node(${node.val}). leftH = ${leftH}.`,
      variables: { leftH },
      actionType: 'BACKTRACK',
      output: [],
    });

    if (leftH === -1) {
      frame.returnVal = -1;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = -1; }
      stack.pop();
      return -1;
    }

    // Line 7: int rightH = checkHeight(root->right);
    frame.line = 7;
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, 'check right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Calling int rightH = checkHeight(root->right). Frame on Node(${node.val}) PAUSES again.`,
      variables: { leftH, checking: 'rightH' },
      actionType: 'CALL',
      output: [],
    });

    const rightH = checkHeightHelper(node.right);

    // Backtrack on Line 7
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, rightH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7 (Backtrack): Resumed at Node(${node.val}). rightH = ${rightH}.`,
      variables: { leftH, rightH },
      actionType: 'BACKTRACK',
      output: [],
    });

    if (rightH === -1) {
      frame.returnVal = -1;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = -1; }
      stack.pop();
      return -1;
    }

    // Line 10: if (abs(leftH - rightH) > 1) return -1;
    frame.line = 10;
    const diff = Math.abs(leftH - rightH);
    const isUnbalanced = diff > 1;

    if (isUnbalanced) {
      statusMap[node.id] = { status: 'deleted', badge: `diff=${diff} UNBALANCED` };
      steps.push({
        line: 10,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, leftH, rightH, '|leftH - rightH|': `${diff} > 1 ❌` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `❌ Line 10: UNBALANCED! |leftH (${leftH}) - rightH (${rightH})| = ${diff} > 1. Returning -1!`,
        variables: { leftH, rightH, diff, balanced: false },
        actionType: 'INVALID',
        output: [false],
      });

      frame.returnVal = -1;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = -1; }
      stack.pop();
      return -1;
    }

    // Line 12: return 1 + max(leftH, rightH);
    frame.line = 12;
    const currentH = 1 + Math.max(leftH, rightH);
    statusMap[node.id] = { status: 'visited', badge: `h=${currentH}` };

    steps.push({
      line: 12,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftH, rightH, height: currentH },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 12: Node(${node.val}) is balanced (diff = ${diff} <= 1). Returning height ${currentH}.`,
      variables: { leftH, rightH, height: currentH, balanced: true },
      actionType: 'RETURN',
      output: [true],
    });

    frame.returnVal = currentH;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = currentH; }
    stack.pop();
    return currentH;
  }

  checkHeightHelper(treeState);
  return steps;
}

// ==========================================
// SYMMETRIC TREE
// ==========================================
export function generateSymmetricTreeSteps(initialTree) {
  const steps = [];
  const treeState = cloneTree(initialTree);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  if (!treeState) return steps;

  function isMirrorHelper(t1, t2) {
    const currentCallId = `call_${++callIdCounter}`;
    const t1Label = t1 ? `Node(${t1.val})` : 'nullptr';
    const t2Label = t2 ? `Node(${t2.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `isMirror`,
      args: { t1: t1Label, t2: t2Label },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `isMirror(${t1Label}, ${t2Label})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: t1 ? t1.id : (t2 ? t2.id : null),
      highlightNodeIds: [t1?.id, t2?.id].filter(Boolean),
      pointers: { t1: t1Label, t2: t2Label },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering bool isMirror(t1 = ${t1Label}, t2 = ${t2Label}).`,
      variables: { t1: t1Label, t2: t2Label },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (t1 == nullptr && t2 == nullptr) return true;
    if (!t1 && !t2) {
      steps.push({
        line: 2,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { t1: 'nullptr', t2: 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: Both t1 and t2 are nullptr. Symmetric leaf match! Returning true.`,
        variables: { t1: null, t2: null, symmetric: true },
        actionType: 'BASE_CASE',
        output: [],
      });
      frame.returnVal = true;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = true; }
      stack.pop();
      return true;
    }

    // Line 3: if (t1 == nullptr || t2 == nullptr) return false;
    if (!t1 || !t2) {
      steps.push({
        line: 3,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: t1 ? t1.id : (t2 ? t2.id : null),
        highlightNodeIds: [t1?.id, t2?.id].filter(Boolean),
        pointers: { t1: t1Label, t2: t2Label, mismatch: 'Structure mismatch (one is null)' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 3: Asymmetric structure: one node is null while the other exists. Returning false.`,
        variables: { t1: t1Label, t2: t2Label, symmetric: false },
        actionType: 'INVALID',
        output: [false],
      });
      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    // Line 5: values equal check
    frame.line = 5;
    const valMatch = (t1.val === t2.val);
    const activeHighlights = [t1.id, t2.id];

    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...statusMap, [t1.id]: { status: valMatch ? 'matched' : 'deleted' }, [t2.id]: { status: valMatch ? 'matched' : 'deleted' } }),
      activeNodeId: t1.id,
      highlightNodeIds: activeHighlights,
      pointers: { 't1->val': t1.val, 't2->val': t2.val, match: valMatch ? 'TRUE' : 'FALSE ❌' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: valMatch 
        ? `Line 5: Values match! t1->val (${t1.val}) == t2->val (${t2.val}). Now comparing outer and inner mirror subtrees.`
        : `Line 5: Value mismatch! t1->val (${t1.val}) != t2->val (${t2.val}). Tree is NOT symmetric. Returning false.`,
      variables: { 't1->val': t1.val, 't2->val': t2.val, valMatch },
      actionType: valMatch ? 'MATCH' : 'INVALID',
      output: [],
    });

    if (!valMatch) {
      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    // Line 6: isMirror(t1->left, t2->right) (Outer Mirror)
    frame.line = 6;
    steps.push({
      line: 6,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: t1.id,
      highlightNodeIds: activeHighlights,
      pointers: { 'Outer Mirror': `isMirror(t1->left, t2->right)` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 6: Checking outer mirror pair: Calling isMirror(t1->left, t2->right).`,
      variables: { outerPair: true },
      actionType: 'CALL',
      output: [],
    });

    const outer = isMirrorHelper(t1.left, t2.right);

    // Backtrack on Line 6
    steps.push({
      line: 6,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: t1.id,
      highlightNodeIds: activeHighlights,
      pointers: { outerMirrorResult: outer ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 6 (Backtrack): Outer pair check returned ${outer ? 'TRUE' : 'FALSE'}.`,
      variables: { outer },
      actionType: 'BACKTRACK',
      output: [],
    });

    if (!outer) {
      frame.returnVal = false;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
      stack.pop();
      return false;
    }

    // Line 7: isMirror(t1->right, t2->left) (Inner Mirror)
    frame.line = 7;
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: t1.id,
      highlightNodeIds: activeHighlights,
      pointers: { 'Inner Mirror': `isMirror(t1->right, t2->left)` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Outer symmetric. Now checking inner mirror pair: Calling isMirror(t1->right, t2->left).`,
      variables: { innerPair: true },
      actionType: 'CALL',
      output: [],
    });

    const inner = isMirrorHelper(t1.right, t2.left);

    // Backtrack on Line 7
    const overall = outer && inner;
    steps.push({
      line: 7,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: t1.id,
      highlightNodeIds: activeHighlights,
      pointers: { innerMirrorResult: inner ? 'true' : 'false', overallResult: overall ? 'SYMMETRIC' : 'NOT SYMMETRIC' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7 (Backtrack): Inner pair check returned ${inner ? 'TRUE' : 'FALSE'}. Overall mirror match is ${overall ? 'TRUE' : 'FALSE'}.`,
      variables: { outer, inner, overall },
      actionType: 'RETURN',
      output: [overall],
    });

    frame.returnVal = overall;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = overall; }
    stack.pop();
    return overall;
  }

  isMirrorHelper(treeState.left, treeState.right);
  return steps;
}
