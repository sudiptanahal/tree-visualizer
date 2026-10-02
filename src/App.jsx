import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ALGORITHMS } from './data/algorithmsData';
import { parseArrayToTree, cloneTree } from './utils/treeLayout';

// Step Generators
import {
  generateBstInsertSteps,
  generateBstDeleteSteps,
  generateBstSearchSteps,
  generateValidateBstSteps,
  generateInorderSteps,
  generatePreorderSteps,
  generatePostorderSteps,
  generateLevelOrderSteps,
  generateMaxDepthSteps,
  generateInvertTreeSteps,
  generateLcaBstSteps,
  generateLcaBinaryTreeSteps,
  generatePathSumSteps,
  generateDiameterSteps,
  generateBalancedTreeSteps,
  generateSymmetricTreeSteps,
} from './engine/treeAlgorithms';

import {
  generateGraphBfsSteps,
  generateGraphDfsSteps,
  generateUndirectedCycleSteps,
} from './engine/graphAlgorithms';

import {
  generateFibonacciSteps,
  generateMergeSortSteps,
  generateQuickSortSteps,
  generateSubsetsSteps,
  generateTowerOfHanoiSteps,
} from './engine/recursionAlgorithms';

// Components
import Navbar from './components/Navbar';
import VisualizerCanvas from './components/VisualizerCanvas';
import RecursionTreeView from './components/RecursionTreeView';
import GraphCanvas from './components/GraphCanvas';
import CodePanel from './components/CodePanel';
import CallStackPanel from './components/CallStackPanel';
import VariablesInspector from './components/VariablesInspector';
import PlaybackControls from './components/PlaybackControls';
import ExplanationCard from './components/ExplanationCard';
import TreeBuilderModal from './components/TreeBuilderModal';
import DSAConceptGuideModal from './components/DSAConceptGuideModal';
import CustomCodeModal from './components/CustomCodeModal';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [selectedAlgoId, setSelectedAlgoId] = useState('bst_delete');
  const [algoParams, setAlgoParams] = useState({ key: 3, value: 5, val: 6, p: 2, q: 8, targetSum: 22, n: 4, startNode: 0 });
  const [customTree, setCustomTree] = useState(null);
  const [customGraph, setCustomGraph] = useState(null);

  // Custom C++ Code State
  const [isCustomCodeOpen, setIsCustomCodeOpen] = useState(false);
  const [customCodeData, setCustomCodeData] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('treeviz_gemini_key') || '');

  // View state
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'recursion' | 'dual'
  const [isTreeBuilderOpen, setIsTreeBuilderOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Playback state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [breakpoints, setBreakpoints] = useState(new Set());

  const timerRef = useRef(null);

  // Current algorithm definition (memoized so it doesn't change reference on every render)
  const currentAlgo = useMemo(() => {
    if (customCodeData) {
      return {
        id: 'custom_cpp_code',
        name: customCodeData.name || 'Custom C++ Solution',
        category: customCodeData.isRecursion ? 'recursion' : 'custom',
        cppCode: customCodeData.code,
        paramConfigs: [],
      };
    }
    return ALGORITHMS[selectedAlgoId] || ALGORITHMS['bst_delete'];
  }, [customCodeData, selectedAlgoId]);

  // Generator for standard algorithms
  const generateStepsForAlgo = useCallback((algoId, params, userTree, userGraph) => {
    const algo = ALGORITHMS[algoId] || ALGORITHMS['bst_delete'];
    let treeToUse = userTree ? cloneTree(userTree) : parseArrayToTree(algo.defaultTree);
    let graphToUse = userGraph || algo.defaultGraph;
    let generated = [];

    switch (algoId) {
      case 'bst_insert':
        generated = generateBstInsertSteps(treeToUse, params.value ?? 5);
        break;
      case 'bst_delete':
        generated = generateBstDeleteSteps(treeToUse, params.key ?? 3);
        break;
      case 'bst_search':
        generated = generateBstSearchSteps(treeToUse, params.val ?? 6);
        break;
      case 'validate_bst':
        generated = generateValidateBstSteps(treeToUse);
        break;
      case 'inorder_traversal':
        generated = generateInorderSteps(treeToUse);
        break;
      case 'preorder_traversal':
        generated = generatePreorderSteps(treeToUse);
        break;
      case 'postorder_traversal':
        generated = generatePostorderSteps(treeToUse);
        break;
      case 'level_order_traversal':
        generated = generateLevelOrderSteps(treeToUse);
        break;
      case 'max_depth':
        generated = generateMaxDepthSteps(treeToUse);
        break;
      case 'invert_tree':
        generated = generateInvertTreeSteps(treeToUse);
        break;
      case 'lca_bst':
        generated = generateLcaBstSteps(treeToUse, params.p ?? 2, params.q ?? 8);
        break;
      case 'lca_binary_tree':
        generated = generateLcaBinaryTreeSteps(treeToUse, params.p ?? 5, params.q ?? 4);
        break;
      case 'path_sum':
        generated = generatePathSumSteps(treeToUse, params.targetSum ?? 22);
        break;
      case 'diameter_tree':
        generated = generateDiameterSteps(treeToUse);
        break;
      case 'balanced_tree':
        generated = generateBalancedTreeSteps(treeToUse);
        break;
      case 'symmetric_tree':
        generated = generateSymmetricTreeSteps(treeToUse);
        break;
      case 'graph_bfs':
        generated = generateGraphBfsSteps(graphToUse, params.startNode ?? 0);
        break;
      case 'graph_dfs':
        generated = generateGraphDfsSteps(graphToUse, params.startNode ?? 0);
        break;
      case 'cycle_detection_undirected':
        generated = generateUndirectedCycleSteps(graphToUse, params.startNode ?? 0);
        break;
      case 'merge_sort':
        generated = generateMergeSortSteps(algo.defaultArray || [38, 27, 43, 3, 9, 82, 10]);
        break;
      case 'quick_sort':
        generated = generateQuickSortSteps(algo.defaultArray || [10, 80, 30, 90, 40, 50, 70]);
        break;
      case 'fibonacci_recursion':
        generated = generateFibonacciSteps(params.n ?? 4);
        break;
      case 'subsets_backtracking':
        generated = generateSubsetsSteps(algo.defaultArray || [1, 2, 3]);
        break;
      case 'tower_of_hanoi':
        generated = generateTowerOfHanoiSteps(params.n ?? 3);
        break;
      default:
        generated = generateBstInsertSteps(treeToUse, 5);
    }
    return generated;
  }, []);

  // Regenerate steps ONLY when standard algorithm / params / custom tree change
  useEffect(() => {
    if (!customCodeData) {
      const newSteps = generateStepsForAlgo(selectedAlgoId, algoParams, customTree, customGraph);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [selectedAlgoId, algoParams, customTree, customGraph, customCodeData, generateStepsForAlgo]);

  // Active step object
  const currentStep = steps[currentStepIndex] || {
    line: 1,
    tree: null,
    graph: null,
    activeNodeId: null,
    highlightNodeIds: [],
    pointers: {},
    callStack: [],
    recursionTree: [],
    explanation: 'Ready to execute. Click Step or Auto Play.',
    variables: {},
    actionType: 'READY',
    output: [],
    extraInfo: {}
  };

  // Playback timer loop - Rock solid & non-glitching
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(1000 / speed, 200);
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85 }
          });
          return prev;
        }

        const nextIdx = prev + 1;
        const nextStep = steps[nextIdx];
        if (nextStep && breakpoints.has(nextStep.line)) {
          setIsPlaying(false);
        }

        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length, breakpoints]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((p) => p + 1);
    }
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((p) => p - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(steps.length - 1, 0));
  };

  const handleRunToBreakpoint = () => {
    setIsPlaying(false);
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      if (breakpoints.has(steps[i].line)) {
        setCurrentStepIndex(i);
        return;
      }
    }
    setCurrentStepIndex(Math.max(steps.length - 1, 0));
  };

  const handleToggleBreakpoint = (lineNum) => {
    setBreakpoints((prev) => {
      const updated = new Set(prev);
      if (updated.has(lineNum)) updated.delete(lineNum);
      else updated.add(lineNum);
      return updated;
    });
  };

  const handleSelectAlgo = (algoId) => {
    setCustomCodeData(null);
    setSelectedAlgoId(algoId);
    setCustomTree(null);
    setCustomGraph(null);
    setBreakpoints(new Set());
    const algo = ALGORITHMS[algoId];
    if (algo?.defaultParams) {
      setAlgoParams((prev) => ({ ...prev, ...algo.defaultParams }));
    }
    if (algo?.category === 'recursion') {
      setViewMode('recursion');
    } else {
      setViewMode('tree');
    }
  };

  const handleChangeParam = (name, value) => {
    setAlgoParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCustomTree = (newTree) => {
    setCustomTree(newTree);
  };

  const handleApplyCustomSteps = (customData) => {
    setCustomCodeData(customData);
    setBreakpoints(new Set());
    setSteps(customData.steps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (customData.isRecursion) {
      setViewMode('recursion');
    } else {
      setViewMode('tree');
    }
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('treeviz_gemini_key', newKey);
  };

  const handleManualRebuild = () => {
    if (!customCodeData) {
      const newSteps = generateStepsForAlgo(selectedAlgoId, algoParams, customTree, customGraph);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (isCustomCodeOpen || isTreeBuilderOpen || isGuideOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight' || e.code === 'F10') {
        e.preventDefault();
        handleStepNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'F9') {
        e.preventDefault();
        handleStepPrev();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCustomCodeOpen, isTreeBuilderOpen, isGuideOpen, steps.length, currentStepIndex]);

  const isGraph = currentAlgo.category === 'graph';
  const isRecursionOnly = currentAlgo.category === 'recursion';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        selectedAlgoId={customCodeData ? 'custom_cpp_code' : selectedAlgoId}
        onSelectAlgo={handleSelectAlgo}
        algoParams={algoParams}
        onChangeParam={handleChangeParam}
        onOpenTreeBuilder={() => setIsTreeBuilderOpen(true)}
        onOpenCustomCode={() => setIsCustomCodeOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onRebuildSteps={handleManualRebuild}
        isCustomCodeActive={Boolean(customCodeData)}
      />

      {/* Main Workspace Grid */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Section: Visualizer Canvas + Playback Controls + Explanation (Col 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 h-full overflow-hidden">
          {/* Main Visualizer Area */}
          <div className="flex-1 min-h-[360px] relative">
            {isGraph ? (
              <GraphCanvas
                graphData={currentStep.graph || currentAlgo.defaultGraph}
                activeNodeId={currentStep.activeNodeId}
                highlightNodeIds={currentStep.highlightNodeIds}
                pointers={currentStep.pointers}
                actionType={currentStep.actionType}
                variables={currentStep.variables}
                extraInfo={currentStep.extraInfo}
              />
            ) : isRecursionOnly || viewMode === 'recursion' ? (
              <RecursionTreeView
                recursionTree={currentStep.recursionTree}
                activeNodeId={currentStep.activeNodeId}
                arrayState={currentStep.arrayState}
                pointers={currentStep.pointers}
                explanation={currentStep.explanation}
              />
            ) : viewMode === 'dual' ? (
              <div className="grid grid-cols-2 gap-2 h-full">
                <VisualizerCanvas
                  treeData={currentStep.tree}
                  activeNodeId={currentStep.activeNodeId}
                  highlightNodeIds={currentStep.highlightNodeIds}
                  pointers={currentStep.pointers}
                  actionType={currentStep.actionType}
                />
                <RecursionTreeView
                  recursionTree={currentStep.recursionTree}
                  activeNodeId={currentStep.activeNodeId}
                  arrayState={currentStep.arrayState}
                  pointers={currentStep.pointers}
                  explanation={currentStep.explanation}
                />
              </div>
            ) : (
              <VisualizerCanvas
                treeData={currentStep.tree}
                activeNodeId={currentStep.activeNodeId}
                highlightNodeIds={currentStep.highlightNodeIds}
                pointers={currentStep.pointers}
                actionType={currentStep.actionType}
              />
            )}
          </div>

          {/* Playback Controls Bar */}
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            onStepNext={handleStepNext}
            onStepPrev={handleStepPrev}
            onReset={handleReset}
            onJumpToEnd={handleJumpToEnd}
            onRunToBreakpoint={handleRunToBreakpoint}
            onSeekStep={(idx) => {
              setIsPlaying(false);
              setCurrentStepIndex(idx);
            }}
            speed={speed}
            onChangeSpeed={setSpeed}
            actionType={currentStep.actionType}
          />

          {/* Plain English Step Explanation */}
          <ExplanationCard
            explanation={currentStep.explanation}
            actionType={currentStep.actionType}
            pointers={currentStep.pointers}
            variables={currentStep.variables}
            currentLine={currentStep.line}
            algorithmMeta={currentAlgo}
          />
        </div>

        {/* Right Section: C++ Code + Call Stack + Variables Watch (Col 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 h-full overflow-hidden">
          {/* Top Half: C++ Code Panel */}
          <div className="flex-1 min-h-[300px]">
            <CodePanel
              cppCode={currentAlgo.cppCode}
              currentLine={currentStep.line}
              breakpoints={breakpoints}
              onToggleBreakpoint={handleToggleBreakpoint}
              variables={currentStep.variables}
              actionType={currentStep.actionType}
            />
          </div>

          {/* Bottom Half: Call Stack & Variables Inspector */}
          <div className="h-[260px] grid grid-cols-2 gap-3">
            {/* Call Stack Panel */}
            <CallStackPanel callStack={currentStep.callStack} />

            {/* Scope / Variables Inspector */}
            <VariablesInspector
              variables={currentStep.variables}
              pointers={currentStep.pointers}
              actionType={currentStep.actionType}
              output={currentStep.output}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CustomCodeModal
        isOpen={isCustomCodeOpen}
        onClose={() => setIsCustomCodeOpen(false)}
        onApplyCustomSteps={handleApplyCustomSteps}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <TreeBuilderModal
        isOpen={isTreeBuilderOpen}
        onClose={() => setIsTreeBuilderOpen(false)}
        onApplyTree={handleApplyCustomTree}
        currentTree={customTree}
      />

      <DSAConceptGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <Analytics />
    </div>
  );
}
