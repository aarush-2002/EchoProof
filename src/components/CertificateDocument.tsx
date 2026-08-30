/**
 * Digital Recording Certificate Document Component
 * Official Forensics Evidence Style
 * EchoProof - Team Straw Hats (IIT Patna)
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Fingerprint, 
  Copy, 
  Check 
} from 'lucide-react';
import { DigitalCertificate } from '../types';
import { formatBytes, formatDuration, truncateHash } from '../utils/crypto';

interface CertificateDocumentProps {
  certificate: DigitalCertificate;
  onVerify?: (cert: DigitalCertificate) => void;
  onClose?: () => void;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  onVerify,
  onClose
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Generate high resolution verification QR code
    const verificationPayload = JSON.stringify({
      id: certificate.id,
      echoDnaId: certificate.echoDnaId,
      sha256: certificate.sha256Hash,
      issuer: 'EchoProof (Straw Hats, IIT Patna)',
      verifyUrl: `${window.location.origin}/verify?certId=${certificate.id}`
    });

    QRCode.toDataURL(verificationPayload, {
      margin: 1,
      width: 160,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR code generation error', err));
  }, [certificate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${certificate.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(certificate.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printed) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#0d141e] p-3 rounded border border-[#1a2636]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-200">
            CERTIFICATE #{certificate.id}
          </span>
          <button
            onClick={handleCopyId}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-mono flex items-center gap-1"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'COPIED' : 'COPY ID'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onVerify && (
            <button
              onClick={() => onVerify(certificate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>VERIFY RECORDING</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131b26] hover:bg-[#1a2534] border border-[#233144] text-slate-200 text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131b26] hover:bg-[#1a2534] border border-[#233144] text-slate-200 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#18202c] hover:bg-[#202b3b] text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>

      {/* The Printable Digital Evidence Certificate Document */}
      <div className="print-card bg-[#090d13] text-slate-100 p-6 md:p-8 rounded border border-[#1f2d3d] space-y-6 font-mono relative overflow-hidden shadow-xl">
        {/* Subtle Watermark Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[90px] font-black text-white/[0.02] pointer-events-none select-none tracking-widest uppercase">
          ECHOPROOF
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-[#1e2a3b] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-lg font-bold tracking-widest uppercase">ECHOPROOF</span>
            </div>
            <div className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
              DIGITAL RECORDING CERTIFICATE
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              PROVENANCE RECORD &amp; CRYPTOGRAPHIC INTEGRITY BINDING
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[10px] text-slate-400 uppercase">CERTIFICATE ID</div>
            <div className="text-sm font-bold text-cyan-300 select-all">{certificate.id}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              ISSUED: {new Date(certificate.createdAt).toUTCString()}
            </div>
          </div>
        </div>

        {/* Main Certificate Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Left Metadata Column */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                RECORDING ARTIFACT
              </div>
              <div className="p-2.5 rounded bg-[#060a0e] border border-[#141e2b] text-slate-200 font-semibold truncate">
                {certificate.recordingName}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 px-1">
                <span>{certificate.format}</span>
                <span>•</span>
                <span>{formatBytes(certificate.fileSize)}</span>
                <span>•</span>
                <span>{formatDuration(certificate.duration)}</span>
                <span>•</span>
                <span>{certificate.sampleRate} Hz</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                ECHODNA FINGERPRINT
              </div>
              <div className="p-2.5 rounded bg-[#060a0e] border border-cyan-500/30 text-cyan-300 font-bold select-all tracking-wider">
                {certificate.echoDnaId}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                RECORDING SHA-256 HASH
              </div>
              <div className="p-2.5 rounded bg-[#060a0e] border border-[#141e2b] text-slate-300 font-mono text-[11px] select-all break-all leading-tight">
                {certificate.sha256Hash}
              </div>
            </div>
          </div>

          {/* Right Assessment & Verification Column */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                AUTHENTICITY ASSESSMENT RECORD
              </div>
              <div className="p-2.5 rounded bg-[#060a0e] border border-[#141e2b] flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Score &amp; Classification:</div>
                  <div className="text-sm font-bold text-slate-200">
                    {certificate.assessmentScore} / 100 — <span className="text-cyan-400">{certificate.riskLevel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">STATUS</div>
                  <div className="text-xs font-bold text-emerald-400">RECORDED</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                QR VERIFICATION CODE
              </div>
              <div className="p-3 rounded bg-[#060a0e] border border-[#141e2b] flex items-center gap-4">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Certificate QR Verification Code"
                    className="w-24 h-24 rounded border border-white/20 p-1 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                    Generating...
                  </div>
                )}
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Scan to verify recording against EchoProof provenance ledger. Includes immutable SHA-256 seal.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Disclaimer & Sign-off */}
        <div className="border-t border-[#1a2534] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400">
          <div>
            <div>ISSUER: {certificate.issuer || 'EchoProof Provenance Engine'}</div>
            <div className="text-slate-400">
              DEVELOPED BY TEAM STRAW HATS (IIT PATNA) — UTKARSH &amp; DEVANSH
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              INTEGRITY STATUS: RECORDED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
