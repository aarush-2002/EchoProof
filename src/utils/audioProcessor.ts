/**
 * Real Web Audio API Processor
 * Spectrogram, Waveform, Acoustic Analysis & Synthetic Sample Generators
 * EchoProof - Team Straw Hats (IIT Patna)
 */

import { AudioMetadata, AcousticAnalysis } from '../types';
import { calculateSha256 } from './crypto';

// Shared AudioContext instance (lazy initialized)
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Decodes audio blob/file and extracts actual browser audio metadata and ArrayBuffer
 */
export async function extractAudioData(
  fileOrBlob: Blob,
  originalFilename?: string
): Promise<{
  buffer: AudioBuffer;
  metadata: AudioMetadata;
  arrayBuffer: ArrayBuffer;
  acousticAnalysis: AcousticAnalysis;
}> {
  const ctx = getAudioContext();
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  
  // Calculate real SHA-256
  const sha256Hash = await calculateSha256(arrayBuffer);

  // Decode audio data
  const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

  // Extract real acoustic properties
  const acousticAnalysis = computeAcousticFeatures(buffer);

  // Determine file format
  let format = 'WAV';
  const name = originalFilename || (fileOrBlob as File).name || 'recording.wav';
  const ext = name.split('.').pop()?.toUpperCase();
  if (ext && ['WAV', 'MP3', 'M4A', 'OGG', 'WEBM', 'FLAC', 'AAC'].includes(ext)) {
    format = ext;
  } else if (fileOrBlob.type) {
    if (fileOrBlob.type.includes('wav')) format = 'WAV';
    else if (fileOrBlob.type.includes('mpeg') || fileOrBlob.type.includes('mp3')) format = 'MP3';
    else if (fileOrBlob.type.includes('ogg')) format = 'OGG';
    else if (fileOrBlob.type.includes('webm')) format = 'WEBM';
    else if (fileOrBlob.type.includes('mp4') || fileOrBlob.type.includes('m4a')) format = 'M4A';
  }

  const metadata: AudioMetadata = {
    filename: name,
    fileSize: fileOrBlob.size,
    format,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
    mimeType: fileOrBlob.type || `audio/${format.toLowerCase()}`,
    sha256Hash
  };

  return { buffer, metadata, arrayBuffer, acousticAnalysis };
}

/**
 * Extracts acoustic features from AudioBuffer
 */
export function computeAcousticFeatures(buffer: AudioBuffer): AcousticAnalysis {
  const channelData = buffer.getChannelData(0);
  const length = channelData.length;
  if (length === 0) {
    return {
      rmsEnergy: 0,
      spectralCentroidHz: 0,
      zeroCrossingRate: 0,
      crestFactorDb: 0,
      clippingRate: 0,
      dynamicRangeDb: 0,
    };
  }

  let sumSquares = 0;
  let zeroCrossings = 0;
  let peak = 0;
  let clippingCount = 0;

  for (let i = 0; i < length; i++) {
    const val = channelData[i];
    const absVal = Math.abs(val);
    sumSquares += val * val;
    if (absVal > peak) peak = absVal;
    if (absVal >= 0.99) clippingCount++;

    if (i > 0 && ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0))) {
      zeroCrossings++;
    }
  }

  const rms = Math.sqrt(sumSquares / length);
  const zcr = zeroCrossings / length;
  const crestFactor = rms > 0 ? 20 * Math.log10(peak / rms) : 0;
  const dynamicRange = peak > 0 && rms > 0 ? 20 * Math.log10(peak / (rms * 0.01)) : 48;
  const clippingRate = clippingCount / length;

  // Approximate spectral centroid via time-domain differentiation
  let diffSum = 0;
  for (let i = 1; i < length; i++) {
    const diff = channelData[i] - channelData[i - 1];
    diffSum += diff * diff;
  }
  const meanDiff = Math.sqrt(diffSum / length);
  const approxCentroid = Math.min(Math.max((meanDiff / (rms || 0.001)) * (buffer.sampleRate / (2 * Math.PI)), 300), 7500);

  return {
    rmsEnergy: Number(rms.toFixed(4)),
    spectralCentroidHz: Math.round(approxCentroid),
    zeroCrossingRate: Number(zcr.toFixed(4)),
    crestFactorDb: Number(crestFactor.toFixed(1)),
    clippingRate: Number(clippingRate.toFixed(4)),
    dynamicRangeDb: Number(dynamicRange.toFixed(1)),
    snrEstimateDb: Number((20 * Math.log10((rms || 0.001) / 0.0005)).toFixed(1))
  };
}

/**
 * Generates downsampled waveform peaks for canvas visualization
 */
export function generateWaveformData(buffer: AudioBuffer, numPoints = 250): number[] {
  const channelData = buffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / numPoints);
  const peaks: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const val = Math.abs(channelData[start + j] || 0);
      if (val > max) max = val;
    }
    peaks.push(max);
  }

  return peaks;
}

/**
 * Computes a frequency-time 2D spectrogram matrix from an AudioBuffer using windowed FFT
 */
export function computeSpectrogramMatrix(
  buffer: AudioBuffer,
  numTimeSlices = 120,
  numFreqBins = 64
): number[][] {
  const channelData = buffer.getChannelData(0);
  const totalSamples = channelData.length;
  const step = Math.floor(totalSamples / numTimeSlices);
  const windowSize = Math.min(512, step > 0 ? step : 512);

  const matrix: number[][] = [];

  // Simple Discrete Fourier Transform for frequency bins
  for (let t = 0; t < numTimeSlices; t++) {
    const start = t * step;
    const slice: number[] = new Array(numFreqBins).fill(0);

    for (let k = 0; k < numFreqBins; k++) {
      let real = 0;
      let imag = 0;
      const freqMultiplier = (2 * Math.PI * (k + 1)) / windowSize;

      for (let n = 0; n < windowSize; n++) {
        const sample = channelData[start + n] || 0;
        // Apply Hann window
        const windowCoeff = 0.5 * (1 - Math.cos((2 * Math.PI * n) / windowSize));
        const windowedSample = sample * windowCoeff;

        real += windowedSample * Math.cos(freqMultiplier * n);
        imag -= windowedSample * Math.sin(freqMultiplier * n);
      }

      const magnitude = Math.sqrt(real * real + imag * imag) / windowSize;
      // Convert to normalized log scale (0 to 1)
      const logMag = Math.min(1, Math.max(0, (Math.log10(magnitude + 0.0001) + 4) / 4));
      slice[k] = logMag;
    }

    matrix.push(slice);
  }

  return matrix;
}

/**
 * Synthesizes test audio waveforms in-memory for zero-friction demo testing
 */
export function createSyntheticDemoAudio(
  type: 'authentic_human' | 'synthetic_cloned'
): { blob: Blob; filename: string } {
  const sampleRate = 44100;
  const duration = 4.2; // seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const audioData = new Float32Array(totalSamples);

  if (type === 'authentic_human') {
    // Authentic speech harmonic structure: dynamic natural pitch modulation (formants at 130Hz, 300Hz, 800Hz, 2400Hz), breath pauses, room acoustic decay
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      
      // Speech syllable envelopes
      const syllableEnv = 
        Math.max(0, Math.sin(t * 7.5)) * 0.4 + 
        Math.max(0, Math.sin(t * 3.2)) * 0.3 + 
        (t > 1.8 && t < 2.2 ? 0.02 : 0.25); // natural breath pause

      // Natural pitch micro-jitter (human vocal chord fluctuation)
      const f0 = 135 + 8 * Math.sin(t * 4.1) + 2 * Math.sin(t * 22.0) + (Math.random() - 0.5) * 0.8;
      
      // Harmonics (Formants F1, F2, F3)
      const h1 = Math.sin(2 * Math.PI * f0 * t) * 0.6;
      const h2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.35;
      const h3 = Math.sin(2 * Math.PI * f0 * 3 * t) * 0.2;
      const fFormant = Math.sin(2 * Math.PI * 1800 * t) * 0.08;
      const breathNoise = (Math.random() - 0.5) * 0.035;

      audioData[i] = (h1 + h2 + h3 + fFormant + breathNoise) * syllableEnv * 0.85;
    }
  } else {
    // Synthetic cloned voice characteristics: unnatural flat pitch trajectory, robotic high-frequency artifacts (phase discontinuities at 2.4s, metallic buzzing at 4kHz)
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      
      // Mechanical syllable bursts with abrupt on/off (vocoder signature)
      const robotEnv = Math.sin(t * 6.0) > -0.2 ? 0.75 : 0.05;
      
      // Rigid pitch (zero vocal jitter, signature of neural vocoder auto-regressive failure)
      const f0 = 142.0; 
      
      const h1 = Math.sin(2 * Math.PI * f0 * t) * 0.5;
      const h2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.3;
      const h3 = Math.sin(2 * Math.PI * f0 * 4 * t) * 0.25;
      // High-frequency vocoder metallic artifact / phase tear
      const vocoderArtifact = (t > 1.6 && t < 2.3) ? Math.sin(2 * Math.PI * 3850 * t) * 0.22 : Math.sin(2 * Math.PI * 4100 * t) * 0.05;
      const quantizationStep = (t > 2.8 && t < 3.4) ? (Math.round(Math.sin(2 * Math.PI * 800 * t) * 8) / 8) * 0.15 : 0;

      audioData[i] = (h1 + h2 + h3 + vocoderArtifact + quantizationStep) * robotEnv * 0.85;
    }
  }

  // Convert Float32Array to 16-bit PCM WAV Blob
  const wavBlob = encodeWAV(audioData, sampleRate);
  const filename = type === 'authentic_human' 
    ? 'echoproof_sample_authentic_voice.wav' 
    : 'echoproof_sample_cloned_synthetic.wav';

  return { blob: wavBlob, filename };
}

/**
 * Convenience helper returning just the synthetic sample WAV Blob
 */
export function createSyntheticAudioSample(
  type: 'authentic_human' | 'synthetic_cloned',
  duration = 4.2
): Blob {
  return createSyntheticDemoAudio(type).blob;
}

/**
 * Encodes PCM float samples into standard 16-bit PCM WAV Blob
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // 1 channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16 bits per sample
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
