// Recursion Visualizer Step Generator (Fibonacci)

export function generateFibonacciSteps(n = 4) {
  const steps = [];
  const N = Number(n);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function fibHelper(currN) {
    const currentCallId = `call_${++callIdCounter}`;

    const frame = {
      id: currentCallId,
      func: `fib`,
      args: { n: currN },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `fib(${currN})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 3: if (n <= 0) return 0;
    if (currN <= 0) {
      steps.push({
        line: 3,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { n: currN, condition: 'n <= 0 (TRUE)' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 3: Base Case: n = ${currN} <= 0. Returning 0.`,
        variables: { n: currN, returnVal: 0 },
        actionType: 'BASE_CASE',
        output: [0],
      });

      frame.returnVal = 0;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 0; }
      stack.pop();
      return 0;
    }

    // Line 4: if (n == 1) return 1;
    if (currN === 1) {
      steps.push({
        line: 4,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { n: currN, condition: 'n == 1 (TRUE)' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 4: Base Case: n = 1. Returning 1.`,
        variables: { n: currN, returnVal: 1 },
        actionType: 'BASE_CASE',
        output: [1],
      });

      frame.returnVal = 1;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = 1; }
      stack.pop();
      return 1;
    }

    // Line 7: int left = fib(n - 1);
    steps.push({
      line: 7,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN, 'calling left': `fib(${currN - 1})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Calling left branch: fib(${currN} - 1) = fib(${currN - 1}). Current frame fib(${currN}) pauses.`,
      variables: { n: currN, nextCall: `fib(${currN - 1})` },
      actionType: 'CALL',
      output: [],
    });

    const left = fibHelper(currN - 1);

    // After left returns
    steps.push({
      line: 7,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN, leftResult: left },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: Left call resolved: left = fib(${currN - 1}) = ${left}. Now evaluating right branch.`,
      variables: { n: currN, left },
      actionType: 'RECEIVE_RETURN',
      output: [],
    });

    // Line 8: int right = fib(n - 2);
    steps.push({
      line: 8,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN, leftResult: left, 'calling right': `fib(${currN - 2})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Calling right branch: fib(${currN} - 2) = fib(${currN - 2}).`,
      variables: { n: currN, left, nextCall: `fib(${currN - 2})` },
      actionType: 'CALL',
      output: [],
    });

    const right = fibHelper(currN - 2);

    const sum = left + right;

    // Line 11: return left + right;
    steps.push({
      line: 11,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN, left, right, sum: `${left} + ${right} = ${sum}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Combining results for fib(${currN}): left (${left}) + right (${right}) = ${sum}. Returning ${sum}.`,
      variables: { n: currN, left, right, returnVal: sum },
      actionType: 'RETURN',
      output: [sum],
    });

    frame.returnVal = sum;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = sum; }

    stack.pop();
    return sum;
  }

  fibHelper(N);
  return steps;
}
