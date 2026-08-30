/**
 * EchoProof Certificates Page
 * Manage, view, print, and verify generated provenance certificates
 * Team Straw Hats (IIT Patna)
 */

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  QrCode,
  FilePlus,
  ShieldCheck
} from 'lucide-react';
import { DigitalCertificate } from '../types';
import { formatBytes, formatDuration, truncateHash } from '../utils/crypto';
import { CertificateDocument } from './CertificateDocument';

interface CertificatesViewProps {
  certificates: DigitalCertificate[];
  onSelectCertificateToVerify: (cert: DigitalCertificate) => void;
  onDeleteCertificate: (id: string) => void;
  onNavigateToAnalyze: () => void;
  selectedCertId?: string | null;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  onSelectCertificateToVerify,
  onDeleteCertificate,
  onNavigateToAnalyze,
  selectedCertId
}) => {
  const [activeCertificate, setActiveCertificate] = useState<DigitalCertificate | null>(
    selectedCertId ? certificates.find(c => c.id === selectedCertId) || null : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCertificates = certificates.filter(cert => {
    const q = searchQuery.toLowerCase();
    return (
      cert.id.toLowerCase().includes(q) ||
      cert.recordingName.toLowerCase().includes(q) ||
      cert.echoDnaId.toLowerCase().includes(q) ||
      cert.sha256Hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="border-b border-[#172230] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase font-mono">
            DIGITAL CERTIFICATES
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Tamper-evident provenance certificates issued by EchoProof
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToAnalyze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-semibold transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>CERTIFY NEW AUDIO</span>
          </button>
        </div>
      </div>

      {/* If a Certificate is actively selected for full inspection */}
      {activeCertificate ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveCertificate(null)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            ← Back to all certificates
          </button>

          <CertificateDocument
            certificate={activeCertificate}
            onVerify={(cert) => onSelectCertificateToVerify(cert)}
            onClose={() => setActiveCertificate(null)}
          />
        </div>
      ) : (
        <>
          {/* Search bar when certificates exist */}
          {certificates.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Certificate ID, recording name, EchoDNA, or SHA-256..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded bg-[#090d13] border border-[#1a2636] focus:border-cyan-500/50 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          )}

          {/* Certificate List */}
          {certificates.length === 0 ? (
            <div className="p-10 rounded bg-[#090d12] border border-[#16202c] text-center space-y-3">
              <div className="w-12 h-12 rounded bg-[#101720] border border-[#1b2736] flex items-center justify-center text-slate-400 mx-auto">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-slate-200">
                No certificates created yet.
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Analyze a recording and click "CREATE CERTIFICATE" to generate an auditable digital evidence record with a QR code and SHA-256 seal.
              </p>
              <div className="pt-2">
                <button
                  onClick={onNavigateToAnalyze}
                  className="px-4 py-2 rounded bg-[#121922] hover:bg-[#182332] border border-[#213042] text-xs font-mono text-cyan-300 transition-colors inline-flex items-center gap-2"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Analyze &amp; Certify Audio</span>
                </button>
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-6 rounded bg-[#090d12] border border-[#16202c] text-center text-xs font-mono text-slate-400">
              No certificates match search criteria "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded bg-[#0a0f16] hover:bg-[#0d141e] border border-[#172230] hover:border-cyan-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div
                    onClick={() => setActiveCertificate(cert)}
                    className="flex-1 cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                        {cert.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                        {cert.integrityStatus}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-200 truncate max-w-md">
                      {cert.recordingName}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-2">
                      <span>{cert.format}</span>
                      <span>•</span>
                      <span>{formatBytes(cert.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDuration(cert.duration)}</span>
                      <span>•</span>
                      <span className="text-cyan-300/90 font-semibold">{cert.echoDnaId}</span>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 sm:shrink-0 justify-between md:justify-end border-t md:border-t-0 border-[#141c26] pt-2 md:pt-0">
                    <button
                      onClick={() => onSelectCertificateToVerify(cert)}
                      className="px-3 py-1.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Verify in integrity engine"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>VERIFY</span>
                    </button>

                    <button
                      onClick={() => setActiveCertificate(cert)}
                      className="px-3 py-1.5 rounded bg-[#121924] hover:bg-[#192434] border border-[#202e40] text-slate-300 text-xs font-mono transition-colors"
                    >
                      VIEW
                    </button>

                    <button
                      onClick={() => onDeleteCertificate(cert.id)}
                      className="p-1.5 rounded bg-[#10151c] hover:bg-red-950/50 text-slate-400 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
