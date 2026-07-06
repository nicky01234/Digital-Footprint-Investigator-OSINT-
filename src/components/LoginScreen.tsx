/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Lock, Mail, User, ShieldAlert, Award, FileText } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [role, setRole] = useState<"Investigator" | "Admin">("Investigator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initializing login triggers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister 
      ? { name, email, password, role, badgeNumber }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication procedure failed.");
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Connection to secure authentication server failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = (type: "admin" | "analyst") => {
    if (type === "admin") {
      setEmail("admin@osint.io");
      setPassword("admin");
      setIsRegister(false);
    } else {
      setEmail("investigator@osint.io");
      setPassword("investigator");
      setIsRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] bg-radial-[circle_at_center,rgba(0,229,255,0.05)_0%,rgba(11,15,25,0)_70%] flex flex-col items-center justify-center p-4">
      
      {/* Absolute Decorative Grid Backing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0B0F19]/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Neon Border Accent Top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide text-center uppercase font-sans">
            Digital Footprint Investigator
          </h1>
          <p className="text-xs text-cyan-400 font-mono tracking-widest mt-1 uppercase">
            OSINT Intelligence Suite
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs text-gray-400 font-mono uppercase mb-1.5">Investigator Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sgt. Evelyn Miller"
                    className="w-full bg-[#0d1323] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono uppercase mb-1.5">Badge/Auth Identifier</label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. BADGE-2026"
                    className="w-full bg-[#0d1323] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono uppercase mb-1.5">Assigned Security Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("Investigator")}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border uppercase transition-all ${
                      role === "Investigator"
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "bg-[#0d1323] border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Investigator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Admin")}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border uppercase transition-all ${
                      role === "Admin"
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "bg-[#0d1323] border-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Admin Analyst
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-gray-400 font-mono uppercase mb-1.5">Secure Email Contact</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@osint.io"
                className="w-full bg-[#0d1323] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono uppercase mb-1.5">Authorization Secret Phrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0d1323] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#060913] text-sm font-semibold py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#060913] border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              "REGISTER BADGE"
            ) : (
              "START INVESTIGATION"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isRegister ? "Already registered? Login" : "Enroll investigator badge"}
          </button>
        </div>

        {/* Quick Demo Login Credentials Panel */}
        <div className="mt-6 p-4 bg-slate-950/40 rounded-xl border border-slate-800/40">
          <p className="text-[10px] text-cyan-400/70 font-mono uppercase mb-2 tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> SECURE DEMO TEST CREDENTIALS
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleDemoCredentials("analyst")}
              className="py-1 px-2 bg-[#0d1323] border border-slate-800 rounded text-gray-300 hover:border-cyan-500/30 transition-all font-mono"
            >
              Investigator Login
            </button>
            <button
              onClick={() => handleDemoCredentials("admin")}
              className="py-1 px-2 bg-[#0d1323] border border-slate-800 rounded text-gray-300 hover:border-cyan-500/30 transition-all font-mono"
            >
              Admin Login
            </button>
          </div>
        </div>

        <p className="text-[9px] text-gray-500 text-center mt-6 uppercase tracking-widest font-mono">
          Strictly authorized personnel only. All access logged.
        </p>

      </motion.div>
    </div>
  );
}
