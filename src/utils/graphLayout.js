// Graph utilities and layout calculator

export function parseAdjacencyList(adjStr) {
  // Parses format like:
  // 0: 1, 2
  // 1: 2
  // 2: 0, 3
  // 3: 3
  const adj = {};
  const lines = adjStr.trim().split('\n');
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const u = parseInt(parts[0].trim());
      const neighbors = parts[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => parseInt(s));
      if (!isNaN(u)) {
        adj[u] = neighbors;
      }
    }
  }
  return adj;
}

export function calculateGraphLayout(nodesList, edgesList, width = 600, height = 450, radius = 22) {
  const numNodes = nodesList.length;
  if (numNodes === 0) return { nodes: [], edges: [] };

  const centerX = width / 2;
  const centerY = height / 2;
  const circleRadius = Math.min(width, height) * 0.36;

  // Place nodes evenly in a circle or neat polygon
  const nodes = nodesList.map((node, i) => {
    const angle = (i * 2 * Math.PI) / numNodes - Math.PI / 2;
    return {
      ...node,
      x: centerX + circleRadius * Math.cos(angle),
      y: centerY + circleRadius * Math.sin(angle),
      radius,
    };
  });

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const edges = edgesList.map(edge => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    return {
      ...edge,
      fromX: fromNode ? fromNode.x : 0,
      fromY: fromNode ? fromNode.y : 0,
      toX: toNode ? toNode.x : 0,
      toY: toNode ? toNode.y : 0,
    };
  });

  return { nodes, edges };
}
