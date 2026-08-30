/**
 * EchoProof Local Storage and Persistence Layer
 * Certificates, Analysis History, and Provenance Records
 * Team Straw Hats (IIT Patna)
 */

import { DigitalCertificate, ActiveAudioRecord, AuthenticityAssessment } from '../types';

const CERTIFICATES_STORAGE_KEY = 'echoproof_certificates_v1';
const RECENT_ANALYSES_STORAGE_KEY = 'echoproof_recent_analyses_v1';

export interface StoredAnalysisItem {
  id: string;
  filename: string;
  fileSize: number;
  duration: number;
  format: string;
  sha256Hash: string;
  echoDnaId: string;
  assessmentScore: number;
  riskLevel: string;
  analyzedAt: string;
  certificateId?: string;
}

/**
 * Retrieves all stored certificates
 */
export function getStoredCertificates(): DigitalCertificate[] {
  try {
    const raw = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new certificate
 */
export function saveCertificate(certificate: DigitalCertificate): void {
  try {
    const list = getStoredCertificates();
    const existingIdx = list.findIndex(c => c.id === certificate.id || c.sha256Hash === certificate.sha256Hash);
    if (existingIdx >= 0) {
      list[existingIdx] = certificate;
    } else {
      list.unshift(certificate);
    }
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save certificate to local storage', err);
  }
}

/**
 * Finds a certificate by ID or SHA-256 hash
 */
export function findCertificate(idOrHash: string): DigitalCertificate | null {
  const clean = idOrHash.trim().toLowerCase();
  const list = getStoredCertificates();
  return list.find(c => 
    c.id.toLowerCase() === clean || 
    c.sha256Hash.toLowerCase() === clean ||
    c.echoDnaId.toLowerCase() === clean
  ) || null;
}

/**
 * Deletes a certificate by ID
 */
export function deleteCertificate(id: string): void {
  try {
    const list = getStoredCertificates().filter(c => c.id !== id);
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete certificate', err);
  }
}

/**
 * Retrieves recent analyses history
 */
export function getRecentAnalyses(): StoredAnalysisItem[] {
  try {
    const raw = localStorage.getItem(RECENT_ANALYSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const getStoredHistory = getRecentAnalyses;

/**
 * Records an analysis to history
 */
export function saveRecentAnalysis(
  record: ActiveAudioRecord,
  assessment: AuthenticityAssessment,
  certificateId?: string
): void {
  try {
    const list = getRecentAnalyses();
    const item: StoredAnalysisItem = {
      id: `ana-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      filename: record.metadata.filename,
      fileSize: record.metadata.fileSize,
      duration: record.metadata.duration,
      format: record.metadata.format,
      sha256Hash: record.metadata.sha256Hash,
      echoDnaId: record.echoDNA?.id || 'EPD-UNBOUND',
      assessmentScore: assessment.assessment,
      riskLevel: assessment.riskLevel,
      analyzedAt: assessment.analyzedAt,
      certificateId
    };

    // Remove duplicates with same hash
    const filtered = list.filter(a => a.sha256Hash !== item.sha256Hash);
    filtered.unshift(item);
    // Cap at 20 items
    localStorage.setItem(RECENT_ANALYSES_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (err) {
    console.error('Failed to save analysis history', err);
  }
}

export function saveAnalysisToHistory(item: Partial<StoredAnalysisItem> & { filename: string; sha256Hash: string }): void {
  try {
    const list = getRecentAnalyses();
    const fullItem: StoredAnalysisItem = {
      id: item.id || `ana-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      filename: item.filename,
      fileSize: item.fileSize || 0,
      duration: item.duration || 0,
      format: item.format || 'WAV',
      sha256Hash: item.sha256Hash,
      echoDnaId: item.echoDnaId || 'EPD-UNBOUND',
      assessmentScore: item.assessmentScore || 80,
      riskLevel: item.riskLevel || 'LOWER RISK',
      analyzedAt: item.analyzedAt || new Date().toISOString(),
      certificateId: item.certificateId
    };

    const filtered = list.filter(a => a.sha256Hash !== fullItem.sha256Hash);
    filtered.unshift(fullItem);
    localStorage.setItem(RECENT_ANALYSES_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (err) {
    console.error('Failed to save analysis history item', err);
  }
}

/**
 * Clears analysis history
 */
export function clearRecentAnalyses(): void {
  try {
    localStorage.removeItem(RECENT_ANALYSES_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear analysis history', err);
  }
}
