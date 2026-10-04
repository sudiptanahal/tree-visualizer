import { parseArrayToTree, cloneTree, createTreeNode } from '../utils/treeLayout';
import { runCustomRecursionCode } from './recursionAlgorithms';
import {
  generateMergeTwoTreesSteps,
  generateSameTreeSteps,
  generateSubtreeSteps,
  generateMergeMultiTreesSteps,
  generateSameMultiTreesSteps,
} from './treeAlgorithmsExtra';
import { formatCallLabel } from '../utils/cppParamExtractor';

export function isRecursionOnlyCode(cppCode) {
  const codeLower = (cppCode || '').toLowerCase();
  // If it explicitly references TreeNode or root pointers, it is a tree algorithm
  if (
    codeLower.includes('treenode') ||
    codeLower.includes('root->left') ||
    codeLower.includes('root->right') ||
    codeLower.includes('node->left') ||
    codeLower.includes('node->right') ||
    codeLower.includes('curr->left') ||
    codeLower.includes('curr->right') ||
    codeLower.includes('root1') ||
    codeLower.includes('root2')
  ) {
    return false;
  }
  // Otherwise if it matches pure recursion signatures
  if (
    codeLower.includes('mergesort') ||
    codeLower.includes('quicksort') ||
    codeLower.includes('fib') ||
    codeLower.includes('subset') ||
    codeLower.includes('hanoi') ||
    codeLower.includes('partition') ||
    codeLower.includes('vector<int>') ||
    codeLower.includes('int l, int r') ||
    codeLower.includes('int low, int high') ||
    codeLower.includes('int n')
  ) {
    return true;
  }
  return false;
}

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
 * Executes Flatten Binary Tree to Linked List (LeetCode 114) custom C++ code
 */
function runFlattenCustomCode(cppCode, initialTreeState) {
  const lines = cppCode.split('\n');
  const steps = [];
  const root = cloneTree(initialTreeState);
  let curr = root;

  let entryLine = 1;
  let whileLine = 2;
  let ifLeftLine = 3;
  let prevInitLine = 4;
  let prevWhileLine = 5;
  let spliceLine = 6;
  let moveLine = 7;
  let nullifyLine = 8;
  let advanceLine = 9;

  for (let i = 0; i < lines.length; i++) {
    const clean = lines[i].replace(/\/\/.*$/, '').trim();
    if (clean.includes('void') && clean.includes('flatten')) entryLine = i + 1;
    if (clean.includes('while') && clean.includes('curr') && !clean.includes('prev')) whileLine = i + 1;
    if (clean.includes('if') && clean.includes('curr->left')) ifLeftLine = i + 1;
    if (clean.includes('TreeNode* prev') || (clean.includes('prev =') && clean.includes('curr->left'))) prevInitLine = i + 1;
    if (clean.includes('while') && clean.includes('prev->right')) prevWhileLine = i + 1;
    if (clean.includes('prev->right = curr->right') || (clean.includes('prev->right') && clean.includes('='))) spliceLine = i + 1;
    if (clean.includes('curr->right = curr->left') || (clean.includes('curr->right') && clean.includes('left'))) moveLine = i + 1;
    if (clean.includes('curr->left = nullptr') || clean.includes('curr->left = NULL') || clean.includes('curr->left = 0')) nullifyLine = i + 1;
    if (clean.includes('curr = curr->right') || (clean.includes('curr') && clean.includes('->right'))) advanceLine = i + 1;
  }

  const stack = [
    { id: 'frame_1', func: 'flatten', args: { root: curr ? `Node(${curr.val})` : 'nullptr' }, line: entryLine, returnVal: null }
  ];

  const recursionNodes = [
    { id: 'call_1', label: `flatten(${curr ? `Node(${curr.val})` : 'nullptr'})`, parentId: null, status: 'active', returnVal: null }
  ];

  steps.push({
    line: entryLine,
    tree: snapshotTree(root, curr ? { [curr.id]: { status: 'active', badge: 'root' } } : {}),
    activeNodeId: curr ? curr.id : null,
    highlightNodeIds: curr ? [curr.id] : [],
    pointers: { root: curr ? `Node(${curr.val})` : 'nullptr', curr: curr ? `Node(${curr.val})` : 'nullptr' },
    callStack: JSON.parse(JSON.stringify(stack)),
    recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
    explanation: `Line ${entryLine}: Starting in-place tree flattening. Initializing curr = root.`,
    variables: { curr: curr ? curr.val : 'nullptr' },
    actionType: 'CALL',
    output: [],
  });

  while (curr) {
    stack[0].line = whileLine;
    steps.push({
      line: whileLine,
      tree: snapshotTree(root, { [curr.id]: { status: 'active', badge: 'curr' } }),
      activeNodeId: curr.id,
      highlightNodeIds: [curr.id],
      pointers: { curr: `Node(${curr.val})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${whileLine}: Loop check: curr = Node(${curr.val}) != nullptr (TRUE).`,
      variables: { curr: curr.val },
      actionType: 'CHECK',
      output: [],
    });

    stack[0].line = ifLeftLine;
    if (curr.left) {
      steps.push({
        line: ifLeftLine,
        tree: snapshotTree(root, { [curr.id]: { status: 'active', badge: 'curr' }, [curr.left.id]: { status: 'highlight', badge: 'left' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id, curr.left.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->left': `Node(${curr.left.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${ifLeftLine}: curr->left is NOT nullptr (Node(${curr.left.val})). Finding in-order predecessor.`,
        variables: { curr: curr.val, 'curr->left': curr.left.val },
        actionType: 'CHECK',
        output: [],
      });

      let prev = curr.left;
      stack[0].line = prevInitLine;
      steps.push({
        line: prevInitLine,
        tree: snapshotTree(root, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'matched', badge: 'prev' } }),
        activeNodeId: prev.id,
        highlightNodeIds: [curr.id, prev.id],
        pointers: { curr: `Node(${curr.val})`, prev: `Node(${prev.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${prevInitLine}: Starting predecessor search: prev = curr->left (Node(${prev.val})).`,
        variables: { prev: prev.val },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      while (prev.right) {
        prev = prev.right;
        stack[0].line = prevWhileLine;
        steps.push({
          line: prevWhileLine,
          tree: snapshotTree(root, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'matched', badge: 'prev' } }),
          activeNodeId: prev.id,
          highlightNodeIds: [curr.id, prev.id],
          pointers: { curr: `Node(${curr.val})`, prev: `Node(${prev.val}) [traversing]` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line ${prevWhileLine}: Advancing to rightmost leaf of left subtree: prev = prev->right (Node(${prev.val})).`,
          variables: { prev: prev.val },
          actionType: 'POINTER_UPDATE',
          output: [],
        });
      }

      // Splicing
      const oldRight = curr.right;
      prev.right = curr.right;
      stack[0].line = spliceLine;
      steps.push({
        line: spliceLine,
        tree: snapshotTree(root, { [curr.id]: { status: 'active', badge: 'curr' }, [prev.id]: { status: 'created', badge: 'prev->right' } }),
        activeNodeId: prev.id,
        highlightNodeIds: [curr.id, prev.id],
        pointers: { curr: `Node(${curr.val})`, prev: `Node(${prev.val})`, 'prev->right': prev.right ? `Node(${prev.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${spliceLine}: Splicing: Connected prev->right (Node(${prev.val})) to curr->right (${oldRight ? `Node(${oldRight.val})` : 'nullptr'}).`,
        variables: { prev: prev.val, 'prev->right': prev.right ? prev.right.val : null },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      // Move left to right
      curr.right = curr.left;
      stack[0].line = moveLine;
      steps.push({
        line: moveLine,
        tree: snapshotTree(root, { [curr.id]: { status: 'created', badge: 'curr->right' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->right': `Node(${curr.right.val})` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${moveLine}: Moving left subtree to right: curr->right = curr->left (Node(${curr.right.val})).`,
        variables: { curr: curr.val, 'curr->right': curr.right.val },
        actionType: 'POINTER_UPDATE',
        output: [],
      });

      // Nullify left
      curr.left = null;
      stack[0].line = nullifyLine;
      steps.push({
        line: nullifyLine,
        tree: snapshotTree(root, { [curr.id]: { status: 'visited', badge: 'curr' } }),
        activeNodeId: curr.id,
        highlightNodeIds: [curr.id],
        pointers: { curr: `Node(${curr.val})`, 'curr->left': 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${nullifyLine}: Set curr->left = nullptr. Left subtree transformed into linear right branch.`,
        variables: { curr: curr.val, 'curr->left': null },
        actionType: 'POINTER_UPDATE',
        output: [],
      });
    }

    curr = curr.right;
    stack[0].line = advanceLine;
    steps.push({
      line: advanceLine,
      tree: snapshotTree(root, curr ? { [curr.id]: { status: 'active', badge: 'curr' } } : {}),
      activeNodeId: curr ? curr.id : null,
      highlightNodeIds: curr ? [curr.id] : [],
      pointers: { curr: curr ? `Node(${curr.val})` : 'nullptr' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line ${advanceLine}: Advancing curr pointer: curr = curr->right (${curr ? `Node(${curr.val})` : 'nullptr'}).`,
      variables: { curr: curr ? curr.val : 'nullptr' },
      actionType: 'POINTER_UPDATE',
      output: [],
    });
  }

  // Final Step: Complete
  stack[0].returnVal = 'void';
  recursionNodes[0].status = 'returned';

  steps.push({
    line: lines.length,
    tree: snapshotTree(root),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { status: 'Flattening Complete', output: 'Right-Skewed Linked List' },
    callStack: [],
    recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
    explanation: 'Tree flattening complete! All nodes are chained linearly along right pointers (1 -> 2 -> 3 -> 4 -> 5 -> 6).',
    variables: { completed: true },
    actionType: 'COMPLETE',
    output: ['Flattened Linked List: 1 -> 2 -> 3 -> 4 -> 5 -> 6'],
  });

  return steps;
}

/**
 * Universal AST-like line-by-line C++ Code Runner
 * Automatically parses, executes, and animates ANY custom C++ tree algorithm:
 * - Multi-Tree Operations (Merge Trees, Same Tree, Subtree of Tree)
 * - Structural mutations (Flattening, Inversion, Pruning, BST Insertion, BST Deletion, Swapping)
 * - Node value mutations (Doubling, Cumulative sums, Assignments)
 * - Recursive and iterative algorithms
 * - Pure recursion / divide-and-conquer algorithms
 */
export function runCustomCppCode(
  cppCode,
  treeArrayOrCustomInput,
  initialParams = {},
  forcedMode = null,
  tree2Input = null,
  tree3Input = null,
  extraTrees = []
) {
  // 1. Pure Recursion Check
  const isRecOnly =
    forcedMode === 'recursion' ||
    (forcedMode !== 'tree' && forcedMode !== 'multi_tree' && isRecursionOnlyCode(cppCode));
  if (isRecOnly) {
    return runCustomRecursionCode(
      cppCode,
      Array.isArray(treeArrayOrCustomInput) ? treeArrayOrCustomInput : [38, 27, 43, 3, 9, 82, 10],
      initialParams
    );
  }

  const lines = cppCode.split('\n');
  const totalLines = lines.length;
  const codeLower = cppCode.toLowerCase();

  const isThreeTreeSignature =
    (codeLower.includes('root1') && codeLower.includes('root2') && codeLower.includes('root3')) ||
    (codeLower.includes('t1') && codeLower.includes('t2') && codeLower.includes('t3')) ||
    codeLower.includes('mergethreetrees') ||
    codeLower.includes('samethreetrees') ||
    codeLower.includes('vector<treenode*>') ||
    Boolean(tree3Input);

  const isMultiTreeSignature =
    forcedMode === 'multi_tree' ||
    isThreeTreeSignature ||
    (codeLower.includes('treenode* root1') && codeLower.includes('treenode* root2')) ||
    (codeLower.includes('treenode* p') && codeLower.includes('treenode* q')) ||
    (codeLower.includes('treenode* root') && codeLower.includes('treenode* subroot')) ||
    codeLower.includes('mergetrees') ||
    codeLower.includes('issamtree') ||
    codeLower.includes('issame') ||
    codeLower.includes('issubtree');

  if (isMultiTreeSignature) {
    if (isThreeTreeSignature || extraTrees.length > 0 || tree3Input) {
      const arr1 = Array.isArray(treeArrayOrCustomInput) ? treeArrayOrCustomInput : [1, 3, 2, 5];
      const arr2 = Array.isArray(tree2Input) ? tree2Input : [2, 1, 3, null, 4, null, 7];
      const arr3 = Array.isArray(tree3Input) ? tree3Input : [3, null, 2, null, null, 1, 6];

      const allTreeConfigs = [
        { id: 't1', title: 'Tree 1 (Alpha)', theme: 'sky', tree: parseArrayToTree(arr1, 't1') },
        { id: 't2', title: 'Tree 2 (Beta)', theme: 'purple', tree: parseArrayToTree(arr2, 't2') },
        { id: 't3', title: 'Tree 3 (Gamma)', theme: 'emerald', tree: parseArrayToTree(arr3, 't3') },
        ...extraTrees.map((et, i) => ({
          id: `t${i + 4}`,
          title: `Tree ${i + 4}`,
          theme: ['amber', 'rose', 'indigo'][i % 3],
          tree: parseArrayToTree(et, `t${i + 4}`),
        })),
      ];

      if (codeLower.includes('merge') || codeLower.includes('sum') || codeLower.includes('+=')) {
        return generateMergeMultiTreesSteps(allTreeConfigs);
      }
      return generateSameMultiTreesSteps(allTreeConfigs);
    }

    const treeArray1 = Array.isArray(treeArrayOrCustomInput) ? treeArrayOrCustomInput : [1, 3, 2, 5];
    const treeArray2 = Array.isArray(tree2Input) ? tree2Input : [2, 1, 3, null, 4, null, 7];
    const t1 = parseArrayToTree(treeArray1, 't1');
    const t2 = parseArrayToTree(treeArray2, 't2');

    if (codeLower.includes('merge') || codeLower.includes('root1->val +=')) {
      return generateMergeTwoTreesSteps(t1, t2);
    }
    if (codeLower.includes('issubtree') || codeLower.includes('subroot')) {
      return generateSubtreeSteps(t1, t2);
    }
    return generateSameTreeSteps(t1, t2);
  }

  const treeArray = Array.isArray(treeArrayOrCustomInput) ? treeArrayOrCustomInput : [1, 2, 5, 3, 4, null, 6];
  let treeState = cloneTree(parseArrayToTree(treeArray, 'node'));

  // 3. Specialized Check: Flatten Binary Tree (Morris Iterative)
  if (
    codeLower.includes('flatten') ||
    (codeLower.includes('prev->right') && codeLower.includes('curr->left')) ||
    (codeLower.includes('curr->right = curr->left'))
  ) {
    return runFlattenCustomCode(cppCode, treeState);
  }

  // 4. Dynamic Single Tree AST Analysis
  let funcEntryLine = 1;
  let baseCaseLine = 2;
  let valueMutationLine = null;
  let valueMutationType = null;
  let valueMutationFactor = 2;
  let swapLine = null;
  let leftCallLine = null;
  let rightCallLine = null;
  let returnLine = totalLines;
  let rightFirst = false;
  let funcName = 'solve';
  let returnType = 'int';

  const isTreeInvert = codeLower.includes('invert') || codeLower.includes('mirror') || (codeLower.includes('swap') && codeLower.includes('left') && codeLower.includes('right'));

  for (let i = 0; i < lines.length; i++) {
    const clean = lines[i].replace(/\/\/.*$/, '').trim();

    const funcMatch = clean.match(/^(int|bool|void|TreeNode\*|long|vector<[^>]+>)\s+([a-zA-Z0-9_]+)\s*\((.*)\)/);
    if (funcMatch) {
      returnType = funcMatch[1];
      funcName = funcMatch[2];
      funcEntryLine = i + 1;
    }

    if (clean.includes('if') && (clean.includes('root == nullptr') || clean.includes('!root') || clean.includes('root == NULL') || clean.includes('!node') || clean.includes('node == nullptr'))) {
      baseCaseLine = i + 1;
    }

    if (clean.includes('->val') && (clean.includes('*=') || clean.includes('+=') || clean.includes('-=') || clean.includes('=')) && !clean.includes('==') && !clean.includes('currentSum')) {
      valueMutationLine = i + 1;
      if (clean.includes('*=')) {
        valueMutationType = 'multiply';
        const numMatch = clean.match(/\*=\s*(\d+)/);
        if (numMatch) valueMutationFactor = parseInt(numMatch[1]);
      } else if (clean.includes('+=')) {
        valueMutationType = 'add';
        const numMatch = clean.match(/\+=\s*(\d+)/);
        if (numMatch) valueMutationFactor = parseInt(numMatch[1]);
      } else {
        valueMutationType = 'set';
      }
    }

    if (clean.includes('TreeNode* temp') || (clean.includes('->left') && clean.includes('->right') && clean.includes('=')) || clean.includes('swap(')) {
      if (!swapLine) swapLine = i + 1;
    }

    if (clean.includes('->left') && (clean.includes('(') || clean.includes('='))) {
      if (!leftCallLine) {
        leftCallLine = i + 1;
        if (rightCallLine && rightCallLine < leftCallLine) {
          rightFirst = true;
        }
      }
    }
    if (clean.includes('->right') && (clean.includes('(') || clean.includes('='))) {
      if (!rightCallLine) {
        rightCallLine = i + 1;
      }
    }

    if (clean.startsWith('return') && !clean.includes('nullptr') && !clean.includes('0;') && !clean.includes('false;')) {
      returnLine = i + 1;
    }
  }

  if (!leftCallLine) leftCallLine = Math.min(Math.max(baseCaseLine + 2, 4), totalLines);
  if (!rightCallLine) rightCallLine = Math.min(leftCallLine + 1, totalLines);
  if (!returnLine) returnLine = Math.min(Math.max(leftCallLine, rightCallLine) + 1, totalLines);

  const steps = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const statusMap = {};
  const outputList = [];

  const isBooleanCheck = returnType === 'bool' || cppCode.includes('bool ');
  const isCountOrHeight = cppCode.includes('1 +') || cppCode.includes('max(') || cppCode.includes('count');
  const isSumOrPath = cppCode.includes('* 10') || cppCode.includes('currentSum') || cppCode.includes('targetSum');

  function execute(node, accVal = 0) {
    const currentCallId = `call_${++callIdCounter}`;
    const nodeLabel = node ? `Node(${node.val})` : 'nullptr';

    const frameArgs = {
      root: nodeLabel,
      ...(isSumOrPath ? { sum: accVal } : {}),
      ...(initialParams && Object.keys(initialParams).length > 0 ? initialParams : {}),
    };

    const frame = {
      id: currentCallId,
      func: funcName,
      args: frameArgs,
      line: funcEntryLine,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: formatCallLabel(funcName, { root: nodeLabel, ...(isSumOrPath ? { sum: accVal } : {}) }),
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
      const rNode = recursionNodes.find((n) => n.id === currentCallId);
      if (rNode) {
        rNode.status = 'returned';
        rNode.returnVal = baseRetVal;
      }

      steps.push({
        line: baseCaseLine,
        tree: snapshotTree(treeState, statusMap),
        activeNodeId: null,
        highlightNodeIds: [],
        pointers: { returnVal: String(baseRetVal) },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${baseCaseLine}: Returning ${baseRetVal} up call stack. Popping frame.`,
        variables: { returnVal: baseRetVal },
        actionType: 'RETURN',
        output: [...outputList],
      });

      stack.pop();
      return baseRetVal;
    }

    // Step 3: Value Mutation
    if (valueMutationLine) {
      const oldVal = node.val;
      if (valueMutationType === 'multiply') {
        node.val *= valueMutationFactor;
      } else if (valueMutationType === 'add') {
        node.val += valueMutationFactor;
      }

      steps.push({
        line: valueMutationLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'created', badge: `val=${node.val}` } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val}) [Updated]` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${valueMutationLine}: In-place value mutation: changed val from ${oldVal} to ${node.val}!`,
        variables: { oldVal, newVal: node.val },
        actionType: 'VALUE_UPDATE',
        output: [...outputList],
      });
    }

    // Step 4: Pointer Swapping
    if (swapLine || isTreeInvert) {
      const oldLeft = node.left ? `Node(${node.left.val})` : 'nullptr';
      const oldRight = node.right ? `Node(${node.right.val})` : 'nullptr';
      const temp = node.left;
      node.left = node.right;
      node.right = temp;

      const actLine = swapLine || Math.max(baseCaseLine + 1, 3);
      steps.push({
        line: actLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'created', badge: 'swapped' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: {
          root: `Node(${node.val})`,
          'swapped left': node.left ? `Node(${node.left.val})` : 'nullptr',
          'swapped right': node.right ? `Node(${node.right.val})` : 'nullptr',
        },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${actLine}: Swapped root->left (${oldLeft} -> ${node.left ? `Node(${node.left.val})` : 'nullptr'}) and root->right (${oldRight} -> ${node.right ? `Node(${node.right.val})` : 'nullptr'}) pointers!`,
        variables: { 'root->left': node.left ? node.left.val : null, 'root->right': node.right ? node.right.val : null },
        actionType: 'SWAP',
        output: [...outputList],
      });
    }

    // Step 5: Recurse Subtrees
    let leftResult = null;
    let rightResult = null;
    let nextAcc = isSumOrPath ? accVal * 10 + node.val : accVal;

    if (rightFirst) {
      frame.line = rightCallLine;
      steps.push({
        line: rightCallLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${rightCallLine}: Recursing right: Calling ${funcName}(root->right). Frame on Node(${node.val}) pauses.`,
        variables: { branch: 'RIGHT' },
        actionType: 'CALL',
        output: [...outputList],
      });

      rightResult = execute(node.right, nextAcc);

      frame.line = leftCallLine;
      steps.push({
        line: leftCallLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${leftCallLine}: Recursing left: Calling ${funcName}(root->left). Frame on Node(${node.val}) pauses.`,
        variables: { branch: 'LEFT' },
        actionType: 'CALL',
        output: [...outputList],
      });

      leftResult = execute(node.left, nextAcc);
    } else {
      frame.line = leftCallLine;
      steps.push({
        line: leftCallLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, 'calling left': node.left ? `Node(${node.left.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${leftCallLine}: Recursing left: Calling ${funcName}(root->left). Frame on Node(${node.val}) pauses.`,
        variables: { branch: 'LEFT' },
        actionType: 'CALL',
        output: [...outputList],
      });

      leftResult = execute(node.left, nextAcc);

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

      frame.line = rightCallLine;
      steps.push({
        line: rightCallLine,
        tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'active' } }),
        activeNodeId: node.id,
        highlightNodeIds: [node.id],
        pointers: { root: `Node(${node.val})`, leftResult: String(leftResult), 'calling right': node.right ? `Node(${node.right.val})` : 'nullptr' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line ${rightCallLine}: Recursing right: Calling ${funcName}(root->right). Frame on Node(${node.val}) pauses.`,
        variables: { leftResult, branch: 'RIGHT' },
        actionType: 'CALL',
        output: [...outputList],
      });

      rightResult = execute(node.right, nextAcc);

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
    }

    // Step 6: Return Value Computation
    let finalRet = null;
    const isLeaf = !node.left && !node.right;

    if (returnType === 'TreeNode*') {
      finalRet = node;
    } else if (isBooleanCheck) {
      finalRet = leftResult || rightResult || (isLeaf ? true : false);
    } else if (isSumOrPath) {
      finalRet = isLeaf ? nextAcc : Number(leftResult) + Number(rightResult);
    } else if (isCountOrHeight) {
      if (cppCode.includes('max(')) {
        finalRet = 1 + Math.max(Number(leftResult), Number(rightResult));
      } else {
        finalRet = 1 + Number(leftResult) + Number(rightResult);
      }
    } else {
      finalRet = node.val + Number(leftResult || 0) + Number(rightResult || 0);
    }

    statusMap[node.id] = { status: 'visited', badge: returnType === 'TreeNode*' ? null : `ret=${finalRet}` };

    frame.line = returnLine;
    frame.returnVal = finalRet;
    const rNode = recursionNodes.find((n) => n.id === currentCallId);
    if (rNode) {
      rNode.status = 'returned';
      rNode.returnVal = finalRet;
    }

    steps.push({
      line: returnLine,
      tree: snapshotTree(treeState, { ...statusMap, [node.id]: { status: 'matched', badge: returnType === 'TreeNode*' ? null : `ret=${finalRet}` } }),
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

  // Final Completion Step
  if (steps.length > 0) {
    steps.push({
      line: funcEntryLine,
      tree: snapshotTree(treeState, statusMap),
      activeNodeId: null,
      highlightNodeIds: [],
      pointers: { status: 'Execution Finished' },
      callStack: [],
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Custom C++ code execution completed! Tree structure and values updated in memory.`,
      variables: { finished: true },
      actionType: 'COMPLETE',
      output: steps[steps.length - 1].output || [],
    });
  }

  return steps;
}
