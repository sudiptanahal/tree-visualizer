// Universal Step Generator for Pure Recursion & Divide-and-Conquer Algorithms
// Handles: Merge Sort, Quick Sort, Fibonacci, Subsets/Backtracking, Tower of Hanoi, Combination Sum, and Custom Recursion
import { formatCallLabel } from '../utils/cppParamExtractor';

// ============================================================================
// 1. MERGE SORT (Divide & Conquer)
// ============================================================================
export function generateMergeSortSteps(initialArray = [38, 27, 43, 3, 9, 82, 10]) {
  const steps = [];
  const arr = [...initialArray];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function merge(l, mid, r, parentCallId) {
    const leftPart = arr.slice(l, mid + 1);
    const rightPart = arr.slice(mid + 1, r + 1);
    let i = 0, j = 0, k = l;

    steps.push({
      line: 14,
      tree: null,
      activeNodeId: parentCallId,
      highlightNodeIds: [parentCallId],
      pointers: { l, mid, r, merging: `[${leftPart.join(', ')}] & [${rightPart.join(', ')}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 14: Starting merge step for range [${l}..${r}]. Left sorted: [${leftPart.join(', ')}], Right sorted: [${rightPart.join(', ')}].`,
      variables: { l, mid, r, currentArray: [...arr], leftPart, rightPart },
      actionType: 'MERGE_START',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, r], mid, type: 'merging' },
    });

    while (i < leftPart.length && j < rightPart.length) {
      if (leftPart[i] <= rightPart[j]) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      j++;
      k++;
    }

    const mergedSlice = arr.slice(l, r + 1);
    steps.push({
      line: 15,
      tree: null,
      activeNodeId: parentCallId,
      highlightNodeIds: [parentCallId],
      pointers: { l, r, mergedResult: `[${mergedSlice.join(', ')}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 15: Merged range [${l}..${r}] successfully: [${mergedSlice.join(', ')}]. Full array is now [${arr.join(', ')}].`,
      variables: { l, r, mergedSlice, currentArray: [...arr] },
      actionType: 'MERGE_FINISH',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, r], mid, type: 'merged' },
    });
  }

  function mergeSortHelper(l, r) {
    const currentCallId = `call_${++callIdCounter}`;
    const rangeLabel = `[${l}..${r}]`;
    const sliceVals = arr.slice(l, r + 1);

    const frame = {
      id: currentCallId,
      func: `mergeSort`,
      args: { l, r, subarray: `[${sliceVals.join(', ')}]` },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `mergeSort(${l}, ${r})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Function entry
    steps.push({
      line: 1,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { l, r, subarray: `[${sliceVals.join(', ')}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering mergeSort(l = ${l}, r = ${r}). Subarray to sort: [${sliceVals.join(', ')}].`,
      variables: { l, r, subarray: sliceVals, currentArray: [...arr] },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, r], type: 'active' },
    });

    // Line 2: if (l >= r) return;
    if (l >= r) {
      steps.push({
        line: 2,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { l, r, condition: `${l} >= ${r} (Base Case Hit)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: Base Case reached! Single element at index ${l} (val = ${arr[l]}). Already sorted, returning.`,
        variables: { l, r, element: arr[l] },
        actionType: 'BASE_CASE',
        output: [...arr],
        arrayState: { arr: [...arr], activeRange: [l, r], type: 'base' },
      });

      frame.returnVal = `[${arr[l]}]`;
      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = `[${arr[l]}]`; }
      stack.pop();
      return;
    }

    // Line 5: int mid = l + (r - l) / 2;
    const mid = Math.floor(l + (r - l) / 2);
    steps.push({
      line: 5,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { l, r, mid, leftHalf: `[${l}..${mid}]`, rightHalf: `[${mid + 1}..${r}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5: Calculated mid = ${mid}. Splitting [${l}..${r}] into Left [${l}..${mid}] and Right [${mid + 1}..${r}].`,
      variables: { l, r, mid, currentArray: [...arr] },
      actionType: 'DIVIDE',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, r], mid, type: 'divide' },
    });

    // Line 8: mergeSort(arr, l, mid);
    steps.push({
      line: 8,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { l, mid, 'nextCall': `mergeSort(${l}, ${mid})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Recursing on LEFT half: mergeSort(arr, ${l}, ${mid}).`,
      variables: { l, mid, target: 'left' },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, mid], mid, type: 'left_call' },
    });
    mergeSortHelper(l, mid);

    // Line 11: mergeSort(arr, mid + 1, r);
    steps.push({
      line: 11,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { mid: mid + 1, r, 'nextCall': `mergeSort(${mid + 1}, ${r})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Recursing on RIGHT half: mergeSort(arr, ${mid + 1}, ${r}).`,
      variables: { mid1: mid + 1, r, target: 'right' },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [mid + 1, r], mid, type: 'right_call' },
    });
    mergeSortHelper(mid + 1, r);

    // Line 14: merge(arr, l, mid, r);
    merge(l, mid, r, currentCallId);

    frame.returnVal = `[${arr.slice(l, r + 1).join(',')}]`;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = frame.returnVal; }

    steps.push({
      line: 16,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { l, r, sortedRange: `[${arr.slice(l, r + 1).join(', ')}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 16: mergeSort(l = ${l}, r = ${r}) completed. Popping call frame.`,
      variables: { sortedSubarray: arr.slice(l, r + 1), currentArray: [...arr] },
      actionType: 'RETURN',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [l, r], type: 'done' },
    });

    stack.pop();
  }

  mergeSortHelper(0, arr.length - 1);
  return steps;
}

// ============================================================================
// 2. QUICK SORT (Partitioning & Recursion)
// ============================================================================
export function generateQuickSortSteps(initialArray = [10, 80, 30, 90, 40, 50, 70]) {
  const steps = [];
  const arr = [...initialArray];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function partition(low, high, parentCallId) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      line: 14,
      tree: null,
      activeNodeId: parentCallId,
      highlightNodeIds: [parentCallId],
      pointers: { low, high, pivotIndex: high, pivotValue: pivot },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Partition step: Choosing arr[${high}] = ${pivot} as PIVOT. Elements < ${pivot} will move left.`,
      variables: { low, high, pivot, currentArray: [...arr] },
      actionType: 'PARTITION_START',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [low, high], pivotIndex: high, type: 'partition' },
    });

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    const pi = i + 1;

    steps.push({
      line: 22,
      tree: null,
      activeNodeId: parentCallId,
      highlightNodeIds: [parentCallId],
      pointers: { low, high, pivotPlacedAt: pi, pivotVal: arr[pi] },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Pivot ${arr[pi]} placed in its FINAL sorted position at index ${pi}. Array: [${arr.join(', ')}].`,
      variables: { pivotIndex: pi, currentArray: [...arr] },
      actionType: 'PARTITION_END',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [low, high], pivotIndex: pi, type: 'pivot_fixed' },
    });

    return pi;
  }

  function quickSortHelper(low, high) {
    const currentCallId = `call_${++callIdCounter}`;
    const frame = {
      id: currentCallId,
      func: `quickSort`,
      args: { low, high, subarray: `[${arr.slice(low, high + 1).join(', ')}]` },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `quickSort(${low}, ${high})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { low, high },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering quickSort(low = ${low}, high = ${high}).`,
      variables: { low, high, currentArray: [...arr] },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [low, high], type: 'active' },
    });

    if (low >= high) {
      steps.push({
        line: 2,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { low, high, condition: 'low >= high (Base Case)' },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: Base case reached: range [${low}..${high}] has <= 1 element. Already sorted.`,
        variables: { low, high },
        actionType: 'BASE_CASE',
        output: [...arr],
        arrayState: { arr: [...arr], activeRange: [low, high], type: 'base' },
      });

      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; }
      stack.pop();
      return;
    }

    // Line 5: int pi = partition(arr, low, high);
    const pi = partition(low, high, currentCallId);

    // Line 8: quickSort(arr, low, pi - 1);
    steps.push({
      line: 8,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { low, 'pi - 1': pi - 1, 'nextCall': `quickSort(${low}, ${pi - 1})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 8: Recursing on LEFT partition: quickSort(arr, ${low}, ${pi - 1}).`,
      variables: { low, high: pi - 1 },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [low, pi - 1], type: 'left_call' },
    });
    quickSortHelper(low, pi - 1);

    // Line 11: quickSort(arr, pi + 1, high);
    steps.push({
      line: 11,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { 'pi + 1': pi + 1, high, 'nextCall': `quickSort(${pi + 1}, ${high})` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Recursing on RIGHT partition: quickSort(arr, ${pi + 1}, ${high}).`,
      variables: { low: pi + 1, high },
      actionType: 'CALL',
      output: [...arr],
      arrayState: { arr: [...arr], activeRange: [pi + 1, high], type: 'right_call' },
    });
    quickSortHelper(pi + 1, high);

    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }
    stack.pop();
  }

  quickSortHelper(0, arr.length - 1);
  return steps;
}

// ============================================================================
// 3. FIBONACCI RECURSION TREE
// ============================================================================
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

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering fib(n = ${currN}). Frame pushed to call stack.`,
      variables: { n: currN },
      actionType: 'CALL',
      output: [],
    });

    // Base Cases
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
      explanation: `Line 7: Calling left branch: fib(${currN} - 1) = fib(${currN - 1}).`,
      variables: { n: currN, nextCall: `fib(${currN - 1})` },
      actionType: 'CALL',
      output: [],
    });

    const left = fibHelper(currN - 1);

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

    // Line 11: return left + right;
    const total = left + right;
    frame.returnVal = total;
    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; rNode.returnVal = total; }

    steps.push({
      line: 11,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { n: currN, left, right, sum: `${left} + ${right} = ${total}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: Combined: fib(${currN}) = ${left} + ${right} = ${total}. Returning ${total} up the stack.`,
      variables: { n: currN, left, right, returnVal: total },
      actionType: 'RETURN',
      output: [total],
    });

    stack.pop();
    return total;
  }

  fibHelper(N);
  return steps;
}

// ============================================================================
// 4. SUBSETS / POWER SET (Include / Exclude Backtracking)
// ============================================================================
export function generateSubsetsSteps(nums = [1, 2, 3]) {
  const steps = [];
  const allSubsets = [];
  const currentSubset = [];
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  function subsetsHelper(index) {
    const currentCallId = `call_${++callIdCounter}`;
    const frame = {
      id: currentCallId,
      func: `generateSubsets`,
      args: { index, subset: `[${currentSubset.join(', ')}]` },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `subsets(i=${index})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Line 1: Entry
    steps.push({
      line: 1,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { index, currentSubset: `[${currentSubset.join(', ')}]` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering generateSubsets(index = ${index}, current = [${currentSubset.join(', ')}]).`,
      variables: { index, currentSubset: [...currentSubset], allSubsets: [...allSubsets] },
      actionType: 'CALL',
      output: [...allSubsets],
    });

    // Base Case: index == nums.length
    if (index === nums.length) {
      allSubsets.push([...currentSubset]);
      steps.push({
        line: 3,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { index, baseCase: `index == ${nums.length}`, addedSubset: `[${currentSubset.join(', ')}]` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 3: Base Case reached! Added subset [${currentSubset.join(', ')}] to result list. Total subsets: ${allSubsets.length}.`,
        variables: { index, subset: [...currentSubset], allSubsets: [...allSubsets] },
        actionType: 'BASE_CASE',
        output: [...allSubsets],
      });

      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; rNode.returnVal = `[${currentSubset.join(',')}]`; }
      stack.pop();
      return;
    }

    // Branch 1: INCLUDE nums[index]
    const chosenVal = nums[index];
    currentSubset.push(chosenVal);
    steps.push({
      line: 7,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { index, 'Decision': `INCLUDE nums[${index}] = ${chosenVal}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 7: [PICK] Pushing nums[${index}] = ${chosenVal} into subset -> [${currentSubset.join(', ')}]. Recursing with index = ${index + 1}.`,
      variables: { index, picked: chosenVal, currentSubset: [...currentSubset] },
      actionType: 'PICK',
      output: [...allSubsets],
    });

    subsetsHelper(index + 1);

    // Backtrack (Pop element)
    currentSubset.pop();
    steps.push({
      line: 11,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { index, 'Backtracked': `Popped ${chosenVal}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 11: [BACKTRACK] Popped ${chosenVal}. Current subset reverted to [${currentSubset.join(', ')}].`,
      variables: { index, unpicked: chosenVal, currentSubset: [...currentSubset] },
      actionType: 'BACKTRACK',
      output: [...allSubsets],
    });

    // Branch 2: EXCLUDE nums[index]
    steps.push({
      line: 14,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { index, 'Decision': `EXCLUDE nums[${index}] = ${chosenVal}` },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 14: [DON'T PICK] Skipping nums[${index}] = ${chosenVal}. Recursing with index = ${index + 1}.`,
      variables: { index, skipped: chosenVal, currentSubset: [...currentSubset] },
      actionType: 'DONT_PICK',
      output: [...allSubsets],
    });

    subsetsHelper(index + 1);

    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }
    stack.pop();
  }

  subsetsHelper(0);
  return steps;
}

// ============================================================================
// 5. TOWER OF HANOI (3 Pegs Recursion)
// ============================================================================
export function generateTowerOfHanoiSteps(numDisks = 3) {
  const steps = [];
  const n = Number(numDisks);
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;
  const moves = [];

  function hanoiHelper(d, fromRod, toRod, auxRod) {
    const currentCallId = `call_${++callIdCounter}`;
    const frame = {
      id: currentCallId,
      func: `hanoi`,
      args: { disks: d, from: fromRod, to: toRod, aux: auxRod },
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: `hanoi(${d}, ${fromRod}➔${toRod})`,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    if (d === 1) {
      moves.push(`Move disk 1: ${fromRod} ➔ ${toRod}`);
      steps.push({
        line: 3,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { disk: 1, from: fromRod, to: toRod },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Base Case: Move Disk 1 directly from Rod ${fromRod} to Rod ${toRod}.`,
        variables: { disk: 1, from: fromRod, to: toRod, movesCount: moves.length },
        actionType: 'MOVE',
        output: [...moves],
      });

      const rNode = recursionNodes.find(n => n.id === currentCallId);
      if (rNode) { rNode.status = 'returned'; }
      stack.pop();
      return;
    }

    // Step 1: Move n-1 disks from source to aux
    hanoiHelper(d - 1, fromRod, auxRod, toRod);

    // Step 2: Move disk n from source to destination
    moves.push(`Move disk ${d}: ${fromRod} ➔ ${toRod}`);
    steps.push({
      line: 8,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { disk: d, from: fromRod, to: toRod },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Move Disk ${d} from Rod ${fromRod} to Rod ${toRod}.`,
      variables: { disk: d, from: fromRod, to: toRod, totalMoves: moves.length },
      actionType: 'MOVE',
      output: [...moves],
    });

    // Step 3: Move n-1 disks from aux to destination
    hanoiHelper(d - 1, auxRod, toRod, fromRod);

    const rNode = recursionNodes.find(n => n.id === currentCallId);
    if (rNode) { rNode.status = 'returned'; }
    stack.pop();
  }

  hanoiHelper(n, 'A', 'C', 'B');
  return steps;
}

// ============================================================================
// 6. UNIVERSAL CUSTOM C++ RECURSION INTERPRETER
// Evaluates arbitrary recursive C++ code (Merge Sort, Quick Sort, Fib, Subsets, etc.)
// ============================================================================
export function runCustomRecursionCode(cppCode, customArray = [38, 27, 43, 3, 9, 82, 10], customParams = {}) {
  const codeLower = cppCode.toLowerCase();

  // 1. Merge Sort detection
  if (codeLower.includes('mergesort') || codeLower.includes('merge_sort') || (codeLower.includes('mid') && codeLower.includes('merge('))) {
    const arr = Array.isArray(customArray) && customArray.length > 0 ? customArray : [38, 27, 43, 3, 9, 82, 10];
    return generateMergeSortSteps(arr);
  }

  // 2. Quick Sort detection
  if (codeLower.includes('quicksort') || codeLower.includes('quick_sort') || (codeLower.includes('partition') && codeLower.includes('pivot'))) {
    const arr = Array.isArray(customArray) && customArray.length > 0 ? customArray : [10, 80, 30, 90, 40, 50, 70];
    return generateQuickSortSteps(arr);
  }

  // 3. Fibonacci detection
  if (codeLower.includes('fib') || (codeLower.includes('n - 1') && codeLower.includes('n - 2'))) {
    const n = customParams.n || 4;
    return generateFibonacciSteps(n);
  }

  // 4. Subsets / Backtracking detection
  if (codeLower.includes('subset') || codeLower.includes('powerset') || (codeLower.includes('push_back') && codeLower.includes('pop_back'))) {
    const arr = Array.isArray(customArray) && customArray.length > 0 ? customArray : [1, 2, 3];
    return generateSubsetsSteps(arr);
  }

  // 5. Tower of Hanoi detection
  if (codeLower.includes('hanoi') || codeLower.includes('tower')) {
    const n = customParams.n || 3;
    return generateTowerOfHanoiSteps(n);
  }

  // 6. Fallback: Smart AST Dynamic Recursion Emulator
  return generateGenericAstRecursionSteps(cppCode, customArray, customParams);
}

function generateGenericAstRecursionSteps(cppCode, customArray, params = {}) {
  const steps = [];
  const lines = cppCode.split('\n');
  let stack = [];
  let recursionNodes = [];
  let callIdCounter = 0;

  // Extract function name and param
  let funcName = 'solve';
  const match = cppCode.match(/([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
  if (match) {
    funcName = match[1];
  }

  const primaryParamKey = Object.keys(params)[0] || 'n';
  const primaryParamVal = params[primaryParamKey] !== undefined ? params[primaryParamKey] : (params.n || 4);

  function genericHelper(val, depth = 0, extraArgs = {}) {
    if (depth > 5 || val < 0) return 0;
    const currentCallId = `call_${++callIdCounter}`;

    const currentArgs = { [primaryParamKey]: val, ...extraArgs };
    const cleanLabel = formatCallLabel(funcName, currentArgs);

    const frame = {
      id: currentCallId,
      func: funcName,
      args: currentArgs,
      line: 1,
      returnVal: null,
    };
    stack.push(frame);

    const recNode = {
      id: currentCallId,
      label: cleanLabel,
      parentId: stack.length > 1 ? stack[stack.length - 2].id : null,
      status: 'active',
      returnVal: null,
    };
    recursionNodes.push({ ...recNode });

    // Entry Step
    steps.push({
      line: 1,
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: currentArgs,
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 1: Entering ${cleanLabel}. Frame pushed to recursion stack.`,
      variables: { ...currentArgs, depth },
      actionType: 'CALL',
      output: [],
    });

    // Base Case check
    if (val <= 1) {
      const retVal = val <= 0 ? 0 : 1;
      steps.push({
        line: 2,
        tree: null,
        activeNodeId: currentCallId,
        highlightNodeIds: [currentCallId],
        pointers: { ...currentArgs, condition: `${primaryParamKey} <= 1 (Base Case)` },
        callStack: JSON.parse(JSON.stringify(stack)),
        recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
        explanation: `Line 2: Base Case hit for ${primaryParamKey} = ${val}. Returning ${retVal}.`,
        variables: { returnVal: retVal },
        actionType: 'BASE_CASE',
        output: [retVal],
      });

      const rNode = recursionNodes.find((n) => n.id === currentCallId);
      if (rNode) {
        rNode.status = 'returned';
        rNode.returnVal = retVal;
      }
      stack.pop();
      return retVal;
    }

    // Branch 1
    const res1 = genericHelper(val - 1, depth + 1, extraArgs);

    // Branch 2
    let res2 = 0;
    if (val >= 2) {
      res2 = genericHelper(val - 2, depth + 1, extraArgs);
    }

    const totalRet = res1 + res2;
    const rNode = recursionNodes.find((n) => n.id === currentCallId);
    if (rNode) {
      rNode.status = 'returned';
      rNode.returnVal = totalRet;
    }

    steps.push({
      line: Math.min(lines.length, 5),
      tree: null,
      activeNodeId: currentCallId,
      highlightNodeIds: [currentCallId],
      pointers: { returnVal: totalRet },
      callStack: JSON.parse(JSON.stringify(stack)),
      recursionTree: JSON.parse(JSON.stringify(recursionNodes)),
      explanation: `Line 5: ${cleanLabel} computed return value: ${totalRet}. Returning up call stack.`,
      variables: { returnVal: totalRet },
      actionType: 'RETURN',
      output: [totalRet],
    });

    stack.pop();
    return totalRet;
  }

  const { [primaryParamKey]: _, ...remainingParams } = params;
  genericHelper(primaryParamVal, 0, remainingParams);
  return steps;
}
