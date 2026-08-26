import React, { useEffect, useRef, useState } from 'react';
import { PersonaRole } from '../data/personas';
import { DebateMessage } from '../services/debateEngine';
import { ZoomIn, ZoomOut, RefreshCw, Info } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  persona: PersonaRole;
  currentStance?: string;
}

interface Link {
  source: string;
  target: string;
  type: 'Rebuttal' | 'Consensus' | 'Synergy';
}

interface SpiderWebGraphProps {
  activePersonas: PersonaRole[];
  messages: DebateMessage[];
}

export const SpiderWebGraph: React.FC<SpiderWebGraphProps> = ({ activePersonas, messages }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize node layout in circle
  useEffect(() => {
    if (activePersonas.length === 0) return;

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    const newNodes: Node[] = activePersonas.map((persona, index) => {
      const angle = (index / activePersonas.length) * 2 * Math.PI;
      const latestMsg = messages.find(m => m.personaId === persona.id);

      return {
        id: persona.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        persona,
        currentStance: latestMsg?.text
      };
    });

    setNodes(newNodes);
  }, [activePersonas]);

  // Extract links from messages
  useEffect(() => {
    const newLinks: Link[] = [];
    messages.forEach(m => {
      if (m.targetPersonaId) {
        newLinks.push({
          source: m.personaId,
          target: m.targetPersonaId,
          type: 'Rebuttal'
        });
      }
    });
    setLinks(newLinks.slice(0, 50));
  }, [messages]);

  // Physics animation loop & Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.height = canvas.parentElement?.clientHeight || 550;

      // Physics force adjustments
      const centerX = width / 2;
      const centerY = height / 2;

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          let fx = 0;
          let fy = 0;

          // Pull towards center
          fx += (centerX - node.x) * 0.0005;
          fy += (centerY - node.y) * 0.0005;

          // Node-node repulsion
          prevNodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              if (dist < 120) {
                const force = (120 - dist) / dist * 0.05;
                fx += dx * force;
                fy += dy * force;
              }
            }
          });

          const vx = (node.vx + fx) * 0.88;
          const vy = (node.vy + fy) * 0.88;

          return {
            ...node,
            x: Math.max(40, Math.min(width - 40, node.x + vx)),
            y: Math.max(40, Math.min(height - 40, node.y + vy)),
            vx,
            vy
          };
        });
      });

      // Clear Canvas Background - Crisp Obsidian Dark
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(scale, scale);

      // Draw Spider-Web Grid Background Lines
      ctx.strokeStyle = '#171717';
      ctx.lineWidth = 1;
      for (let r = 80; r < Math.max(width, height); r += 80) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw Links / Rebuttals (Monochrome subtle white/gray)
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          ctx.strokeStyle = '#525252';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Persona Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;
        const radius = isHovered ? 16 : 12;

        // Node Circle Outer Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#ffffff' : '#262626';
        ctx.fill();

        // Node Circle Inner Fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#000000' : '#141414';
        ctx.fill();

        // Node Icon / Symbol
        ctx.font = `${isHovered ? '14px' : '11px'} sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.persona.icon, node.x, node.y);

        // Node Name Label below
        ctx.font = '10px Fira Code, monospace';
        ctx.fillStyle = isHovered ? '#ffffff' : '#a3a3a3';
        ctx.fillText(node.persona.name.split(' ')[0], node.x, node.y + radius + 12);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, scale, pan, hoveredNode]);

  // Handle Mouse Events for Drag & Hover
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / scale;
    const mouseY = (e.clientY - rect.top - pan.y) / scale;

    const found = nodes.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) < 18;
    });

    setHoveredNode(found || null);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[480px] md:h-[550px] bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
      
      {/* Header Legend */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#262626] text-xs">
        <span className="text-neutral-400 font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-white" /> Network Visualizer:
        </span>
        <span className="text-neutral-300 font-mono">
          {activePersonas.length} Active Nodes
        </span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#0a0a0a]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#262626]">
        <button
          onClick={() => setScale(s => Math.min(s + 0.2, 2.5))}
          className="p-1.5 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
          className="p-1.5 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
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

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#333333] p-4 rounded-xl shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl p-1.5 rounded bg-[#171717] border border-[#262626]">{hoveredNode.persona.icon}</span>
            <div>
              <h4 className="font-bold text-xs text-white">
                {hoveredNode.persona.name}
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono">{hoveredNode.persona.title}</p>
            </div>
          </div>
          {hoveredNode.currentStance && (
            <p className="text-xs text-neutral-300 italic bg-[#141414] p-2.5 rounded border border-[#262626] line-clamp-3">
              "{hoveredNode.currentStance}"
            </p>
          )}
        </div>
      )}

    </div>
  );
};
