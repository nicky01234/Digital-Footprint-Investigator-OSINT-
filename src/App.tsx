/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Case, SearchHistoryItem, User } from "./types";

// Component imports
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import InvestigatorSuite from "./components/InvestigatorSuite";
import CasesView from "./components/CasesView";
import RelationshipGraph from "./components/RelationshipGraph";
import ReportCompiler from "./components/ReportCompiler";
import AuditLogView from "./components/AuditLogView";
import AboutHelpView from "./components/AboutHelpView";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("osint_token"));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState(true);

  // Core Data sets
  const [cases, setCases] = useState<Case[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>("");

  // Quick investigation bridge
  const [quickSearch, setQuickSearch] = useState<{ query: string; type: any } | null>(null);

  // 1. Initial Identity check on load
  useEffect(() => {
    const verifyIdentity = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Load app metrics
          await Promise.all([fetchCases(token), fetchHistory(token)]);
        } else {
          // Token expired, clear
          handleLogout();
        }
      } catch (err) {
        console.error("Connection failed verifying identity token:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyIdentity();
  }, [token]);

  // Fetch Cases from API
  const fetchCases = async (authToken = token) => {
    if (!authToken) return;
    try {
      const response = await fetch("/api/cases", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const casesList = await response.json();
        setCases(Array.isArray(casesList) ? casesList : []);
        if (casesList.length > 0 && !activeCaseId) {
          setActiveCaseId(casesList[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to sync cases database:", e);
    }
  };

  // Fetch History from API
  const fetchHistory = async (authToken = token) => {
    if (!authToken) return;
    try {
      const response = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const historyList = await response.json();
        setHistory(Array.isArray(historyList) ? historyList : []);
      }
    } catch (e) {
      console.error("Failed to sync search history log:", e);
    }
  };

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    localStorage.setItem("osint_token", newToken);
    setToken(newToken);
    setUser(loggedUser);
    fetchCases(newToken);
    fetchHistory(newToken);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("osint_token");
    setToken(null);
    setUser(null);
    setCases([]);
    setHistory([]);
    setActiveCaseId("");
  };

  // 2. Case Operations API synchronizations
  const handleCreateCase = async (name: string, description: string, target: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', tags: string[]) => {
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, target, riskLevel, tags }),
      });

      if (response.ok) {
        const newCase = await response.json();
        setCases((prev) => [...prev, newCase]);
        setActiveCaseId(newCase.id);
      }
    } catch (err) {
      console.error("Error creating investigation case record:", err);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCases((prev) => prev.filter((c) => c.id !== caseId));
        if (activeCaseId === caseId) {
          setActiveCaseId("");
        }
      }
    } catch (err) {
      console.error("Failed to delete case file from database table:", err);
    }
  };

  const handleAddEvidence = async (caseId: string, type: string, value: string, source: string, notes: string, data: any) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, value, source, notes, tags: [], riskLevel: "medium", data }),
      });

      if (response.ok) {
        // Refresh cases metrics to update evidence counters
        await fetchCases();
      }
    } catch (err) {
      console.error("Failed to secure evidence log:", err);
    }
  };

  // 3. Search history operations API synchronizations
  const handleAddHistory = async (query: string, type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website') => {
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, type }),
      });

      if (response.ok) {
        await fetchHistory();
      }
    } catch (err) {
      console.error("Error logging query history:", err);
    }
  };

  const handleToggleFavoriteHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}/favorite`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchHistory();
      }
    } catch (err) {
      console.error("Failed to favorite history log:", err);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete query history:", err);
    }
  };

  const handleQuickSearchRedirect = (query: string, type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website') => {
    setQuickSearch({ query, type });
    setActiveTab("investigate");
  };

  // Main Canvas Content Switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            cases={cases}
            history={history}
            onToggleFavorite={handleToggleFavoriteHistory}
            onDeleteHistory={handleDeleteHistory}
            onNavigateToTab={setActiveTab}
            onSelectCase={setActiveCaseId}
            onQuickSearch={handleQuickSearchRedirect}
          />
        );
      case "investigate":
        return (
          <InvestigatorSuite
            cases={cases}
            token={token || ""}
            onAddEvidence={handleAddEvidence}
            onAddHistory={handleAddHistory}
            quickSearchInitial={quickSearch}
          />
        );
      case "cases":
        return (
          <CasesView
            cases={cases}
            activeCaseId={activeCaseId}
            token={token || ""}
            onSelectCase={setActiveCaseId}
            onCreateCase={handleCreateCase}
            onDeleteCase={handleDeleteCase}
            onAddEvidence={handleAddEvidence}
          />
        );
      case "graph":
        return (
          <RelationshipGraph
            cases={cases}
            activeCaseId={activeCaseId}
            token={token || ""}
          />
        );
      case "reports":
        return (
          <ReportCompiler
            cases={cases}
            activeCaseId={activeCaseId}
            token={token || ""}
          />
        );
      case "audit":
        return <AuditLogView token={token || ""} />;
      case "help":
        return <AboutHelpView />;
      default:
        return (
          <div className="py-20 text-center text-gray-500 font-mono text-xs">
            SELECT MODULE SUITE.
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
          Establishing Secure Handshake...
        </p>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!token || !user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#060913] text-gray-100 flex overflow-hidden">
      
      {/* Sidebar Rail Menu */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "investigate") {
            setQuickSearch(null); // clear search redirects
          }
        }}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header details banner */}
        <header className="bg-[#0B0F19]/60 border-b border-slate-800/80 px-8 py-4 shrink-0 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs font-semibold font-mono tracking-widest uppercase text-cyan-400">
              {activeTab === "dashboard" && "Central command dashboard"}
              {activeTab === "investigate" && "Lawful intelligence analyzer"}
              {activeTab === "cases" && "Case file registries & indexes"}
              {activeTab === "graph" && "Interactive relationship link analysis"}
              {activeTab === "reports" && "Compliance report compiler"}
              {activeTab === "audit" && "Security operations log register"}
              {activeTab === "help" && "OSINT Handbook training manual"}
            </h2>
          </div>

          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
            UTC Time: {new Date().toISOString().substring(11, 19)} • SECURE REGISTRY: LIVE
          </div>
        </header>

        {/* Scrollable Canvas area */}
        <div className="flex-1 overflow-y-auto p-8 bg-radial-[circle_at_top_right,rgba(0,229,255,0.02)_0%,transparent_60%]">
          {renderTabContent()}
        </div>

      </main>
    </div>
  );
}
