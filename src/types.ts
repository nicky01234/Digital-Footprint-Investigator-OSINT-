/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Investigator';
  badgeNumber: string;
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  name: string;
  description: string;
  target: string;
  status: 'active' | 'closed' | 'archived';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: 'person' | 'username' | 'email' | 'domain' | 'metadata' | 'website';
  source: string;
  value: string;
  notes: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  data?: any; // Rich custom data payload from investigation APIs
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'discovery' | 'verification' | 'risk_escalation' | 'intel_link';
  source: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'person' | 'username' | 'domain' | 'email' | 'metadata' | 'website';
  timestamp: string;
  isFavorite: boolean;
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'person' | 'username' | 'email' | 'domain' | 'phone' | 'company' | 'ip' | 'website';
  details?: string;
  x?: number;
  y?: number;
}

export interface RelationshipLink {
  source: string;
  target: string;
  label?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  read: boolean;
}
