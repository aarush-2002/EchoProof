/**
 * Interactive Audio Waveform & Player
 * EchoProof - Team Straw Hats (IIT Patna)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, Flag } from 'lucide-react';
import { FlaggedSegment } from '../types';
import { formatDuration } from '../utils/crypto';
import { generateWaveformData } from '../utils/audioProcessor';

interface AudioPlayerWaveformProps {
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  flaggedSegments?: FlaggedSegment[];
  duration: number;
  onSelectSegment?: (segment: FlaggedSegment) => void;
  selectedSegmentId?: string;
}

export const AudioPlayerWaveform: React.FC<AudioPlayerWaveformProps> = ({
  audioBuffer,
  audioUrl,
  flaggedSegments = [],
  duration,
  onSelectSegment,
  selectedSegmentId
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveData, setWaveData] = useState<number[]>([]);

  // Generate waveform peaks from buffer or fallback
  useEffect(() => {
    if (audioBuffer) {
      const peaks = generateWaveformData(audioBuffer, 300);
      setWaveData(peaks);
    } else {
      // Fallback synthetic wave peaks
      const synthPeaks = Array.from({ length: 200 }, (_, i) => {
        return Math.abs(Math.sin(i * 0.15) * 0.7 + Math.cos(i * 0.3) * 0.3) * (0.3 + Math.random() * 0.6);
      });
      setWaveData(synthPeaks);
    }
  }, [audioBuffer]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error('Audio playback error', e));
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().catch(e => console.error(e));
    }
  };

  // Canvas drawing loop
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const progress = duration > 0 ? currentTime / duration : 0;

    // Clear background
    ctx.fillStyle = '#080c11';
    ctx.fillRect(0, 0, width, height);

    // Center baseline
    ctx.strokeStyle = '#1a2430';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Time grid lines
    const numGridLines = 8;
    ctx.strokeStyle = '#121a24';
    ctx.fillStyle = '#475569';
    ctx.font = '9px monospace';
    for (let i = 1; i < numGridLines; i++) {
      const x = (i / numGridLines) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const timeSec = (i / numGridLines) * duration;
      ctx.fillText(formatDuration(timeSec), x + 4, height - 6);
    }

    // Draw Flagged Segments background highlights
    if (flaggedSegments && flaggedSegments.length > 0 && duration > 0) {
      flaggedSegments.forEach(seg => {
        const startX = (seg.startTime / duration) * width;
        const endX = (seg.endTime / duration) * width;
        const segWidth = Math.max(endX - startX, 4);

        const isSelected = seg.id === selectedSegmentId;
        ctx.fillStyle = isSelected 
          ? 'rgba(239, 68, 68, 0.25)' 
          : 'rgba(245, 158, 11, 0.15)';
        ctx.fillRect(startX, 0, segWidth, height);

        ctx.strokeStyle = isSelected ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, 0, segWidth, height);
      });
    }

    // Draw Waveform bars
    if (waveData.length > 0) {
      const barWidth = width / waveData.length;
      const progressX = progress * width;

      for (let i = 0; i < waveData.length; i++) {
        const x = i * barWidth;
        const peak = Math.max(0.04, waveData[i]);
        const barHeight = peak * (height * 0.85);
        const y = (height - barHeight) / 2;

        if (x <= progressX) {
          // Played section (Electric Cyan)
          ctx.fillStyle = '#06b6d4';
        } else {
          // Unplayed section (Subtle Slate)
          ctx.fillStyle = '#334155';
        }

        ctx.fillRect(x, y, Math.max(1.5, barWidth - 1), barHeight);
      }
    }

    // Draw Playhead line
    const playheadX = progress * width;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead indicator top triangle
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(playheadX - 4, 0);
    ctx.lineTo(playheadX + 4, 0);
    ctx.lineTo(playheadX, 6);
    ctx.closePath();
    ctx.fill();
  }, [currentTime, duration, waveData, flaggedSegments, selectedSegmentId]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Click / Scrub on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current || duration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="w-full bg-[#0a0e14] border border-[#172230] rounded p-4">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Waveform Canvas View */}
      <div className="relative w-full h-32 cursor-pointer select-none rounded overflow-hidden border border-[#1b2736]">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Flagged Markers Overlay Tags */}
        {flaggedSegments && flaggedSegments.length > 0 && duration > 0 && (
          <div className="absolute top-1.5 left-2 flex items-center gap-1.5 pointer-events-none">
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <Flag className="w-3 h-3 text-amber-400" />
              {flaggedSegments.length} FLAGGED SECTION{flaggedSegments.length > 1 ? 'S' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Controls and Time Display */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="audio-play-pause-button"
            onClick={togglePlay}
            disabled={!audioUrl}
            className="flex items-center justify-center w-8 h-8 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-colors disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            id="audio-restart-button"
            onClick={handleRestart}
            disabled={!audioUrl}
            className="flex items-center justify-center w-8 h-8 rounded bg-[#101720] hover:bg-[#16202c] border border-[#1e2a3b] text-slate-300 transition-colors disabled:opacity-40"
            title="Restart playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="ml-2 flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <span className="text-cyan-400">{formatDuration(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Clickable flagged markers quick seek pills */}
        {flaggedSegments.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50%] py-0.5">
            {flaggedSegments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = seg.startTime;
                    setCurrentTime(seg.startTime);
                  }
                  onSelectSegment?.(seg);
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                  selectedSegmentId === seg.id
                    ? 'bg-red-950/80 text-red-300 border-red-500/60'
                    : 'bg-amber-950/40 text-amber-300/90 border-amber-500/30 hover:bg-amber-950/70'
                }`}
              >
                @{formatDuration(seg.startTime)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <span>WAVEFORM</span>
        </div>
      </div>
    </div>
  );
};
