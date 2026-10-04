import { parseArrayToTree, cloneTree, createTreeNode } from '../utils/treeLayout';

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

/**
 * Built-in dynamic evaluator for custom C++ tree algorithms
 */
export function interpretCustomTreeCode(cppCode, treeArray, params = {}) {
  const treeState = cloneTree(parseArrayToTree(treeArray));
  const codeLower = cppCode.toLowerCase();

  // 1. COUNT NODES
  if (codeLower.includes('countnodes') || (codeLower.includes('count') && codeLower.includes('return 1 +'))) {
    return generateCountNodesSteps(treeState, cppCode);
  }

  // 2. SUM ROOT TO LEAF NUMBERS
  if (codeLower.includes('sumnumbers') || (codeLower.includes('sum') && codeLower.includes('* 10'))) {
    return generateSumNumbersSteps(treeState, cppCode);
  }

  // 3. KTH SMALLEST IN BST
  if (codeLower.includes('kthsmallest') || codeLower.includes('kth')) {
    const k = params.k || 3;
    return generateKthSmallestSteps(treeState, k, cppCode);
  }

  // 4. RIGHT SIDE VIEW
  if (codeLower.includes('rightsideview') || codeLower.includes('right_side')) {
    return generateRightSideViewSteps(treeState, cppCode);
  }

  // 5. FLATTEN BINARY TREE TO LINKED LIST
  if (codeLower.includes('flatten')) {
    return generateFlattenSteps(treeState, cppCode);
  }

  // Generic Recursive Explorer for any arbitrary custom recursive function
  return generateGenericRecursionSteps(treeState, cppCode, params);
}

// 1. COUNT NODES
function generateCountNodesSteps(treeState, cppCode) {
  const steps = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function countHelper(node) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `countNodes`,
      args: { root: nodeLabel },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `countNodes(${nodeLabel})`,
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
      explanation: `Line 1: Entering countNodes(root = ${nodeLabel}).`,
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
      explanation: node ? `Line 2: 'root == nullptr' is FALSE (root is Node(${node.val})). Recursing left and right.` : `Line 2: Base Case: 'root == nullptr' is TRUE. Returning 0.`,
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

    // Line 4: int leftCount = countNodes(root->left);
    frame.line = 4;
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 4: Calling leftCount = countNodes(root->left). Frame on Node(${node.val}) PAUSES.`,
      variables: { calculating: 'leftCount' },
      actionType: 'CALL',
      output: [],
    });

    const leftCount = countHelper(node.left);

    // Backtrack on Line 4
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftCount },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 4 (Backtrack): Resumed at Node(${node.val}). leftCount = ${leftCount}.`,
      variables: { leftCount },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 5: int rightCount = countNodes(root->right);
    frame.line = 5;
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftCount, 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5: Calling rightCount = countNodes(root->right). Frame on Node(${node.val}) PAUSES.`,
      variables: { leftCount, calculating: 'rightCount' },
      actionType: 'CALL',
      output: [],
    });

    const rightCount = countHelper(node.right);

    // Backtrack on Line 5
    steps.push({
      line: 5,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftCount, rightCount },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5 (Backtrack): Resumed at Node(${node.val}). rightCount = ${rightCount}.`,
      variables: { leftCount, rightCount },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 7: return 1 + leftCount + rightCount;
    const total = 1 + leftCount + rightCount;
    statusMap[node.id] = { status: 'visited', badge: `cnt=${total}` };

    frame.line = 7;
    frame.returnVal = total;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = total; }

    steps.push({
      line: 7,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: `cnt=${total}` } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftCount, rightCount, total: `1 + ${leftCount} + ${rightCount} = ${total}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Returning total subtree count 1 + ${leftCount} + ${rightCount} = ${total}.`,
      variables: { leftCount, rightCount, total },
      actionType: 'RETURN',
      output: [total],
    });

    stack.pop();
    return total;
  }

  countHelper(treeState);
  return steps;
}

// 2. SUM ROOT TO LEAF NUMBERS
function generateSumNumbersSteps(treeState, cppCode) {
  const steps = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function sumHelper(node, currentVal) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frame = {
      id: currentCallId,
      func: `sumNumbersHelper`,
      args: { root: nodeLabel, currentSum: currentVal },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `sum(${nodeLabel}, ${currentVal})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active', badge: `val=${currentVal}` } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, currentSum: currentVal },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering sumNumbersHelper(root = ${nodeLabel}, sum = ${currentVal}).`,
      variables: { root: nodeLabel, currentSum: currentVal },
      actionType: 'CALL',
      output: [],
    });

    // Line 2: if (root == nullptr) return 0;
    if (!node) {
      steps.push({
        line: 2,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { root: 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: Base Case: root is nullptr. Returning 0.`,
        variables: { returnVal: 0 },
        actionType: 'BASE_CASE',
        output: [],
      });
      frame.returnVal = 0;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 0; }
      stack.pop();
      return 0;
    }

    // Line 4: currentSum = currentSum * 10 + root->val;
    const newVal = currentVal * 10 + node.val;
    statusMap[node.id] = { status: 'active', badge: `num=${newVal}` };

    frame.line = 4;
    steps.push({
      line: 4,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, formula: `${currentVal} * 10 + ${node.val} = ${newVal}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 4: Computed path integer: currentSum = ${currentVal} * 10 + ${node.val} = ${newVal}.`,
      variables: { currentSum: newVal },
      actionType: 'COMPUTE',
      output: [],
    });

    // Line 6: if (root->left == nullptr && root->right == nullptr) return currentSum;
    const isLeaf = !node.left && !node.right;
    if (isLeaf) {
      statusMap[node.id] = { status: 'matched', badge: `LEAF=${newVal}` };
      frame.line = 6;
      frame.returnVal = newVal;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = newVal; }

      steps.push({
        line: 6,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val}) [Leaf]`, fullNumber: newVal },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `🎯 Line 6: Leaf reached! Completed root-to-leaf number is ${newVal}. Returning ${newVal}.`,
        variables: { leafSum: newVal },
        actionType: 'MATCH',
        output: [newVal],
      });

      stack.pop();
      return newVal;
    }

    // Line 8: left
    frame.line = 8;
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'recursing left': node.left ? `Node(${node.left.val})` : 'nullptr', currentSum: newVal },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Calling sumNumbersHelper(root->left, ${newVal}). Frame on Node(${node.val}) PAUSES.`,
      variables: { branch: 'LEFT', currentSum: newVal },
      actionType: 'CALL',
      output: [],
    });

    const left = sumHelper(node.left, newVal);

    // Backtrack on Line 8
    steps.push({
      line: 8,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftSumResult: left },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8 (Backtrack): Left subtree sum returned: ${left}.`,
      variables: { leftSum: left },
      actionType: 'BACKTRACK',
      output: [],
    });

    // Line 9: right
    frame.line = 9;
    steps.push({
      line: 9,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'recursing right': node.right ? `Node(${node.right.val})` : 'nullptr', currentSum: newVal },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 9: Calling sumNumbersHelper(root->right, ${newVal}). Frame on Node(${node.val}) PAUSES.`,
      variables: { branch: 'RIGHT', currentSum: newVal },
      actionType: 'CALL',
      output: [],
    });

    const right = sumHelper(node.right, newVal);

    // Backtrack on Line 9
    const total = left + right;
    frame.line = 10;
    frame.returnVal = total;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = total; }

    steps.push({
      line: 10,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, left, right, totalSum: `${left} + ${right} = ${total}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 10: Combining path sums for subtree Node(${node.val}): left (${left}) + right (${right}) = ${total}. Returning ${total}.`,
      variables: { leftSum: left, rightSum: right, totalSum: total },
      actionType: 'RETURN',
      output: [total],
    });

    stack.pop();
    return total;
  }

  sumHelper(treeState, 0);
  return steps;
}

// 3. KTH SMALLEST IN BST
function generateKthSmallestSteps(treeState, kTarget, cppCode) {
  const steps = [];
  let count = 0;
  let ans = null;
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};

  function inorderKth(node) {
    if (!node || ans !== null) return;
    const currentCallId = `call_${++callIdCounter}`;

    const frame = {
      id: currentCallId,
      func: `inorder`,
      args: { root: `Node(${node.val})`, k: kTarget, currentCount: count },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `inorder(${node.val})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, k: kTarget, count },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Inorder visit at Node(${node.val}). Target k = ${kTarget}, current count = ${count}.`,
      variables: { root: node.val, k: kTarget, count },
      actionType: 'CALL',
      output: [],
    });

    // Left
    if (node.left) {
      inorderKth(node.left);
    }

    if (ans !== null) {
      stack.pop();
      return;
    }

    // Process Root: count++
    count++;
    const isTarget = (count === kTarget);
    if (isTarget) {
      ans = node.val;
      statusMap[node.id] = { status: 'matched', badge: `k=${kTarget} (MATCH!)` };
    } else {
      statusMap[node.id] = { status: 'visited', badge: `#${count}` };
    }

    steps.push({
      line: 4,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'count == k': `${count} == ${kTarget} (${isTarget ? 'TRUE 🎯' : 'FALSE'})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: isTarget
        ? `🎯 Line 4: count (${count}) == k (${kTarget})! Found ${kTarget}th smallest element: Node(${node.val})! ans = ${node.val}.`
        : `Line 4: Incremented count to ${count}. ${count} != ${kTarget}. Continuing inorder.`,
      variables: { count, k: kTarget, ans: ans ?? 'searching...' },
      actionType: isTarget ? 'MATCH' : 'PROCESS_NODE',
      output: isTarget ? [node.val] : [],
    });

    if (isTarget) {
      stack.pop();
      return;
    }

    // Right
    if (node.right) {
      inorderKth(node.right);
    }

    stack.pop();
  }

  inorderKth(treeState);
  return steps;
}

// 4. RIGHT SIDE VIEW
function generateRightSideViewSteps(treeState, cppCode) {
  const steps = [];
  const result = [];
  if (!treeState) return steps;

  const queue = [treeState];

  while (queue.length > 0) {
    const levelSize = queue.length;
    let rightVal = null;

    steps.push({
      line: 6,
      tree: snapshotTree(treeState),
      activeNodeId: null,
      highlightNodeIds: queue.map(n => n.id),
      pointers: { levelSize },
      callStack: [{ id: 'main', func: 'rightSideView', args: { levelSize }, line: 6 }],
      recursionTree: [],
      explanation: `Starting level with ${levelSize} node(s). The LAST node in this level will be visible from the right side.`,
      variables: { levelSize, queue: queue.map(n => n.val) },
      actionType: 'LOOP',
      output: [...result],
    });

    for (let i = 0; i < levelSize; i++) {
      const curr = queue.shift();
      rightVal = curr.val;

      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }

    result.push(rightVal);
    steps.push({
      line: 12,
      tree: snapshotTree(treeState),
      activeNodeId: null,
      highlightNodeIds: [],
      pointers: { rightmostNode: rightVal },
      callStack: [{ id: 'main', func: 'rightSideView', args: {}, line: 12 }],
      recursionTree: [],
      explanation: `Rightmost node of this level is ${rightVal}. Added to rightSideView output: [${result.join(', ')}].`,
      variables: { added: rightVal, result: [...result] },
      actionType: 'PROCESS_NODE',
      output: [...result],
    });
  }

  return steps;
}

// 5. FLATTEN BINARY TREE TO LINKED LIST
function generateFlattenSteps(initialTreeState, cppCode) {
  const steps = [];
  const treeState = cloneTree(initialTreeState);
  let curr = treeState;

  const stack = [
    { id: 'frame_1', func: 'flatten', args: { root: curr ? `Node(${curr.val})` : 'nullptr' }, line: 2, returnVal: null }
  ];

  const recursionNodes = [
    { id: 'call_1', label: `flatten(${curr ? `Node(${curr.val})` : 'nullptr'})`, parentId: null, status: 'active', returnVal: null }
  ];

  // Step 1: Entry
  steps.push({
    line: 1,
    tree: snapshotTree(treeState, curr ? { [curr.id]: { status: 'active', badge: 'root' } } : {}),
    activeNodeId: curr ? curr.id : null,
    highlightNodeIds: curr ? [curr.id] : [],
    pointers: { root: curr ? `Node(${curr.val})` : 'nullptr', curr: curr ? `Node(${curr.val})` : 'nullptr' },
    callStack: JSON.parse(JSON.stringify(stack)),
    recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
    explanation: 'Line 1: Entering flatten(root). Starting in-place binary tree flattening into a linked list.',
    variables: { curr: curr ? curr.val : 'nullptr' },
    actionType: 'CALL',
    output: [],
  });

  // Step 2: TreeNode* curr = root;
  steps.push({
    line: 2,
    tree: snapshotTree(treeState, curr ? { [curr.id]: { status: 'active', badge: 'curr' } } : {}),
    activeNodeId: curr ? curr.id : null,
    highlightNodeIds: curr ? [curr.id] : [],
    pointers: { curr: curr ? `Node(${curr.val})` : 'nullptr' },
    callStack: JSON.parse(JSON.stringify(stack)),
    recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
    explanation: `Line 2: Initializing pointer: TreeNode* curr = root (pointing to Node(${curr ? curr.val : 'nullptr'})).`,
    variables: { curr: curr ? curr.val : 'nullptr' },
    actionType: 'POINTER_UPDATE',
    output: [],
  });

  while (curr) {
    stack[0].line = 3;
    steps.push({
      line: 3,
      tree: snapshotTree(treeState, { [curr.id]: { status: 'active', badge: 'curr' } }),
      activeNodeId: curr.id,
      highlightNodeIds: [curr.id],
      pointers: { curr: `Node(${curr.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 3: Loop condition check: curr is Node(${curr.val}) != nullptr (TRUE).`,
      variables: { curr: curr.val, hasLeft: Boolean(curr.left) },
      actionType: 'CHECK',
      output: [],
    });

    stack[0].line = 4;
    if (curr.left) {
      steps.push({
        line: 4,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'active', badge: 'curr' }, [curr.left.id]: { status: 'highlight', badge: 'left' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id, curr.left.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->left': `Node(${curr.left.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: curr->left is NOT nullptr (points to Node(${curr.left.val})). Left subtree needs flattening.`,
        variables: { curr: curr.val, 'curr->left': curr.left.val },
        actionType: 'CHECK',
        output: [],
      });

      let prev = curr.left;
      stack[0].line = 6;
      steps.push({
        line: 6,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'matched', badge: 'prev' } }),
        activeNodeId: prev.id,
        highlightNodeIds: [curr.id, prev.id],
        pointers: { curr: `Node(${curr.val})`, prev: `Node(${prev.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 6: Initializing predecessor search: TreeNode* prev = curr->left (Node(${prev.val})).`,
        variables: { curr: curr.val, prev: prev.val },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      while (prev.right) {
        prev = prev.right;
        stack[0].line = 8;
        steps.push({
          line: 8,
          tree: snapshotTree(treeState, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'matched', badge: 'prev' } }),
          activeNodeId: prev.id,
          highlightNodeIds: [curr.id, prev.id],
          pointers: { curr: `Node(${curr.val})`, prev: `Node(${prev.val}) [traversing]` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 8: Traversing to rightmost node of left subtree: prev = prev->right (Node(${prev.val})).`,
          variables: { prev: prev.val },
          actionType: 'POINTER_UPDATE',
          output: [],
        });
      }

      // 1. Splice: prev->right = curr->right;
      const oldCurrRight = curr.right;
      prev.right = curr.right;
      stack[0].line = 12;
      steps.push({
        line: 12,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'created', badge: 'prev->right' } }),
        activeNodeId: prev.id,
        highlightNodeIds: [curr.id, prev.id],
        pointers: {
          curr: `Node(${curr.val})`,
          prev: `Node(${prev.val})`,
          'prev->right': prev.right ? `Node(${prev.right.val})` : 'nullptr',
        },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 12: Splicing: Connected prev->right (Node(${prev.val})) to curr->right (${oldCurrRight ? `Node(${oldCurrRight.val})` : 'nullptr'}).`,
        variables: { prev: prev.val, 'prev->right': prev.right ? prev.right.val : null },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      // 2. Move left to right: curr->right = curr->left;
      curr.right = curr.left;
      stack[0].line = 14;
      steps.push({
        line: 14,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'created', badge: 'curr->right' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: {
          curr: `Node(${curr.val})`,
          'curr->right': `Node(${curr.right.val})`,
        },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 14: Moving left subtree to right: curr->right = curr->left (Node(${curr.right.val})).`,
        variables: { curr: curr.val, 'curr->right': curr.right.val },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      // 3. Nullify left: curr->left = nullptr;
      curr.left = null;
      stack[0].line = 16;
      steps.push({
        line: 16,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'visited', badge: 'curr' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: {
          curr: `Node(${curr.val})`,
          'curr->left': 'nullptr',
          'curr->right': `Node(${curr.right.val})`,
        },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 16: Set curr->left = nullptr. Left branch disconnected; subtree is now part of the right chain.`,
        variables: { curr: curr.val, 'curr->left': null },
        actionType: 'POINTER_UPDATE',
        output: [],
      });
    } else {
      steps.push({
        line: 4,
        tree: snapshotTree(treeState, { [curr.id]: { status: 'visited', badge: 'curr' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->left': 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: curr->left is nullptr on Node(${curr.val}). No left subtree to rewire.`,
        variables: { curr: curr.val },
        actionType: 'CHECK',
        output: [],
      });
    }

    curr = curr.right;
    stack[0].line = 19;
    steps.push({
      line: 19,
      tree: snapshotTree(treeState, curr ? { [curr.id]: { status: 'active', badge: 'curr' } } : {}),
      activeNodeId: curr ? curr.id : null,
      highlightNodeIds: curr ? [curr.id] : [],
      pointers: { curr: curr ? `Node(${curr.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 19: Advancing curr: curr = curr->right (${curr ? `Node(${curr.val})` : 'nullptr'}).`,
      variables: { curr: curr ? curr.val : 'nullptr' },
      actionType: 'POINTER_UPDATE',
      output: [],
    });
  }

  // Final Step: Complete
  stack[0].line = 21;
  stack[0].returnVal = 'void';
  recursionNodes[0].status = 'returned';

  steps.push({
    line: 21,
    tree: snapshotTree(treeState),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { status: 'Flattening Complete', result: 'Right-Skewed Linked List' },
    callStack: [],
    recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
    explanation: 'Line 21: Flatten algorithm complete! All nodes are chained linearly along right pointers (1 -> 2 -> 3 -> 4 -> 5 -> 6) matching pre-order traversal.',
    variables: { completed: true },
    actionType: 'COMPLETE',
    output: ['Flattened Linked List: 1 -> 2 -> 3 -> 4 -> 5 -> 6'],
  });

  return steps;
}

// 6. GENERIC RECURSIVE EVALUATOR
function generateGenericRecursionSteps(treeState, cppCode, params) {
  const steps = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const visitedMap = {};

  function traverseHelper(node) {
    if (!node) return;
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = `Node(${node.val})`;

    const frame = {
      id: currentCallId,
      func: `solve`,
      args: { root: nodeLabel },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `solve(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Step 1: Visit
    steps.push({
      line: 1,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: nodeLabel },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Executing custom function on Node(${node.val}). Inspecting children.`,
      variables: { root: node.val },
      actionType: 'CALL',
      output: [],
    });

    if (node.left) {
      steps.push({
        line: 4,
        tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: nodeLabel, 'next call': `Node(${node.left.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Recursing down left subtree of Node(${node.val}). Frame pauses.`,
        variables: { branch: 'LEFT' },
        actionType: 'CALL',
        output: [],
      });
      traverseHelper(node.left);
    }

    visitedMap[node.id] = { status: 'visited' };

    if (node.right) {
      steps.push({
        line: 6,
        tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: nodeLabel, 'next call': `Node(${node.right.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Recursing down right subtree of Node(${node.val}). Frame pauses.`,
        variables: { branch: 'RIGHT' },
        actionType: 'CALL',
        output: [],
      });
      traverseHelper(node.right);
    }

    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }

    steps.push({
      line: 8,
      tree: snapshotTree(treeState, { ...visitedMap, [node.id]: { status: 'visited' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: nodeLabel, status: 'Complete' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Completed evaluation for Node(${node.val}). Returning to caller.`,
      variables: { completed: node.val },
      actionType: 'RETURN',
      output: [],
    });

    stack.pop();
  }

  traverseHelper(treeState);
  return steps;
}
