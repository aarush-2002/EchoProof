/**
 * EchoProof Overview / Dashboard Screen
 * Team Straw Hats (IIT Patna)
 */

import React from 'react';
import { 
  Upload, 
  Mic, 
  CheckCircle2, 
  Radio, 
  Binary, 
  FileCheck2, 
  ArrowRight, 
  Fingerprint, 
  Volume2, 
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';
import { StoredAnalysisItem } from '../utils/storage';
import { formatBytes, formatDuration, truncateHash } from '../utils/crypto';

interface OverviewViewProps {
  onStartUpload: () => void;
  onStartRecord: () => void;
  onOpenVerify: () => void;
  onLoadSample: (type: 'authentic_human' | 'synthetic_cloned') => void;
  recentAnalyses: StoredAnalysisItem[];
  onSelectRecentAnalysis: (item: StoredAnalysisItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onStartUpload,
  onStartRecord,
  onOpenVerify,
  onLoadSample,
  recentAnalyses,
  onSelectRecentAnalysis
}) => {
  const steps = [
    {
      num: '01',
      title: 'AUTHENTICATE',
      desc: 'Inspect vocal tract formants, temporal consistency, and neural synthesis artifacts.',
      icon: Radio,
    },
    {
      num: '02',
      title: 'BIND',
      desc: 'Generate deterministic EchoDNA acoustic fingerprint and SHA-256 recording digest.',
      icon: Fingerprint,
    },
    {
      num: '03',
      title: 'CERTIFY',
      desc: 'Issue a tamper-evident digital certificate with auditable verification metadata.',
      icon: FileCheck2,
    },
    {
      num: '04',
      title: 'VERIFY',
      desc: 'Perform exact cryptographic hash matching to prove file integrity against certificates.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Top Header Block */}
      <div className="border-b border-[#172230] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400">
            <span className="text-cyan-400 font-semibold">ECHOPROOF</span>
            <span>/</span>
            <span>VOICE INTEGRITY PLATFORM</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d141e] border border-[#1e2a3b]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-slate-200">
              ● SYSTEM READY
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 mb-3">
          Verify before you trust.
        </h1>
        <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
          Analyze a voice recording, establish provenance signals, generate an EchoDNA fingerprint, and verify its integrity against tamper-evident certificates.
        </p>

        {/* Primary Action Row */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            id="overview-upload-audio-btn"
            onClick={onStartUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-950" />
            <span>Upload Audio</span>
          </button>

          <button
            id="overview-record-audio-btn"
            onClick={onStartRecord}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#131b26] hover:bg-[#1a2533] border border-[#223145] text-slate-200 font-medium text-sm transition-colors"
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>Record Audio</span>
          </button>

          <button
            id="overview-verify-cert-btn"
            onClick={onOpenVerify}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#0d141e] hover:bg-[#141e2b] border border-[#1b2636] text-slate-300 font-medium text-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verify Certificate</span>
          </button>
        </div>
      </div>

      {/* Instant Demo Test Samples Loader Banner */}
      <div className="p-4 rounded bg-[#0a0f16] border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
              <span>HACKATHON DEMO CONTROLS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                1-CLICK EVALUATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              No audio file ready? Load synthesized forensic voice test samples to test the pipeline instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="load-authentic-sample-btn"
            onClick={() => onLoadSample('authentic_human')}
            className="text-xs font-mono px-3 py-1.5 rounded bg-[#101924] hover:bg-[#162232] border border-emerald-500/30 text-emerald-300 transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authentic Sample</span>
          </button>

          <button
            id="load-synthetic-sample-btn"
            onClick={() => onLoadSample('synthetic_cloned')}
            className="text-xs font-mono px-3 py-1.5 rounded bg-[#101924] hover:bg-[#162232] border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cloned Voice Sample</span>
          </button>
        </div>
      </div>

      {/* 4-Step Process Visualization */}
      <div>
        <div className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">
          SYSTEM PIPELINE
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded bg-[#0c1118] border border-[#182332] hover:border-[#223347] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {step.num}
                  </span>
                  <div className="w-6 h-6 rounded bg-[#121a24] flex items-center justify-center text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wide mb-1">
                  {step.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Analysis Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono tracking-wider text-slate-400 uppercase">
            RECENT ANALYSIS
          </div>
          {recentAnalyses.length > 0 && (
            <span className="text-[11px] font-mono text-slate-400">
              {recentAnalyses.length} RECORD{recentAnalyses.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="p-8 rounded bg-[#090d12] border border-[#16202c] text-center">
            <div className="w-10 h-10 rounded bg-[#101720] border border-[#1b2736] flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Binary className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-slate-300 mb-1">
              No recordings analyzed yet.
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Upload or record an audio sample above to start extracting acoustic signals and generating EchoDNA fingerprints.
            </p>
            <button
              onClick={onStartUpload}
              className="text-xs font-mono px-3 py-1.5 rounded bg-[#121922] hover:bg-[#1a2533] border border-[#213042] text-cyan-300 transition-colors inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Begin Analysis</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRecentAnalysis(item)}
                className="p-3.5 rounded bg-[#0a0f16] hover:bg-[#0e1520] border border-[#172230] hover:border-cyan-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#101720] border border-[#1b2636] flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-200 transition-colors truncate max-w-md">
                      {item.filename}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{item.format}</span>
                      <span>•</span>
                      <span>{formatBytes(item.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDuration(item.duration)}</span>
                      <span>•</span>
                      <span className="text-cyan-400/90">{item.echoDnaId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {item.assessmentScore} / 100
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          item.riskLevel === 'LOWER RISK'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SHA: {truncateHash(item.sha256Hash, 4, 4)}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
