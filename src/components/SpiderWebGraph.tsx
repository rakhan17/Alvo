import React, { useEffect, useRef, useState } from 'react';
import { DebateNode, DebateLink } from '../services/debateEngine';
import { Maximize2, RefreshCw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface SpiderWebGraphProps {
  nodes: DebateNode[];
  links: DebateLink[];
  onSelectNode: (node: DebateNode) => void;
}

interface PhysicsNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  node: DebateNode;
}

export const SpiderWebGraph: React.FC<SpiderWebGraphProps> = ({ nodes, links, onSelectNode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsNodesRef = useRef<Map<string, PhysicsNode>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<DebateNode | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<PhysicsNode | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Sync physics nodes when props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const currentMap = physicsNodesRef.current;

    nodes.forEach((n, idx) => {
      if (!currentMap.has(n.id)) {
        // Place in circular orbit around center
        const angle = (idx / nodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.35;
        const cx = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
        const cy = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 30;

        currentMap.set(n.id, {
          id: n.id,
          x: cx,
          y: cy,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 18,
          node: n
        });
      } else {
        const existing = currentMap.get(n.id)!;
        existing.node = n; // update state
      }
    });

    // Remove deleted nodes
    Array.from(currentMap.keys()).forEach(key => {
      if (!nodes.some(n => n.id === key)) {
        currentMap.delete(key);
      }
    });
  }, [nodes]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particleOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      particleOffset += 0.05;

      ctx.clearRect(0, 0, width, height);

      // Save context for Pan & Scale
      ctx.save();
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);

      const pNodes = Array.from(physicsNodesRef.current.values());

      // --- 1. Physics Simulation step ---
      for (let i = 0; i < pNodes.length; i++) {
        const n1 = pNodes[i];
        if (n1 === dragNodeRef.current) continue;

        // Center gravity force
        const dx = width / 2 - n1.x;
        const dy = height / 2 - n1.y;
        n1.vx += dx * 0.0003;
        n1.vy += dy * 0.0003;

        // Node-to-Node Repulsion Force
        for (let j = i + 1; j < pNodes.length; j++) {
          const n2 = pNodes[j];
          const rx = n2.x - n1.x;
          const ry = n2.y - n1.y;
          const dist = Math.sqrt(rx * rx + ry * ry) || 1;
          const minDist = 90;

          if (dist < minDist) {
            const force = (minDist - dist) / minDist;
            const fx = (rx / dist) * force * 0.8;
            const fy = (ry / dist) * force * 0.8;

            if (n1 !== dragNodeRef.current) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== dragNodeRef.current) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }

        // Apply velocity & damping
        n1.vx *= 0.88;
        n1.vy *= 0.88;
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Keep inside boundary margins
        const pad = 40;
        n1.x = Math.max(pad, Math.min(width - pad, n1.x));
        n1.y = Math.max(pad, Math.min(height - pad, n1.y));
      }

      // --- 2. Draw Subtle Web Mesh Grid lines ---
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(30, 38, 56, 0.4)';
      for (let i = 0; i < pNodes.length; i++) {
        for (let j = i + 1; j < pNodes.length; j++) {
          const dist = Math.hypot(pNodes[i].x - pNodes[j].x, pNodes[i].y - pNodes[j].y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(pNodes[i].x, pNodes[i].y);
            ctx.lineTo(pNodes[j].x, pNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // --- 3. Draw Active Link Beams (Rebuttals/Agreements) ---
      links.forEach(link => {
        const sourceNode = physicsNodesRef.current.get(link.source);
        const targetNode = physicsNodesRef.current.get(link.target);
        if (!sourceNode || !targetNode) return;

        let strokeColor = 'rgba(0, 240, 255, 0.6)';
        if (link.type === 'rebuttal') strokeColor = 'rgba(255, 0, 127, 0.8)';
        if (link.type === 'agreement') strokeColor = 'rgba(0, 255, 136, 0.8)';
        if (link.type === 'synergy') strokeColor = 'rgba(157, 0, 255, 0.8)';

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flowing particle along link
        const progress = (particleOffset + Math.abs(link.timestamp % 10)) % 1;
        const px = sourceNode.x + (targetNode.x - sourceNode.x) * progress;
        const py = sourceNode.y + (targetNode.y - sourceNode.y) * progress;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // --- 4. Draw Persona Nodes ---
      pNodes.forEach(pn => {
        const { x, y, radius, node } = pn;
        const isHovered = hoveredNode?.id === node.id;
        const isSpeaking = node.status === 'speaking';
        const isThinking = node.status === 'thinking';

        // Outer Pulsing Ring for Speaking/Thinking
        if (isSpeaking || isThinking) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 8 + Math.sin(Date.now() * 0.008) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = isSpeaking ? '#00f0ff' : '#9d00ff';
          ctx.lineWidth = 2;
          ctx.shadowColor = isSpeaking ? '#00f0ff' : '#9d00ff';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Base Circle
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? radius + 4 : radius, 0, Math.PI * 2);
        ctx.fillStyle = '#111520';
        ctx.fill();

        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeStyle = node.persona.color || '#00f0ff';
        ctx.shadowColor = node.persona.color || '#00f0ff';
        ctx.shadowBlur = isHovered ? 15 : 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Render Emoji / Icon
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.persona.icon || '🤖', x, y + 1);

        // Render Name Label below node
        ctx.font = '10px Outfit, sans-serif';
        ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
        ctx.fillText(node.persona.name.split(' ')[0], x, y + radius + 14);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [links, hoveredNode, scale, pan]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interaction (Hover, Click, Drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - canvas.width / 2 - pan.x) / scale + canvas.width / 2;
    const my = (e.clientY - rect.top - canvas.height / 2 - pan.y) / scale + canvas.height / 2;

    const pNodes = Array.from(physicsNodesRef.current.values());
    const clicked = pNodes.find(pn => Math.hypot(pn.x - mx, pn.y - my) <= pn.radius + 5);

    if (clicked) {
      dragNodeRef.current = clicked;
      onSelectNode(clicked.node);
    } else {
      isDraggingRef.current = true;
    }
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - canvas.width / 2 - pan.x) / scale + canvas.width / 2;
    const my = (e.clientY - rect.top - canvas.height / 2 - pan.y) / scale + canvas.height / 2;

    // Check hover
    const pNodes = Array.from(physicsNodesRef.current.values());
    const hovered = pNodes.find(pn => Math.hypot(pn.x - mx, pn.y - my) <= pn.radius + 5);
    setHoveredNode(hovered ? hovered.node : null);

    if (dragNodeRef.current) {
      dragNodeRef.current.x = mx;
      dragNodeRef.current.y = my;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
    isDraggingRef.current = false;
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[480px] md:h-[580px] bg-cyber-card/90 border border-cyber-border rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
      
      {/* Visual Header Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-[#090b10]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyber-border/80 text-xs">
        <span className="text-gray-400 font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" /> Spider-Web Graph:
        </span>
        <span className="flex items-center gap-1 text-pink-400">
          <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ff007f]"></span> Rebuttal
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#00ff88]"></span> Consensus
        </span>
        <span className="flex items-center gap-1 text-purple-400">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#9d00ff]"></span> Synergy
        </span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#090b10]/80 backdrop-blur-md p-1.5 rounded-xl border border-cyber-border/80">
        <button
          onClick={() => setScale(s => Math.min(s + 0.2, 2.5))}
          className="p-1.5 rounded-lg hover:bg-cyber-border/40 text-gray-300 hover:text-cyan-300 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
          className="p-1.5 rounded-lg hover:bg-cyber-border/40 text-gray-300 hover:text-cyan-300 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg hover:bg-cyber-border/40 text-gray-300 hover:text-cyan-300 transition"
          title="Reset View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* HTML5 Canvas Surface */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Hover Card Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md z-20 bg-[#090b10]/95 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xl">{hoveredNode.persona.icon}</span>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                {hoveredNode.persona.name}
                <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: `${hoveredNode.persona.color}20`, color: hoveredNode.persona.color }}>
                  {hoveredNode.persona.category}
                </span>
              </h4>
              <p className="text-xs text-gray-400 font-mono">{hoveredNode.persona.title}</p>
            </div>
          </div>
          {hoveredNode.currentStance && (
            <p className="text-xs text-cyan-200 italic bg-cyan-950/30 p-2 rounded border border-cyan-500/20 line-clamp-3">
              "{hoveredNode.currentStance}"
            </p>
          )}
        </div>
      )}

    </div>
  );
};
