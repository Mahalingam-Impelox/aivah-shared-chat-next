import { Lipsync } from 'wawa-lipsync';
import type { Dispatch } from '@reduxjs/toolkit';
import { setLipsyncData } from '@/store/companion';

// Create a single shared lipsync manager instance (like in demo)
export const lipsyncManager = new Lipsync({
  fftSize: 2048,
  historySize: 10
});

// Store the current audio element and LiveKit stream
let currentAudio: HTMLAudioElement | null = null;
let currentLiveKitStream: MediaStream | null = null;
let isProcessing = false;
let animationFrameId: number | null = null;
let liveKitAudioContext: AudioContext | null = null;
let liveKitSourceNode: MediaStreamAudioSourceNode | null = null;

// OFFICIAL DEMO PATTERN: Simple direct connection
export const connectAudio = (audio: HTMLAudioElement): void => {
  if (currentAudio === audio) {
    return; // Already connected
  }

  // Disconnect previous audio if any
  if (currentAudio) {
    disconnectAudio();
  }

  // Connect new audio (OFFICIAL DEMO APPROACH)
  currentAudio = audio;
  lipsyncManager.connectAudio(audio);
  console.log('🎵 Audio connected to wawa-lipsync:', audio.src);
};

// Function to disconnect audio
export const disconnectAudio = (): void => {
  if (currentAudio) {
    currentAudio = null;
  }
};

// Function to connect LiveKit MediaStream to lipsync manager (custom approach)
export const connectLiveKitAudio = (mediaStream: MediaStream): void => {
  if (currentLiveKitStream === mediaStream) {
    return; // Already connected
  }

  // Disconnect previous LiveKit audio if any
  disconnectLiveKitAudio();
  // Reset analysis state for immediate responsiveness
  resetCustomAnalysis();

  try {
    // Create audio context if needed
    if (!liveKitAudioContext || liveKitAudioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      liveKitAudioContext = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
    }

    // Resume audio context if suspended
    if (liveKitAudioContext.state === 'suspended') {
      liveKitAudioContext.resume().catch(console.warn);
    }

    // Create MediaStream source and analyser for real-time audio analysis
    const source = liveKitAudioContext.createMediaStreamSource(mediaStream);
    const analyser = liveKitAudioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.1; // Reduced from 0.3 for more immediate response
    analyser.minDecibels = -90; // More sensitive to quiet sounds
    analyser.maxDecibels = -10;

    // Connect source to analyser (but not to speakers to avoid echo)
    source.connect(analyser);

    liveKitSourceNode = source;
    liveKitAnalyser = analyser; // Store for custom analysis
    currentLiveKitStream = mediaStream;
    // Also create audio element for compatibility but don't use it for analysis
    const audioElement = new Audio();
    audioElement.srcObject = mediaStream;
    audioElement.volume = 1; // Normal volume for proper audio element behavior
    audioElement.muted = true; // Muted to prevent echo but allow proper media element state
    audioElement.autoplay = true;

    currentAudio = audioElement;

    // Auto-start processing when LiveKit audio is connected
    console.log('🎵 LiveKit Audio Connected:', {
      hasDispatch: !!dispatch,
      isProcessing,
      hasStream: !!mediaStream
    });
    if (dispatch && !isProcessing) {
      startProcessing();
    }
  } catch (error) {
    console.error('WawaLipsyncManager: Failed to connect LiveKit audio:', error);
  }
};

// Function to disconnect LiveKit audio
export const disconnectLiveKitAudio = (): void => {
  if (currentLiveKitStream || liveKitSourceNode) {
    try {
      if (liveKitSourceNode) {
        liveKitSourceNode.disconnect();
        liveKitSourceNode = null;
      }
      liveKitAnalyser = null;
      resetCustomAnalysis();
      if (currentAudio && currentAudio.srcObject === currentLiveKitStream) {
        currentAudio.srcObject = null;
        currentAudio = null;
      }

      currentLiveKitStream = null;
    } catch (error) {
      console.warn('WawaLipsyncManager: Error disconnecting LiveKit audio:', error);
    }
  }
};

// Store analyser node for custom audio analysis
let liveKitAnalyser: AnalyserNode | null = null;

// Smoothing and history for better viseme detection - RESTORED ORIGINAL SETTINGS
const previousVisemes: string[] = [];
let previousVolume = 0;
let lastVisemeTime = 0;
const VISEME_SMOOTHING_FRAMES = 2; // Reduced from 3 for faster response (ORIGINAL)
const MIN_VISEME_DURATION = 30; // Reduced from 50ms for faster switching (ORIGINAL)
const VOLUME_THRESHOLD = 0.003; // Lower threshold for more sensitivity (ORIGINAL)
const SILENCE_THRESHOLD = 0.001; // Lower threshold to catch quieter speech (ORIGINAL)

// Custom audio analysis for LiveKit streams
const analyzeLiveKitAudio = (): {
  viseme: string;
  volume: number;
  features: { volume: number; bands: number[]; deltaBands: number[]; centroid: number };
} => {
  if (!liveKitAnalyser || !liveKitAudioContext) {
    return {
      viseme: 'viseme_sil',
      volume: 0,
      features: { volume: 0, bands: [0, 0, 0], deltaBands: [0, 0, 0], centroid: 0 }
    };
  }

  // Get frequency data
  const bufferLength = liveKitAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  liveKitAnalyser.getByteFrequencyData(dataArray);

  // Calculate volume (RMS) with better sensitivity
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i] / 255;
    sum += value * value;
  }
  const volume = Math.sqrt(sum / bufferLength);

  // Smooth volume changes - reduced smoothing for real-time responsiveness (ORIGINAL)
  const smoothedVolume = previousVolume * 0.5 + volume * 0.5; // More responsive (was 0.7/0.3) (ORIGINAL)
  previousVolume = smoothedVolume;

  // More detailed frequency analysis for better viseme detection
  const sampleRate = liveKitAudioContext.sampleRate;
  const frequencyResolution = sampleRate / (2 * bufferLength);
  // Define frequency bands based on speech formats
  const lowEnd = Math.floor(400 / frequencyResolution); // 0-400Hz (fundamental freq)
  const lowMidEnd = Math.floor(800 / frequencyResolution); // 400-800Hz (F1 formant)
  const midEnd = Math.floor(2000 / frequencyResolution); // 800-2000Hz (F2 formant)
  const highMidEnd = Math.floor(4000 / frequencyResolution); // 2000-4000Hz (F3 formant)
  const highEnd = Math.floor(8000 / frequencyResolution); // 4000-8000Hz (fricatives)

  // Calculate energy in each frequency band
  const bassEnergy = dataArray.slice(0, lowEnd).reduce((a, b) => a + b, 0) / lowEnd;
  const lowMidEnergy = dataArray.slice(lowEnd, lowMidEnd).reduce((a, b) => a + b, 0) / (lowMidEnd - lowEnd);
  const midEnergy = dataArray.slice(lowMidEnd, midEnd).reduce((a, b) => a + b, 0) / (midEnd - lowMidEnd);
  const highMidEnergy = dataArray.slice(midEnd, highMidEnd).reduce((a, b) => a + b, 0) / (highMidEnd - midEnd);
  const highEnergy = dataArray.slice(highMidEnd, Math.min(highEnd, bufferLength)).reduce((a, b) => a + b, 0) /
    (Math.min(highEnd, bufferLength) - highMidEnd);

  // Normalize energies
  const totalEnergy = bassEnergy + lowMidEnergy + midEnergy + highMidEnergy + highEnergy;
  const normalizedBass = totalEnergy > 0 ? bassEnergy / totalEnergy : 0;
  const normalizedLowMid = totalEnergy > 0 ? lowMidEnergy / totalEnergy : 0;
  const normalizedMid = totalEnergy > 0 ? midEnergy / totalEnergy : 0;
  const normalizedHighMid = totalEnergy > 0 ? highMidEnergy / totalEnergy : 0;
  const normalizedHigh = totalEnergy > 0 ? highEnergy / totalEnergy : 0;

  let viseme = 'viseme_sil';

  // RESTORED ORIGINAL SOPHISTICATED VISEME DETECTION
  // Check for silence first - but be more aggressive about detecting speech
  if (smoothedVolume < SILENCE_THRESHOLD) {
    viseme = 'viseme_sil';
  } else if (smoothedVolume > VOLUME_THRESHOLD) {
    // More sophisticated viseme detection based on formant analysis (ORIGINAL)
    // For immediate response to speech onset, default to mouth opening
    if (previousVisemes.length === 0 || previousVisemes[previousVisemes.length - 1] === 'viseme_sil') {
      // First speech detection - immediately open mouth (ORIGINAL)
      viseme = 'viseme_aa'; // Start with open vowel for immediate response
    }
    // High frequency energy indicates fricatives or sibilants (ORIGINAL)
    if (normalizedHigh > 0.3 && normalizedHighMid > 0.25) {
      if (normalizedHigh > normalizedHighMid) {
        viseme = 'viseme_SS'; // s, z sounds
      } else {
        viseme = 'viseme_CH'; // sh, ch sounds
      }
    } else if (normalizedBass > 0.4 && normalizedMid < 0.2) {
      // Low bass with moderate mid suggests closed vowels (ORIGINAL)
      viseme = 'viseme_U'; // closed vowels like "goose"
    } else if (normalizedMid > 0.4 && normalizedBass < 0.3) {
      // High mid energy with low bass suggests open vowels (ORIGINAL)
      if (normalizedHighMid > normalizedLowMid) {
        viseme = 'viseme_I'; // high vowels like "fleece"
      } else {
        viseme = 'viseme_E'; // mid vowels like "bed"
      }
    } else if (normalizedLowMid > 0.3 && normalizedMid > 0.3) {
      // Balanced low-mid and mid energy suggests open vowels (ORIGINAL)
      viseme = 'viseme_aa'; // open vowels like "father"
    } else if (normalizedBass > 0.35) {
      // Strong bass energy suggests back vowels (ORIGINAL)
      viseme = 'viseme_O'; // back vowels like "thought"
    } else if (smoothedVolume > VOLUME_THRESHOLD && smoothedVolume < VOLUME_THRESHOLD * 3) {
      // Low overall energy but above threshold suggests consonants (ORIGINAL)
      // Cycle through consonant visemes based on energy patterns
      if (normalizedHighMid > normalizedLowMid) {
        viseme = 'viseme_TH'; // dental sounds
      } else if (normalizedMid > normalizedBass) {
        viseme = 'viseme_DD'; // alveolar sounds
      } else {
        viseme = 'viseme_PP'; // bilabial sounds
      }
    } else {
      // Default to a vowel sound for speech (ORIGINAL)
      viseme = 'viseme_aa';
    }
  }

  // RESTORED ORIGINAL TEMPORAL SMOOTHING - improved for real-time
  const currentTime = Date.now();
  if (previousVisemes.length > 0) {
    const lastViseme = previousVisemes[previousVisemes.length - 1];
    // More flexible timing - allow faster changes for silence and strong signals (ORIGINAL)
    const minDuration = lastViseme === 'viseme_sil' || smoothedVolume > VOLUME_THRESHOLD * 3
      ? MIN_VISEME_DURATION * 0.5 // Faster switching from silence or strong signals (ORIGINAL)
      : MIN_VISEME_DURATION;
    // Don't change viseme too quickly (ORIGINAL)
    if (currentTime - lastVisemeTime < minDuration && lastViseme !== 'viseme_sil') {
      viseme = lastViseme;
    }
    // Use majority voting from recent frames for stability - but only for weak signals (ORIGINAL)
    if (previousVisemes.length >= VISEME_SMOOTHING_FRAMES && smoothedVolume < VOLUME_THRESHOLD * 2) {
      const visemeCounts: Record<string, number> = {};
      previousVisemes.slice(-VISEME_SMOOTHING_FRAMES).forEach(v => {
        visemeCounts[v] = (visemeCounts[v] || 0) + 1;
      });
      // Find most common viseme in recent history (ORIGINAL)
      const mostCommon = Object.keys(visemeCounts).reduce((a, b) =>
        visemeCounts[a] > visemeCounts[b] ? a : b
      );
      // Use most common only for weak signals to prevent lag on strong signals (ORIGINAL)
      if (viseme !== mostCommon && (visemeCounts[viseme] || 0) < 2) {
        viseme = mostCommon;
      }
    }
  }

  // Update history (ORIGINAL)
  if (viseme !== (previousVisemes[previousVisemes.length - 1] || '')) {
    lastVisemeTime = currentTime;
  }
  previousVisemes.push(viseme);
  if (previousVisemes.length > VISEME_SMOOTHING_FRAMES * 2) {
    previousVisemes.shift();
  }

  return {
    viseme,
    volume: smoothedVolume,
    features: {
      volume: smoothedVolume,
      bands: [normalizedBass, normalizedLowMid, normalizedMid, normalizedHighMid, normalizedHigh],
      deltaBands: [0, 0, 0, 0, 0],
      centroid: (normalizedBass + normalizedLowMid + normalizedMid + normalizedHighMid + normalizedHigh) / 5
    }
  };
};

// Function to reset custom analysis state (ORIGINAL)
const resetCustomAnalysis = (): void => {
  previousVisemes.length = 0;
  previousVolume = 0;
  lastVisemeTime = 0;
  customAnalysisResult = null;
};

// Store current custom analysis results
let customAnalysisResult: {
  viseme: string;
  volume: number;
  features: { volume: number; bands: number[]; deltaBands: number[]; centroid: number };
} | null = null;

// Redux dispatch for updating lipsync data
let dispatch: Dispatch | null = null;

export const setDispatch = (reduxDispatch: Dispatch): void => {
  dispatch = reduxDispatch;
};

// OFFICIAL DEMO PATTERN: Simple processing loop
export const startProcessing = (): void => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  console.log('🎵 Starting wawa-lipsync processing');

  const processAudio = (): void => {
    if (!isProcessing) {
      return;
    }

    // DUAL APPROACH: Handle both regular audio and LiveKit
    if (currentLiveKitStream && liveKitAnalyser) {
      // Use custom analysis for LiveKit audio
      customAnalysisResult = analyzeLiveKitAudio();

      if (dispatch && customAnalysisResult) {
        const lipsyncPayload = {
          viseme: customAnalysisResult.viseme,
          volume: customAnalysisResult.volume,
          isActive: customAnalysisResult.volume > 0.001,
          lastActiveTime: customAnalysisResult.volume > 0.001 ? Date.now() : undefined,
          intensity: customAnalysisResult.volume
        };
        dispatch(setLipsyncData(lipsyncPayload));
      }
    } else if (currentAudio) {
      // OFFICIAL DEMO PATTERN: Use wawa-lipsync directly
      lipsyncManager.processAudio();

      if (dispatch) {
        // Get volume from features since .volume property doesn't exist
        const features = lipsyncManager.features as any;
        const volume = features?.volume || 0;

        const lipsyncPayload = {
          viseme: lipsyncManager.viseme,
          volume: volume,
          isActive: lipsyncManager.viseme !== 'viseme_sil',
          lastActiveTime: lipsyncManager.viseme !== 'viseme_sil' ? Date.now() : undefined,
          intensity: volume
        };
        dispatch(setLipsyncData(lipsyncPayload));
      }
    }

    animationFrameId = requestAnimationFrame(processAudio);
  };

  processAudio();
};

// Force start processing for LiveKit audio
export const forceStartProcessing = (): void => {
  // Always start if we have LiveKit audio setup
  if (!isProcessing && currentLiveKitStream && liveKitAnalyser && dispatch) {
    startProcessing();
  }
};

// Function to stop processing audio
export const stopProcessing = (): void => {
  isProcessing = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// OFFICIAL DEMO PATTERN: Direct viseme access
export const getCurrentViseme = (): string => {
  if (customAnalysisResult) {
    return customAnalysisResult.viseme;
  }
  return lipsyncManager.viseme;
};

// OFFICIAL DEMO PATTERN: Get current state (vowel/consonant)
export const getCurrentState = (): string => {
  // From the demo: they use lipsyncManager.state
  // We need to determine state based on viseme since state might be private
  const viseme = getCurrentViseme();
  const baseViseme = viseme.replace('viseme_', '');

  // Vowels are typically longer duration (from demo pattern)
  if (['aa', 'I', 'E', 'O', 'U'].includes(baseViseme)) {
    return 'vowel';
  } else if (baseViseme === 'sil') {
    return 'silent';
  } else {
    return 'consonant';
  }
};

// Getter for current features (demo approach)
export const getCurrentFeatures = (): unknown => {
  return lipsyncManager.features;
};

// Getter for custom analysis result (LiveKit)
export const getCustomAnalysisResult = (): {
  viseme: string;
  volume: number;
  features: { volume: number; bands: number[]; deltaBands: number[]; centroid: number };
} | null => {
  return customAnalysisResult;
};

// Check if audio is currently connected and playing
export const isAudioActive = (): boolean => {
  return !!(currentAudio && !currentAudio.paused && !currentAudio.ended);
};

// Check if LiveKit audio is currently active
export const isLiveKitAudioActive = (): boolean => {
  return !!(currentLiveKitStream && currentAudio && currentAudio.srcObject === currentLiveKitStream);
};

// Get the current audio element
export const getCurrentAudio = (): HTMLAudioElement | null => {
  return currentAudio;
};

// Get the current LiveKit stream
export const getCurrentLiveKitStream = (): MediaStream | null => {
  return currentLiveKitStream;
};
