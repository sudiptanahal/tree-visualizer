// Graph Algorithms Step Generators (BFS, DFS, Cycle Detection)

export function generateGraphBfsSteps(graphData, startVertex = 0) {
  const steps = [];
  const start = Number(startVertex);
  const nodes = (graphData.nodes || [0, 1, 2, 3, 4, 5]).map(n => typeof n === 'object' ? n.id : n);
  const edges = graphData.edges || [];
  const V = nodes.length;

  // Build adjacency list
  const adj = {};
  nodes.forEach(u => adj[u] = []);
  edges.forEach(e => {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
    // If undirected:
    if (!adj[e.to]) adj[e.to] = [];
    if (!adj[e.to].includes(e.from)) adj[e.to].push(e.from);
  });

  const visited = new Array(V).fill(false);
  const queue = [];
  const output = [];
  const nodeStatus = {};
  const edgeStatus = {};

  const makeSnapshot = () => ({
    nodes: nodes.map(id => ({
      id,
      val: id,
      status: nodeStatus[id] || 'unvisited',
      badge: visited[id] ? 'VISITED' : (queue.includes(id) ? 'QUEUED' : null)
    })),
    edges: edges.map(e => ({
      ...e,
      status: edgeStatus[`${e.from}-${e.to}`] || edgeStatus[`${e.to}-${e.from}`] || 'default'
    }))
  });

  // Line 2: vector<bool> visited(V, false); queue<int> q;
  steps.push({
    line: 2,
    graph: makeSnapshot(),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { startVertex: start },
    callStack: [{ id: 'main', func: 'bfs', args: { start, V }, line: 2 }],
    recursionTree: [],
    explanation: `Line 2-3: Initialized vector<bool> visited(${V}, false) and std::queue<int> q.`,
    variables: { visited: [...visited], queue: [] },
    actionType: 'INIT',
    output: [],
    extraInfo: { queue: [] }
  });

  // Line 6: visited[start] = true; q.push(start);
  visited[start] = true;
  queue.push(start);
  nodeStatus[start] = 'in_queue';

  steps.push({
    line: 6,
    graph: makeSnapshot(),
    activeNodeId: start,
    highlightNodeIds: [start],
    pointers: { 'visited[start]': 'true', 'pushed': start },
    callStack: [{ id: 'main', func: 'bfs', args: { start }, line: 6 }],
    recursionTree: [],
    explanation: `Line 6-7: Marked start vertex ${start} as visited (visited[${start}] = true) and pushed to queue.`,
    variables: { visited: [...visited], queue: [...queue] },
    actionType: 'QUEUE_PUSH',
    output: [],
    extraInfo: { queue: [...queue] }
  });

  // Line 9: while (!q.empty())
  while (queue.length > 0) {
    const u = queue.shift();
    nodeStatus[u] = 'visiting';
    output.push(u);

    // Line 10: int u = q.front(); q.pop();
    steps.push({
      line: 10,
      graph: makeSnapshot(),
      activeNodeId: u,
      highlightNodeIds: [u],
      pointers: { u, 'q.front()': u, queueSize: queue.length },
      callStack: [{ id: 'main', func: 'bfs', args: { current_u: u }, line: 10 }],
      recursionTree: [],
      explanation: `Line 10-12: Popped front vertex u = ${u} from queue. Visited output: [${output.join(', ')}].`,
      variables: { u, queue: [...queue], visitedOrder: [...output] },
      actionType: 'QUEUE_POP',
      output: [...output],
      extraInfo: { queue: [...queue] }
    });

    // Line 15: for (int v : adj[u])
    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      const edgeKey1 = `${u}-${v}`;
      const edgeKey2 = `${v}-${u}`;

      // Line 16: if (!visited[v])
      const isUnvisited = !visited[v];
      edgeStatus[edgeKey1] = isUnvisited ? 'active' : 'traversed';
      edgeStatus[edgeKey2] = isUnvisited ? 'active' : 'traversed';

      steps.push({
        line: 16,
        graph: makeSnapshot(),
        activeNodeId: u,
        highlightNodeIds: [u, v],
        pointers: { u, neighbor_v: v, 'visited[v]': visited[v] },
        callStack: [{ id: 'main', func: 'bfs', args: { u, v }, line: 16 }],
        recursionTree: [],
        explanation: `Line 16: Inspecting neighbor v = ${v} of vertex u = ${u}. visited[${v}] is ${visited[v] ? 'TRUE (already visited)' : 'FALSE (unvisited)'}.`,
        variables: { u, v, 'visited[v]': visited[v] },
        actionType: 'CHECK',
        output: [...output],
        extraInfo: { queue: [...queue] }
      });

      if (isUnvisited) {
        visited[v] = true;
        queue.push(v);
        nodeStatus[v] = 'in_queue';

        // Line 17-18: visited[v] = true; q.push(v);
        steps.push({
          line: 17,
          graph: makeSnapshot(),
          activeNodeId: v,
          highlightNodeIds: [u, v],
          pointers: { u, 'visited[v]': 'true', 'pushed': v },
          callStack: [{ id: 'main', func: 'bfs', args: { u, v }, line: 17 }],
          recursionTree: [],
          explanation: `Line 17-18: Marked neighbor ${v} as visited (visited[${v}] = true) and pushed into queue.`,
          variables: { visited: [...visited], queue: [...queue] },
          actionType: 'QUEUE_PUSH',
          output: [...output],
          extraInfo: { queue: [...queue] }
        });
      }
    }

    nodeStatus[u] = 'visited';
  }

  // Finished
  steps.push({
    line: 21,
    graph: makeSnapshot(),
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: { status: 'BFS Complete' },
    callStack: [{ id: 'main', func: 'bfs', args: {}, line: 21 }],
    recursionTree: [],
    explanation: `BFS complete! All reachable vertices visited: [${output.join(' -> ')}].`,
    variables: { totalVisited: output.length },
    actionType: 'COMPLETE',
    output: [...output],
    extraInfo: { queue: [] }
  });

  return steps;
}

export function generateGraphDfsSteps(graphData, startVertex = 0) {
  const steps = [];
  const start = Number(startVertex);
  const nodes = (graphData.nodes || [0, 1, 2, 3, 4, 5]).map(n => typeof n === 'object' ? n.id : n);
  const edges = graphData.edges || [];
  const V = nodes.length;

  const adj = {};
  nodes.forEach(u => adj[u] = []);
  edges.forEach(e => {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
    if (!adj[e.to]) adj[e.to] = [];
    if (!adj[e.to].includes(e.from)) adj[e.to].push(e.from);
  });

  const visited = new Array(V).fill(false);
  const output = [];
  const nodeStatus = {};
  const edgeStatus = {};
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  const makeSnapshot = () => ({
    nodes: nodes.map(id => ({
      id,
      val: id,
      status: nodeStatus[id] || 'unvisited',
      badge: visited[id] ? 'VISITED' : null
    })),
    edges: edges.map(e => ({
      ...e,
      status: edgeStatus[`${e.from}-${e.to}`] || edgeStatus[`${e.to}-${e.from}`] || 'default'
    }))
  });

  function dfsHelper(u) {
    const currentCallId = `call_${++callIdCounter}`;
    const frame = {
      id: currentCallId,
      func: `dfs`,
      args: { u },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `dfs(u=${u})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 2: visited[u] = true;
    visited[u] = true;
    nodeStatus[u] = 'visiting';
    output.push(u);

    steps.push({
      line: 2,
      graph: makeSnapshot(),
      activeNodeId: u,
      highlightNodeIds: [u],
      pointers: { u, 'visited[u]': 'true' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 2-3: Vertex ${u} marked as visited (visited[${u}] = true). Added ${u} to DFS order: [${output.join(', ')}].`,
      variables: { u, visited: [...visited], dfsOrder: [...output] },
      actionType: 'VISIT',
      output: [...output],
    });

    // Line 6: for (int v : adj[u])
    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      const edgeKey1 = `${u}-${v}`;
      const edgeKey2 = `${v}-${u}`;

      steps.push({
        line: 6,
        graph: makeSnapshot(),
        activeNodeId: u,
        highlightNodeIds: [u, v],
        pointers: { u, neighbor_v: v, 'visited[v]': visited[v] },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 6-7: Checking neighbor v = ${v} from u = ${u}. visited[${v}] is ${visited[v] ? 'TRUE' : 'FALSE'}.`,
        variables: { u, v, 'visited[v]': visited[v] },
        actionType: 'CHECK',
        output: [...output],
      });

      if (!visited[v]) {
        edgeStatus[edgeKey1] = 'active';
        edgeStatus[edgeKey2] = 'active';

        // Line 8: dfs(v, adj, visited);
        steps.push({
          line: 8,
          graph: makeSnapshot(),
          activeNodeId: v,
          highlightNodeIds: [u, v],
          pointers: { u, 'calling dfs': v },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 8: Neighbor ${v} is unvisited. Recursing deep: Calling dfs(${v}). Execution on ${u} pauses.`,
          variables: { calling: `dfs(${v})` },
          actionType: 'CALL',
          output: [...output],
        });

        dfsHelper(v);

        // Back from v
        steps.push({
          line: 8,
          graph: makeSnapshot(),
          activeNodeId: u,
          highlightNodeIds: [u],
          pointers: { u, returnedFrom: v },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Returned to dfs(${u}) after exploring path from ${v}. Continuing to next neighbor of ${u}.`,
          variables: { u },
          actionType: 'BACKTRACK',
          output: [...output],
        });
      }
    }

    // Line 11: End of function / backtrack
    nodeStatus[u] = 'visited';
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }

    steps.push({
      line: 11,
      graph: makeSnapshot(),
      activeNodeId: u,
      highlightNodeIds: [u],
      pointers: { u, status: 'Backtracking' },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: All neighbors of ${u} explored. Backtracking up the call stack. Popping dfs(${u}).`,
      variables: { u, status: 'Completed' },
      actionType: 'RETURN',
      output: [...output],
    });

    stack.pop();
  }

  dfsHelper(start);
  return steps;
}

export function generateUndirectedCycleSteps(graphData, startVertex = 0) {
  const steps = [];
  const start = Number(startVertex);
  const nodes = (graphData.nodes || [0, 1, 2, 3, 4]).map(n => typeof n === 'object' ? n.id : n);
  const edges = graphData.edges || [];
  const V = nodes.length;

  const adj = {};
  nodes.forEach(u => adj[u] = []);
  edges.forEach(e => {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
    if (!adj[e.to]) adj[e.to] = [];
    if (!adj[e.to].includes(e.from)) adj[e.to].push(e.from);
  });

  const visited = new Array(V).fill(false);
  const nodeStatus = {};
  const edgeStatus = {};
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  const makeSnapshot = () => ({
    nodes: nodes.map(id => ({
      id,
      val: id,
      status: nodeStatus[id] || 'unvisited',
      badge: visited[id] ? 'VISITED' : null
    })),
    edges: edges.map(e => ({
      ...e,
      status: edgeStatus[`${e.from}-${e.to}`] || edgeStatus[`${e.to}-${e.from}`] || 'default'
    }))
  });

  function cycleHelper(u, parent) {
    const currentCallId = `call_${++callIdCounter}`;
    const frame = {
      id: currentCallId,
      func: `hasCycleDFS`,
      args: { u, parent: parent === -1 ? '-1 (none)' : parent },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `hasCycle(u=${u}, p=${parent})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 2: visited[u] = true;
    visited[u] = true;
    nodeStatus[u] = 'visiting';

    steps.push({
      line: 2,
      graph: makeSnapshot(),
      activeNodeId: u,
      highlightNodeIds: [u],
      pointers: { u, parent: parent === -1 ? '-1 (none)' : parent },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 2: Marked vertex ${u} as visited (visited[${u}] = true). Exploring adjacent edges.`,
      variables: { u, parent, visited: [...visited] },
      actionType: 'VISIT',
      output: [],
    });

    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      const edgeKey1 = `${u}-${v}`;
      const edgeKey2 = `${v}-${u}`;

      steps.push({
        line: 4,
        graph: makeSnapshot(),
        activeNodeId: u,
        highlightNodeIds: [u, v],
        pointers: { u, neighbor_v: v, parent, 'v != parent': `${v} != ${parent}` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4-5: Checking neighbor v = ${v}. Is v visited? (${visited[v] ? 'YES' : 'NO'}). Is v the direct parent? (${v === parent ? 'YES' : 'NO'}).`,
        variables: { u, v, parent, 'visited[v]': visited[v] },
        actionType: 'CHECK',
        output: [],
      });

      if (!visited[v]) {
        edgeStatus[edgeKey1] = 'active';
        edgeStatus[edgeKey2] = 'active';

        // Line 6: hasCycleDFS(v, u, adj, visited)
        steps.push({
          line: 6,
          graph: makeSnapshot(),
          activeNodeId: v,
          highlightNodeIds: [u, v],
          pointers: { u, 'calling next': v, 'new parent': u },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `Line 6: Neighbor ${v} unvisited. Calling hasCycleDFS(v=${v}, parent=${u}).`,
          variables: { u, v },
          actionType: 'CALL',
          output: [],
        });

        if (cycleHelper(v, u)) {
          frame.returnVal = true;
          const rNode = recursionNodes.find(n => n.id === currentCallId);
          if (rNode) { rNode.status = 'returned'; rNode.returnVal = true; }
          stack.pop();
          return true;
        }
      } else if (v !== parent) {
        // Line 9: v != parent => CYCLE DETECTED!
        edgeStatus[edgeKey1] = 'cycle_edge';
        edgeStatus[edgeKey2] = 'cycle_edge';
        nodeStatus[u] = 'matched';
        nodeStatus[v] = 'matched';

        steps.push({
          line: 10,
          graph: makeSnapshot(),
          activeNodeId: u,
          highlightNodeIds: [u, v],
          pointers: { u, backEdgeTo: v, parent, 'CYCLE CONDITION': `visited[${v}] == true AND ${v} != ${parent}` },
          callStack: JSON.parse(JSON.stringify(stack)),
          recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
          explanation: `🚨 CYCLE DETECTED! Neighbor ${v} was ALREADY visited, and ${v} is NOT the parent of ${u}! This indicates an alternative path (back-edge). Cycle exists! Returning TRUE.`,
          variables: { cycleFound: true, backEdge: `${u} -> ${v}` },
          actionType: 'CYCLE_FOUND',
          output: [true],
        });

        frame.returnVal = true;
        const rNode = recursionNodes.find(n => n.id === currentCallId);
        if (rNode) { rNode.status = 'returned'; rNode.returnVal = true; }
        stack.pop();
        return true;
      }
    }

    nodeStatus[u] = 'visited';
    frame.returnVal = false;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = false; }
    stack.pop();
    return false;
  }

  const hasCycle = cycleHelper(start, -1);

  if (!hasCycle) {
    steps.push({
      line: 14,
      graph: makeSnapshot(),
      activeNodeId: null,
      highlightNodeIds: [],
      pointers: { result: 'NO CYCLE' },
      callStack: [{ id: 'main', func: 'hasCycleDFS', args: {}, line: 14 }],
      recursionTree: [],
      explanation: `Line 14: All vertices explored with no back-edges encountered. Graph has NO cycles! Returning FALSE.`,
      variables: { hasCycle: false },
      actionType: 'COMPLETE',
      output: [false],
    });
  }

  return steps;
}
