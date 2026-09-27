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

  // Resize listener
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 750,
          height: clientHeight || 480,
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute tree layout
  const { nodes, edges, bounds } = calculateTreeLayout(treeData, dimensions.width, dimensions.height);

  // Auto-center when tree changes significantly
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
          title="Center View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          title="Reset"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Visualization */}
      <svg
        className="w-full h-full flex-1"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
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
        <rect width="3000" height="3000" x="-1000" y="-1000" fill="url(#grid)" pointerEvents="none" />

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

        {/* Edges / Pointer Lines */}
        <g className="edges-layer">
          {edges.map((edge, idx) => {
            const isLeft = edge.isLeft;
            const midY = (edge.fromY + edge.toY) / 2;
            const midX = (edge.fromX + edge.toX) / 2;
            // Smooth cubic bezier curve for tree links
            const pathData = `M ${edge.fromX} ${edge.fromY + 15} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY - 22}`;

            return (
              <g key={`edge_${idx}`} className="transition-all duration-300">
                {/* Glow underlay */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Main edge line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Left/Right Child Indicator Pill */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-10"
                    y="-8"
                    width="20"
                    height="16"
                    rx="4"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={isLeft ? '#38bdf8' : '#ec4899'}
                    fontSize="9"
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

            // Choose fill style based on status
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
                    r="32"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r="23"
                  fill={fillGrad}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter={filter}
                  className="transition-all duration-300"
                />

                {/* Node Value */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="15"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.val}
                </text>

                {/* Status Badge (e.g. Height 'h=2', 'rem=10', 'MATCH') */}
                {node.badge && (
                  <g transform="translate(0, 34)">
                    <rect
                      x="-28"
                      y="-8"
                      width="56"
                      height="16"
                      rx="8"
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.badge}
                    </text>
                  </g>
                )}

                {/* Attached C++ Pointers Badge (e.g., 'root ->', 'curr ->') */}
                {ptrs.length > 0 && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-36"
                      y="-10"
                      width="72"
                      height="18"
                      rx="5"
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#c7d2fe"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {ptrs.join(', ')} →
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node Details Tooltip (Bottom left) */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700/80 shadow-2xl text-xs space-y-1 z-20 pointer-events-none">
          <div className="font-bold text-sky-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>TreeNode Memory Inspector</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            <div><span className="text-slate-500">Address:</span> 0x{(hoveredNode.val * 4096 + 1048576).toString(16)}</div>
            <div><span className="text-slate-500">root-&gt;val:</span> <span className="text-emerald-400 font-bold">{hoveredNode.val}</span></div>
            <div><span className="text-slate-500">root-&gt;left:</span> {hoveredNode.left ? `Node(${hoveredNode.left.val})` : 'nullptr'}</div>
            <div><span className="text-slate-500">root-&gt;right:</span> {hoveredNode.right ? `Node(${hoveredNode.right.val})` : 'nullptr'}</div>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 font-mono bg-slate-950/70 px-2 py-1 rounded border border-slate-800 pointer-events-none">
        Scroll to Zoom · Drag to Pan
      </div>
    </div>
  );
}
