/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="bg-[#0f1b2e]/60 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.05)]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-cyan-400 font-mono tracking-wider">ETHICAL OSINT COMPLIANCE DIRECTIVE</span>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-500/15 text-cyan-400 rounded-full font-mono border border-cyan-500/30">
              LEGAL USE ONLY
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed font-sans">
            This platform facilitates investigations strictly restricted to <b>lawfully accessible</b> public resources. It contains no tools for hacking, unauthorized scanning, exploit testing, or breach-generation. Investigators are solely responsible for ensuring complete compliance with local laws, corporate data policy, and target site terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
