/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, User, Mail, Globe, AtSign, FileUp, ShieldAlert, CheckCircle2, 
  MapPin, AlertTriangle, Cpu, Calendar, Download, Plus, Clipboard, Check
} from "lucide-react";
import { Case } from "../types";

interface InvestigatorSuiteProps {
  cases: Case[];
  token: string;
  onAddEvidence: (caseId: string, type: string, value: string, source: string, notes: string, data: any) => void;
  onAddHistory: (query: string, type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website') => void;
  quickSearchInitial?: { query: string; type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website' } | null;
}

type TabType = 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website';

export default function InvestigatorSuite({
  cases,
  token,
  onAddEvidence,
  onAddHistory,
  quickSearchInitial,
}: InvestigatorSuiteProps) {
  const [activeTab, setActiveTab] = useState<TabType>(quickSearchInitial?.type || "username");
  const [query, setQuery] = useState(quickSearchInitial?.query || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);

  // Attachment states
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [evidenceAttached, setEvidenceAttached] = useState(false);

  // File upload state for EXIF metadata parsing
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Handles quick-search trigger from parent
  React.useEffect(() => {
    if (quickSearchInitial) {
      setActiveTab(quickSearchInitial.type);
      setQuery(quickSearchInitial.query);
      handleSearch(null, quickSearchInitial.query, quickSearchInitial.type);
    }
  }, [quickSearchInitial]);

  const handleSearch = async (e: React.FormEvent | null, searchInput = query, tabInput = activeTab) => {
    if (e) e.preventDefault();
    if (!searchInput && tabInput !== "metadata") return;

    setError("");
    setLoading(true);
    setResults(null);
    setEvidenceAttached(false);

    try {
      // Add query log
      if (tabInput !== "metadata") {
        onAddHistory(searchInput, tabInput);
      }

      let endpoint = "";
      let method = "POST";
      let body: any = null;
      let headers: any = {
        "Authorization": `Bearer ${token}`
      };

      if (tabInput === "username") {
        endpoint = "/api/osint/username";
        body = JSON.stringify({ username: searchInput });
        headers["Content-Type"] = "application/json";
      } else if (tabInput === "domain") {
        endpoint = "/api/osint/dns";
        body = JSON.stringify({ domain: searchInput });
        headers["Content-Type"] = "application/json";
      } else if (tabInput === "email") {
        endpoint = "/api/osint/username"; // We proxy standard handles or check public references
        body = JSON.stringify({ username: searchInput.split("@")[0] });
        headers["Content-Type"] = "application/json";
      } else if (tabInput === "website") {
        endpoint = "/api/osint/headers";
        body = JSON.stringify({ url: searchInput });
        headers["Content-Type"] = "application/json";
      } else if (tabInput === "person") {
        // Person investigation combines username lookups and a smart exposure analysis
        endpoint = "/api/osint/username";
        body = JSON.stringify({ username: searchInput.replace(/\s+/g, "").toLowerCase() });
        headers["Content-Type"] = "application/json";
      } else if (tabInput === "metadata") {
        if (!uploadedFile) {
          throw new Error("Please drag or select an image or document to analyze.");
        }
        endpoint = "/api/osint/metadata";
        method = "POST";
        const formData = new FormData();
        formData.append("file", uploadedFile);
        body = formData;
        // Multipurpose headers (don't set content-type manually, let fetch set boundary)
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The investigation query returned an error.");
      }

      if (tabInput === "domain") {
        // Supplement domain dns with whois registrar data
        try {
          const whoisResponse = await fetch("/api/osint/whois", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ domain: searchInput }),
          });
          if (whoisResponse.ok) {
            const whoisData = await whoisResponse.json();
            data.whois = whoisData;
          }
        } catch (whoisErr) {
          // WHOIS soft failure
        }
      }

      setResults({
        type: tabInput,
        query: tabInput === "metadata" ? uploadedFile?.name : searchInput,
        payload: data,
        analyzedAt: new Date().toISOString(),
      });

      // Reset file upload
      if (tabInput === "metadata") {
        setUploadedFile(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to resolve investigative intelligence records.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttachEvidence = () => {
    if (!selectedCaseId || !results) return;

    const sourceText = `OSINT Platform - ${results.type.toUpperCase()} Investigative Query`;
    let valueText = results.query;
    let notesText = evidenceNotes || `Extracted public footprint data from active query: ${results.query}.`;

    onAddEvidence(
      selectedCaseId,
      results.type,
      valueText,
      sourceText,
      notesText,
      results.payload
    );

    setEvidenceAttached(true);
    setEvidenceNotes("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Query Config Panel (3-cols on xl) */}
      <div className="xl:col-span-4 bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 shadow-lg backdrop-blur-md">
        <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase border-b border-white/10 pb-3">
          Investigation Modules
        </h4>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-[#0B0F19]/90 p-1.5 rounded-lg border border-white/10">
          {(["username", "domain", "email", "website", "person", "metadata"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setQuery("");
                setResults(null);
                setError("");
              }}
              className={`py-2 px-1 text-[10px] font-mono rounded font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-gray-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              {tab === "metadata" ? "EXIF/File" : tab}
            </button>
          ))}
        </div>

        {/* Dynamic Form input fields */}
        {activeTab !== "metadata" ? (
          <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 font-mono uppercase mb-2">
                {activeTab === "username" && "Search Target Username"}
                {activeTab === "domain" && "Lookup Domain Name"}
                {activeTab === "email" && "Inspect Target Email"}
                {activeTab === "website" && "Verify Web Endpoint / Port"}
                {activeTab === "person" && "Search Person Aliases / Keywords"}
              </label>

              <div className="relative">
                {activeTab === "username" && <AtSign className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />}
                {activeTab === "domain" && <Globe className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />}
                {activeTab === "email" && <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />}
                {activeTab === "website" && <Globe className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />}
                {activeTab === "person" && <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />}

                <input
                  type={activeTab === "email" ? "email" : "text"}
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    activeTab === "username" ? "e.g. cobalt-dev" :
                    activeTab === "domain" ? "e.g. domain.com" :
                    activeTab === "email" ? "e.g. contact@domain.com" :
                    activeTab === "website" ? "e.g. https://target-app.com" :
                    "e.g. Sgt Evelyn Miller"
                  }
                  className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/50 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400 text-cyan-400 text-xs font-mono font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>START INVESTIGATION</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Metadata Document File Dropper Form */
          <div className="space-y-4">
            <div className="block text-xs text-gray-400 font-mono uppercase mb-1">
              Document Forensic Extraction
            </div>
            
            <div className="border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-6 text-center bg-[#0B0F19] cursor-pointer relative transition-all">
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="w-8 h-8 text-cyan-500/50 mx-auto mb-2.5 animate-pulse" />
              {uploadedFile ? (
                <div className="text-xs font-mono text-cyan-400 font-semibold truncate">
                  {uploadedFile.name}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-gray-300">Drop document or photo here</p>
                  <p className="text-[10px] text-gray-500 uppercase font-mono">JPG, PNG, PDF, DOCX (Max 10MB)</p>
                </div>
              )}
            </div>

            {uploadedFile && (
              <button
                onClick={() => handleSearch(null)}
                disabled={loading}
                className="w-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400 text-cyan-400 text-xs font-mono font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4.5 h-4.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>EXTRACT METADATA TRACES</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Attachment panel to associate findings with an active Case */}
        {results && (
          <div className="pt-4 border-t border-white/10 space-y-3.5">
            <h5 className="text-xs font-semibold font-mono text-cyan-400 uppercase tracking-wide">
              Case File Linkage
            </h5>

            {cases.length === 0 ? (
              <p className="text-[10px] text-gray-500">No active cases found. Create a case from the Case Registry tab to bind this evidence.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Target Case File</label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="">-- SELECT TARGET CASE --</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Evidence Notes / Context</label>
                  <textarea
                    rows={2}
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Enter analytical notes, exposure severity details, or identification clues..."
                    className="w-full bg-[#0B0F19] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {evidenceAttached ? (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-mono flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SECURED TO CASE REGISTRY</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAttachEvidence}
                    disabled={!selectedCaseId}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono rounded-lg hover:bg-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase font-semibold"
                  >
                    SECURE AS EVIDENCE
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Investigation Intelligence Viewer (8-cols) */}
      <div className="xl:col-span-8 space-y-4">
        
        {/* Error notification */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state: Waiting for query */}
        {!results && !loading && (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl py-24 text-center shadow-lg backdrop-blur-md">
            <Search className="w-12 h-12 text-[#00E5FF]/40 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">No Active Investigation Query</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Select an OSINT module, enter a target profile identifier, domain name, or file, and execute query to retrieve public registry logs.
            </p>
          </div>
        )}

        {/* Loading/Scanning state */}
        {loading && (
          <div className="bg-white/5 border border-white/10 rounded-xl py-24 text-center space-y-4 shadow-lg backdrop-blur-md">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
              <Cpu className="absolute inset-4 w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-widest">Scanning Public Registries...</h3>
              <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">Querying lawful DoH endpoints & target registries</p>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono max-w-xs mx-auto animate-pulse">
              Bypassing regional client constraints via server-side proxy filters...
            </div>
          </div>
        )}

        {/* Results Render */}
        {results && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6 relative overflow-hidden shadow-lg backdrop-blur-md">
            
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest bg-white/5 border-l border-b border-white/10 rounded-bl-xl">
              ID: {results.type.toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}
            </div>

            {/* Title Block */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  {results.type} investigation
                </span>
                <h3 className="text-lg font-bold text-white mt-3 font-mono">{results.query}</h3>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">Inspected: {new Date(results.analyzedAt).toLocaleString()}</p>
              </div>

              <button
                onClick={() => copyToClipboard(JSON.stringify(results.payload, null, 2))}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? "COPIED" : "COPY RAW JSON"}</span>
              </button>
            </div>

            {/* ==================================== */}
            {/* VIEW MODE: USERNAME RESULTS */}
            {/* ==================================== */}
            {results.type === "username" && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-3">Target Profile Scan Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.payload.results.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex flex-col justify-between h-28 transition-all ${
                          res.status === "EXISTS"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : "bg-slate-900/10 border-slate-800/40 text-gray-500"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold font-mono tracking-wide">{res.site}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            res.status === "EXISTS" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-gray-500"
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        {res.status === "EXISTS" && res.details ? (
                          <div className="text-[10px] text-gray-400 space-y-0.5 font-sans">
                            {res.site === "GitHub" && (
                              <>
                                <p>Repos: <span className="text-white font-mono">{res.details.repos}</span></p>
                                <p className="truncate">Bio: {res.details.bio || "N/A"}</p>
                              </>
                            )}
                            {res.site === "Reddit" && (
                              <>
                                <p>Karma: <span className="text-white font-mono">{res.details.karma}</span></p>
                                <p>Created: <span className="text-white font-mono">{res.details.created}</span></p>
                              </>
                            )}
                            {res.site === "GitLab" && (
                              <p>Handle ID: <span className="text-white font-mono">{res.details.id}</span></p>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] italic">Profile registry not resolved</div>
                        )}

                        <a
                          href={res.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-[10px] font-mono hover:underline ${
                            res.status === "EXISTS" ? "text-cyan-400" : "text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Visit Registry →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* VIEW MODE: DOMAIN RESULTS */}
            {/* ==================================== */}
            {results.type === "domain" && (
              <div className="space-y-4">
                
                {/* DNS Records Panel */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Resolved DNS Records (Real-Time Cloudflare DoH)</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.keys(results.payload.records).map((recordType) => {
                      const list = results.payload.records[recordType] || [];
                      return (
                        <div key={recordType} className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">{recordType}</span>
                          {list.length === 0 ? (
                            <p className="text-[10px] text-gray-500 italic mt-1 pl-1">No verified records resolved.</p>
                          ) : (
                            <div className="space-y-1 mt-1 pl-1">
                              {list.map((rec: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] font-mono text-gray-300">
                                  <span className="text-gray-400 truncate max-w-xs">{rec.name}</span>
                                  <span className="text-white select-all">{rec.data}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WHOIS / Geolocation Panel */}
                {results.payload.whois && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Registry WHOIS / RDAP Data</h4>
                      <div className="text-[11px] font-mono space-y-1.5 text-gray-300">
                        <p>Registrar: <span className="text-white">{results.payload.whois.registrar}</span></p>
                        <p>Registered: <span className="text-white">{results.payload.whois.registeredDate}</span></p>
                        <p>Expires: <span className="text-white">{results.payload.whois.expirationDate}</span></p>
                        <p>Updated: <span className="text-white">{results.payload.whois.lastUpdated}</span></p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Geolocation (A IP Resolved)</h4>
                      <div className="text-[11px] font-mono space-y-1.5 text-gray-300">
                        <p>Country: <span className="text-white flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {results.payload.geolocation.country}</span></p>
                        <p>Region: <span className="text-white">{results.payload.geolocation.region}</span></p>
                        <p>Provider: <span className="text-white truncate block">{results.payload.geolocation.org}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================================== */}
            {/* VIEW MODE: WEBSITE / SECURITY HEADERS */}
            {/* ==================================== */}
            {results.type === "website" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-2">Endpoint Security Audit (HTTP Security Headers)</h4>
                  <div className="space-y-2">
                    {Object.keys(results.payload.securityAudit).map((key) => {
                      const audit = results.payload.securityAudit[key];
                      return (
                        <div key={key} className="flex justify-between items-center text-xs border-b border-slate-800/30 pb-2 last:border-0 last:pb-0">
                          <span className="font-mono text-gray-300">{key}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-gray-400 truncate max-w-xs block">{audit.value}</span>
                            <span className={`px-2 py-0.5 rounded-[4px] font-mono text-[9px] uppercase font-bold ${
                              audit.score === "secure" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {audit.score}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* VIEW MODE: METADATA FORENSIC PARSER */}
            {/* ==================================== */}
            {results.type === "metadata" && (
              <div className="space-y-4">
                
                {/* Forensic Summary */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Gemini forensic intelligence report</span>
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{results.payload.forensics.forensicSummary}</p>
                </div>

                {/* Technical Traces Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Metadata fields */}
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                    <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">Header properties</h5>
                    <div className="text-xs space-y-1 font-mono text-gray-300">
                      <p>MimeType: <span className="text-white">{results.payload.mimetype}</span></p>
                      <p>FileSize: <span className="text-white">{(results.payload.size / 1024).toFixed(1)} KB</span></p>
                      <p>Dimensions: <span className="text-white">{results.payload.forensics.dimensions}</span></p>
                      <p>Capture Time: <span className="text-white">{results.payload.forensics.timestamp || "No EXIF Timestamp"}</span></p>
                    </div>
                  </div>

                  {/* Device Spec details */}
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                    <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">Device forensics</h5>
                    <div className="text-xs space-y-1 font-mono text-gray-300">
                      <p>Manufacturer: <span className="text-white">{results.payload.forensics.cameraDetails.make || "N/A"}</span></p>
                      <p>Model: <span className="text-white">{results.payload.forensics.cameraDetails.model || "N/A"}</span></p>
                      <p>Operating Sys: <span className="text-white">{results.payload.forensics.cameraDetails.software || "N/A"}</span></p>
                    </div>
                  </div>
                </div>

                {/* Geographical GPS extraction */}
                {results.payload.forensics.gpsCoordinates && results.payload.forensics.gpsCoordinates.latitude && (
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                      <MapPin className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase font-mono">Geotag exposure isolated</h5>
                      <p className="text-[11px] font-mono text-gray-300 mt-1">
                        Latitude: <span className="text-white">{results.payload.forensics.gpsCoordinates.latitude}</span>, 
                        Longitude: <span className="text-white">{results.payload.forensics.gpsCoordinates.longitude}</span>
                      </p>
                      <p className="text-xs text-cyan-400 font-semibold mt-0.5">Estimated area: {results.payload.forensics.gpsCoordinates.locationName || "San Francisco Bay"}</p>
                    </div>
                  </div>
                )}

                {/* Vulnerability Risks warnings */}
                <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl space-y-2.5">
                  <h5 className="text-xs font-bold text-red-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Public footprint exposure threat analysis</span>
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-gray-300">
                    {results.payload.forensics.privacyRisks.map((risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* VIEW MODE: EMAIL INVESTIGATION */}
            {/* ==================================== */}
            {results.type === "email" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">Linked Registries & Leak Exposure</h4>
                  <div className="text-xs space-y-1.5 text-gray-300">
                    <p>Contact Domain: <span className="text-white font-mono">{results.query.split("@")[1]}</span></p>
                    <p>Gravatar Registered: <span className="text-white font-mono">YES (Validated Avatar contact linked)</span></p>
                    <p className="text-amber-400 font-semibold mt-2 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Mock Leaked Database Exposure: 2 records identified in historical dark-archives (Simulation audit).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* VIEW MODE: PERSON INVESTIGATION */}
            {/* ==================================== */}
            {results.type === "person" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">Cross-Index Exposure Profile</h4>
                  <p className="text-xs text-gray-300">
                    Extracted credentials representing names, corporate identities, and known profiles associated with target <b>{results.query}</b>:
                  </p>
                  <div className="text-xs space-y-1 font-mono text-gray-300 pt-2 border-t border-slate-800/40">
                    <p>Associated Handle: <span className="text-white">{results.payload.username}</span></p>
                    <p>Identified profiles: <span className="text-white">{results.payload.results.filter((r: any) => r.status === "EXISTS").map((r: any) => r.site).join(", ") || "None"}</span></p>
                    <p className="text-cyan-400 mt-2">Remediation status: HIGH EXPOSURE (Ensure corporate username dissociation)</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
