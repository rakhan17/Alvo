import React, { useEffect, useRef, useState } from 'react';
import { PersonaRole } from '../data/personas';
import { DebateMessage } from '../services/debateEngine';
import { 
  ZoomIn, ZoomOut, RefreshCw, Info,
  Stethoscope, Brain, Scale, Gavel, Building2, Shield, Activity, 
  Pill, HeartPulse, ShieldAlert, Cross, Dna, Briefcase, Users, 
  Compass, BookOpen, Heart, Moon, FileText
} from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  persona: PersonaRole;
  currentStance?: string;
  clusterTargetX: number;
  clusterTargetY: number;
}

interface Link {
  source: string;
  target: string;
  type: 'Rebuttal' | 'Consensus';
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

  // Map Kubu IDs to cluster center coordinates on Canvas
  const getClusterTarget = (kubuId: string, width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const offset = Math.min(width, height) * 0.28;

    switch (kubuId) {
      case 'kubu_health': return { x: cx - offset, y: cy - offset * 0.7 };
      case 'kubu_law': return { x: cx + offset, y: cy - offset * 0.7 };
      case 'kubu_eco': return { x: cx - offset * 1.1, y: cy + offset * 0.7 };
      case 'kubu_science': return { x: cx + offset * 1.1, y: cy + offset * 0.7 };
      case 'kubu_society': return { x: cx, y: cy };
      default: return { x: cx, y: cy };
    }
  };

  // Initialize nodes randomly scattered across canvas
  useEffect(() => {
    if (activePersonas.length === 0) return;

    const width = 800;
    const height = 550;

    const newNodes: Node[] = activePersonas.map((persona) => {
      const target = getClusterTarget(persona.kubuId, width, height);
      const latestMsg = messages.find(m => m.personaId === persona.id);

      return {
        id: persona.id,
        // Start randomly scattered across the entire canvas
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        persona,
        currentStance: latestMsg?.text,
        clusterTargetX: target.x,
        clusterTargetY: target.y
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
    setLinks(newLinks.slice(0, 60));
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

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          let fx = 0;
          let fy = 0;

          // Pull towards Kubu Cluster Target (Ideological Gravity)
          const target = getClusterTarget(node.persona.kubuId, width, height);
          fx += (target.x - node.x) * 0.008;
          fy += (target.y - node.y) * 0.008;

          // Node-node repulsion (don't overlap too closely)
          prevNodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              // Intra-Kubu vs Inter-Kubu forces
              const sameKubu = node.persona.kubuId === other.persona.kubuId;
              const minDistance = sameKubu ? 45 : 90;

              if (dist < minDistance) {
                const force = (minDistance - dist) / dist * (sameKubu ? 0.04 : 0.08);
                fx += dx * force;
                fy += dy * force;
              }
            }
          });

          const vx = (node.vx + fx) * 0.85;
          const vy = (node.vy + fy) * 0.85;

          return {
            ...node,
            x: Math.max(30, Math.min(width - 30, node.x + vx)),
            y: Math.max(30, Math.min(height - 30, node.y + vy)),
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

      // Draw Spider-Web Grid Background
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Spider-Web Intra-Kubu Cluster Web Lines
      nodes.forEach((node, idx) => {
        nodes.slice(idx + 1).forEach(other => {
          if (node.persona.kubuId === other.persona.kubuId) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      // Draw Inter-Kubu Debate Rebuttal Tension Lines
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Persona Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;
        const radius = isHovered ? 14 : 10;

        // Node Circle Outer Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#ffffff' : '#262626';
        ctx.fill();

        // Node Circle Inner Fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#000000' : '#141414';
        ctx.fill();

        // Node Label Dot Symbol
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Node Name Label
        ctx.font = '9px Fira Code, monospace';
        ctx.fillStyle = isHovered ? '#ffffff' : '#737373';
        ctx.fillText(node.persona.name.split(' ')[0], node.x, node.y + radius + 10);
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
      return Math.sqrt(dx * dx + dy * dy) < 16;
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
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#262626] text-xs font-mono">
        <span className="text-neutral-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-white" /> Kubu Clusters:
        </span>
        <span className="text-white">
          {activePersonas.length} Roles forming 5 Kubu Alliances
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
            <div className="p-2 rounded bg-[#171717] border border-[#262626] text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">
                {hoveredNode.persona.name}
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono">{hoveredNode.persona.title}</p>
            </div>
          </div>
          {hoveredNode.currentStance && (
            <p className="text-xs text-neutral-300 italic bg-[#141414] p-2.5 rounded border border-[#262626] line-clamp-3 font-sans">
              "{hoveredNode.currentStance}"
            </p>
          )}
        </div>
      )}

    </div>
  );
};
