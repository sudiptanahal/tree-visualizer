// Tree data structures and layout calculation utility

let nextNodeId = 1;
export const getUniqueNodeId = () => `node_${Date.now()}_${nextNodeId++}`;

/**
 * Creates a Tree Node
 */
export function createTreeNode(val, left = null, right = null, id = null) {
  return {
    id: id || getUniqueNodeId(),
    val: val,
    left: left,
    right: right,
  };
}

/**
 * Deep clones a tree structure preserving IDs or generating new ones
 */
export function cloneTree(root) {
  if (!root) return null;
  return {
    id: root.id,
    val: root.val,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
    highlight: root.highlight,
    status: root.status,
    deleted: root.deleted,
    ghost: root.ghost,
  };
}

/**
 * Parses LeetCode-style array format [3, 9, 20, null, null, 15, 7] into a Binary Tree
 */
export function parseArrayToTree(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0 || arr[0] === null || arr[0] === undefined) {
    return null;
  }

  const root = createTreeNode(arr[0], null, null, `node_0`);
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const current = queue.shift();

    // Left child
    if (i < arr.length) {
      if (arr[i] !== null && arr[i] !== undefined && arr[i] !== '') {
        const leftVal = Number(arr[i]);
        current.left = createTreeNode(leftVal, null, null, `node_${i}`);
        queue.push(current.left);
      }
      i++;
    }

    // Right child
    if (i < arr.length) {
      if (arr[i] !== null && arr[i] !== undefined && arr[i] !== '') {
        const rightVal = Number(arr[i]);
        current.right = createTreeNode(rightVal, null, null, `node_${i}`);
        queue.push(current.right);
      }
      i++;
    }
  }

  return root;
}

/**
 * Converts tree to level-order array
 */
export function treeToArray(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }

  // Trim trailing nulls
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

/**
 * Inserts a value into a BST and returns the new root
 */
export function insertBST(root, val, nodeId = null) {
  if (!root) {
    return createTreeNode(val, null, null, nodeId);
  }
  if (val < root.val) {
    root.left = insertBST(root.left, val, nodeId);
  } else if (val > root.val) {
    root.right = insertBST(root.right, val, nodeId);
  }
  return root;
}

/**
 * Builds a BST from an array of numbers
 */
export function buildBSTFromNumbers(numbers) {
  let root = null;
  let idx = 0;
  for (const num of numbers) {
    root = insertBST(root, num, `node_bst_${idx++}`);
  }
  return root;
}

/**
 * Calculates (x, y) coordinates for each node in a binary tree
 * Uses an in-order traversal coordinate layout with subtree bounding boxes
 * for symmetrical, collision-free aesthetic tree rendering.
 */
export function calculateTreeLayout(root, canvasWidth = 800, canvasHeight = 500, nodeRadius = 24) {
  if (!root) return { nodes: [], edges: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 } };

  // Collect all nodes with level and in-order position
  let inOrderIndex = 0;
  const nodes = [];
  const edges = [];
  let maxDepth = 0;

  function getDepth(node, depth = 0) {
    if (!node) return depth;
    maxDepth = Math.max(maxDepth, depth);
    getDepth(node.left, depth + 1);
    getDepth(node.right, depth + 1);
  }
  getDepth(root, 0);

  // Compute position using recursive subtree width allocation
  function computeLayout(node, depth, leftBound, rightBound) {
    if (!node) return;

    const x = (leftBound + rightBound) / 2;
    const y = 50 + depth * 75;

    const positionedNode = {
      ...node,
      x,
      y,
      depth,
      radius: nodeRadius,
    };
    nodes.push(positionedNode);

    if (node.left) {
      edges.push({
        from: node.id,
        to: node.left.id,
        fromX: x,
        fromY: y,
        isLeft: true,
      });
      computeLayout(node.left, depth + 1, leftBound, x);
    }

    if (node.right) {
      edges.push({
        from: node.id,
        to: node.right.id,
        fromX: x,
        fromY: y,
        isLeft: false,
      });
      computeLayout(node.right, depth + 1, x, rightBound);
    }
  }

  // Width spread based on tree depth
  const spreadWidth = Math.max(canvasWidth - 80, Math.pow(2, Math.min(maxDepth, 5)) * 60);
  computeLayout(root, 0, 40, spreadWidth + 40);

  // Connect edges to destination node coordinates
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const resolvedEdges = edges.map(e => {
    const toNode = nodeMap.get(e.to);
    return {
      ...e,
      toX: toNode ? toNode.x : e.fromX,
      toY: toNode ? toNode.y : e.fromY,
    };
  });

  // Calculate bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x - nodeRadius);
    maxX = Math.max(maxX, n.x + nodeRadius);
    minY = Math.min(minY, n.y - nodeRadius);
    maxY = Math.max(maxY, n.y + nodeRadius);
  });

  return {
    nodes,
    edges: resolvedEdges,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(maxX - minX + 80, canvasWidth),
      height: Math.max(maxY - minY + 100, canvasHeight),
    }
  };
}
