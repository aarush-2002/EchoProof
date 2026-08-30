/**
 * EchoProof Educational Resource Center
 * Core concepts of Audio Forensics, Provenance, EchoDNA, and Cryptographic Verification
 * Team Straw Hats (IIT Patna)
 */

import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Fingerprint, 
  Binary, 
  ShieldCheck, 
  FileCheck2, 
  Radio,
  CheckCircle2
} from 'lucide-react';

export const EducateView: React.FC = () => {
  const cards = [
    {
      title: 'What is Voice Cloning?',
      icon: Sparkles,
      desc: 'Voice cloning uses neural vocoders and deep neural networks (e.g. diffusion models or autoregressive transformers) trained on reference audio to mimic a target speaker\'s pitch, timbre, formant structure, and cadence from arbitrary text or speech input.'
    },
    {
      title: 'What is Audio Provenance?',
      icon: Radio,
      desc: 'Audio provenance is the verifiable chain of custody, creation metadata, and acoustic integrity of a sound recording from the moment of capture. It establishes where, when, and how an audio artifact was recorded, preventing unauthorized substitution.'
    },
    {
      title: 'What is EchoDNA?',
      icon: Fingerprint,
      desc: 'EchoDNA is a deterministic acoustic fingerprinting algorithm developed by EchoProof. It binds frequency-domain formant distribution, spectral centroid harmonics, and bit-level cryptographic hashes into a unique, compact identifier (e.g. EPD-XXXX-XXXX).'
    },
    {
      title: 'What does SHA-256 do in EchoProof?',
      icon: Binary,
      desc: 'SHA-256 calculates a 256-bit cryptographic digest of the exact audio bytes. If even a single byte or sample in the audio file is modified, re-compressed, or clipped, the hash completely changes, providing mathematical proof of tampering.'
    },
    {
      title: 'What is Authenticity Assessment?',
      icon: ShieldCheck,
      desc: 'Authenticity Assessment is an analytical evaluation of biological vocal tract signals vs. neural vocoder artifacts (such as high-frequency phase smearing and robotic timing envelopes). It yields a risk score and signal consistency metrics rather than binary certainty.'
    },
    {
      title: 'What does Certificate Verification prove?',
      icon: CheckCircle2,
      desc: 'Verification proves that a specific audio file is identical bit-for-bit to the version registered in the certificate at the recorded timestamp. It proves integrity and provenance, enabling legal and forensic verification across organizations.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Title */}
      <div className="border-b border-[#172230] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase font-mono">
          AUDIO FORENSICS &amp; PROVENANCE GUIDE
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Essential concepts of voice verification, neural synthesis detection, and digital integrity
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded bg-[#090d13] border border-[#172230] hover:border-cyan-500/30 transition-colors space-y-2.5"
            >
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {card.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer attribution callout */}
      <div className="p-4 rounded bg-[#070b10] border border-[#141e2b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div>
          <span>Developed by </span>
          <strong className="text-slate-200">Team Straw Hats (IIT Patna)</strong>
          <span> — Utkarsh &amp; Devansh</span>
        </div>
        <div className="text-cyan-400/80">
          Trust the Voice. Verify the Reality.
        </div>
      </div>
    </div>
  );
};
