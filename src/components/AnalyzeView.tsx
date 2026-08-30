/**
 * EchoProof Analyze View
 * Audio Upload, Live Microphone Recording & Real-time Processing
 * Team Straw Hats (IIT Patna)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  FileAudio, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  ShieldAlert,
  Binary,
  Loader2,
  HardDrive
} from 'lucide-react';
import { extractAudioData, getAudioContext } from '../utils/audioProcessor';
import { formatBytes, formatDuration, truncateHash } from '../utils/crypto';
import { ActiveAudioRecord } from '../types';

interface AnalyzeViewProps {
  onAnalyzeAudio: (file: Blob, filename: string, isSyntheticSample?: boolean) => void;
  isProcessing: boolean;
  processingStage: string;
  processingPercent: number;
  initialMode?: 'upload' | 'record';
  activeRecord?: ActiveAudioRecord | null;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  onAnalyzeAudio,
  isProcessing,
  processingStage,
  processingPercent,
  initialMode = 'upload',
  activeRecord
}) => {
  const [mode, setMode] = useState<'upload' | 'record'>(initialMode);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{
    duration: number;
    sampleRate: number;
    channels: number;
    sha256Hash: string;
    format: string;
    size: number;
  } | null>(null);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recording State
  const [micPermission, setMicPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioElemRef = useRef<HTMLAudioElement | null>(null);
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync mode if passed as initialMode
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    setSelectedFile(file);
    setIsDecodingFile(true);

    try {
      const { metadata } = await extractAudioData(file, file.name);
      setFileMetadata({
        duration: metadata.duration,
        sampleRate: metadata.sampleRate,
        channels: metadata.channels,
        sha256Hash: metadata.sha256Hash,
        format: metadata.format,
        size: file.size
      });
    } catch (err) {
      console.error('Failed to decode audio file', err);
      setUploadError('Unable to decode audio format. Please provide a standard WAV, MP3, M4A, or OGG file.');
      setFileMetadata(null);
    } finally {
      setIsDecodingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  // Start Real-time Microphone Recording with Web Audio Live Waveform Visualizer
  const startRecording = async () => {
    try {
      setUploadError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermission('granted');

      // Setup Web Audio Analyser for live visual feedback
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start live canvas animation
      drawLiveMicWaveform();

      // Start MediaRecorder
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedUrl(url);

        // Decode metadata
        try {
          const { metadata } = await extractAudioData(fullBlob, 'live_microphone_recording.webm');
          setFileMetadata({
            duration: metadata.duration,
            sampleRate: metadata.sampleRate,
            channels: metadata.channels,
            sha256Hash: metadata.sha256Hash,
            format: 'WEBM',
            size: fullBlob.size
          });
        } catch (e) {
          console.error(e);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: unknown) {
      console.error('Microphone error', err);
      setMicPermission('denied');
      setUploadError('Microphone permission was denied or microphone hardware is unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleReRecord = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setFileMetadata(null);
    setRecordDuration(0);
    startRecording();
  };

  // Live Microphone canvas visualizer
  const drawLiveMicWaveform = useCallback(() => {
    const canvas = micCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#070b10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  }, []);

  const handleStartAnalysis = () => {
    if (mode === 'upload' && selectedFile) {
      onAnalyzeAudio(selectedFile, selectedFile.name);
    } else if (mode === 'record' && recordedBlob) {
      onAnalyzeAudio(recordedBlob, 'live_microphone_recording.webm');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Title */}
      <div className="border-b border-[#172230] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase font-mono">
            VOICE INTEGRITY ANALYSIS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Ingest raw voice recording for acoustic feature extraction and EchoDNA binding
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#090d12] p-1 rounded border border-[#1b2636]">
          <button
            id="tab-upload-audio"
            onClick={() => {
              setMode('upload');
              setUploadError(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD AUDIO</span>
          </button>

          <button
            id="tab-record-audio"
            onClick={() => {
              setMode('record');
              setUploadError(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
              mode === 'record'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>RECORD AUDIO</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Mode 1: Audio Upload Area */}
      {mode === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 md:p-12 rounded border-2 border-dashed transition-all cursor-pointer text-center ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-[#1e2c3d] bg-[#090d12] hover:border-cyan-500/40 hover:bg-[#0c121a]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.m4a,.ogg,.webm,.flac,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded bg-[#101722] border border-[#1d2b3c] flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <div className="font-mono text-sm font-semibold text-slate-200 uppercase tracking-wider mb-1">
              DROP AUDIO FILE HERE
            </div>
            <div className="text-xs text-slate-400 mb-3">or click to browse from system</div>

            <button
              type="button"
              className="px-4 py-2 rounded bg-[#121a24] hover:bg-[#182332] border border-[#213247] text-xs font-mono text-cyan-300 transition-colors pointer-events-none"
            >
              CHOOSE FILE
            </button>

            <div className="mt-4 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-3">
              <span>SUPPORTED FORMATS:</span>
              <span className="text-slate-300">WAV</span>
              <span>•</span>
              <span className="text-slate-300">MP3</span>
              <span>•</span>
              <span className="text-slate-300">M4A</span>
              <span>•</span>
              <span className="text-slate-300">OGG</span>
              <span>•</span>
              <span className="text-slate-300">WEBM</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Live Recording Area */}
      {mode === 'record' && (
        <div className="p-6 rounded bg-[#090d12] border border-[#182332] space-y-5">
          <div className="flex items-center justify-between border-b border-[#141c27] pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-mono text-xs font-semibold text-slate-300 tracking-wider">
                {isRecording ? 'RECORDING IN PROGRESS' : 'MICROPHONE READY'}
              </span>
            </div>

            {/* Timer */}
            <div className="font-mono text-sm font-bold text-cyan-400 bg-[#060a0e] px-3 py-1 rounded border border-[#172230]">
              {formatDuration(recordDuration)}
            </div>
          </div>

          {/* Real-time Oscilloscope / Waveform canvas */}
          <div className="relative h-28 rounded overflow-hidden border border-[#172332] bg-[#070b10] flex items-center justify-center">
            <canvas
              ref={micCanvasRef}
              width={700}
              height={112}
              className="w-full h-full block"
            />
            {!isRecording && !recordedBlob && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-400 bg-[#070b10]/90">
                Click START RECORDING to request microphone permission and capture audio.
              </div>
            )}
          </div>

          {/* Recording Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {!isRecording && !recordedBlob && (
                <button
                  id="btn-start-recording"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>START RECORDING</span>
                </button>
              )}

              {isRecording && (
                <button
                  id="btn-stop-recording"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>STOP RECORDING</span>
                </button>
              )}

              {recordedBlob && !isRecording && (
                <>
                  <button
                    onClick={() => {
                      if (!recordedAudioElemRef.current) return;
                      if (isPlayingRecorded) {
                        recordedAudioElemRef.current.pause();
                      } else {
                        recordedAudioElemRef.current.play();
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition-colors"
                  >
                    {isPlayingRecorded ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingRecorded ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <button
                    onClick={handleReRecord}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#121922] hover:bg-[#182332] border border-[#202e40] text-slate-300 font-mono text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RE-RECORD</span>
                  </button>

                  {recordedUrl && (
                    <audio
                      ref={recordedAudioElemRef}
                      src={recordedUrl}
                      onPlay={() => setIsPlayingRecorded(true)}
                      onPause={() => setIsPlayingRecorded(false)}
                      onEnded={() => setIsPlayingRecorded(false)}
                      className="hidden"
                    />
                  )}
                </>
              )}
            </div>

            {recordedBlob && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Audio Captured ({formatBytes(recordedBlob.size)})</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected File Details Box */}
      {(selectedFile || recordedBlob) && fileMetadata && (
        <div className="p-4 rounded bg-[#0a0f16] border border-[#1b2736] space-y-3">
          <div className="flex items-center justify-between border-b border-[#141d28] pb-2">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-slate-200 truncate max-w-sm">
                {selectedFile ? selectedFile.name : 'live_microphone_recording.webm'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 uppercase">
              READY FOR ANALYSIS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2 rounded bg-[#070b10] border border-[#141d27]">
              <div className="text-[10px] text-slate-400">FORMAT</div>
              <div className="font-semibold text-slate-200 mt-0.5">{fileMetadata.format}</div>
            </div>

            <div className="p-2 rounded bg-[#070b10] border border-[#141d27]">
              <div className="text-[10px] text-slate-400">FILE SIZE</div>
              <div className="font-semibold text-slate-200 mt-0.5">{formatBytes(fileMetadata.size)}</div>
            </div>

            <div className="p-2 rounded bg-[#070b10] border border-[#141d27]">
              <div className="text-[10px] text-slate-400">DURATION</div>
              <div className="font-semibold text-slate-200 mt-0.5">{formatDuration(fileMetadata.duration)}</div>
            </div>

            <div className="p-2 rounded bg-[#070b10] border border-[#141d27]">
              <div className="text-[10px] text-slate-400">SAMPLE RATE</div>
              <div className="font-semibold text-slate-200 mt-0.5">{fileMetadata.sampleRate} Hz</div>
            </div>
          </div>

          <div className="p-2 rounded bg-[#070b10] border border-[#141d27] flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] text-slate-400">RAW SHA-256 HASH:</span>
            <span className="text-slate-300 select-all">{truncateHash(fileMetadata.sha256Hash, 14, 14)}</span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              id="analyze-recording-button"
              onClick={handleStartAnalysis}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-sm font-bold tracking-wide transition-colors shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>PROCESSING AUDIO...</span>
                </>
              ) : (
                <>
                  <Binary className="w-4 h-4 text-slate-950" />
                  <span>ANALYZE RECORDING</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing Audio Modal / Progress Indicator */}
      {isProcessing && (
        <div className="p-6 rounded bg-[#0b1017] border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                PROCESSING AUDIO
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">{processingPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[#121922] overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${processingPercent}%` }}
            />
          </div>

          {/* Stage name */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Stage: <strong className="text-slate-200">{processingStage}</strong></span>
            <span>EchoDNA Pipeline</span>
          </div>
        </div>
      )}
    </div>
  );
};
