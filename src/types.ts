/**
 * EchoProof Domain Types
 * Voice Authenticity and Provenance Verification Platform
 * Team Straw Hats (IIT Patna) - Utkarsh & Devansh
 */

export type NavigationTab = 
  | 'overview' 
  | 'analyze' 
  | 'certificates' 
  | 'verify' 
  | 'forensics' 
  | 'defend' 
  | 'educate';

export type SignalCategoryScore = 'CONSISTENT' | 'LOW' | 'MODERATE' | 'ELEVATED';

export type RiskLevel = 'LOWER RISK' | 'MODERATE RISK' | 'ELEVATED RISK' | 'HIGH RISK';

export interface SignalFindings {
  speechCharacteristics: string;
  spectralBehaviour: string;
  temporalConsistency: string;
  backgroundConsistency: string;
  syntheticIndicators: string;
}

export interface SignalMetrics {
  speechCharacteristicsStatus: SignalCategoryScore;
  spectralBehaviourStatus: SignalCategoryScore;
  temporalConsistencyStatus: SignalCategoryScore;
  backgroundConsistencyStatus: SignalCategoryScore;
  syntheticIndicatorsStatus: SignalCategoryScore;
}

export interface FlaggedSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  signal: string;
  reason: string;
  risk: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
}

export interface AcousticAnalysis {
  rmsEnergy: number;
  spectralCentroidHz: number;
  zeroCrossingRate: number;
  crestFactorDb: number;
  clippingRate: number;
  dynamicRangeDb: number;
  pitchEstimateHz?: number;
  snrEstimateDb?: number;
}

export interface AuthenticityAssessment {
  assessment: number; // 0-100 authenticity confidence score
  riskLevel: RiskLevel;
  signalFindings: SignalFindings;
  signalMetrics: SignalMetrics;
  explanation: string;
  detailedExplanations: {
    speechCharacteristics: string;
    spectralBehaviour: string;
    temporalConsistency: string;
    backgroundConsistency: string;
    syntheticIndicators: string;
  };
  flaggedSegments: FlaggedSegment[];
  isDemoMode: boolean;
  modelUsed?: string;
  acousticAnalysis?: AcousticAnalysis;
  analyzedAt: string;
}

export interface EchoDNAData {
  id: string; // EPD-XXXX-XXXX-XXXX-XXXX
  createdAt: string;
  sha256Hash: string;
  acousticChecksum: string;
  entropyScore: number;
  spectralFingerprint: string[];
}

export interface AudioMetadata {
  filename: string;
  fileSize: number; // in bytes
  format: string; // e.g. WAV, MP3, M4A, OGG
  duration: number; // in seconds
  sampleRate: number; // in Hz (e.g. 44100, 48000)
  channels: number; // 1 (mono), 2 (stereo)
  bitDepth?: number;
  mimeType: string;
  sha256Hash: string;
}

export interface DigitalCertificate {
  id: string; // CERT-EP-XXXXX-XXXX
  echoDnaId: string;
  recordingName: string;
  fileSize: number;
  format: string;
  duration: number;
  sampleRate: number;
  channels: number;
  sha256Hash: string;
  createdAt: string;
  assessmentScore: number;
  riskLevel: RiskLevel;
  integrityStatus: 'RECORDED' | 'VERIFIED' | 'REVOKED';
  issuer: string;
  summary: string;
  qrCodeDataUrl?: string;
}

export interface ActiveAudioRecord {
  file: Blob;
  metadata: AudioMetadata;
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  acousticAnalysis?: AcousticAnalysis;
  echoDNA?: EchoDNAData;
  assessment?: AuthenticityAssessment;
  certificate?: DigitalCertificate;
}

export interface VerificationResult {
  status: 'MATCH' | 'MISMATCH' | 'NOT_FOUND' | 'ERROR';
  uploadedHash: string;
  certifiedHash?: string;
  certificate?: DigitalCertificate;
  message: string;
  timestamp: string;
}
