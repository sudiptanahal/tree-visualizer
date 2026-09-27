import { parseArrayToTree, cloneTree, createTreeNode } from '../utils/treeLayout';

/**
 * Traces arbitrary C++ Tree/Graph code using Gemini API
 */
export async function traceCodeWithGemini(cppCode, initialTreeArray, params = {}, apiKey, modelName = 'gemini-2.5-flash') {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please enter a valid Gemini API Key to trace custom C++ code.');
  }

  const cleanTree = Array.isArray(initialTreeArray) ? initialTreeArray : [3, 9, 20, null, null, 15, 7];
  const paramsStr = JSON.stringify(params);

  const systemInstruction = `You are an expert C++ DSA execution tracer and memory debugger.
Your task is to step-by-step simulate the execution of a given C++ Binary Tree or Graph function on the provided input tree.
For EVERY single statement/line of code executed in order (including function calls, base cases, comparisons, pointer updates, recursing into left/right, returning back up the call stack with return values, memory allocations, and mutations), you must generate a trace step.

Return ONLY a valid JSON object matching this schema (do NOT include markdown code fences or backticks, just raw JSON):
{
  "functionName": "string",
  "steps": [
    {
      "line": 1, // 1-indexed line number in the provided C++ code
      "explanation": "Clear plain English description of what happens on this line in C++ and why",
      "activeNodeVal": 3, // number or null - the value of the node 'root' currently points to
      "highlightNodeVals": [3], // array of node values currently highlighted or compared
      "pointers": { "root": "Node(3)", "val": 5 }, // map of active variable/pointer names to their string values
      "callStack": [
        { "func": "funcName", "args": { "root": "Node(3)" }, "line": 1, "returnVal": null }
      ], // full call stack from bottom to top (most recent frame last)
      "treeArray": [3, 9, 20, null, null, 15, 7], // level-order array of the tree at this step (reflecting any mutations/insertions/deletions)
      "nodeBadges": { "3": "active" }, // optional badges for nodes e.g. {"3": "h=2", "9": "MATCH"}
      "variables": { "left": 1, "right": 2 }, // watch variables
      "actionType": "CALL", // one of: 'CALL', 'BASE_CASE', 'CHECK', 'COMPARE', 'POINTER_UPDATE', 'CREATE_NODE', 'DELETE', 'SWAP', 'MATCH', 'BACKTRACK', 'RETURN', 'LOOP', 'PROCESS_NODE'
      "output": [] // output array so far if applicable (e.g. traversal output or return result)
    }
  ]
}

Ensure:
1. Every recursive call pushes a stack frame with active line.
2. Base cases evaluate condition, and on return, pop the frame and show the exact backtracking step to caller.
3. If tree nodes are created, inserted, deleted, swapped, or values updated, 'treeArray' must reflect the updated tree state!
4. The 'line' numbers MUST strictly correspond to the 1-indexed line numbers of the provided C++ code.`;

  const userPrompt = `Given this C++ code:
\`\`\`cpp
${cppCode}
\`\`\`

Initial Tree (LeetCode level-order array):
${JSON.stringify(cleanTree)}

Function Arguments / Parameters:
${paramsStr}

Simulate the complete line-by-line execution trace from the start until the function completes.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      }
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || response.statusText;
    throw new Error(`Gemini API Error: ${errMsg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini did not return any trace steps.');
  }

  let parsedData;
  try {
    // Clean any accidental markdown backticks
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsedData = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse Gemini response as JSON: ' + err.message);
  }

  if (!parsedData.steps || !Array.isArray(parsedData.steps) || parsedData.steps.length === 0) {
    throw new Error('Gemini response did not contain valid steps array.');
  }

  // Convert Gemini steps into Visualizer Step format
  let recursionNodes = [];
  let callMap = new Map();

  const visualizerSteps = parsedData.steps.map((s, stepIdx) => {
    const currentTreeArray = s.treeArray || cleanTree;
    const treeObj = parseArrayToTree(currentTreeArray);

    // Map activeNodeVal to tree node ID
    let activeNodeId = null;
    let highlightNodeIds = [];

    function findNodeByVal(root, targetVal) {
      if (!root || targetVal === null || targetVal === undefined) return null;
      if (root.val === targetVal) return root;
      return findNodeByVal(root.left, targetVal) || findNodeByVal(root.right, targetVal);
    }

    if (s.activeNodeVal !== null && s.activeNodeVal !== undefined && treeObj) {
      const found = findNodeByVal(treeObj, s.activeNodeVal);
      if (found) activeNodeId = found.id;
    }

    if (Array.isArray(s.highlightNodeVals) && treeObj) {
      s.highlightNodeVals.forEach(val => {
        const found = findNodeByVal(treeObj, val);
        if (found) highlightNodeIds.push(found.id);
      });
    }

    // Attach badges/status to tree
    function enrichTree(root) {
      if (!root) return null;
      const badge = s.nodeBadges ? s.nodeBadges[String(root.val)] : null;
      let status = null;
      if (root.id === activeNodeId) status = 'active';
      else if (highlightNodeIds.includes(root.id)) status = 'highlight';

      return {
        ...root,
        status: status,
        badge: badge,
        left: enrichTree(root.left),
        right: enrichTree(root.right),
      };
    }

    const enrichedTree = enrichTree(treeObj);

    // Call stack formatting
    const formattedCallStack = (s.callStack || []).map((frame, idx) => ({
      id: `frame_${idx}_${frame.func}`,
      func: frame.func || parsedData.functionName || 'solve',
      args: frame.args || {},
      line: frame.line || s.line,
      returnVal: frame.returnVal,
    }));

    // Recursion tree update
    const topFrame = formattedCallStack[formattedCallStack.length - 1];
    if (topFrame) {
      const recId = `${topFrame.func}_${JSON.stringify(topFrame.args)}`;
      if (!callMap.has(recId)) {
        const parentFrame = formattedCallStack.length > 1 ? formattedCallStack[formattedCallStack.length - 2] : null;
        const parentRecId = parentFrame ? `${parentFrame.func}_${JSON.stringify(parentFrame.args)}` : null;
        
        const newRecNode = {
          id: recId,
          label: `${topFrame.func}(${Object.values(topFrame.args).join(', ')})`,
          parentId: parentRecId,
          status: 'active',
          returnVal: topFrame.returnVal,
        };
        callMap.set(recId, newRecNode);
        recursionNodes.push(newRecNode);
      } else {
        const existing = callMap.get(recId);
        if (existing && topFrame.returnVal !== null && topFrame.returnVal !== undefined) {
          existing.status = 'returned';
          existing.returnVal = topFrame.returnVal;
        }
      }
    }

    return {
      line: s.line || 1,
      tree: enrichedTree,
      activeNodeId: activeNodeId,
      highlightNodeIds: highlightNodeIds,
      pointers: s.pointers || {},
      callStack: formattedCallStack,
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: s.explanation || `Executing line ${s.line}`,
      variables: s.variables || {},
      actionType: s.actionType || 'STEP',
      output: s.output || [],
      extraInfo: {}
    };
  });

  return visualizerSteps;
}
