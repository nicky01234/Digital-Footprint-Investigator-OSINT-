/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Download, FileJson, Table, Printer, 
  ShieldAlert, Award, Calendar, CheckSquare, Info
} from "lucide-react";
import { Case, EvidenceItem, TimelineEvent } from "../types";

interface ReportCompilerProps {
  cases: Case[];
  activeCaseId: string;
  token: string;
}

export default function ReportCompiler({
  cases,
  activeCaseId,
  token,
}: ReportCompilerProps) {
  const [selectedCaseId, setSelectedCaseId] = useState(activeCaseId);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom Report Fields for the Executive Summary
  const [analystNote, setAnalystNote] = useState(
    "Exposure assessment indicates various public registry connections. Remediation is suggested for administrative logins."
  );
  const [conclusion, setConclusion] = useState(
    "The target footprint is partially exposed across developer registries. Recommend immediate key rotation."
  );

  useEffect(() => {
    if (activeCaseId) {
      setSelectedCaseId(activeCaseId);
    }
  }, [activeCaseId]);

  useEffect(() => {
    if (!selectedCaseId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const evRes = await fetch(`/api/cases/${selectedCaseId}/evidence`, { headers });
        const evData = await evRes.json();
        setEvidence(Array.isArray(evData) ? evData : []);

        const tmRes = await fetch(`/api/cases/${selectedCaseId}/timeline`, { headers });
        const tmData = await tmRes.json();
        setTimeline(Array.isArray(tmData) ? tmData : []);
      } catch (e) {
        console.error("Error fetching report data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCaseId, token]);

  const activeCase = cases.find((c) => c.id === selectedCaseId);

  // 1. Export JSON Data
  const exportJson = () => {
    if (!activeCase) return;
    const reportObj = {
      case: activeCase,
      executiveSummary: analystNote,
      remediationNotes: conclusion,
      evidenceList: evidence,
      chronologicalTimeline: timeline,
      compiledAt: new Date().toISOString(),
      standardsCompliance: "ISO-27001-OSINT",
    };

    const dataStr = JSON.stringify(reportObj, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const fileName = `${activeCase.caseNumber}-OSINT-INTEL.json`;

    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataUri);
    dlAnchor.setAttribute("download", fileName);
    dlAnchor.click();
  };

  // 2. Export CSV Data (Indicator lists)
  const exportCsv = () => {
    if (!activeCase || evidence.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Type,Source,Value,Notes,RiskLevel,CreatedAt\n";

    evidence.forEach((ev) => {
      const row = [
        ev.id,
        ev.type,
        `"${ev.source.replace(/"/g, '""')}"`,
        `"${ev.value.replace(/"/g, '""')}"`,
        `"${ev.notes.replace(/"/g, '""')}"`,
        ev.riskLevel,
        ev.createdAt
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const fileName = `${activeCase.caseNumber}-EVIDENCE-INDEX.csv`;

    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", encodedUri);
    dlAnchor.setAttribute("download", fileName);
    dlAnchor.click();
  };

  // 3. Print / Trigger Beautiful Browser Print PDF
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header Box */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            <span>Executive Report Compiler</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 font-mono uppercase mb-1.5">Selected Case Portfolio</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 focus:border-[#00E5FF]/40 rounded-lg p-2.5 text-white focus:outline-none font-mono cursor-pointer"
            >
              <option value="">-- SELECT CASE FILE --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <p className="text-gray-400 font-mono uppercase mb-1.5">Legal & Ethical Compliance Note</p>
            <div className="p-3 bg-[#0B0F19]/40 rounded-lg border border-white/10 text-[11px] leading-relaxed text-gray-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
              <span>
                Report output compiles lawfully verified footprint records. No offensive hacking triggers or illegal credential exploits are documented.
              </span>
            </div>
          </div>
        </div>
      </div>

      {activeCase ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left: Input parameters for Analyst Report notes (4-cols) */}
          <div className="xl:col-span-4 bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 text-xs shadow-lg backdrop-blur-md">
            <h5 className="text-xs font-bold font-mono text-[#00E5FF] uppercase tracking-wide border-b border-white/10 pb-2">
              Analyst Annotations
            </h5>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 uppercase font-mono mb-1.5">Executive Summary Findings</label>
                <textarea
                  rows={4}
                  value={analystNote}
                  onChange={(e) => setAnalystNote(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 focus:border-[#00E5FF]/40 rounded-lg p-2.5 text-white focus:outline-none font-sans leading-relaxed"
                  placeholder="Enter high-level summary of exposed targets, critical emails discovered, and overall leak risks..."
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-mono mb-1.5">Remediation Roadmap</label>
                <textarea
                  rows={4}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 focus:border-[#00E5FF]/40 rounded-lg p-2.5 text-white focus:outline-none font-sans leading-relaxed"
                  placeholder="Provide steps for dissociating usernames, rotating keys, and applying WHOIS registrar locks..."
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={triggerPrint}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-[#0B0F19] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all uppercase font-mono"
                >
                  <Printer className="w-4 h-4" />
                  <span>GENERATE PDF REPORT</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportJson}
                    className="py-2 px-3 bg-[#0B0F19] hover:bg-white/5 border border-white/10 hover:border-[#00E5FF]/20 text-gray-200 rounded-lg font-mono text-[10px] flex items-center justify-center gap-1.5 transition-all uppercase cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-pink-500" />
                    <span>EXPORT JSON</span>
                  </button>
                  <button
                    onClick={exportCsv}
                    disabled={evidence.length === 0}
                    className="py-2 px-3 bg-[#0B0F19] hover:bg-white/5 border border-white/10 hover:border-[#00E5FF]/20 text-gray-200 rounded-lg font-mono text-[10px] flex items-center justify-center gap-1.5 transition-all uppercase cursor-pointer disabled:opacity-40"
                  >
                    <Table className="w-3.5 h-3.5 text-emerald-500" />
                    <span>EXPORT CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Beautiful, Print-Optimized Report Preview (8-cols) */}
          <div className="xl:col-span-8 bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <h5 className="text-xs font-semibold font-mono text-[#00E5FF] uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
              Intelligence Briefing Preview
            </h5>

            {/* Print Container styled with printable rules */}
            <div id="osint-print-document" className="bg-white text-slate-900 p-8 rounded-xl max-w-2xl mx-auto shadow-2xl space-y-6 font-sans select-text">
              
              {/* Report Header block */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-600 font-mono text-[10px] uppercase tracking-widest font-bold">
                    <Award className="w-4 h-4" />
                    <span>RESTRICTED OSINT INTELLIGENCE</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 mt-1 uppercase tracking-tight">OSINT COMPLIANCE DOSSIER</h1>
                  <p className="text-xs font-mono text-slate-500 uppercase mt-1">CASE FILE REFERENCE: {activeCase.caseNumber}</p>
                </div>

                <div className="text-right text-xs font-mono text-slate-500">
                  <p>COMPILED: {new Date().toLocaleDateString()}</p>
                  <p>STATUS: ACTIVE ARCHIVE</p>
                </div>
              </div>

              {/* Case Profile details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded-lg text-xs border border-slate-200">
                <div>
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Case Portfolio Name</span>
                  <span className="font-bold text-slate-900 uppercase font-sans">{activeCase.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Target Identifier Key</span>
                  <span className="font-bold text-slate-900 font-mono">{activeCase.target}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Primary Footprint Risk Level</span>
                  <span className={`font-bold uppercase font-mono ${
                    activeCase.riskLevel === "critical" ? "text-red-600" :
                    activeCase.riskLevel === "high" ? "text-amber-600" : "text-blue-600"
                  }`}>{activeCase.riskLevel} EXPOSURE</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Standards Assurance</span>
                  <span className="font-bold text-slate-700 font-mono">ISO-27001-COMPLIANT</span>
                </div>
              </div>

              {/* Executive summary block */}
              <div className="space-y-2">
                <h3 className="text-xs font-black font-mono tracking-widest text-slate-950 uppercase border-b border-slate-200 pb-1">
                  1.0 Executive Findings Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed text-justify font-sans">{analystNote}</p>
              </div>

              {/* Discovered evidence list */}
              <div className="space-y-3">
                <h3 className="text-xs font-black font-mono tracking-widest text-slate-950 uppercase border-b border-slate-200 pb-1">
                  2.0 Discovered Footprint Indicators
                </h3>

                {evidence.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic font-mono">No evidence items attached yet.</p>
                ) : (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-mono">
                          <th className="p-2">Type</th>
                          <th className="p-2">Value / Indicator</th>
                          <th className="p-2">Threat Severity</th>
                          <th className="p-2">Discovery Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {evidence.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-800 uppercase">{ev.type}</td>
                            <td className="p-2 select-all text-slate-950">{ev.value}</td>
                            <td className={`p-2 font-bold uppercase ${
                              ev.riskLevel === "critical" ? "text-red-600" :
                              ev.riskLevel === "high" ? "text-amber-600" : "text-slate-700"
                            }`}>{ev.riskLevel}</td>
                            <td className="p-2 text-slate-500 font-sans">{ev.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Remediation Block */}
              <div className="space-y-2">
                <h3 className="text-xs font-black font-mono tracking-widest text-slate-950 uppercase border-b border-slate-200 pb-1">
                  3.0 Remediation Roadmap
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed text-justify font-sans">{conclusion}</p>
              </div>

              {/* Disclaimer footer */}
              <div className="pt-6 border-t border-slate-200 text-[9px] font-mono text-slate-400 text-center uppercase tracking-wider space-y-1">
                <p>This report compiles publicly available records retrieved under lawful investigation parameters.</p>
                <p>Digital Footprint Investigator Suite © 2026. All rights reserved.</p>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 border-dashed rounded-xl py-24 text-center shadow-lg backdrop-blur-md animate-pulse">
          <FileText className="w-12 h-12 text-[#00E5FF]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">No Active Case Selected</h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">Select an active Case File from the compiler options to build an intelligence briefing.</p>
        </div>
      )}

      {/* Embedded CSS rules for clean PDF printing outputs */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #osint-print-document, #osint-print-document * {
            visibility: visible;
          }
          #osint-print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5in;
            box-shadow: none;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

    </div>
  );
}
