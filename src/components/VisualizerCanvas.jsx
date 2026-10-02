import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info } from 'lucide-react';
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

  // Compute responsive tree layout guaranteed to fit within dimensions
  const { nodes, edges, bounds } = calculateTreeLayout(treeData, dimensions.width, dimensions.height);

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

  // Build node pointer map (e.g. 'root', 'curr', 'LCA')
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Binary Tree Memory View</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{nodes.length} Nodes</span>
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenter}
          title="Center & Fit View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Visualization */}
      <svg className="w-full h-full flex-1">
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="rgba(51, 65, 85, 0.25)"
              strokeWidth="0.8"
            />
          </pattern>
          {/* Gradients */}
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
            <stop offset="0%" stopColor="#a855f7" />
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
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          {/* Drop Shadows */}
          <filter id="glowActive" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
          {/* Edges / Pointer Lines */}
          <g className="edges-layer">
            {edges.map((edge, idx) => {
              const isLeft = edge.isLeft;
              const midY = (edge.fromY + edge.toY) / 2;
              const midX = (edge.fromX + edge.toX) / 2;
              const pathData = `M ${edge.fromX} ${edge.fromY + 12} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY - 18}`;

              return (
                <g key={`edge_${idx}`} className="transition-all duration-300">
                  {/* Glow underlay */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.15)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Main edge line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Left/Right Child Indicator Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-8"
                      y="-7"
                      width="16"
                      height="14"
                      rx="3"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isLeft ? '#38bdf8' : '#ec4899'}
                      fontSize="8"
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
            {nodes.map((node) => {
              const isActive = node.id === activeNodeId;
              const isHighlighted = highlightNodeIds.includes(node.id);
              const status = node.status;
              const ptrs = nodePointersMap[node.id] || [];
              const radius = node.radius || 22;

              let fillGrad = 'url(#defaultGrad)';
              let strokeColor = '#475569';
              let strokeWidth = 2;
              let filter = '';

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
              } else if (isActive || isHighlighted) {
                fillGrad = 'url(#activeGrad)';
                strokeColor = '#38bdf8';
                strokeWidth = 3.5;
                filter = 'url(#glowActive)';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer transition-transform duration-300"
                >
                  {/* Active Focus Pulsing Ring */}
                  {isActive && (
                    <circle
                      r={radius + 7}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={radius}
                    fill={fillGrad}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    className="shadow-2xl transition-all duration-300"
                  />

                  {/* Node Value Text */}
                  <text
                    x="0"
                    y={radius > 20 ? '4.5' : '3.5'}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={radius > 20 ? '13' : '11'}
                    fontWeight="extrabold"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {node.val}
                  </text>

                  {/* Pointers Tags Box */}
                  {ptrs.length > 0 && (
                    <g transform={`translate(0, -${radius + 14})`}>
                      <rect
                        x="-24"
                        y="-8"
                        width="48"
                        height="16"
                        rx="4"
                        fill="#1e1b4b"
                        stroke="#6366f1"
                        strokeWidth="1.2"
                        className="shadow-md"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {ptrs.join(', ')}
                      </text>
                    </g>
                  )}

                  {/* Node State Pill Below */}
                  {status && status !== 'default' && (
                    <g transform={`translate(0, ${radius + 12})`}>
                      <rect
                        x="-16"
                        y="-6"
                        width="32"
                        height="12"
                        rx="3"
                        fill="#022c22"
                        stroke="#059669"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#34d399"
                        fontSize="7"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {status === 'visited' ? 'OK' : status.toUpperCase().slice(0, 4)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Canvas Hints */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded pointer-events-none border border-slate-800/40">
        Scroll to Zoom · Drag to Pan
      </div>
    </div>
  );
}
