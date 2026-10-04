import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info, Cpu, Layers } from 'lucide-react';
import { calculateTreeLayout } from '../utils/treeLayout';

export default function VisualizerCanvas({
  treeData,
  activeNodeId,
  highlightNodeIds = [],
  pointers = {},
  actionType = '',
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 750, height: 480 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Resize listener using ResizeObserver for responsive dual-view and container size changes
  useEffect(() => {
    function handleResize() {
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
    handleResize();
    const ro = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, []);

  // Compute responsive tree layout (single or multi-tree)
  const { nodes, edges, partitions = [], bounds } = calculateTreeLayout(treeData, dimensions.width, dimensions.height);

  const effectiveZoom = zoom * (bounds?.autoScale || 1);

  // Auto-center when tree changes or user resets
  const handleCenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
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

  // Build node pointer map (e.g. 'root', 'curr', 'root1', 'root2', 'p', 'q')
  const nodePointersMap = {};
  if (pointers) {
    Object.entries(pointers).forEach(([key, val]) => {
      if (typeof val === 'string' && val.startsWith('Node(')) {
        const match = val.match(/Node\((-?\d+)\)/);
        if (match) {
          const numVal = parseInt(match[1]);
          const targetNode = nodes.find((n) => n.val === numVal);
          if (targetNode) {
            if (!nodePointersMap[targetNode.id]) nodePointersMap[targetNode.id] = [];
            nodePointersMap[targetNode.id].push(key);
          }
        }
      }
    });
  }

  const isMultiTree = partitions.length > 1;

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
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-xl text-xs font-medium text-slate-300 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isMultiTree ? 'bg-purple-400' : 'bg-emerald-400'} animate-pulse shadow-sm`}></span>
          <span className="font-semibold text-slate-200">
            {isMultiTree ? `Multi-Tree Visualizer (${partitions.length} Trees)` : 'Binary Tree Visualizer'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-mono font-semibold">{nodes.length} Nodes</span>
          {activeNodeId && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                <Cpu className="w-3 h-3 animate-spin" />
                Active Node: {nodes.find((n) => n.id === activeNodeId)?.val ?? activeNodeId}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenter}
          title="Fit & Center View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset Canvas"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Visualization */}
      <svg className="w-full h-full flex-1">
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(51, 65, 85, 0.22)"
              strokeWidth="0.8"
            />
          </pattern>

          {/* Core Status Gradients */}
          <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="visitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="matchedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="createdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="deletedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="succGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* Tree Partition Theme Gradients */}
          <linearGradient id="skyTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="purpleTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="emeraldTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="amberTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#291202" />
          </linearGradient>
          <linearGradient id="roseTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c0519" />
            <stop offset="100%" stopColor="#2a020d" />
          </linearGradient>
          <linearGradient id="indigoTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0d2b" />
          </linearGradient>
          <linearGradient id="tealTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#042f2e" />
            <stop offset="100%" stopColor="#021c1b" />
          </linearGradient>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Drop Shadows and Glow Filters */}
          <filter id="glowActive" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowRoot" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />

        {/* Empty Tree State */}
        {nodes.length === 0 && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height / 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize="15"
            fontFamily="monospace"
          >
            nullptr (Tree is empty)
          </text>
        )}

        {/* Transform Group for Pan & Zoom */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${effectiveZoom})`}
          style={{
            transformOrigin: `${dimensions.width / 2}px 60px`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Multi-Tree Partition Cards & Titles */}
          {partitions.length > 1 && (
            <g className="partitions-layer">
              {partitions.map((part) => {
                const themeMap = {
                  sky: { border: 'rgba(56, 189, 248, 0.45)', bg: 'rgba(15, 23, 42, 0.55)', text: '#38bdf8' },
                  purple: { border: 'rgba(192, 132, 252, 0.45)', bg: 'rgba(28, 17, 52, 0.55)', text: '#c084fc' },
                  emerald: { border: 'rgba(52, 211, 153, 0.45)', bg: 'rgba(6, 40, 28, 0.55)', text: '#34d399' },
                  amber: { border: 'rgba(251, 191, 36, 0.45)', bg: 'rgba(38, 24, 7, 0.55)', text: '#fbbf24' },
                  rose: { border: 'rgba(244, 114, 182, 0.45)', bg: 'rgba(40, 7, 24, 0.55)', text: '#f472b6' },
                  indigo: { border: 'rgba(129, 140, 248, 0.45)', bg: 'rgba(20, 18, 55, 0.55)', text: '#818cf8' },
                  teal: { border: 'rgba(45, 212, 191, 0.45)', bg: 'rgba(4, 47, 46, 0.55)', text: '#2dd4bf' },
                };
                const t = themeMap[part.theme] || themeMap.sky;

                return (
                  <g key={part.id} className="transition-all duration-300">
                    <rect
                      x={part.x}
                      y={part.y}
                      width={part.width}
                      height={part.height}
                      rx="14"
                      fill={t.bg}
                      stroke={t.border}
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                    />
                    {/* Header Pill */}
                    <g transform={`translate(${part.x + 14}, ${part.y + 18})`}>
                      <rect
                        x="-4"
                        y="-12"
                        width={Math.max(part.title.length * 8 + 26, 84)}
                        height="22"
                        rx="6"
                        fill="#0b1329"
                        stroke={t.border}
                        strokeWidth="1.2"
                      />
                      <text
                        x="6"
                        y="3"
                        fill={t.text}
                        fontSize="11.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {part.title}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Edges / Pointer Lines */}
          <g className="edges-layer">
            {edges.map((edge, idx) => {
              const isLeft = edge.isLeft;
              const midY = (edge.fromY + edge.toY) / 2;
              const midX = (edge.fromX + edge.toX) / 2;
              const pathData = `M ${edge.fromX} ${edge.fromY + 14} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY - 20}`;

              const themeColorMap = {
                sky: '#38bdf8',
                purple: '#a855f7',
                emerald: '#10b981',
                amber: '#f59e0b',
                rose: '#f43f5e',
                indigo: '#6366f1',
                teal: '#14b8a6',
              };
              const edgeColor = themeColorMap[edge.theme] || '#38bdf8';

              return (
                <g key={`edge_${edge.treeId || 't'}_${edge.from}_${edge.to}_${idx}`} className="transition-all duration-300">
                  {/* Glow underlay */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={edge.theme === 'purple' ? 'rgba(192, 132, 252, 0.2)' : edge.theme === 'emerald' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)'}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  {/* Main edge line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  {/* Left/Right Child Indicator Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-8.5"
                      y="-7"
                      width="17"
                      height="14"
                      rx="3.5"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.2"
                      textAnchor="middle"
                      fill={isLeft ? edgeColor : '#ec4899'}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isLeft ? 'L' : 'R'}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Nodes Layer */}
          <g className="nodes-layer">
            {nodes.map((node, idx) => {
              const isActive = node.id === activeNodeId;
              const isHighlighted = highlightNodeIds.includes(node.id);
              const status = node.status;
              const ptrs = nodePointersMap[node.id] || [];
              const radius = node.radius || 22;
              const isRootNode = node.isRoot || node.depth === 0;

              const themeColorMap = {
                sky: '#38bdf8',
                purple: '#a855f7',
                emerald: '#10b981',
                amber: '#f59e0b',
                rose: '#f43f5e',
                indigo: '#6366f1',
                teal: '#14b8a6',
              };

              let fillGrad =
                node.theme === 'purple'
                  ? 'url(#purpleTreeGrad)'
                  : node.theme === 'emerald'
                  ? 'url(#emeraldTreeGrad)'
                  : node.theme === 'amber'
                  ? 'url(#amberTreeGrad)'
                  : node.theme === 'rose'
                  ? 'url(#roseTreeGrad)'
                  : node.theme === 'indigo'
                  ? 'url(#indigoTreeGrad)'
                  : node.theme === 'teal'
                  ? 'url(#tealTreeGrad)'
                  : 'url(#defaultGrad)';

              let strokeColor = themeColorMap[node.theme] || '#475569';
              let strokeWidth = isRootNode ? 2.5 : 2;
              let filter = isRootNode ? 'url(#glowRoot)' : '';

              if (status === 'matched') {
                fillGrad = 'url(#matchedGrad)';
                strokeColor = '#f59e0b';
                strokeWidth = 3;
              } else if (status === 'created') {
                fillGrad = 'url(#createdGrad)';
                strokeColor = '#c084fc';
                strokeWidth = 3;
              } else if (status === 'deleted') {
                fillGrad = 'url(#deletedGrad)';
                strokeColor = '#ef4444';
                strokeWidth = 3;
              } else if (status === 'inorder_successor') {
                fillGrad = 'url(#succGrad)';
                strokeColor = '#f43f5e';
                strokeWidth = 3;
              } else if (status === 'visited') {
                fillGrad = 'url(#visitedGrad)';
                strokeColor = '#10b981';
                strokeWidth = 2.5;
              }

              if (isActive) {
                fillGrad = 'url(#activeGrad)';
                strokeColor = '#38bdf8';
                strokeWidth = 3.5;
                filter = 'url(#glowActive)';
              } else if (isHighlighted) {
                strokeColor = '#ec4899';
                strokeWidth = 3;
              }

              return (
                <g
                  key={`node_${node.treeId || 't'}_${node.id}_${idx}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Active Animations: Sonar Pulse & Rotating Cyber Rings */}
                  {isActive && (
                    <>
                      {/* Expanding Sonar Pulse */}
                      <circle
                        r={radius}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      >
                        <animate
                          attributeName="r"
                          values={`${radius};${radius + 15};${radius + 20}`}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.3;0"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Primary Spinning High-Tech Dashed Ring (strictly rotates around node center 0 0) */}
                      <g>
                        <circle
                          r={radius + 8}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.2"
                          strokeDasharray="7 5"
                          opacity="0.95"
                        />
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 0 0"
                          to="360 0 0"
                          dur="6s"
                          repeatCount="indefinite"
                        />
                      </g>

                      {/* Counter-Spinning Outer Tech Halo */}
                      <g>
                        <circle
                          r={radius + 14}
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="1.2"
                          strokeDasharray="3 7"
                          opacity="0.5"
                        />
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="360 0 0"
                          to="0 0 0"
                          dur="10s"
                          repeatCount="indefinite"
                        />
                      </g>
                    </>
                  )}

                  {/* Special Root Node Subtle Halo Ring when not active */}
                  {isRootNode && !isActive && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke={node.theme === 'purple' ? '#c084fc' : node.theme === 'emerald' ? '#34d399' : '#38bdf8'}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.45"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={radius}
                    fill={fillGrad}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    className="transition-colors duration-200"
                  />

                  {/* Value Text */}
                  <text
                    x="0"
                    y="5.5"
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : '#f8fafc'}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.val}
                  </text>

                  {/* Pointer Badges (root1, root2, p, q, curr, head, tail) */}
                  {ptrs.length > 0 && (
                    <g transform={`translate(0, ${-radius - 12})`}>
                      <rect
                        x={-ptrs.join(', ').length * 3.8 - 8}
                        y="-10"
                        width={ptrs.join(', ').length * 7.6 + 16}
                        height="20"
                        rx="6"
                        fill="#0284c7"
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        className="shadow-lg"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {ptrs.join(', ')} →
                      </text>
                    </g>
                  )}

                  {/* Root Label Badge when no explicit pointer is present on Root */}
                  {isRootNode && ptrs.length === 0 && (
                    <g transform={`translate(0, ${-radius - 10})`}>
                      <rect
                        x="-16"
                        y="-7.5"
                        width="32"
                        height="15"
                        rx="4"
                        fill="#0f172a"
                        stroke={node.theme === 'purple' ? '#a855f7' : node.theme === 'emerald' ? '#10b981' : '#38bdf8'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.2"
                        textAnchor="middle"
                        fill={node.theme === 'purple' ? '#c084fc' : node.theme === 'emerald' ? '#34d399' : '#38bdf8'}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ROOT
                      </text>
                    </g>
                  )}

                  {/* Status / Value Badge below node (e.g. 'h=2', 'rem=10', 'MATCH', 'SUBTREE') */}
                  {node.badge && (
                    <g transform={`translate(0, ${radius + 12})`}>
                      <rect
                        x={-node.badge.length * 3.6 - 7}
                        y="-8"
                        width={node.badge.length * 7.2 + 14}
                        height="17"
                        rx="5"
                        fill="#0b1329"
                        stroke={strokeColor}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3.8"
                        textAnchor="middle"
                        fill={strokeColor}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.badge}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Node Details Tooltip (Bottom left memory inspector) */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-1.5 z-20 pointer-events-none animate-in fade-in duration-200">
          <div className="font-bold text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <Info className="w-3.5 h-3.5" />
            <span>TreeNode Memory Inspector</span>
            {hoveredNode.isRoot && (
              <span className="ml-auto bg-sky-500/20 text-sky-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                ROOT
              </span>
            )}
          </div>
          <div className="text-slate-300 font-mono text-[11px] space-y-0.5">
            <div>
              <span className="text-slate-500">Address:</span>{' '}
              <span className="text-indigo-300">0x{(Math.abs(hoveredNode.val) * 4096 + 1048576).toString(16)}</span>
            </div>
            <div>
              <span className="text-slate-500">root-&gt;val:</span>{' '}
              <span className="text-emerald-400 font-bold">{hoveredNode.val}</span>
            </div>
            <div>
              <span className="text-slate-500">root-&gt;left:</span>{' '}
              <span className="text-sky-300">{hoveredNode.left ? `Node(${hoveredNode.left.val})` : 'nullptr'}</span>
            </div>
            <div>
              <span className="text-slate-500">root-&gt;right:</span>{' '}
              <span className="text-pink-300">{hoveredNode.right ? `Node(${hoveredNode.right.val})` : 'nullptr'}</span>
            </div>
            {hoveredNode.status && (
              <div>
                <span className="text-slate-500">status:</span>{' '}
                <span className="text-amber-400 font-bold">{hoveredNode.status}</span>
              </div>
            )}
            {hoveredNode.treeId && (
              <div>
                <span className="text-slate-500">tree:</span>{' '}
                <span className="text-purple-300 font-semibold">{hoveredNode.treeId.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info / Controls Helper */}
      <div className="absolute bottom-3 right-3 z-10 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-md border border-slate-800 pointer-events-none">
        Scroll to Zoom · Drag to Pan
      </div>
    </div>
  );
}
