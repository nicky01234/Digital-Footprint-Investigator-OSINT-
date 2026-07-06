/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Folder, Shield, Database, Trash2, Star, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Case, SearchHistoryItem } from "../types";
import DisclaimerBanner from "./DisclaimerBanner";

interface DashboardViewProps {
  cases: Case[];
  history: SearchHistoryItem[];
  onToggleFavorite: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
  onQuickSearch: (query: string, type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website') => void;
}

export default function DashboardView({
  cases,
  history,
  onToggleFavorite,
  onDeleteHistory,
  onNavigateToTab,
  onSelectCase,
  onQuickSearch,
}: DashboardViewProps) {
  // Aggregate stats
  const activeCasesCount = cases.filter((c) => c.status === "active").length;
  const criticalCasesCount = cases.filter((c) => c.riskLevel === "critical" || c.riskLevel === "high").length;
  const totalEvidenceCount = cases.reduce((sum, c) => sum + (c.evidenceCount || 0), 0);

  // Risk profile data for beautiful SVG Donut
  const lowRisk = cases.filter((c) => c.riskLevel === "low").length;
  const mediumRisk = cases.filter((c) => c.riskLevel === "medium").length;
  const highRisk = cases.filter((c) => c.riskLevel === "high").length;
  const criticalRisk = cases.filter((c) => c.riskLevel === "critical").length;
  const totalCases = cases.length || 1;

  const lowPct = Math.round((lowRisk / totalCases) * 100);
  const medPct = Math.round((mediumRisk / totalCases) * 100);
  const highPct = Math.round((highRisk / totalCases) * 100);
  const critPct = Math.round((criticalRisk / totalCases) * 100);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-lg backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00E5FF]" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Total Investigations</p>
              <h3 className="text-3xl font-bold text-white mt-1 font-mono">{cases.length}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Active monitoring pipelines</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-lg backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B8CFF]" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Active Threat Cases</p>
              <h3 className="text-3xl font-bold text-white mt-1 font-mono">{activeCasesCount}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live investigator focus</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF4D4D]" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">High Risk Footprints</p>
              <h3 className="text-3xl font-bold text-white mt-1 font-mono">{criticalCasesCount}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-red-400/80 mt-3 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Escalated exposure tags</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00D26A]" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Captured Indicators</p>
              <h3 className="text-3xl font-bold text-white mt-1 font-mono">{totalEvidenceCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured evidence records</span>
          </p>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Case Watchlist */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-lg backdrop-blur-md">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase">Active Case Registry</h4>
              <button
                onClick={() => onNavigateToTab("cases")}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {cases.length === 0 ? (
                <div className="py-12 text-center">
                  <Folder className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No active cases. Open a case record to begin logging evidence.</p>
                </div>
              ) : (
                cases.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      onNavigateToTab("cases");
                    }}
                    className="p-4 bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400">{c.caseNumber}</span>
                        <h5 className="text-xs font-semibold text-white">{c.name}</h5>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{c.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded font-mono">
                          Target: {c.target}
                        </span>
                        {c.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-cyan-500/10 text-cyan-400/80 px-2 py-0.5 rounded font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border font-bold ${
                          c.riskLevel === "critical" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                          c.riskLevel === "high" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                          c.riskLevel === "medium" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                          "bg-gray-500/10 border-gray-500/30 text-gray-400"
                        }`}>
                          {c.riskLevel}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{c.evidenceCount || 0} indicators</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-mono uppercase">Case Status Engine</span>
            <button
              onClick={() => onNavigateToTab("cases")}
              className="px-3 py-1.5 bg-white/5 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/10 rounded-lg transition-all uppercase cursor-pointer"
            >
              REGISTER NEW CASE FILE
            </button>
          </div>
        </div>

        {/* Right Column: Footprint Risk donut chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-lg backdrop-blur-md">
          <div>
            <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase mb-4">Risk Profile Analytics</h4>
            
            <div className="flex justify-center my-2 relative">
              {/* Elegant SVG Donut Chart */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#222b3c" strokeWidth="4.5" />
                
                {/* Critical section */}
                {critPct > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FF4D4D" strokeWidth="5.5"
                    strokeDasharray={`${critPct} ${100 - critPct}`} strokeDashoffset="100" />
                )}
                {/* High section */}
                {highPct > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FFB020" strokeWidth="5.5"
                    strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset={`${100 - critPct}`} />
                )}
                {/* Medium section */}
                {medPct > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#5B8CFF" strokeWidth="5.5"
                    strokeDasharray={`${medPct} ${100 - medPct}`} strokeDashoffset={`${100 - critPct - highPct}`} />
                )}
                {/* Low section */}
                {lowPct > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#00D26A" strokeWidth="5.5"
                    strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset={`${100 - critPct - highPct - medPct}`} />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white font-mono">{cases.length}</span>
                <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">Total Audits</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded bg-[#FF4D4D]" />
                <span>Critical ({critPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-[#FFB020]" />
                <span>High ({highPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded bg-[#5B8CFF]" />
                <span>Medium ({medPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-[#00D26A]" />
                <span>Low ({lowPct}%)</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 font-mono uppercase text-center mt-4">
            Secured regional compliance status: GREEN
          </p>
        </div>
      </div>

      {/* Recent Investigations Searches */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase mb-4">Investigator Query Log</h4>
        
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            Query log empty. Start a Person, Domain, or Username lookup in the investigation suite.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 6).map((h) => (
              <div
                key={h.id}
                className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between group hover:border-[#00E5FF]/30 hover:bg-white/10 transition-all"
              >
                <div 
                  onClick={() => onQuickSearch(h.query, h.type)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className={`p-2 rounded font-mono text-[9px] font-semibold shrink-0 uppercase tracking-widest ${
                    h.type === "email" ? "bg-pink-500/10 text-pink-400" :
                    h.type === "username" ? "bg-amber-500/10 text-amber-400" :
                    h.type === "domain" ? "bg-blue-500/10 text-blue-400" :
                    h.type === "person" ? "bg-cyan-500/10 text-cyan-400" :
                    "bg-slate-800 text-gray-400"
                  }`}>
                    {h.type}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate font-mono">{h.query}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(h.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => onToggleFavorite(h.id)}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Pin Search"
                  >
                    <Star className={`w-4 h-4 ${h.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <button
                    onClick={() => onDeleteHistory(h.id)}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove Search log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
