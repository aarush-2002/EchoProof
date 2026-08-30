/**
 * EchoProof Voice Integrity Analysis Workspace
 * Waveform, Spectrogram, Authenticity Assessment, Explainable Results, Flagged Segments, EchoDNA & Certification
 * Team Straw Hats (IIT Patna)
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Fingerprint, 
  Copy, 
  Check, 
  FileCheck2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Flag, 
  Info,
  Clock,
  HardDrive,
  Cpu,
  Sparkles
} from 'lucide-react';
import { ActiveAudioRecord, FlaggedSegment, SignalCategoryScore } from '../types';
import { formatBytes, formatDuration, truncateHash } from '../utils/crypto';
import { AudioPlayerWaveform } from './AudioPlayerWaveform';
import { SpectrogramViewer } from './SpectrogramViewer';

interface AnalysisWorkspaceProps {
  record: ActiveAudioRecord;
  onCreateCertificate: () => void;
  onNavigateToCertificates: () => void;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  record,
  onCreateCertificate,
  onNavigateToCertificates
}) => {
  const [activeVizTab, setActiveVizTab] = useState<'waveform' | 'spectrogram'>('waveform');
  const [copiedEchoDna, setCopiedEchoDna] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<FlaggedSegment | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<{ [key: string]: boolean }>({});

  const { metadata, assessment, echoDNA, certificate } = record;

  if (!assessment || !echoDNA) {
    return null;
  }

  const handleCopy = (text: string, type: 'dna' | 'hash') => {
    navigator.clipboard.writeText(text);
    if (type === 'dna') {
      setCopiedEchoDna(true);
      setTimeout(() => setCopiedEchoDna(false), 2000);
    } else {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const toggleDetail = (key: string) => {
    setExpandedDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper for Category status badge colors
  const getStatusBadge = (status: SignalCategoryScore) => {
    switch (status) {
      case 'CONSISTENT':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'LOW':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
      case 'MODERATE':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'ELEVATED':
        return 'bg-red-950/70 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getRiskScoreTheme = (score: number) => {
    if (score >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-500/30' };
    if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-500/30' };
    return { text: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-500/30' };
  };

  const scoreTheme = getRiskScoreTheme(assessment.assessment);

  const signalCategories: {
    id: keyof typeof assessment.signalFindings;
    label: string;
    status: SignalCategoryScore;
  }[] = [
    { id: 'speechCharacteristics', label: 'Speech Characteristics', status: assessment.signalMetrics.speechCharacteristicsStatus },
    { id: 'spectralBehaviour', label: 'Spectral Behaviour', status: assessment.signalMetrics.spectralBehaviourStatus },
    { id: 'temporalConsistency', label: 'Temporal Consistency', status: assessment.signalMetrics.temporalConsistencyStatus },
    { id: 'backgroundConsistency', label: 'Background Consistency', status: assessment.signalMetrics.backgroundConsistencyStatus },
    { id: 'syntheticIndicators', label: 'Synthetic Indicators', status: assessment.signalMetrics.syntheticIndicatorsStatus },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Workspace Header Strip */}
      <div className="p-4 rounded bg-[#090d13] border border-[#16212e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wide">
            <span>VOICE INTEGRITY ANALYSIS</span>
            <span>•</span>
            <span className="text-slate-400 font-normal">{metadata.filename}</span>
          </div>
          <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-3 mt-1">
            <span>Duration: <strong className="text-slate-200">{formatDuration(metadata.duration)}</strong></span>
            <span>•</span>
            <span>Format: <strong className="text-slate-200">{metadata.format}</strong></span>
            <span>•</span>
            <span>Size: <strong className="text-slate-200">{formatBytes(metadata.fileSize)}</strong></span>
            <span>•</span>
            <span>Rate: <strong className="text-slate-200">{metadata.sampleRate} Hz</strong></span>
            <span>•</span>
            <span>Channels: <strong className="text-slate-200">{metadata.channels === 1 ? '1 (Mono)' : '2 (Stereo)'}</strong></span>
          </div>
        </div>

        {/* Status Mode Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {assessment.isDemoMode ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DEMO MODE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE AI ENGINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#090d12] p-1 rounded border border-[#182332]">
            <button
              id="tab-view-waveform"
              onClick={() => setActiveVizTab('waveform')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeVizTab === 'waveform'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>WAVEFORM</span>
            </button>

            <button
              id="tab-view-spectrogram"
              onClick={() => setActiveVizTab('spectrogram')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeVizTab === 'spectrogram'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SPECTROGRAM</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {activeVizTab === 'waveform' ? 'Interactive Time Domain Scrubbing' : 'FFT Frequency Domain Energy'}
          </div>
        </div>

        {activeVizTab === 'waveform' ? (
          <AudioPlayerWaveform
            audioBuffer={record.audioBuffer}
            audioUrl={record.audioUrl}
            duration={metadata.duration}
            flaggedSegments={assessment.flaggedSegments}
            selectedSegmentId={selectedSegment?.id}
            onSelectSegment={(seg) => setSelectedSegment(seg)}
          />
        ) : (
          <SpectrogramViewer
            audioBuffer={record.audioBuffer}
            duration={metadata.duration}
          />
        )}
      </div>

      {/* Flagged Segments Section */}
      <div className="p-4 rounded bg-[#090d13] border border-[#16212e] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              FLAGGED SEGMENTS
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {assessment.flaggedSegments.length === 0 ? '0 FLAGGED' : `${assessment.flaggedSegments.length} FLAGGED SECTION(S)`}
          </span>
        </div>

        {assessment.flaggedSegments.length === 0 ? (
          <div className="p-3 rounded bg-[#060a0e] border border-[#131b26] text-xs font-mono text-slate-400 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>No segments flagged. Audio envelope exhibits continuous acoustic progression.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {assessment.flaggedSegments.map((seg) => {
              const isSelected = selectedSegment?.id === seg.id;
              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegment(isSelected ? null : seg)}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500/40 text-slate-200'
                      : 'bg-[#060a0e] border-[#16212e] hover:border-amber-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#101824] border border-[#1e2a3b] text-cyan-300 font-bold">
                        {formatDuration(seg.startTime)} - {formatDuration(seg.endTime)}
                      </span>
                      <span className="font-semibold text-slate-200">{seg.signal}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-300 text-[10px]">
                      {seg.risk} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {seg.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Authenticity Assessment Panel & Why This Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Assessment Score Card */}
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] flex flex-col justify-between space-y-4">
          <div>
            <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              AUTHENTICITY ASSESSMENT
            </div>

            {/* Score & Risk classification */}
            <div className={`p-4 rounded border ${scoreTheme.bg} ${scoreTheme.border} text-center space-y-1 mb-4`}>
              <div className={`font-mono text-4xl font-extrabold ${scoreTheme.text}`}>
                {assessment.assessment} <span className="text-xl text-slate-500 font-normal">/ 100</span>
              </div>
              <div className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
                {assessment.riskLevel}
              </div>
            </div>

            {/* Signal Categories Breakdown */}
            <div className="space-y-2">
              {signalCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded bg-[#060a0e] border border-[#131b26] text-xs font-mono"
                >
                  <span className="text-slate-300">{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getStatusBadge(cat.status)}`}>
                    {cat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory subtle disclaimer */}
          <div className="p-3 rounded bg-[#05080c] border border-[#121a24] text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              This is an analytical assessment based on available audio signals, not absolute proof of origin.
            </span>
          </div>
        </div>

        {/* Right 2 Columns: Explainable Results (Why This Result?) */}
        <div className="lg:col-span-2 p-5 rounded bg-[#090d13] border border-[#172230] space-y-4">
          <div className="flex items-center justify-between border-b border-[#141d28] pb-3">
            <div>
              <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                WHY THIS RESULT?
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Explainable signal decomposition and acoustic telemetry
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              {assessment.modelUsed || 'EchoProof Forensics Engine'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#060a0e] p-3 rounded border border-[#131b26]">
            {assessment.explanation}
          </p>

          {/* Detailed signal explanations accordion */}
          <div className="space-y-2.5">
            {signalCategories.map((cat) => {
              const isExpanded = !!expandedDetails[cat.id];
              const summaryText = assessment.signalFindings[cat.id];
              const detailText = assessment.detailedExplanations[cat.id];

              return (
                <div
                  key={cat.id}
                  className="rounded bg-[#060a0e] border border-[#141e2b] overflow-hidden"
                >
                  <button
                    onClick={() => toggleDetail(String(cat.id))}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-[#090e15] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-200">
                        {cat.label}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getStatusBadge(cat.status)}`}>
                        {cat.status}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="px-3 pb-3 pt-1 text-xs text-slate-400 border-t border-[#0d141e]">
                    <p className="text-slate-300">{summaryText}</p>
                    {isExpanded && detailText && (
                      <div className="mt-2 pt-2 border-t border-[#121922] font-mono text-[11px] text-cyan-300/80 bg-[#040609] p-2 rounded">
                        <strong className="text-slate-400">Deep telemetry: </strong>
                        {detailText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EchoDNA Fingerprint & Certification Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* EchoDNA Fingerprint Card */}
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-4">
          <div className="flex items-center justify-between border-b border-[#141d28] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Fingerprint className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                  ECHODNA
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Recording fingerprint
                </div>
              </div>
            </div>

            <button
              id="copy-echodna-btn"
              onClick={() => handleCopy(echoDNA.id, 'dna')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101722] hover:bg-[#162130] border border-[#1e2a3b] text-xs font-mono text-cyan-300 transition-colors"
            >
              {copiedEchoDna ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEchoDna ? 'COPIED' : 'COPY ECHODNA'}</span>
            </button>
          </div>

          {/* Dynamic EchoDNA ID */}
          <div className="p-3.5 rounded bg-[#05080c] border border-cyan-500/30 text-center space-y-1">
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              DETERMINISTIC FINGERPRINT ID
            </div>
            <div className="font-mono text-base md:text-lg font-bold text-cyan-300 tracking-widest select-all">
              {echoDNA.id}
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-[#060a0e] border border-[#131b26]">
              <span className="text-slate-400">Created Timestamp:</span>
              <span className="text-slate-200">{new Date(echoDNA.createdAt).toLocaleTimeString()}</span>
            </div>

            <div className="p-2 rounded bg-[#060a0e] border border-[#131b26] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Audio SHA-256 Hash:</span>
                <button
                  onClick={() => handleCopy(echoDNA.sha256Hash, 'hash')}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-300 select-all break-all bg-[#040608] p-1.5 rounded font-mono">
                {echoDNA.sha256Hash}
              </div>
            </div>
          </div>
        </div>

        {/* Certify Recording Panel */}
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#141d28] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
                    CERTIFY RECORDING
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Provenance and integrity seal
                  </div>
                </div>
              </div>

              {certificate && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  CERTIFIED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Create a tamper-evident digital certificate binding this recording's cryptographic hash, EchoDNA fingerprint, and analytical telemetry.
            </p>

            <div className="mt-3 p-3 rounded bg-[#060a0e] border border-[#131b26] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">EchoDNA:</span>
                <span className="text-cyan-300 font-semibold">{echoDNA.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SHA-256 Digest:</span>
                <span className="text-slate-300">{truncateHash(echoDNA.sha256Hash, 6, 6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Integrity Status:</span>
                <span className="text-emerald-400 font-semibold">READY TO RECORD</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {certificate ? (
              <button
                id="view-created-cert-btn"
                onClick={onNavigateToCertificates}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-emerald-700 hover:bg-emerald-600 text-slate-950 font-mono text-xs font-bold transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-slate-950" />
                <span>VIEW CERTIFICATE #{certificate.id}</span>
              </button>
            ) : (
              <button
                id="create-certificate-btn"
                onClick={onCreateCertificate}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors shadow-xs"
              >
                <FileCheck2 className="w-4 h-4 text-slate-950" />
                <span>CREATE CERTIFICATE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
