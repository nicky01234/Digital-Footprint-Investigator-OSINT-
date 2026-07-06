/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, Terminal, Clock, ShieldCheck } from "lucide-react";

interface AuditLogViewProps {
  token: string;
}

export default function AuditLogView({ token }: AuditLogViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/audit-logs", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve security logs.");
      }

      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Unauthorized or connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg backdrop-blur-md">
      
      {/* Header action panel */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div>
          <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[#00E5FF]" />
            <span>Security Audit Log Registry</span>
          </h4>
          <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.5">ADMIN SECURITY OPERATIONS RECORD</p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer uppercase font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-xs text-gray-400 font-mono animate-pulse uppercase tracking-wider">
          Querying audit log archives...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-mono">
          Audit registry empty. All operations clear.
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 font-mono">
          {logs.map((l) => (
            <div
              key={l.id}
              className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-[#00E5FF]/10 transition-all"
            >
              <div className="flex items-start md:items-center gap-3">
                <div className={`p-1.5 rounded shrink-0 ${
                  l.action === "USER_LOGIN" ? "bg-emerald-500/10 text-emerald-400" :
                  l.action === "CASE_CREATION" ? "bg-cyan-500/10 text-cyan-400" :
                  l.action === "CASE_DELETE" ? "bg-red-500/10 text-red-400" :
                  "bg-white/5 text-gray-400"
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">{l.action}</span>
                    <span className="text-[10px] text-gray-400">by {l.user}</span>
                  </div>
                  <p className="text-gray-300 text-[11px] font-sans leading-tight">{l.details}</p>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0 font-mono">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-500 font-mono uppercase text-center pt-2 border-t border-white/10">
        Logs comply with NIST-800-OSINT governance requirements.
      </p>

    </div>
  );
}
