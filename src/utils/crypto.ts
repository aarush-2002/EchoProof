/**
 * Cryptographic and EchoDNA Fingerprinting Utilities
 * EchoProof - Team Straw Hats (IIT Patna)
 */

import { EchoDNAData, AcousticAnalysis } from '../types';

/**
 * Computes the real SHA-256 cryptographic hash of an ArrayBuffer
 */
export async function calculateSha256(arrayBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Deterministically generates an EchoDNA identifier based on SHA-256 and acoustic signal properties.
 * Format: EPD-XXXX-XXXX-XXXX-XXXX
 */
export function generateEchoDNA(
  sha256Hash: string,
  acousticAnalysis?: AcousticAnalysis,
  timestamp?: string
): EchoDNAData {
  const ts = timestamp || new Date().toISOString();
  
  // Extract portions of the SHA-256 hash
  const cleanHash = sha256Hash.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  const h1 = cleanHash.slice(0, 4) || '7F2A';
  const h2 = cleanHash.slice(4, 8) || '91C4';
  const h3 = cleanHash.slice(8, 12) || '8D7E';
  
  // Incorporate acoustic features into the 4th block if available
  let acousticHex = '31B6';
  if (acousticAnalysis) {
    const rawVal = Math.floor(
      (acousticAnalysis.spectralCentroidHz * 13 + 
       acousticAnalysis.rmsEnergy * 10000 + 
       acousticAnalysis.zeroCrossingRate * 5000) % 65535
    );
    acousticHex = rawVal.toString(16).toUpperCase().padStart(4, '0');
  }

  const echoId = `EPD-${h1}-${h2}-${h3}-${acousticHex}`;

  // Generate spectral fingerprint blocks for visual representation
  const spectralFingerprint: string[] = [];
  for (let i = 0; i < 8; i++) {
    const blockStart = (i * 4) % cleanHash.length;
    spectralFingerprint.push(cleanHash.slice(blockStart, blockStart + 4));
  }

  // Calculate approximate Shannon entropy of the hash for diagnostic display
  const entropy = calculateEntropy(cleanHash);

  return {
    id: echoId,
    createdAt: ts,
    sha256Hash: cleanHash.toLowerCase(),
    acousticChecksum: `AC-${acousticHex}`,
    entropyScore: entropy,
    spectralFingerprint
  };
}

/**
 * Returns just the EchoDNA string ID (e.g. EPD-XXXX-XXXX-XXXX-XXXX)
 */
export function generateEchoDnaId(
  sha256Hash: string,
  acousticAnalysis?: AcousticAnalysis
): string {
  return generateEchoDNA(sha256Hash, acousticAnalysis).id;
}

/**
 * Generates a unique Certificate ID in the format CERT-EP-YYYYMM-XXXXX
 */
export function generateCertificateId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `CERT-EP-${year}${month}-${randomHex}`;
}

/**
 * Shannon entropy calculation
 */
function calculateEntropy(str: string): number {
  const map: { [key: string]: number } = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    map[char] = (map[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in map) {
    const p = map[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format seconds to mm:ss format
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 10);
  if (seconds < 10) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${millis}s`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Truncate hash for compact UI display
 */
export function truncateHash(hash: string, lead = 8, tail = 8): string {
  if (!hash) return '';
  if (hash.length <= lead + tail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-tail)}`;
}
