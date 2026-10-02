import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers } from 'lucide-react';

export default function RecursionTreeView({
  recursionTree = [],
  activeNodeId,
  arrayState = null,
  pointers = {},
  explanation = '',
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update dimensions on resize with ResizeObserver
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({
            width: clientWidth,
            height: clientHeight,
          });
        }
      }
    }
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, []);

  // Convert flat recursionNodes with parentId into a centered visual tree layout with guaranteed bounds
  const { nodes, edges } = useMemo(() => {
    if (!recursionTree || recursionTree.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Build hierarchy
    const nodeMap = new Map();
    recursionTree.forEach((n) => {
      nodeMap.set(n.id, { ...n, children: [] });
    });

    const roots = [];
    nodeMap.forEach((n) => {
      if (n.parentId && nodeMap.has(n.parentId)) {
        nodeMap.get(n.parentId).children.push(n);
      } else {
        roots.push(n);
      }
    });

    // 1. Assign leaf column indices
    let leafCounter = 0;
    const leafIndexMap = new Map();
    let maxDepth = 0;

    function countLeaves(node, depth = 0) {
      maxDepth = Math.max(maxDepth, depth);
      if (node.children.length === 0) {
        leafIndexMap.set(node.id, leafCounter++);
      } else {
        node.children.forEach((child) => countLeaves(child, depth + 1));
      }
    }
    roots.forEach((root) => countLeaves(root, 0));

    const totalLeaves = Math.max(leafCounter, 1);

    // Dynamic horizontal padding & spacing
    const horizMargin = Math.max(68, Math.min(85, dimensions.width * 0.18));
    const usableWidth = Math.max(dimensions.width - 2 * horizMargin, 80);
    const stepX = totalLeaves > 1 ? usableWidth / (totalLeaves - 1) : 0;

    // Card pill width and text sizing based on available width
    const cardWidth = Math.min(128, Math.max(88, totalLeaves > 1 ? stepX * 0.88 : 124));
    const halfCard = cardWidth / 2;

    // Vertical spacing
    const startY = arrayState ? 175 : 62;
    const usableHeight = Math.max(dimensions.height - startY - 45, 80);
    const levelHeight = maxDepth > 0 ? Math.min(76, Math.max(45, usableHeight / maxDepth)) : 70;

    const positionedNodes = [];
    const edgeList = [];

    function layoutSubtree(node, depth = 0) {
      const y = startY + depth * levelHeight;
      let myX = 0;

      if (node.children.length === 0) {
        const leafIdx = leafIndexMap.get(node.id) || 0;
        myX = totalLeaves === 1 ? dimensions.width / 2 : horizMargin + leafIdx * stepX;
      } else {
        const childXs = [];
        node.children.forEach((child) => {
          layoutSubtree(child, depth + 1);
          const childPos = positionedNodes.find((p) => p.id === child.id);
          if (childPos) childXs.push(childPos.x);
        });
        myX = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }

      positionedNodes.push({
        ...node,
        x: myX,
        y,
        cardWidth,
        halfCard,
      });

      node.children.forEach((child) => {
        const childPos = positionedNodes.find((p) => p.id === child.id);
        if (childPos) {
          edgeList.push({
            fromX: myX,
            fromY: y,
            toX: childPos.x,
            toY: childPos.y,
          });
        }
      });
    }

    roots.forEach((root) => layoutSubtree(root, 0));

    return { nodes: positionedNodes, edges: edgeList };
  }, [recursionTree, arrayState, dimensions.width, dimensions.height]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.5));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Title & Stats */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium text-slate-300">
        <Network className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-slate-200">Recursion Execution Tree</span>
        <span className="text-slate-500">|</span>
        <span className="text-purple-300 font-mono">{nodes.length} Calls Total</span>
      </div>

      {/* Array / Data State Banner (for MergeSort / QuickSort / Array Recursion) */}
      {arrayState && arrayState.arr && (
        <div className="absolute top-12 left-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 shadow-2xl flex flex-col gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Array State & Active Range:
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              {arrayState.activeRange && (
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  Range: [{arrayState.activeRange[0]}..{arrayState.activeRange[1]}]
                </span>
              )}
              {arrayState.mid !== undefined && (
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  mid = {arrayState.mid}
                </span>
              )}
              {arrayState.pivotIndex !== undefined && (
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  pivot = arr[{arrayState.pivotIndex}]
                </span>
              )}
            </div>
          </div>

          {/* Array Boxes */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {arrayState.arr.map((val, idx) => {
              const inRange =
                arrayState.activeRange &&
                idx >= arrayState.activeRange[0] &&
                idx <= arrayState.activeRange[1];
              const isMid = arrayState.mid === idx;
              const isPivot = arrayState.pivotIndex === idx;

              let boxBg = 'bg-slate-800 text-slate-300 border-slate-700';
              if (isPivot) {
                boxBg = 'bg-purple-600/50 text-purple-100 border-purple-400 ring-2 ring-purple-400 shadow-md scale-105';
              } else if (isMid) {
                boxBg = 'bg-amber-600/50 text-amber-100 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105';
              } else if (inRange) {
                boxBg = 'bg-sky-600/40 text-sky-100 border-sky-400 font-bold ring-1 ring-sky-400/50';
              }

              return (
                <div key={`arr_box_${idx}`} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all ${boxBg}`}
                  >
                    {val}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5">{idx}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Reset & Center View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg className="w-full h-full flex-1">
        <defs>
          <linearGradient id="recActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="recReturnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="recBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        {/* Empty state */}
        {nodes.length === 0 && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height / 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize="14"
            fontFamily="monospace"
          >
            No recursive calls active yet
          </text>
        )}

        {/* Transform Group for Pan & Zoom */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: `${dimensions.width / 2}px ${arrayState ? '175px' : '65px'}`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Edges */}
          <g>
            {edges.map((e, idx) => (
              <line
                key={`rec_edge_${idx}`}
                x1={e.fromX}
                y1={e.fromY + 15}
                x2={e.toX}
                y2={e.toY - 15}
                stroke="#475569"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
            ))}
          </g>

          {/* Call Nodes */}
          <g>
            {nodes.map((n) => {
              const isLatest = n.status === 'active';
              const isReturned = n.status === 'returned';
              const width = n.cardWidth || 120;
              const halfW = n.halfCard || width / 2;

              const returnText =
                n.returnVal !== null && n.returnVal !== undefined
                  ? typeof n.returnVal === 'object'
                    ? JSON.stringify(n.returnVal)
                    : String(n.returnVal)
                  : '';

              const returnBadgeWidth = Math.max(26, returnText.length * 6.5 + 8);

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="transition-all duration-300"
                >
                  {/* Glow ring for active call */}
                  {isLatest && (
                    <rect
                      x={-halfW - 4}
                      y="-18"
                      width={width + 8}
                      height="36"
                      rx="10"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Pill Box */}
                  <rect
                    x={-halfW}
                    y="-15"
                    width={width}
                    height="30"
                    rx="8"
                    fill={
                      isLatest
                        ? 'url(#recActiveGrad)'
                        : isReturned
                        ? 'url(#recReturnGrad)'
                        : '#1e293b'
                    }
                    stroke={isLatest ? '#e9d5ff' : isReturned ? '#34d399' : '#334155'}
                    strokeWidth={isLatest ? 2 : 1}
                    className="shadow-lg"
                  />

                  {/* Call Label */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={width < 100 ? '8.5' : '9.5'}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.label.length > (width < 100 ? 14 : 19)
                      ? n.label.substring(0, width < 100 ? 13 : 18) + '…'
                      : n.label}
                  </text>

                  {/* Return Value Bubble */}
                  {isReturned && returnText && (
                    <g transform={`translate(${halfW - 5}, -13)`}>
                      <rect
                        x={-returnBadgeWidth / 2}
                        y="-8"
                        width={returnBadgeWidth}
                        height="16"
                        rx="4"
                        fill="#10b981"
                        stroke="#047857"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {returnText}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
