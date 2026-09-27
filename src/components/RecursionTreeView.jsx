import React, { useRef, useState, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function RecursionTreeView({ recursionTree = [], activeNodeId }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Convert flat recursionNodes with parentId into a visual tree layout
  const buildLayout = () => {
    if (!recursionTree || recursionTree.length === 0) return { nodes: [], edges: [] };

    // Build hierarchy
    const nodeMap = new Map();
    recursionTree.forEach(n => {
      nodeMap.set(n.id, { ...n, children: [] });
    });

    const roots = [];
    nodeMap.forEach(n => {
      if (n.parentId && nodeMap.has(n.parentId)) {
        nodeMap.get(n.parentId).children.push(n);
      } else {
        roots.push(n);
      }
    });

    const positionedNodes = [];
    const edges = [];
    let currentX = 50;

    function layoutSubtree(node, depth = 0) {
      const y = 50 + depth * 70;
      let myX = currentX;

      if (node.children.length === 0) {
        myX = currentX;
        currentX += 130;
      } else {
        const childXs = [];
        node.children.forEach(child => {
          layoutSubtree(child, depth + 1);
          const childPos = positionedNodes.find(p => p.id === child.id);
          if (childPos) childXs.push(childPos.x);
        });
        myX = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }

      positionedNodes.push({
        ...node,
        x: myX,
        y,
      });

      node.children.forEach(child => {
        const childPos = positionedNodes.find(p => p.id === child.id);
        if (childPos) {
          edges.push({
            fromX: myX,
            fromY: y,
            toX: childPos.x,
            toY: childPos.y,
          });
        }
      });
    }

    roots.forEach(root => layoutSubtree(root, 0));
    return { nodes: positionedNodes, edges };
  };

  const { nodes, edges } = buildLayout();

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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Title */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium text-slate-300">
        <Network className="w-4 h-4 text-sky-400" />
        <span>Recursion Execution Call Graph</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">{nodes.length} Calls</span>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full flex-1"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <defs>
          <linearGradient id="recActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="recReturnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Empty state */}
        {nodes.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#64748b"
            fontSize="14"
            fontFamily="monospace"
          >
            No recursive calls active yet
          </text>
        )}

        {/* Edges */}
        <g>
          {edges.map((e, idx) => (
            <line
              key={`rec_edge_${idx}`}
              x1={e.fromX}
              y1={e.fromY + 16}
              x2={e.toX}
              y2={e.toY - 16}
              stroke="#475569"
              strokeWidth="1.8"
              strokeDasharray="3 3"
            />
          ))}
        </g>

        {/* Call Nodes */}
        <g>
          {nodes.map(n => {
            const isLatest = n.status === 'active';
            const isReturned = n.status === 'returned';

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                className="transition-all duration-300"
              >
                {/* Node Pill Box */}
                <rect
                  x="-55"
                  y="-14"
                  width="110"
                  height="28"
                  rx="6"
                  fill={isLatest ? 'url(#recActiveGrad)' : (isReturned ? 'url(#recReturnGrad)' : '#1e293b')}
                  stroke={isLatest ? '#38bdf8' : (isReturned ? '#34d399' : '#334155')}
                  strokeWidth={isLatest ? 2 : 1}
                  className="shadow-lg"
                />

                {/* Call Label */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.label.length > 15 ? n.label.substring(0, 15) + '…' : n.label}
                </text>

                {/* Return Value Bubble */}
                {isReturned && n.returnVal !== null && n.returnVal !== undefined && (
                  <g transform="translate(48, -12)">
                    <circle r="10" fill="#10b981" stroke="#059669" strokeWidth="1" />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {typeof n.returnVal === 'object' ? 'ret' : n.returnVal.toString().substring(0, 3)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
