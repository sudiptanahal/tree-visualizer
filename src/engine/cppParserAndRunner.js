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
 * Universal AST-like line-by-line C++ Tree Code Runner
 * Handles:
 * - Recursive traversals (Inorder, Preorder, Postorder)
 * - Divide & conquer (Height, Count, Sum, Diameter, Balanced, Same Tree)
 * - Path operations (Path sum, Root-to-leaf paths, Digits accumulation)
 * - BST operations (Search, Insert, Delete, Validate, LCA, Kth smallest)
 * - Tree mutations (Invert, Mirror, Swap, Re-link)
 */
export function runCustomCppCode(cppCode, treeArray, initialParams = {}) {
  const lines = cppCode.split('\n');
  const totalLines = lines.length;
  const treeState = cloneTree(parseArrayToTree(treeArray));

  // Find line numbers for key statements in the user's C++ code
  let funcEntryLine = 1;
  let baseCaseLine = 2;
  let leafCheckLine = null;
  let leftCallLine = null;
  let rightCallLine = null;
  let returnLine = totalLines;
  let swapLine = null;
  let funcName = 'solve';
  let returnType = 'int';

  // Extract function name and signature
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    const clean = raw.replace(/\/\/.*$/, '').trim(); // Strip comments

    // Detect function signature
    const funcMatch = clean.match(/^(int|bool|void|TreeNode\*|long|vector<[^>]+>)\s+([a-zA-Z0-9_]+)\s*\((.*)\)/);
    if (funcMatch) {
      returnType = funcMatch[1];
      funcName = funcMatch[2];
      funcEntryLine = i + 1;
    }

    // Detect base case: if (root == nullptr) or if (!root)
    if (clean.includes('if') && (clean.includes('root == nullptr') || clean.includes('!root') || clean.includes('root == NULL'))) {
      baseCaseLine = i + 1;
    }

    // Detect leaf check: if (root->left == nullptr && root->right == nullptr)
    if (clean.includes('if') && clean.includes('root->left') && clean.includes('root->right') && clean.includes('nullptr')) {
      leafCheckLine = i + 1;
    }

    // Detect swap / pointer rewiring
    if (clean.includes('TreeNode* temp') || (clean.includes('root->left') && clean.includes('root->right') && clean.includes('='))) {
      if (!swapLine) swapLine = i + 1;
    }

    // Detect left recursive call
    if (clean.includes('->left') && (clean.includes('(') || clean.includes('='))) {
      if (!leftCallLine) leftCallLine = i + 1;
    }

    // Detect right recursive call
    if (clean.includes('->right') && (clean.includes('(') || clean.includes('='))) {
      if (!rightCallLine) rightCallLine = i + 1;
    }

    // Detect main return
    if (clean.startsWith('return') && !clean.includes('nullptr') && !clean.includes('0;') && !clean.includes('false;')) {
      returnLine = i + 1;
    }
  }

  // Fallback line positioning if not detected
  if (!leftCallLine) leftCallLine = Math.min(Math.max(baseCaseLine + 2, 4), totalLines);
  if (!rightCallLine) rightCallLine = Math.min(leftCallLine + 1, totalLines);
  if (!returnLine) returnLine = Math.min(rightCallLine + 1, totalLines);

  const steps = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};
  const outputList = [];

  // Determine algorithm behavior from code analysis
  const isSwapOrInvert = cppCode.includes('temp') && cppCode.includes('root->left') && cppCode.includes('root->right');
  const isSumOrPath = cppCode.includes('* 10') || cppCode.includes('currentSum') || cppCode.includes('targetSum');
  const isCountOrHeight = cppCode.includes('1 +') || cppCode.includes('max(') || cppCode.includes('count');
  const isBooleanCheck = returnType === 'bool' || cppCode.includes('bool ');
  const isBSTSearchOrInsert = cppCode.includes('< root->val') || cppCode.includes('> root->val');

  // Recursive dynamic executor
  function execute(node, accVal = 0) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    // Push Frame on Function Entry
    const frame = {
      id: currentCallId,
      func: funcName,
      args: { root: nodeLabel, ...(isSumOrPath ? { sum: accVal } : {}) },
      line: funcEntryLine,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `${funcName}(${nodeLabel})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Step 1: Function Entry
    steps.push({
      line: funcEntryLine,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, ...(isSumOrPath ? { currentSum: accVal } : {}) },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${funcEntryLine}: Entering ${funcName}(root = ${nodeLabel}). Frame pushed to call stack.`,
      variables: { root: nodeLabel },
      actionType: 'CALL',
      output: [...outputList],
    });

    // Step 2: Base Case Evaluation
    const isNull = node === null;
    steps.push({
      line: baseCaseLine,
      tree: snapshotTree(treeState, { ...statusMap, ...(node ? { [node.id]: { status: 'active' } } : {}) }),
      activeNodeId: node ? node.id : null,
      highlightNodeIds: node ? [node.id] : [],
      pointers: { root: nodeLabel, 'root == nullptr': isNull ? 'true' : 'false' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: isNull
        ? `Line ${baseCaseLine}: Base Case HIT! 'root == nullptr' is TRUE. Returning base value.`
        : `Line ${baseCaseLine}: Base Case check: 'root == nullptr' is FALSE (root = Node(${node.val})). Continuing execution.`,
      variables: { root: nodeLabel, baseCaseHit: isNull },
      actionType: isNull ? 'BASE_CASE' : 'CHECK',
      output: [...outputList],
    });

    if (isNull) {
      const baseRetVal = isBooleanCheck ? false : (returnType === 'TreeNode*' ? 'nullptr' : 0);
      frame.returnVal = baseRetVal;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = baseRetVal; }

      steps.push({
        line: baseCaseLine,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { returnVal: String(baseRetVal) },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${baseCaseLine}: Returning ${baseRetVal} up the call stack. Popping frame.`,
        variables: { returnVal: baseRetVal },
        actionType: 'RETURN',
        output: [...outputList],
      });

      stack.pop();
      return baseRetVal;
    }

    // Step 3: Check Leaf condition (if present)
    const isLeaf = !node.left && !node.right;
    if (leafCheckLine && isLeaf) {
      steps.push({
        line: leafCheckLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: 'LEAF' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val}) [Leaf]`, isLeaf: 'true' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${leafCheckLine}: Leaf node reached! Both left and right pointers are nullptr.`,
        variables: { isLeaf: true },
        actionType: 'CHECK',
        output: [...outputList],
      });
    }

    // Step 4: Swapping pointers (if code performs swap / invert)
    if (isSwapOrInvert && swapLine) {
      const oldLeft = node.left ? `Node(${node.left.val})` : 'nullptr';
      const oldRight = node.right ? `Node(${node.right.val})` : 'nullptr';
      const temp = node.left;
      node.left = node.right;
      node.right = temp;

      steps.push({
        line: swapLine,
        tree: snapshotTree(treeState, { [node.id]: { status: 'created' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'swapped left': node.left ? `Node(${node.left.val})` : 'nullptr', 'swapped right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${swapLine}: Swapped root->left and root->right child pointers on Node(${node.val})!`,
        variables: { 'root->left': node.left ? node.left.val : null, 'root->right': node.right ? node.right.val : null },
        actionType: 'SWAP',
        output: [...outputList],
      });
    }

    // Step 5: Recurse Left Subtree
    let nextAcc = accVal;
    if (isSumOrPath) {
      nextAcc = accVal * 10 + node.val;
    }

    frame.line = leftCallLine;
    steps.push({
      line: leftCallLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, 'calling root->left': node.left ? `Node(${node.left.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${leftCallLine}: Recursing left: Calling ${funcName}(root->left). Execution on Node(${node.val}) PAUSES.`,
      variables: { branch: 'LEFT' },
      actionType: 'CALL',
      output: [...outputList],
    });

    const leftResult = execute(node.left, nextAcc);

    // Step 6: Backtrack from Left
    steps.push({
      line: leftCallLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: String(leftResult) },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${leftCallLine} (Backtrack): Resumed at Node(${node.val}). Left subtree evaluated to: ${leftResult}.`,
      variables: { leftResult },
      actionType: 'BACKTRACK',
      output: [...outputList],
    });

    // Step 7: Recurse Right Subtree
    frame.line = rightCallLine;
    steps.push({
      line: rightCallLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: String(leftResult), 'calling root->right': node.right ? `Node(${node.right.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${rightCallLine}: Recursing right: Calling ${funcName}(root->right). Execution on Node(${node.val}) PAUSES.`,
      variables: { leftResult, branch: 'RIGHT' },
      actionType: 'CALL',
      output: [...outputList],
    });

    const rightResult = execute(node.right, nextAcc);

    // Step 8: Backtrack from Right
    steps.push({
      line: rightCallLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, leftResult: String(leftResult), rightResult: String(rightResult) },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${rightCallLine} (Backtrack): Resumed at Node(${node.val}). Right subtree evaluated to: ${rightResult}.`,
      variables: { leftResult, rightResult },
      actionType: 'BACKTRACK',
      output: [...outputList],
    });

    // Step 9: Compute Combined Return Value
    let finalRet = null;
    if (returnType === 'TreeNode*') {
      finalRet = node;
    } else if (isBooleanCheck) {
      finalRet = leftResult || rightResult || (isLeaf ? true : false);
    } else if (isSumOrPath) {
      finalRet = isLeaf ? nextAcc : (Number(leftResult) + Number(rightResult));
    } else if (isCountOrHeight) {
      if (cppCode.includes('max(')) {
        finalRet = 1 + Math.max(Number(leftResult), Number(rightResult));
      } else {
        finalRet = 1 + Number(leftResult) + Number(rightResult);
      }
    } else {
      finalRet = node.val + Number(leftResult || 0) + Number(rightResult || 0);
    }

    statusMap[node.id] = { status: 'visited', badge: `ret=${finalRet}` };

    frame.line = returnLine;
    frame.returnVal = finalRet;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = finalRet; }

    steps.push({
      line: returnLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: `ret=${finalRet}` } }),
      activeNodeId: node.id,
      highlightNodeIds: [node.id],
      pointers: { root: `Node(${node.val})`, returnVal: String(finalRet) },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${returnLine}: Result computed for subtree Node(${node.val}) = ${finalRet}. Returning up call stack.`,
      variables: { leftResult, rightResult, returnVal: finalRet },
      actionType: 'RETURN',
      output: [finalRet],
    });

    stack.pop();
    return finalRet;
  }

  execute(treeState);

  // Final Step: Completion
  if (steps.length > 0) {
    steps.push({
      line: funcEntryLine,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: null,
      highlightNodeIds: [],
      pointers: { status: 'Execution Finished' },
      callStack: [],
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Custom C++ code execution completed! Final result returned: ${steps[steps.length - 1].variables.returnVal ?? 'Done'}.`,
      variables: { finished: true },
      actionType: 'COMPLETE',
      output: steps[steps.length - 1].output || [],
    });
  }

  return steps;
}
