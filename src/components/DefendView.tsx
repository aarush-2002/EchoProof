/**
 * EchoProof Defend Console
 * Practical Voice Scam Defense Countermeasures, Call Verification Checklist & Protocols
 * Team Straw Hats (IIT Patna)
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  KeyRound, 
  CheckSquare, 
  Square, 
  AlertOctagon, 
  FileWarning, 
  HelpCircle,
  PhoneOff,
  UserCheck
} from 'lucide-react';

export const DefendView: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checklist = [
    {
      id: 'c1',
      title: 'Call Back on Verified Direct Channel',
      desc: 'Hang up immediately and dial the contact using a pre-saved, verified personal number or official switchboard.'
    },
    {
      id: 'c2',
      title: 'Request Pre-Agreed Family Safe Word',
      desc: 'Ask for a private passphrase established in advance during face-to-face conversations.'
    },
    {
      id: 'c3',
      title: 'Ask Context-Specific Trivia',
      desc: 'Ask a question only the real individual could answer that cannot be scraped from public social media.'
    },
    {
      id: 'c4',
      title: 'Refuse Instant Urgent Wire Requests',
      desc: 'Deepfake voice attacks almost always manufacture artificial urgency (kidnapping, arrest, emergency ransom).'
    },
    {
      id: 'c5',
      title: 'Capture Recording for EchoDNA Analysis',
      desc: 'If possible, record incoming voicemail or audio message to generate an EchoDNA forensic integrity assessment.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="border-b border-[#172230] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase font-mono">
          VOICE SCAM DEFENSE PROTOCOL
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Tactical countermeasures, operational protocols, and anti-cloning response checklists
        </p>
      </div>

      {/* Red Alert Banner */}
      <div className="p-4 rounded bg-red-950/40 border border-red-500/40 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
            PRIMARY RULE: NEVER WIRE FUNDS OR REVEAL OTPs BASED ON VOICE ALONE
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Modern neural voice cloning requires as little as 3 seconds of audio to clone timbre, accent, and inflection. Treat all unverified voice requests involving financial transactions or credentials as untrusted until out-of-band verification is complete.
          </p>
        </div>
      </div>

      {/* Interactive Verification Checklist */}
      <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-4">
        <div className="flex items-center justify-between border-b border-[#141d28] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              REAL-TIME CALL VERIFICATION CHECKLIST
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {Object.values(checkedItems).filter(Boolean).length} / {checklist.length} COMPLETE
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded border transition-colors cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                    : 'bg-[#060a0e] border-[#141e2b] hover:border-[#1e2d40] text-slate-300'
                }`}
              >
                <div className="mt-0.5 text-cyan-400">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div>
                  <div className={`font-mono text-xs font-semibold ${isChecked ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Word Protocols & Incident Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <KeyRound className="w-4 h-4" />
            <span>ESTABLISHING FAMILY SAFE WORDS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Establish a memorable, non-obvious word or phrase in person with your family, executive team, or colleagues. If someone calls claiming an emergency, ask them for the word. AI voice bots and cloned models cannot guess offline pre-shared secrets.
          </p>
        </div>

        <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
            <PhoneOff className="w-4 h-4" />
            <span>SUSPECTED SCAM INCIDENT RESPONSE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            1. Preserve recording audio artifacts without re-saving or transcoding.<br />
            2. Run EchoDNA analysis to capture acoustic metrics.<br />
            3. Issue an EchoProof Digital Certificate to preserve cryptographic chain of custody for cyber defense reporting.
          </p>
        </div>
      </div>
    </div>
  );
};
