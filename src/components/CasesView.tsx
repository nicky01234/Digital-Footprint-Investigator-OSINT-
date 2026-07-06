/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Folder, Plus, Trash2, Calendar, Shield, MapPin, Tag, 
  Clock, CheckCircle, AtSign, Globe, Mail, Link, AlertTriangle
} from "lucide-react";
import { Case, EvidenceItem, TimelineEvent } from "../types";

interface CasesViewProps {
  cases: Case[];
  activeCaseId: string;
  token: string;
  onSelectCase: (caseId: string) => void;
  onCreateCase: (name: string, description: string, target: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', tags: string[]) => void;
  onDeleteCase: (caseId: string) => void;
  onAddEvidence: (caseId: string, type: string, value: string, source: string, notes: string, data: any) => void;
}

export default function CasesView({
  cases,
  activeCaseId,
  token,
  onSelectCase,
  onCreateCase,
  onDeleteCase,
  onAddEvidence,
}: CasesViewProps) {
  // Case details fetching state
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New Case form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [caseDesc, setCaseDesc] = useState("");
  const [caseTarget, setCaseTarget] = useState("");
  const [caseRisk, setCaseRisk] = useState<'low' | 'medium' | 'high' | 'critical'>("medium");
  const [caseTags, setCaseTags] = useState("");

  // New Evidence manual entry states
  const [manualEvType, setManualEvType] = useState<any>("username");
  const [manualEvValue, setManualEvValue] = useState("");
  const [manualEvNotes, setManualEvNotes] = useState("");
  const [manualEvSource, setManualEvSource] = useState("");

  // Select first case on load if none selected
  useEffect(() => {
    if (cases.length > 0 && !activeCaseId) {
      onSelectCase(cases[0].id);
    }
  }, [cases, activeCaseId]);

  // Fetch case evidence and timeline when active case shifts
  useEffect(() => {
    if (!activeCaseId) return;

    const fetchCaseDetails = async () => {
      setLoadingDetails(true);
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Fetch evidence list
        const evRes = await fetch(`/api/cases/${activeCaseId}/evidence`, { headers });
        const evData = await evRes.json();
        setEvidenceList(Array.isArray(evData) ? evData : []);

        // 2. Fetch timeline events
        const tmRes = await fetch(`/api/cases/${activeCaseId}/timeline`, { headers });
        const tmData = await tmRes.json();
        setTimelineEvents(Array.isArray(tmData) ? tmData : []);
      } catch (err) {
        console.error("Error fetching case forensic details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchCaseDetails();
  }, [activeCaseId, cases, token]);

  const activeCase = cases.find((c) => c.id === activeCaseId);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName || !caseTarget) return;

    const tagsArr = caseTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onCreateCase(caseName, caseDesc, caseTarget, caseRisk, tagsArr);
    
    // Reset Form
    setCaseName("");
    setCaseDesc("");
    setCaseTarget("");
    setCaseRisk("medium");
    setCaseTags("");
    setShowCreateForm(false);
  };

  const handleManualEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEvValue || !activeCaseId) return;

    onAddEvidence(
      activeCaseId,
      manualEvType,
      manualEvValue,
      manualEvSource || "Investigator Direct File Logs",
      manualEvNotes,
      {}
    );

    // Reset manual evidence inputs
    setManualEvValue("");
    setManualEvNotes("");
    setManualEvSource("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Pane: Case list (4-cols) */}
      <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase">
            Case Files Portfolio
          </h4>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>NEW CASE</span>
          </button>
        </div>

        {/* Case List container */}
        <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {cases.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">
              Portfolio empty. Create a case record file to track evidence.
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  c.id === activeCaseId
                    ? "bg-white/10 border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">
                    {c.caseNumber}
                  </span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 rounded border ${
                    c.riskLevel === "critical" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                    c.riskLevel === "high" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                    c.riskLevel === "medium" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                    "bg-gray-500/10 border-gray-500/30 text-gray-400"
                  }`}>
                    {c.riskLevel}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white uppercase truncate">{c.name}</h5>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                
                <div className="flex justify-between items-center text-[10px] mt-3 pt-3 border-t border-slate-800/60 font-mono text-gray-400">
                  <span className="truncate max-w-[120px]">Target: <b className="text-slate-300">{c.target}</b></span>
                  <span>{c.evidenceCount || 0} indicators</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Case Detail View / Form (8-cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* VIEW: CASE CREATION FORM */}
        {showCreateForm ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5 shadow-lg backdrop-blur-md">
            <h4 className="text-sm font-bold font-mono tracking-wider text-white uppercase border-b border-white/10 pb-3">
              Open Investigative Case File
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase font-mono mb-1.5">Case Identifier Name</label>
                  <input
                    type="text"
                    required
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    placeholder="e.g. Operation Sovereign"
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase font-mono mb-1.5">Primary Target ID</label>
                  <input
                    type="text"
                    required
                    value={caseTarget}
                    onChange={(e) => setCaseTarget(e.target.value)}
                    placeholder="e.g. cobalt-leaker / cobalt.com"
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-mono mb-1.5">Scope Description</label>
                <textarea
                  rows={3}
                  value={caseDesc}
                  onChange={(e) => setCaseDesc(e.target.value)}
                  placeholder="Enter details about targets, leaked items, or investigation objective parameters..."
                  className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase font-mono mb-1.5">Threat Exposure Level</label>
                  <select
                    value={caseRisk}
                    onChange={(e) => setCaseRisk(e.target.value as any)}
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="low">Low Exposure Risk</option>
                    <option value="medium">Medium Exposure Risk</option>
                    <option value="high">High Exposure Risk</option>
                    <option value="critical">Critical Vulnerability Exposure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase font-mono mb-1.5">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={caseTags}
                    onChange={(e) => setCaseTags(e.target.value)}
                    placeholder="e.g. Leak, GitHub, Executive"
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg p-2.5 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 font-mono hover:text-white rounded-lg uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold font-mono hover:bg-cyan-400 rounded-lg uppercase cursor-pointer"
                >
                  OPEN CASE FILE
                </button>
              </div>
            </form>
          </div>
        ) : activeCase ? (
          
          /* VIEW: CASE DETAILS EXPANSION */
          <div className="space-y-6">
            
            {/* Header profile cards */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 relative overflow-hidden shadow-lg backdrop-blur-md">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-cyan-400">
                Created: {new Date(activeCase.createdAt).toLocaleDateString()}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                  {activeCase.caseNumber}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 uppercase tracking-wide font-sans">{activeCase.name}</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{activeCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs font-mono text-gray-400 font-mono">
                <div>
                  Target Entity: <b className="text-white select-all">{activeCase.target}</b>
                </div>
                <div>
                  Exposure Severity: <span className={`uppercase font-bold ${
                    activeCase.riskLevel === "critical" ? "text-red-400" :
                    activeCase.riskLevel === "high" ? "text-amber-400" :
                    activeCase.riskLevel === "medium" ? "text-blue-400" :
                    "text-gray-400"
                  }`}>{activeCase.riskLevel}</span>
                </div>
                <div>
                  Evidence Items: <b className="text-white">{evidenceList.length}</b>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1.5">
                  {activeCase.tags.map((t, idx) => (
                    <span key={idx} className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-mono border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onDeleteCase(activeCase.id)}
                  className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">DESTROY FILE</span>
                </button>
              </div>
            </div>

            {/* Evidentiary Index List */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
              <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase border-b border-white/10 pb-3 mb-4">
                Evidence Repository Log
              </h4>

              {loadingDetails ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono animate-pulse">
                  Querying database tables...
                </div>
              ) : evidenceList.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  No evidence indicators secured. Run searches in the investigation suite and secure them here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-[#00E5FF]/20 transition-all flex justify-between items-start gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon based on evidence type */}
                        <div className={`p-2 rounded mt-0.5 shrink-0 uppercase tracking-widest text-[9px] font-mono font-bold ${
                          ev.type === "username" ? "bg-amber-500/10 text-amber-400" :
                          ev.type === "domain" ? "bg-blue-500/10 text-blue-400" :
                          ev.type === "email" ? "bg-pink-500/10 text-pink-400" :
                          "bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {ev.type === "username" && <AtSign className="w-4 h-4" />}
                          {ev.type === "domain" && <Globe className="w-4 h-4" />}
                          {ev.type === "email" && <Mail className="w-4 h-4" />}
                          {ev.type !== "username" && ev.type !== "domain" && ev.type !== "email" && <Link className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white select-all font-mono truncate">{ev.value}</span>
                            <span className={`text-[8px] px-1 rounded uppercase font-bold font-mono border ${
                              ev.riskLevel === "critical" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                              ev.riskLevel === "high" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              "bg-[#0B0F19] border-white/10 text-gray-400"
                            }`}>
                              {ev.riskLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300">{ev.notes}</p>
                          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                            <span>Source: {ev.source}</span>
                            <span>•</span>
                            <span>Secured: {new Date(ev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Case Timeline Logs */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
              <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase border-b border-white/10 pb-3 mb-4">
                Case Chronology Logs
              </h4>

              {timelineEvents.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono">No actions logged in chronology.</p>
              ) : (
                <div className="relative border-l border-slate-800/80 pl-4 space-y-4 py-2">
                  {timelineEvents.map((tm) => (
                    <div key={tm.id} className="relative">
                      {/* Chronology Dot */}
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0B0F19] ${
                        tm.category === "risk_escalation" ? "bg-red-500" :
                        tm.category === "intel_link" ? "bg-cyan-400" :
                        "bg-gray-500"
                      }`} />
                      
                      <div className="text-xs">
                        <span className="text-[10px] font-mono text-gray-400">{new Date(tm.timestamp).toLocaleString()}</span>
                        <h5 className="font-semibold text-white mt-0.5">{tm.title}</h5>
                        <p className="text-gray-300 mt-0.5 font-sans">{tm.description}</p>
                        <p className="text-[10px] font-mono text-cyan-400 uppercase mt-0.5">Source: {tm.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Evidence Injector */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
              <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase border-b border-white/10 pb-3 mb-4">
                Manual Evidence Addition
              </h4>

              <form onSubmit={handleManualEvidenceSubmit} className="space-y-4 text-xs text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase font-mono mb-1.5">Indicator Type</label>
                    <select
                      value={manualEvType}
                      onChange={(e) => setManualEvType(e.target.value as any)}
                      className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2.5 text-white focus:outline-none"
                    >
                      <option value="username">Username Handle</option>
                      <option value="domain">Domain Identifier</option>
                      <option value="email">Email Contact</option>
                      <option value="website">Web Endpoint / Port</option>
                      <option value="person">Person Profile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase font-mono mb-1.5">Indicator Value</label>
                    <input
                      type="text"
                      required
                      value={manualEvValue}
                      onChange={(e) => setManualEvValue(e.target.value)}
                      placeholder="e.g. cobalt-dev / target.com"
                      className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase font-mono mb-1.5">Evidence Source</label>
                    <input
                      type="text"
                      value={manualEvSource}
                      onChange={(e) => setManualEvSource(e.target.value)}
                      placeholder="e.g. Dark Web Archives / Passive Forums"
                      className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase font-mono mb-1.5">Evidence Notes</label>
                    <input
                      type="text"
                      value={manualEvNotes}
                      onChange={(e) => setManualEvNotes(e.target.value)}
                      placeholder="Enter details regarding discovery context..."
                      className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-mono rounded-lg hover:bg-cyan-500/30 transition-all cursor-pointer uppercase font-semibold"
                  >
                    ADD EVIDENCE TO FILE
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          /* Landing case: No case selected */
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl py-24 text-center shadow-lg backdrop-blur-md">
            <Folder className="w-12 h-12 text-[#00E5FF]/40 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">No Case Selected</h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Select an active Case File from the left portfolio index, or register a new one.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
