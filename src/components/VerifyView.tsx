/**
 * EchoProof Verification Engine
 * Cryptographic SHA-256 File Integrity Verification against Certified Records
 * Team Straw Hats (IIT Patna)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Search, 
  FileCheck2, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw,
  Info,
  Check,
  X,
  FileAudio
} from 'lucide-react';
import { DigitalCertificate, VerificationResult } from '../types';
import { calculateSha256, formatBytes, formatDuration, truncateHash } from '../utils/crypto';
import { findCertificate } from '../utils/storage';

interface VerifyViewProps {
  initialCertificate?: DigitalCertificate | null;
  certificates: DigitalCertificate[];
  onNavigateToCertificates: () => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  initialCertificate,
  certificates,
  onNavigateToCertificates
}) => {
  const [certInputId, setCertInputId] = useState(initialCertificate?.id || '');
  const [matchedCertificate, setMatchedCertificate] = useState<DigitalCertificate | null>(
    initialCertificate || null
  );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialCertificate) {
      setCertInputId(initialCertificate.id);
      setMatchedCertificate(initialCertificate);
    }
  }, [initialCertificate]);

  // Handle Certificate ID input lookup
  const handleLookupCertificate = (id: string) => {
    setCertInputId(id);
    const found = findCertificate(id);
    setMatchedCertificate(found);
    setVerificationResult(null);
  };

  // Handle File Upload and Hash Calculation
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsHashing(true);
    setVerificationResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const hash = await calculateSha256(buffer);
      setUploadedHash(hash);

      // If a certificate is already chosen, run verification immediately
      if (matchedCertificate) {
        verifyHashes(hash, matchedCertificate);
      } else {
        // Try auto-matching by hash across stored certificates
        const autoMatch = findCertificate(hash);
        if (autoMatch) {
          setMatchedCertificate(autoMatch);
          setCertInputId(autoMatch.id);
          verifyHashes(hash, autoMatch);
        }
      }
    } catch (err) {
      console.error('Failed to hash uploaded file', err);
    } finally {
      setIsHashing(false);
    }
  };

  const verifyHashes = (audioHash: string, cert: DigitalCertificate) => {
    const isMatch = audioHash.toLowerCase() === cert.sha256Hash.toLowerCase();

    setVerificationResult({
      status: isMatch ? 'MATCH' : 'MISMATCH',
      uploadedHash: audioHash,
      certifiedHash: cert.sha256Hash,
      certificate: cert,
      message: isMatch
        ? 'The uploaded file matches the certified recording.'
        : 'The uploaded file does not match the certified recording.',
      timestamp: new Date().toISOString()
    });
  };

  const handleRunVerify = () => {
    if (!uploadedHash) return;
    if (!matchedCertificate) {
      setVerificationResult({
        status: 'NOT_FOUND',
        uploadedHash,
        message: 'No matching digital certificate found for this ID or hash.',
        timestamp: new Date().toISOString()
      });
      return;
    }
    verifyHashes(uploadedHash, matchedCertificate);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadedHash('');
    setVerificationResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Title */}
      <div className="border-b border-[#172230] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase font-mono">
          VERIFY RECORDING
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Check whether a recording matches its certified integrity record.
        </p>
      </div>

      {/* Dual Input Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step 1: Upload Audio for Verification */}
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141d28] pb-3">
            <div className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
              1
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                UPLOAD AUDIO
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Calculate live SHA-256 digest
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a,.ogg,.webm,.flac,audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded border-2 border-dashed border-[#1e2a3b] hover:border-cyan-500/40 bg-[#060a0e] hover:bg-[#090e15] transition-all cursor-pointer text-center space-y-2"
            >
              <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
              <div className="font-mono text-xs font-semibold text-slate-300 uppercase">
                CHOOSE AUDIO FILE
              </div>
              <div className="text-[11px] text-slate-400">
                WAV, MP3, M4A, OGG, WEBM
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded bg-[#060a0e] border border-[#141e2b] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileAudio className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{uploadedFile.name}</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-200 text-[10px]"
                >
                  CHANGE
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{formatBytes(uploadedFile.size)}</span>
              </div>

              <div className="pt-1">
                <div className="text-[10px] text-slate-400">LIVE COMPUTED SHA-256:</div>
                <div className="p-1.5 rounded bg-[#040608] border border-[#101722] text-[11px] text-cyan-300 break-all select-all mt-0.5">
                  {isHashing ? 'Computing cryptographic digest...' : uploadedHash}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Enter / Select Certificate ID */}
        <div className="p-5 rounded bg-[#090d13] border border-[#172230] space-y-4">
          <div className="flex items-center justify-between border-b border-[#141d28] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                2
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  ENTER CERTIFICATE ID
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Select or type certified record ID
                </div>
              </div>
            </div>

            {certificates.length > 0 && (
              <span className="text-[10px] font-mono text-slate-400">
                {certificates.length} available
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="CERT-EP-YYYYMM-XXXXX or SHA-256..."
                value={certInputId}
                onChange={(e) => handleLookupCertificate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded bg-[#060a0e] border border-[#172230] focus:border-cyan-500/50 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Quick dropdown or select from existing certificates */}
            {certificates.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400">QUICK SELECT FROM CERTIFICATES:</div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {certificates.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleLookupCertificate(c.id)}
                      className={`w-full p-1.5 rounded border text-left text-xs font-mono flex items-center justify-between transition-colors ${
                        matchedCertificate?.id === c.id
                          ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#060a0e] border-[#131b26] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate max-w-[60%]">{c.id}</span>
                      <span className="text-[10px] text-slate-400 truncate">{c.recordingName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchedCertificate && (
              <div className="p-3 rounded bg-[#060a0e] border border-[#141e2b] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Recording:</span>
                  <span className="font-semibold truncate max-w-[60%]">{matchedCertificate.recordingName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">EchoDNA:</span>
                  <span className="text-cyan-300">{matchedCertificate.echoDnaId}</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1">
                  CERTIFIED HASH:
                  <div className="text-slate-300 break-all bg-[#040608] p-1 rounded font-mono mt-0.5">
                    {matchedCertificate.sha256Hash}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {uploadedFile && matchedCertificate && !verificationResult && (
        <button
          id="btn-run-verification"
          onClick={handleRunVerify}
          className="w-full py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold tracking-wider uppercase transition-colors"
        >
          COMPARE RECORDING DIGEST &amp; VERIFY INTEGRITY
        </button>
      )}

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-6 rounded border space-y-4 font-mono ${
            verificationResult.status === 'MATCH'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                  verificationResult.status === 'MATCH'
                    ? 'bg-emerald-900/80 border border-emerald-500/50 text-emerald-400'
                    : 'bg-red-900/80 border border-red-500/50 text-red-400'
                }`}
              >
                {verificationResult.status === 'MATCH' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="text-base font-bold uppercase tracking-wider">
                  {verificationResult.status === 'MATCH' ? '✓ INTEGRITY VERIFIED' : '! INTEGRITY MISMATCH'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {verificationResult.message}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 uppercase">
              {new Date(verificationResult.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Hash comparison details */}
          <div className="p-3.5 rounded bg-black/40 border border-white/10 space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Uploaded File Digest:</span>
              <div className="text-slate-200 break-all select-all font-mono">
                {verificationResult.uploadedHash}
              </div>
            </div>

            {verificationResult.certifiedHash && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Certified Ledger Digest:</span>
                <div className="text-slate-200 break-all select-all font-mono">
                  {verificationResult.certifiedHash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Clarification Callout Note */}
      <div className="p-4 rounded bg-[#090d13] border border-[#172230] space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>IMPORTANT: AUTHENTICITY ASSESSMENT vs FILE INTEGRITY</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          A matching SHA-256 hash verifies that the uploaded audio file matches the exact bit-for-bit certified artifact without any modification or re-compression. It certifies provenance and tamper-evidence, but does <strong className="text-slate-300">not</strong> inherently prove that the original speaker was human. Authenticity is evaluated during the initial acoustic signal analysis.
        </p>
      </div>
    </div>
  );
};
