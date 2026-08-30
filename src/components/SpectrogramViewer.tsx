/**
 * Real Audio Spectrogram Viewer Canvas
 * EchoProof - Team Straw Hats (IIT Patna)
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { computeSpectrogramMatrix } from '../utils/audioProcessor';
import { formatDuration } from '../utils/crypto';

interface SpectrogramViewerProps {
  audioBuffer?: AudioBuffer;
  duration: number;
}

export const SpectrogramViewer: React.FC<SpectrogramViewerProps> = ({
  audioBuffer,
  duration
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [colorMode, setColorMode] = useState<'cyber' | 'magma' | 'mono'>('cyber');

  // Compute 2D FFT matrix from actual buffer or fallback
  const spectrogramData = useMemo(() => {
    if (audioBuffer) {
      return computeSpectrogramMatrix(audioBuffer, 160, 64);
    }
    // Fallback matrix
    return Array.from({ length: 120 }, (_, t) =>
      Array.from({ length: 64 }, (_, f) => {
        const formant1 = Math.exp(-Math.pow(f - 12, 2) / 16);
        const formant2 = Math.exp(-Math.pow(f - 26, 2) / 25);
        const voiceGlottal = (Math.sin(t * 0.2) + 1) * 0.5;
        const noise = Math.random() * 0.08;
        return Math.min(1, Math.max(0, (formant1 + formant2 * 0.7) * voiceGlottal + noise));
      })
    );
  }, [audioBuffer]);

  // Color lookup helper
  const getColor = (value: number, mode: 'cyber' | 'magma' | 'mono'): [number, number, number] => {
    const v = Math.max(0, Math.min(1, value));
    if (mode === 'cyber') {
      // Dark Blue -> Cyan -> Bright Amber / White
      if (v < 0.3) {
        const t = v / 0.3;
        return [Math.floor(10 + 6 * t), Math.floor(18 + 70 * t), Math.floor(32 + 130 * t)];
      } else if (v < 0.7) {
        const t = (v - 0.3) / 0.4;
        return [Math.floor(16 + 220 * t), Math.floor(88 + 140 * t), Math.floor(162 - 100 * t)];
      } else {
        const t = (v - 0.7) / 0.3;
        return [Math.floor(236 + 19 * t), Math.floor(228 + 27 * t), Math.floor(62 + 193 * t)];
      }
    } else if (mode === 'magma') {
      // Black -> Purple -> Orange -> Yellow
      if (v < 0.33) {
        const t = v / 0.33;
        return [Math.floor(15 + 75 * t), Math.floor(10 + 10 * t), Math.floor(35 + 85 * t)];
      } else if (v < 0.66) {
        const t = (v - 0.33) / 0.33;
        return [Math.floor(90 + 130 * t), Math.floor(20 + 70 * t), Math.floor(120 - 60 * t)];
      } else {
        const t = (v - 0.66) / 0.34;
        return [Math.floor(220 + 35 * t), Math.floor(90 + 150 * t), Math.floor(60 + 100 * t)];
      }
    } else {
      // Monochromatic Forensic High-contrast
      const g = Math.floor(v * 255);
      return [g, g, g];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || spectrogramData.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#080c11';
    ctx.fillRect(0, 0, width, height);

    const numTime = spectrogramData.length;
    const numFreq = spectrogramData[0].length;
    const sliceWidth = width / numTime;
    const sliceHeight = height / numFreq;

    for (let t = 0; t < numTime; t++) {
      const slice = spectrogramData[t];
      for (let f = 0; f < numFreq; f++) {
        // High frequencies at top, low frequencies at bottom
        const mag = slice[f];
        const [r, g, b] = getColor(mag, colorMode);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        const x = t * sliceWidth;
        const y = height - (f + 1) * sliceHeight;
        ctx.fillRect(x, y, Math.ceil(sliceWidth), Math.ceil(sliceHeight));
      }
    }

    // Grid overlays and Frequency markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [spectrogramData, colorMode]);

  return (
    <div className="w-full bg-[#0a0e14] border border-[#172230] rounded p-4">
      {/* Canvas with Axis labels */}
      <div className="relative w-full h-44 rounded overflow-hidden border border-[#1b2736] flex">
        {/* Frequency Y-Axis Labels */}
        <div className="w-12 bg-[#070b10] border-r border-[#17212d] py-1.5 px-1 flex flex-col justify-between text-[9px] font-mono text-slate-400 select-none">
          <span>8.0 kHz</span>
          <span>4.0 kHz</span>
          <span>2.0 kHz</span>
          <span>1.0 kHz</span>
          <span>0 Hz</span>
        </div>

        {/* Spectrogram Canvas */}
        <div className="relative flex-1 h-full bg-[#05080c]">
          <canvas
            ref={canvasRef}
            width={640}
            height={176}
            className="w-full h-full block"
          />

          {/* Time axis footer on canvas */}
          <div className="absolute bottom-1 right-2 bg-black/60 px-1.5 py-0.5 rounded font-mono text-[9px] text-slate-300">
            00:00 — {formatDuration(duration)}
          </div>
        </div>
      </div>

      {/* Spectrogram Tools & Info */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">PALETTE:</span>
          <div className="flex items-center gap-1">
            {(['cyber', 'magma', 'mono'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setColorMode(m)}
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border transition-colors ${
                  colorMode === m
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#101720] border-[#1b2736] text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>FFT SPECTROGRAM (64 BINS)</span>
        </div>
      </div>
    </div>
  );
};
