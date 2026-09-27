import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, AlertTriangle } from 'lucide-react';
import { calculateGraphLayout } from '../utils/graphLayout';

export default function GraphCanvas({
  graphData,
  activeNodeId,
  highlightNodeIds = [],
  pointers = {},
  actionType = '',
  variables = {},
  extraInfo = {},
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 650, height: 420 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 650,
          height: containerRef.current.clientHeight || 420,
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodesList = graphData?.nodes || [];
  const edgesList = graphData?.edges || [];
  const { nodes, edges } = calculateGraphLayout(nodesList, edgesList, dimensions.width, dimensions.height);

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

  const queueItems = extraInfo?.queue || variables?.queue || [];
  const visitedArray = variables?.visited || [];
  const isCycleFound = actionType === 'CYCLE_FOUND';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Top Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>Graph Adjacency View</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{nodes.length} Vertices</span>
        </div>
        {isCycleFound && (
          <div className="bg-rose-950/90 border border-rose-500/80 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-bounce shadow-xl">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Cycle Detected in Graph!</span>
          </div>
        )}
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
          <RotateCcw className="w-3.5 h-3.5" />
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
          <linearGradient id="graphActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="graphVisitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="graphCycleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Edges */}
        <g>
          {edges.map((edge, idx) => {
            const isCycleEdge = edge.status === 'cycle_edge';
            const isActiveEdge = edge.status === 'active';

            return (
              <g key={`gedge_${idx}`}>
                <line
                  x1={edge.fromX}
                  y1={edge.fromY}
                  x2={edge.toX}
                  y2={edge.toY}
                  stroke={isCycleEdge ? '#f43f5e' : (isActiveEdge ? '#38bdf8' : '#334155')}
                  strokeWidth={isCycleEdge ? 4 : (isActiveEdge ? 3 : 2)}
                  strokeDasharray={isCycleEdge ? '5 3' : 'none'}
                />
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const isActive = node.id === activeNodeId;
            const isVisiting = node.status === 'visiting';
            const isVisited = node.status === 'visited';
            const isQueued = node.status === 'in_queue';
            const isCycleNode = node.status === 'matched';

            let fill = '#1e293b';
            let stroke = '#475569';
            let strokeW = 2;

            if (isCycleNode) {
              fill = 'url(#graphCycleGrad)';
              stroke = '#f43f5e';
              strokeW = 3.5;
            } else if (isActive || isVisiting) {
              fill = 'url(#graphActiveGrad)';
              stroke = '#38bdf8';
              strokeW = 3.5;
            } else if (isVisited) {
              fill = 'url(#graphVisitedGrad)';
              stroke = '#10b981';
              strokeW = 2.5;
            } else if (isQueued) {
              fill = '#312e81';
              stroke = '#818cf8';
              strokeW = 2.5;
            }

            return (
              <g key={`gnode_${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                {isActive && (
                  <circle
                    r="30"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '6s' }}
                  />
                )}
                <circle
                  r="22"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  className="transition-all duration-300"
                />
                <text
                  x="0"
                  y="5.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.val}
                </text>

                {/* Badge */}
                {node.badge && (
                  <g transform="translate(0, 32)">
                    <rect
                      x="-24"
                      y="-7"
                      width="48"
                      height="14"
                      rx="4"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {node.badge}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Tray: Queue Bar + Visited Array */}
      <div className="bg-slate-900/90 border-t border-slate-800 p-2.5 flex items-center justify-between gap-4 text-xs font-mono">
        {/* Queue State */}
        {queueItems && (
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-bold">std::queue:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {queueItems.length === 0 ? (
                <span className="text-slate-500 italic font-sans">[ empty ]</span>
              ) : (
                queueItems.map((item, i) => (
                  <span
                    key={`q_${i}`}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      i === 0
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Visited Array */}
        {visitedArray.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">visited[]:</span>
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {visitedArray.map((vis, idx) => (
                <span
                  key={`v_${idx}`}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    vis
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                  title={`visited[${idx}] = ${vis}`}
                >
                  {idx}:{vis ? 'T' : 'F'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
