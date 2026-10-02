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
 * Computes aesthetic, hierarchical binary tree layout:
 * 1. Each parent is centered naturally above its children with clear left/right branch angles.
 * 2. Left and right subtrees have guaranteed minimum horizontal separation to prevent overlap.
 * 3. Root is centered horizontally in the canvas with responsive scaling for compact/dual views.
 * 4. Allows scattering and breathing room when zoomed out.
 */
export function calculateTreeLayout(root, canvasWidth = 800, canvasHeight = 500, nodeRadius = 22) {
  if (!root) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  const minSeparation = 66; // Generous horizontal spacing between adjacent sibling subtrees
  const levelHeight = 76;   // Comfortable vertical level spacing

  // 1. Post-order layout pass to compute relative subtree positioning and contours
  function layoutSubtree(node, depth = 0) {
    if (!node) return null;

    const leftLayout = layoutSubtree(node.left, depth + 1);
    const rightLayout = layoutSubtree(node.right, depth + 1);

    let myRelX = 0;
    let minX = 0;
    let maxX = 0;
    let leftContour = [0];
    let rightContour = [0];

    if (!leftLayout && !rightLayout) {
      // Leaf node
      myRelX = 0;
      minX = 0;
      maxX = 0;
      leftContour = [0];
      rightContour = [0];
    } else if (leftLayout && !rightLayout) {
      // Only left child: branch clearly to the left
      const leftShift = -minSeparation * 0.82;
      myRelX = 0;
      shiftSubtree(leftLayout.node, leftShift);
      minX = leftLayout.minX + leftShift;
      maxX = 0;
      leftContour = [0, ...leftLayout.leftContour.map((x) => x + leftShift)];
      rightContour = [0, ...leftLayout.rightContour.map((x) => x + leftShift)];
    } else if (!leftLayout && rightLayout) {
      // Only right child: branch clearly to the right
      const rightShift = minSeparation * 0.82;
      myRelX = 0;
      shiftSubtree(rightLayout.node, rightShift);
      minX = 0;
      maxX = rightLayout.maxX + rightShift;
      leftContour = [0, ...rightLayout.leftContour.map((x) => x + rightShift)];
      rightContour = [0, ...rightLayout.rightContour.map((x) => x + rightShift)];
    } else {
      // Both left and right children: calculate separation so contours never cross
      let maxOverlap = 0;
      const minLevels = Math.min(leftLayout.rightContour.length, rightLayout.leftContour.length);
      for (let l = 0; l < minLevels; l++) {
        const leftRightBound = leftLayout.rightContour[l];
        const rightLeftBound = rightLayout.leftContour[l];
        const overlap = leftRightBound - rightLeftBound + minSeparation;
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
        }
      }

      const totalDist = Math.max(minSeparation, maxOverlap);
      const leftShift = -totalDist / 2;
      const rightShift = totalDist / 2;

      shiftSubtree(leftLayout.node, leftShift);
      shiftSubtree(rightLayout.node, rightShift);

      myRelX = (leftShift + rightShift) / 2; // = 0

      minX = Math.min(0, leftLayout.minX + leftShift);
      maxX = Math.max(0, rightLayout.maxX + rightShift);

      const maxLevel = Math.max(leftLayout.leftContour.length, rightLayout.rightContour.length);
      leftContour = [0];
      rightContour = [0];

      for (let l = 0; l < maxLevel; l++) {
        const leftVal =
          l < leftLayout.leftContour.length
            ? leftLayout.leftContour[l] + leftShift
            : l < rightLayout.leftContour.length
            ? rightLayout.leftContour[l] + rightShift
            : leftShift;
        const rightVal =
          l < rightLayout.rightContour.length
            ? rightLayout.rightContour[l] + rightShift
            : l < leftLayout.rightContour.length
            ? leftLayout.rightContour[l] + leftShift
            : rightShift;
        leftContour.push(leftVal);
        rightContour.push(rightVal);
      }
    }

    const positionedNode = {
      ...node,
      relX: myRelX,
      depth,
      leftLayout,
      rightLayout,
    };

    return {
      node: positionedNode,
      minX,
      maxX,
      leftContour,
      rightContour,
    };
  }

  function shiftSubtree(node, offset) {
    if (!node) return;
    node.relX += offset;
    if (node.leftLayout) shiftSubtree(node.leftLayout.node, offset);
    if (node.rightLayout) shiftSubtree(node.rightLayout.node, offset);
  }

  const layoutResult = layoutSubtree(root, 0);
  if (!layoutResult) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, autoScale: 1 },
    };
  }

  // 2. Second pass: Collect absolute coordinates
  const rawNodes = [];
  const rawEdges = [];

  function collectAbsolute(pNode, currX, depth) {
    if (!pNode) return;
    const absX = currX + pNode.relX;
    const absY = 56 + depth * levelHeight;

    rawNodes.push({
      ...pNode,
      x: absX,
      y: absY,
      radius: nodeRadius,
    });

    if (pNode.leftLayout) {
      rawEdges.push({
        from: pNode.id,
        to: pNode.leftLayout.node.id,
        isLeft: true,
      });
      collectAbsolute(pNode.leftLayout.node, absX, depth + 1);
    }

    if (pNode.rightLayout) {
      rawEdges.push({
        from: pNode.id,
        to: pNode.rightLayout.node.id,
        isLeft: false,
      });
      collectAbsolute(pNode.rightLayout.node, absX, depth + 1);
    }
  }

  collectAbsolute(layoutResult.node, 0, 0);

  // 3. Connect edge coordinates
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

  // 4. Calculate bounding box & auto-center horizontally
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

  // Center horizontally
  rawNodes.forEach((n) => {
    n.x += shiftX;
  });
  edges.forEach((e) => {
    e.fromX += shiftX;
    e.toX += shiftX;
  });

  const finalMinX = minX + shiftX;
  const finalMaxX = maxX + shiftX;

  // Responsive scale factor for compact viewports or large trees
  const availableW = Math.max(canvasWidth - 36, 100);
  const availableH = Math.max(canvasHeight - 85, 100);
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
