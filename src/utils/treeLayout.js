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
export function cloneTree(root, newPrefix = null) {
  if (!root) return null;
  return {
    id: newPrefix ? `${newPrefix}_${root.id}_${Math.random().toString(36).substring(2, 6)}` : root.id,
    val: root.val,
    left: cloneTree(root.left, newPrefix),
    right: cloneTree(root.right, newPrefix),
    highlight: root.highlight,
    status: root.status,
    badge: root.badge,
    customColor: root.customColor,
    deleted: root.deleted,
    ghost: root.ghost,
  };
}

/**
 * Parses LeetCode-style array format [3, 9, 20, null, null, 15, 7] into a Binary Tree
 */
export function parseArrayToTree(arr, prefix = 'node') {
  if (!arr || !Array.isArray(arr) || arr.length === 0 || arr[0] === null || arr[0] === undefined) {
    return null;
  }

  const root = createTreeNode(arr[0], null, null, `${prefix}_0`);
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const current = queue.shift();

    // Left child
    if (i < arr.length) {
      if (arr[i] !== null && arr[i] !== undefined && arr[i] !== '') {
        const leftVal = Number(arr[i]);
        current.left = createTreeNode(leftVal, null, null, `${prefix}_${i}`);
        queue.push(current.left);
      }
      i++;
    }

    // Right child
    if (i < arr.length) {
      if (arr[i] !== null && arr[i] !== undefined && arr[i] !== '') {
        const rightVal = Number(arr[i]);
        current.right = createTreeNode(rightVal, null, null, `${prefix}_${i}`);
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
export function buildBSTFromNumbers(numbers, prefix = 'node_bst') {
  let root = null;
  let idx = 0;
  for (const num of numbers) {
    root = insertBST(root, num, `${prefix}_${idx++}`);
  }
  return root;
}

/**
 * Computes aesthetic, hierarchical binary tree layout for a single tree
 */
function layoutSingleTree(root, canvasWidth = 800, canvasHeight = 500, nodeRadius = 22, treeOffsetY = 60) {
  if (!root) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  const minSeparation = 56;
  const levelHeight = 72;

  const visitedSubtrees = new Set();
  function layoutSubtree(node, depth = 0) {
    if (!node || visitedSubtrees.has(node.id)) return null;
    visitedSubtrees.add(node.id);

    const leftLayout = layoutSubtree(node.left, depth + 1);
    const rightLayout = layoutSubtree(node.right, depth + 1);

    let leftContour = [0];
    let rightContour = [0];
    let leftOffset = 0;
    let rightOffset = 0;

    if (!leftLayout && !rightLayout) {
      leftContour = [0];
      rightContour = [0];
    } else if (leftLayout && !rightLayout) {
      leftOffset = -minSeparation * 0.75;
      leftContour = [0, ...leftLayout.leftContour.map((x) => x + leftOffset)];
      rightContour = [0, ...leftLayout.rightContour.map((x) => x + leftOffset)];
    } else if (!leftLayout && rightLayout) {
      rightOffset = minSeparation * 0.75;
      leftContour = [0, ...rightLayout.leftContour.map((x) => x + rightOffset)];
      rightContour = [0, ...rightLayout.rightContour.map((x) => x + rightOffset)];
    } else {
      let maxOverlap = 0;
      const minLevels = Math.min(leftLayout.rightContour.length, rightLayout.leftContour.length);
      for (let l = 0; l < minLevels; l++) {
        const overlap = leftLayout.rightContour[l] - rightLayout.leftContour[l] + minSeparation;
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
        }
      }

      const totalDist = Math.max(minSeparation, maxOverlap);
      leftOffset = -totalDist / 2;
      rightOffset = totalDist / 2;

      const maxLevel = Math.max(leftLayout.leftContour.length, rightLayout.rightContour.length);
      leftContour = [0];
      rightContour = [0];

      for (let l = 0; l < maxLevel; l++) {
        const leftVal =
          l < leftLayout.leftContour.length
            ? leftLayout.leftContour[l] + leftOffset
            : l < rightLayout.leftContour.length
            ? rightLayout.leftContour[l] + rightOffset
            : leftOffset;
        const rightVal =
          l < rightLayout.rightContour.length
            ? rightLayout.rightContour[l] + rightOffset
            : l < leftLayout.rightContour.length
            ? leftLayout.rightContour[l] + leftOffset
            : rightOffset;
        leftContour.push(leftVal);
        rightContour.push(rightVal);
      }
    }

    return {
      node,
      leftOffset,
      rightOffset,
      leftLayout,
      rightLayout,
      leftContour,
      rightContour,
    };
  }

  const layoutResult = layoutSubtree(root, 0);
  if (!layoutResult) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  const rawNodes = [];
  const rawEdges = [];

  function collectAbsolute(item, currX, depth) {
    if (!item) return;
    const n = item.node;
    const absX = currX;
    const absY = treeOffsetY + depth * levelHeight;

    rawNodes.push({
      ...n,
      x: absX,
      y: absY,
      radius: nodeRadius,
    });

    if (item.leftLayout) {
      rawEdges.push({
        from: n.id,
        to: item.leftLayout.node.id,
        isLeft: true,
      });
      collectAbsolute(item.leftLayout, currX + item.leftOffset, depth + 1);
    }

    if (item.rightLayout) {
      rawEdges.push({
        from: n.id,
        to: item.rightLayout.node.id,
        isLeft: false,
      });
      collectAbsolute(item.rightLayout, currX + item.rightOffset, depth + 1);
    }
  }

  collectAbsolute(layoutResult, 0, 0);

  const nodeMap = new Map();
  rawNodes.forEach((n) => nodeMap.set(n.id, n));

  const edges = rawEdges.map((e) => {
    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);
    return {
      ...e,
      fromX: fromNode ? fromNode.x : 0,
      fromY: fromNode ? fromNode.y : 0,
      toX: toNode ? toNode.x : 0,
      toY: toNode ? toNode.y : 0,
    };
  });

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  rawNodes.forEach((n) => {
    minX = Math.min(minX, n.x - nodeRadius);
    maxX = Math.max(maxX, n.x + nodeRadius);
    minY = Math.min(minY, n.y - nodeRadius);
    maxY = Math.max(maxY, n.y + nodeRadius);
  });

  const treeWidth = Math.max(maxX - minX, 10);
  const treeHeight = Math.max(maxY - minY, 10);
  const treeCenterX = (minX + maxX) / 2;
  const targetCenterX = canvasWidth / 2;
  const shiftX = targetCenterX - treeCenterX;

  rawNodes.forEach((n) => {
    n.x += shiftX;
  });
  edges.forEach((e) => {
    e.fromX += shiftX;
    e.toX += shiftX;
  });

  const finalMinX = minX + shiftX;
  const finalMaxX = maxX + shiftX;

  const availableW = Math.max(canvasWidth - 40, 100);
  const availableH = Math.max(canvasHeight - 90, 100);
  const autoScaleX = availableW / Math.max(treeWidth, 1);
  const autoScaleY = availableH / Math.max(treeHeight, 1);
  const autoScale = Math.min(1, Math.max(0.4, Math.min(autoScaleX, autoScaleY)));

  return {
    nodes: rawNodes,
    edges,
    bounds: {
      minX: finalMinX,
      maxX: finalMaxX,
      minY,
      maxY,
      width: treeWidth,
      height: treeHeight,
      autoScale,
    },
  };
}

/**
 * Computes aesthetic, non-overlapping multi-tree layout (2, 3, or more trees)
 * Displays trees side-by-side or partitioned with distinct color themes and bounding cards
 */
export function calculateMultiTreeLayout(treeConfigs = [], canvasWidth = 800, canvasHeight = 500, nodeRadius = 20) {
  if (!treeConfigs || treeConfigs.length === 0) {
    return {
      nodes: [],
      edges: [],
      partitions: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  const validTrees = treeConfigs.filter((t) => t && (t.tree || t.root || t.id));
  const numTrees = validTrees.length;

  if (numTrees === 0) {
    return {
      nodes: [],
      edges: [],
      partitions: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  if (numTrees === 1) {
    const single = layoutSingleTree(validTrees[0].tree || validTrees[0].root, canvasWidth, canvasHeight, nodeRadius);
    const theme = validTrees[0].theme || 'sky';
    const singleNodes = single.nodes.map((n) => ({ ...n, theme, treeId: validTrees[0].id || 'tree1' }));
    return {
      ...single,
      nodes: singleNodes,
      partitions: [
        {
          id: validTrees[0].id || 'tree1',
          title: validTrees[0].title || 'Binary Tree',
          theme,
          x: 20,
          y: 20,
          width: canvasWidth - 40,
          height: canvasHeight - 40,
        },
      ],
    };
  }

  // Multi-tree side-by-side partitioning
  const subWidth = Math.max(canvasWidth / numTrees, 260);
  const allNodes = [];
  const allEdges = [];
  const partitions = [];

  let overallMinX = Infinity, overallMaxX = -Infinity, overallMinY = Infinity, overallMaxY = -Infinity;

  validTrees.forEach((cfg, idx) => {
    const root = cfg.tree || cfg.root || null;
    const treeId = cfg.id || `tree_${idx + 1}`;
    const title = cfg.title || `Tree ${idx + 1}`;
    const theme = cfg.theme || (idx === 0 ? 'sky' : idx === 1 ? 'purple' : 'emerald');

    const subLayout = layoutSingleTree(root, subWidth, canvasHeight, nodeRadius, 70);
    const offsetX = idx * subWidth;

    const shiftedNodes = subLayout.nodes.map((n) => {
      const shiftedX = n.x + offsetX;
      overallMinX = Math.min(overallMinX, shiftedX - nodeRadius);
      overallMaxX = Math.max(overallMaxX, shiftedX + nodeRadius);
      overallMinY = Math.min(overallMinY, n.y - nodeRadius);
      overallMaxY = Math.max(overallMaxY, n.y + nodeRadius);
      return {
        ...n,
        x: shiftedX,
        treeId,
        treeTitle: title,
        theme,
      };
    });

    const shiftedEdges = subLayout.edges.map((e) => ({
      ...e,
      fromX: e.fromX + offsetX,
      toX: e.toX + offsetX,
      treeId,
      theme,
    }));

    allNodes.push(...shiftedNodes);
    allEdges.push(...shiftedEdges);

    partitions.push({
      id: treeId,
      title,
      theme,
      nodeCount: shiftedNodes.length,
      x: offsetX + 10,
      y: 12,
      width: subWidth - 20,
      height: Math.max(canvasHeight - 24, (subLayout.bounds?.height || 200) + 100),
    });
  });

  const totalW = Math.max(numTrees * subWidth, canvasWidth);
  const totalH = Math.max(canvasHeight, overallMaxY - overallMinY + 120);

  const availableW = Math.max(canvasWidth - 30, 100);
  const autoScale = Math.min(1, Math.max(0.4, availableW / totalW));

  return {
    nodes: allNodes,
    edges: allEdges,
    partitions,
    bounds: {
      minX: overallMinX === Infinity ? 0 : overallMinX,
      maxX: overallMaxX === -Infinity ? totalW : overallMaxX,
      minY: overallMinY === Infinity ? 0 : overallMinY,
      maxY: overallMaxY === -Infinity ? totalH : overallMaxY,
      width: totalW,
      height: totalH,
      autoScale,
    },
  };
}

/**
 * Universal Tree Layout function: seamlessly routes single tree or multi-trees
 */
export function calculateTreeLayout(treeOrMulti, canvasWidth = 800, canvasHeight = 500, nodeRadius = 22) {
  if (!treeOrMulti) {
    return {
      nodes: [],
      edges: [],
      partitions: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  // Multi-tree array format: [ { id, title, tree, theme }, ... ]
  if (Array.isArray(treeOrMulti)) {
    return calculateMultiTreeLayout(treeOrMulti, canvasWidth, canvasHeight, nodeRadius);
  }

  // Multi-tree object format: { multiTrees: [ ... ] }
  if (treeOrMulti && Array.isArray(treeOrMulti.multiTrees)) {
    return calculateMultiTreeLayout(treeOrMulti.multiTrees, canvasWidth, canvasHeight, nodeRadius);
  }

  // Single tree standard layout
  return layoutSingleTree(treeOrMulti, canvasWidth, canvasHeight, nodeRadius);
}
