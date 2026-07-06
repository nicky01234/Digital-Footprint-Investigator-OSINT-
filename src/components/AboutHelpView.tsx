/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Award, Shield, HelpCircle, BookOpen, Key, Info, 
  MapPin, Globe, AtSign, Compass, Cpu, FileText
} from "lucide-react";

export default function AboutHelpView() {
  return (
    <div className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
      
      {/* 1. Handbook Introduction Banner */}
      <div className="bg-gradient-to-br from-[#00E5FF]/15 to-blue-500/5 border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-lg backdrop-blur-md">
        <div className="absolute top-0 right-0 p-4 text-[#00E5FF]/10 opacity-30 select-none pointer-events-none">
          <Compass className="w-36 h-36" />
        </div>
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-widest font-bold">
            <BookOpen className="w-4 h-4" />
            <span>INVESTIGATOR TRAINING MANUAL</span>
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            Ethical Open Source Intelligence (OSINT) Foundations
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Welcome to the training handbook. OSINT refers to any intelligence gathered from lawful, publicly available repositories. Conducting audits safely and ethically protects organizational assets while respecting international data-privacy standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: OSINT Methodology */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 shadow-lg backdrop-blur-md">
          <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            <span>Ethical Investigation Code of Conduct</span>
          </h4>
          <ul className="space-y-3.5 text-xs text-gray-300 font-sans">
            <li className="flex gap-2.5 items-start">
              <span className="p-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded text-[10px] font-mono font-bold shrink-0">01</span>
              <div>
                <span className="font-semibold text-white block">Strict Public Availability Boundary</span>
                Inspect only indexed registries, DNS lookups, public APIs, and user-provided files. Never circumvent access authentication mechanisms.
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="p-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded text-[10px] font-mono font-bold shrink-0">02</span>
              <div>
                <span className="font-semibold text-white block">Respect Terms of Service (ToS)</span>
                Acknowledge and respect automated data scrapers, `robots.txt` disclaimers, rate limiting rules, and registry headers.
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="p-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded text-[10px] font-mono font-bold shrink-0">03</span>
              <div>
                <span className="font-semibold text-white block">Privacy-First Data Sanitization</span>
                Apply security filters to protect non-public personal information (PII). Clear evidence data permanently when cases archive.
              </div>
            </li>
          </ul>
        </div>

        {/* Module 2: Analysis Frameworks */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5 border-b border-white/10 pb-2">
            <HelpCircle className="w-4 h-4 text-[#00E5FF]" />
            <span>Analytical Frameworks Explained</span>
          </h4>
          
          <div className="space-y-3 text-xs text-gray-300">
            {/* DNS */}
            <div className="flex gap-3 items-start">
              <div className="p-1.5 bg-blue-500/10 rounded text-blue-400 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white font-mono block uppercase">DNS / WHOIS Lookup</span>
                <p className="mt-0.5 text-gray-400">DNS maps server routing paths (A, MX registers). WHOIS resolves registrar registry details. Safe audits look for missing locks or exposed nameservers.</p>
              </div>
            </div>

            {/* EXIF */}
            <div className="flex gap-3 items-start">
              <div className="p-1.5 bg-amber-500/10 rounded text-amber-400 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white font-mono block uppercase">File EXIF Traces</span>
                <p className="mt-0.5 text-gray-400">EXIF metadata is embedded in image/document headers. Captured devices leak software versions, GPS coordinates, and camera apertures that can compromise identities.</p>
              </div>
            </div>

            {/* Security Headers */}
            <div className="flex gap-3 items-start">
              <div className="p-1.5 bg-pink-500/10 rounded text-pink-400 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white font-mono block uppercase">HTTP Security Headers</span>
                <p className="mt-0.5 text-gray-400">Headers like Content-Security-Policy (CSP) prevent scripting injection. Auditing security headers flags exposed endpoints lacking active server-level protection.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ISO Compliance Standards list */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 shadow-lg backdrop-blur-md">
        <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5 border-b border-white/10 pb-2">
          <Award className="w-4 h-4 text-[#00E5FF]" />
          <span>Compliance Assurance Certificates</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#0B0F19]/40 border border-white/10 rounded-lg">
            <span className="font-bold text-[#00E5FF] font-mono text-[10px] block uppercase">NIST-SP-800-OSINT</span>
            <p className="text-gray-400 mt-1">Conforms to NIST standards for administrative accountability, data logging verification, and legal investigator audit pathways.</p>
          </div>
          <div className="p-3.5 bg-[#0B0F19]/40 border border-white/10 rounded-lg">
            <span className="font-bold text-[#00E5FF] font-mono text-[10px] block uppercase">ISO-27001 Assurance</span>
            <p className="text-gray-400 mt-1">Encourages strict storage controls, local SQLite-like encrypted caches, and investigator credentials segmentation.</p>
          </div>
          <div className="p-3.5 bg-[#0B0F19]/40 border border-white/10 rounded-lg">
            <span className="font-bold text-[#00E5FF] font-mono text-[10px] block uppercase">Ethical-AI Directives</span>
            <p className="text-gray-400 mt-1">AI-assisted report forensics leverage telemetry-guarded Gemini interfaces, preventing leakage of private document streams.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
