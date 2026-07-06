/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Network, ZoomIn, ZoomOut, RefreshCw, Filter, Download, 
  User, Mail, Globe, AtSign, Eye, EyeOff, ShieldAlert, Award
} from "lucide-react";
import { Case, RelationshipNode, RelationshipLink } from "../types";

interface RelationshipGraphProps {
  cases: Case[];
  activeCaseId: string;
  token: string;
}

export default function RelationshipGraph({
  cases,
  activeCaseId,
  token,
}: RelationshipGraphProps) {
  const activeCase = cases.find((c) => c.id === activeCaseId);

  // Graph state
  const [nodes, setNodes] = useState<RelationshipNode[]>([]);
  const [links, setLinks] = useState<RelationshipLink[]>([]);
  const [filteredType, setFilteredType] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);

  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Dragging node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Compiles relationship nodes based on the selected Case Evidence
  useEffect(() => {
    if (!activeCaseId) return;

    const loadGraphData = async () => {
      try {
        const response = await fetch(`/api/cases/${activeCaseId}/evidence`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const evidenceList = await response.json();

        if (Array.isArray(evidenceList)) {
          // 1. Create central target node
          const centerNode: RelationshipNode = {
            id: "target-root",
            label: activeCase?.target || "Target Host",
            type: activeCase?.target?.includes("@") ? "email" : activeCase?.target?.includes(".") ? "domain" : "person",
            details: `Investigation primary target identifier: ${activeCase?.target}`,
            x: 400,
            y: 250,
          };

          const newNodes: RelationshipNode[] = [centerNode];
          const newLinks: RelationshipLink[] = [];

          // 2. Generate radial nodes for each evidence item
          evidenceList.forEach((ev: any, idx: number) => {
            const angle = (idx * 2 * Math.PI) / (evidenceList.length || 1);
            const radius = 180 + Math.random() * 40; // vary radius slightly for visual organic density
            const x = 400 + radius * Math.cos(angle);
            const y = 250 + radius * Math.sin(angle);

            const evNode: RelationshipNode = {
              id: ev.id,
              label: ev.value,
              type: ev.type,
              details: ev.notes || `Discovered via source: ${ev.source}`,
              x,
              y,
            };

            newNodes.push(evNode);

            // Connect evidence node back to target-root
            newLinks.push({
              source: "target-root",
              target: ev.id,
              label: "resolved_indicator",
            });
          });

          // 3. Create extra secondary links (e.g., connect emails to domains) for higher aesthetic complexity
          const emails = newNodes.filter((n) => n.type === "email");
          const domains = newNodes.filter((n) => n.type === "domain");

          if (emails.length > 0 && domains.length > 0) {
            newLinks.push({
              source: emails[0].id,
              target: domains[0].id,
              label: "hosted_relay",
            });
          }

          setNodes(newNodes);
          setLinks(newLinks);
        }
      } catch (err) {
        console.error("Error building intelligence links:", err);
      }
    };

    loadGraphData();
  }, [activeCaseId, cases, token]);

  // Handle zooming
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => (direction === "in" ? Math.min(prev + 0.15, 2.5) : Math.max(prev - 0.15, 0.4)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Node Drag Handlers (pure React SVG translation)
  const handleNodeMouseDown = (e: React.MouseEvent, node: RelationshipNode) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    setSelectedNode(node);
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      // Get SVG mouse coordinates (relative to transform)
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY } : n))
      );
    } else if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      panStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleSvgMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  // Filters nodes by active selected filter type
  const visibleNodes = nodes.filter((n) => filteredType === "all" || n.type === filteredType || n.id === "target-root");
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  const visibleLinks = links.filter(
    (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  );

  const exportGraphData = () => {
    const dataStr = JSON.stringify({ nodes, links }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeCase?.caseNumber || "case"}-link-graph.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 shadow-lg backdrop-blur-md">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-3">
        <div>
          <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00E5FF]" />
            <span>Interactive Link Analysis</span>
          </h4>
          <p className="text-[11px] text-gray-400 mt-1 uppercase font-mono">Case Target: {activeCase?.name || "None"}</p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom In */}
          <button
            onClick={() => handleZoom("in")}
            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4.5 h-4.5" />
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => handleZoom("out")}
            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4.5 h-4.5" />
          </button>
          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Recenter"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>

          {/* Type Filter Select */}
          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 px-2 py-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={filteredType}
              onChange={(e) => setFilteredType(e.target.value)}
              className="bg-transparent text-xs text-gray-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">ALL NODES</option>
              <option value="person">PEOPLE</option>
              <option value="username">USERNAMES</option>
              <option value="email">EMAILS</option>
              <option value="domain">DOMAINS</option>
            </select>
          </div>

          {/* Export JSON button */}
          <button
            onClick={exportGraphData}
            disabled={nodes.length === 0}
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/30 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all uppercase cursor-pointer font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT LAYOUT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Interactive SVG Canvas (8-cols) */}
        <div className="lg:col-span-8 bg-[#0B0F19]/80 border border-white/10 rounded-xl relative overflow-hidden select-none h-[400px]">
          
          <div className="absolute top-3 left-3 bg-[#0B0F19]/95 border border-white/10 rounded px-2.5 py-1 text-[9px] font-mono text-[#00E5FF] z-10 shadow-sm">
            DRAG NODES TO REPOSITION • DOUBLE CLICK WALL TO PAN
          </div>

          {/* Interactive SVG Canvas */}
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
            onMouseDown={handleSvgMouseDown}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              
              {/* Lines linking nodes */}
              {visibleLinks.map((link, idx) => {
                const srcNode = nodes.find((n) => n.id === link.source);
                const tgtNode = nodes.find((n) => n.id === link.target);

                if (!srcNode || !tgtNode) return null;

                return (
                  <g key={idx}>
                    {/* Glowing outer line */}
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="#00E5FF"
                      strokeWidth="1.5"
                      strokeOpacity="0.25"
                    />
                    {/* Inner dash line */}
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="#00E5FF"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.7"
                    />
                  </g>
                );
              })}

              {/* Node Representations */}
              {visibleNodes.map((node) => {
                const isCenter = node.id === "target-root";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group"
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  >
                    {/* Glowing background ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isCenter ? "22" : "15"}
                      fill="transparent"
                      stroke={
                        isCenter ? "#00E5FF" :
                        node.type === "email" ? "#EC4899" :
                        node.type === "domain" ? "#3B82F6" :
                        node.type === "username" ? "#F59E0B" :
                        "#10B981"
                      }
                      strokeWidth="2"
                      strokeOpacity="0.1"
                      className="group-hover:stroke-opacity-40 transition-all duration-300"
                    />

                    {/* Central colored solid node */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isCenter ? "18" : "12"}
                      fill={
                        isCenter ? "#00E5FF" :
                        node.type === "email" ? "#EC4899" :
                        node.type === "domain" ? "#3B82F6" :
                        node.type === "username" ? "#F59E0B" :
                        "#10B981"
                      }
                      fillOpacity={isCenter ? "1" : "0.2"}
                      stroke={
                        isCenter ? "#00E5FF" :
                        node.type === "email" ? "#EC4899" :
                        node.type === "domain" ? "#3B82F6" :
                        node.type === "username" ? "#F59E0B" :
                        "#10B981"
                      }
                      strokeWidth="2"
                    />

                    {/* Visual Icon Centered */}
                    <g transform="translate(-6, -6) scale(0.65)" className="pointer-events-none">
                      {isCenter ? (
                        <Award className="w-5 h-5 text-slate-950 font-bold" />
                      ) : node.type === "email" ? (
                        <Mail className="w-5 h-5 text-pink-400" />
                      ) : node.type === "domain" ? (
                        <Globe className="w-5 h-5 text-blue-400" />
                      ) : node.type === "username" ? (
                        <AtSign className="w-5 h-5 text-amber-400" />
                      ) : (
                        <User className="w-5 h-5 text-emerald-400" />
                      )}
                    </g>

                    {/* Node Text Label */}
                    <text
                      y="24"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-white pointer-events-none drop-shadow-md select-none bg-[#0B0F19]/90 px-1 py-0.5 rounded border border-white/10"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}

            </g>
          </svg>

        </div>

        {/* Right Column: Node details panel (4-cols) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <h5 className="text-xs font-semibold font-mono text-[#00E5FF] uppercase tracking-wide border-b border-white/10 pb-2 mb-3">
              Inspector intelligence details
            </h5>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    selectedNode.id === "target-root" ? "bg-cyan-500/20 text-cyan-400" :
                    selectedNode.type === "email" ? "bg-pink-500/15 text-pink-400" :
                    selectedNode.type === "domain" ? "bg-blue-500/15 text-blue-400" :
                    "bg-amber-500/15 text-amber-400"
                  }`}>
                    {selectedNode.id === "target-root" ? "Primary Target" : selectedNode.type}
                  </span>
                  <h4 className="text-sm font-bold text-white font-mono break-all mt-2 select-all">{selectedNode.label}</h4>
                </div>

                <div className="p-3.5 bg-[#0B0F19]/80 rounded-lg border border-white/10 text-[11px] leading-relaxed text-gray-300">
                  <p className="font-semibold text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-1">NOTES / AUDIT CONTEXT</p>
                  <p>{selectedNode.details}</p>
                </div>

                <div className="text-[10px] text-gray-400 space-y-0.5 font-mono">
                  <p>Coordinate X: {Math.round(selectedNode.x || 0)}</p>
                  <p>Coordinate Y: {Math.round(selectedNode.y || 0)}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-400 font-mono leading-relaxed">
                Click any relationship node on the left link analysis graph to read metadata details.
              </div>
            )}
          </div>

          <p className="text-[9px] text-gray-500 uppercase font-mono mt-4 pt-2 border-t border-white/10">
            Secure visual link analysis module online.
          </p>
        </div>

      </div>

    </div>
  );
}
