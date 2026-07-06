/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Shield, LayoutDashboard, Search, Folder, 
  Network, FileText, Settings, Terminal, HelpCircle, LogOut, Award
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  user,
  onLogout,
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "investigate", label: "Investigation Suite", icon: Search },
    { id: "cases", label: "Case Registry", icon: Folder },
    { id: "graph", label: "Link Analysis", icon: Network },
    { id: "reports", label: "Report Exporter", icon: FileText },
  ];

  const adminItems = [
    { id: "audit", label: "Security Audit Logs", icon: Terminal },
  ];

  const bottomItems = [
    { id: "help", label: "OSINT Handbook", icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-[#0B0F19]/80 border-r border-white/10 p-5 flex flex-col justify-between h-screen shrink-0 relative backdrop-blur-xl shadow-2xl">
      
      {/* Top logo block */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="p-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.05)]">
            <Shield className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider font-sans uppercase">DF Investigator</h2>
            <p className="text-[10px] text-[#00E5FF] font-mono tracking-widest uppercase">OSINT SUITE</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest pl-2.5 mb-2">ANALYTICS & QUERY</p>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-mono transition-all uppercase cursor-pointer ${
                  isActive
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-[0_0_10px_rgba(0,229,255,0.03)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComponent className="w-4.5 h-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Admin specific routes */}
          {user?.role === "Admin" && (
            <div className="pt-4 space-y-1">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest pl-2.5 mb-2">ADMIN PRIVILEGES</p>
              {adminItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-mono transition-all uppercase cursor-pointer ${
                      isActive
                        ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Handbook route */}
          <div className="pt-4 space-y-1">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest pl-2.5 mb-2">EDUCATION</p>
            {bottomItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-mono transition-all uppercase cursor-pointer ${
                    isActive
                      ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent className="w-4.5 h-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Investigator bottom identity block */}
      <div className="space-y-4 pt-5 border-t border-white/10">
        {user && (
          <div className="flex gap-3 items-center bg-[#0B0F19]/60 border border-white/10 p-3 rounded-xl shadow-inner">
            <div className="p-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-lg text-[#00E5FF]">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate font-sans leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400 font-mono truncate">{user.badgeNumber}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-[#00E5FF]/80 uppercase tracking-wider">{user.role} STATUS</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout action */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all font-mono uppercase cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>LOGOUT SESSION</span>
        </button>
      </div>

    </div>
  );
}
