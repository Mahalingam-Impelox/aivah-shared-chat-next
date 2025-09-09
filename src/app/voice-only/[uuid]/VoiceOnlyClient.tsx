'use client';

import { BaseApi } from '@/utils/api/base-api';
import CommonAPI from '@/utils/api/common-api';
import { SessionStorage } from '@/utils/api/session-storage';
import { CHAT_TYPE, CONVERSATION_ID, KNOWLEDGEBASE_ID, SESSION_ID, SESSION_TOKEN, SESSION_UUID } from '@/utils/constants/local-storage.key';
import {
  ConnectionQuality,
  DisconnectReason,
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  ReconnectContext,
  ReconnectPolicy,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TranscriptionSegment
} from 'livekit-client';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

// Types
interface InitialData {
  uuid: string;
  viewType: string;
  isIframe: boolean;
  validation: {
    success: boolean;
    details?: {
      token: string;
      chatType: string;
      chatbotId: number;
      knowledgebaseType: string;
      llmModelId?: string;
      llmModel?: string;
      voiceSetup?: {
        voiceSetup: any;
      };
    };
    error?: string;
  };
  conversation: {
    conversationId: string;
    userSessionId: string;
    success: boolean;
    error?: string;
  } | null;
  llmModelId: string;
  configuredVoice: any;
  knowledgeBaseId: number;
}

// Enhanced SVG icons for better visual quality
const PhoneIcon = () => (
  <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" height="1.2em" width="1.2em" stroke="currentColor" fill="currentColor">
    <path d="M 82.6 88.6 l 104 -24 c 11.3 -2.6 22.9 3.3 27.5 13.9 l 48 112 c 4.2 9.8 1.4 21.3 -6.9 28 l -60.6 49.6 c 36 76.7 98.9 140.5 177.2 177.2 l 49.6 -60.6 c 6.8 -8.3 18.2 -11.1 28 -6.9 l 112 48 C 572.1 430.5 578 442.1 575.4 453.4 l -24 104 C 548.9 568.2 539.3 576 528 576 c -256.1 0 -464 -207.5 -464 -464 c 0 -11.2 7.7 -20.9 18.6 -23.4 z"></path>
  </svg>
);

const MicIcon = () => (
  <Image src='/icons/mic.svg' alt="microphone" width={20} height={20} />
);

const MicOffIcon = () => (
  <Image src='/icons/mic.svg' alt="microphone off" width={20} height={20} className="opacity-50" />
);

// Main Client Component
const VoiceOnlyClient: React.FC<{ initialData: InitialData }> = ({ initialData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callDuration, setCallDuration] = useState<string>('00:00');

  // LiveKit state
  const [room, setRoom] = useState<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [agentConnected, setAgentConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Enhanced LiveKit state for 2025 improvements
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(ConnectionQuality.Excellent);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [audioMetrics, setAudioMetrics] = useState({
    bitrate: 0,
    packetsLost: 0,
    jitter: 0,
    lastUpdated: Date.now()
  });

  // Local config state
  const [conversationId, setConversationId] = useState<string>(initialData.conversation?.conversationId || '');
  const [sessionId, setSessionId] = useState<string>(initialData.conversation?.userSessionId || '');

  // Transcription state
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreamComplete, setIsStreamComplete] = useState<boolean>(false);
  const [pendingChatId, setPendingChatId] = useState<string | number>('');
  const [isListeningForUser, setIsListeningForUser] = useState<boolean>(false);
  const transcriptionSegmentsRef = useRef<{ [id: string]: TranscriptionSegment }>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamingTextContainerRef = useRef<HTMLDivElement | null>(null);

  const connectionAttemptRef = useRef<boolean>(false);
  const qualityMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Store session data
  useEffect(() => {
    if (initialData.validation.details) {
      SessionStorage.setItem(SESSION_TOKEN, initialData.validation.details.token);
      SessionStorage.setItem(SESSION_UUID, initialData.uuid);
      SessionStorage.setItem(CHAT_TYPE, initialData.validation.details.chatType);
      SessionStorage.setItem(CONVERSATION_ID, conversationId);
      SessionStorage.setItem(SESSION_ID, sessionId);
      SessionStorage.setItem(KNOWLEDGEBASE_ID, initialData.knowledgeBaseId.toString());
    }
  }, [initialData, conversationId, sessionId]);

  useEffect(() => {
    const originalBackground = document.body.style.background;
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = originalBackground;
    };
  }, []);

  // Timer effect for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (callStartTime && isOpen) {
      interval = setInterval(() => {
        const elapsed = Date.now() - callStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callStartTime, isOpen]);

  // Check microphone permissions on component mount
  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'granted') {
          setHasPermissions(true);
          setError('');
        } else {
          setHasPermissions(false);
        }
      } catch (error) {
        setHasPermissions(false);
      }
    };
    
    checkInitialPermissions();
  }, []);

  /**
   * Enhanced utility functions for v2.15+ features
   */
  const updateAvailableDevices = async (): Promise<void> => {
    try {
      const devices = await Room.getLocalDevices('audioinput');
      setAvailableDevices(devices);
      
      if (!activeDeviceId && devices.length > 0) {
        const defaultDevice = devices.find(d => d.deviceId === 'default') || devices[0];
        setActiveDeviceId(defaultDevice.deviceId);
      }
    } catch (error) {
      console.warn('Device enumeration failed:', error);
    }
  };
  
  const adjustAudioQuality = async (quality: ConnectionQuality): Promise<void> => {
    if (!room?.localParticipant) return;
    
    let newBitrate: number;
    switch (quality) {
      case ConnectionQuality.Poor:
        newBitrate = 32000;
        break;
      case ConnectionQuality.Good:
        newBitrate = 64000;
        break;
      case ConnectionQuality.Excellent:
        newBitrate = 96000;
        break;
      default:
        newBitrate = 64000;
    }
  };
  
  const startQualityMonitoring = (roomInstance: Room): void => {
    if (qualityMonitorRef.current) {
      clearInterval(qualityMonitorRef.current);
    }
    
    qualityMonitorRef.current = setInterval(() => {
      if (roomInstance.state !== 'connected') return;
      
      setAudioMetrics(prev => ({
        ...prev,
        lastUpdated: Date.now()
      }));
    }, 5000);
  };
  
  const stopQualityMonitoring = (): void => {
    if (qualityMonitorRef.current) {
      clearInterval(qualityMonitorRef.current);
      qualityMonitorRef.current = null;
    }
  };
  
  const categorizeError = (reason: DisconnectReason): 'network' | 'server' | 'unknown' => {
    const reasonStr = String(reason).toLowerCase();
    if (reasonStr.includes('network') || reasonStr.includes('timeout')) {
      return 'network';
    } else if (reasonStr.includes('server') || reasonStr.includes('unauthorized')) {
      return 'server';
    }
    return 'unknown';
  };
  
  const setupRPCMethods = (roomInstance: Room): void => {
    try {
      roomInstance.localParticipant.registerRpcMethod('getVoiceState', async () => {
        const voiceState = {
          ready: true,
          sessionType: 'voice-only',
          quality: connectionQuality,
          deviceId: activeDeviceId,
          metrics: audioMetrics,
          timestamp: Date.now()
        };
        return JSON.stringify(voiceState);
      });
    } catch (rpcError) {
      console.warn('RPC setup failed:', rpcError);
    }
  };

  /**
   * Enhanced microphone permission check using LiveKit's device enumeration
   */
  const checkMicrophonePermission = async (): Promise<boolean> => {
    setError('');
    
    try {
      const devices = await Room.getLocalDevices('audioinput');
      await updateAvailableDevices();
      
      const hasAudioInput = devices.length > 0;
      if (!hasAudioInput) {
        setError('❌ No microphone found. Please connect a microphone and try again.');
        setHasPermissions(false);
        return false;
      }

      const devicesWithPermissions = devices.some(device => device.label && device.label.trim() !== '');
      
      if (devicesWithPermissions) {
        setHasPermissions(true);
        return true;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setHasPermissions(true);
        return true;
      }

      setHasPermissions(true);
      return true;
    } catch (error: any) {
      setHasPermissions(true);
      return true;
    }
  };

  const syncMessageToDb = (text: string): void => {
    CommonAPI.syncChatMessage(text, Number(conversationId), 'normal').then(() => {
      // Message synced successfully
    }).catch((error) => {
      console.warn('Failed to sync message:', error);
    });
  };

  const nextFlow = (): void => {
    setIsOpen(true);
    connectToLiveKit();
  };

  const handleVoiceChatClick = async () => {
    setError('');
    
    const hasPermission = await checkMicrophonePermission();
    if (hasPermission) {
      nextFlow();
    }
  };

  const connectToLiveKit = async () => {
    if (connecting || connectionAttemptRef.current) {
      return;
    }

    connectionAttemptRef.current = true;
    setConnecting(true);
    setError('');

    try {
      const uniqueConversationId = `${conversationId}-${Date.now()}`;

      const tokenRequest = {
        userSessionId: sessionId,
        conversationId: uniqueConversationId,
        knowledgebaseId: initialData.knowledgeBaseId,
        voice: initialData.configuredVoice,
        enableStream: 'true',
        llmName: initialData.llmModelId,
        uuid: initialData.uuid
      };

      const data = await BaseApi.post('lk-session/generate-share-token', tokenRequest);

      if (!data.success || !data.token || !data.url) {
        throw new Error(data.message || 'Failed to get token or URL from backend');
      }

      if (room) {
        room.disconnect();
        setRoom(null);
        setConnected(false);
        setAgentConnected(false);
        setIsListening(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const reconnectPolicy: ReconnectPolicy = {
        nextRetryDelayInMs: (context: ReconnectContext) => {
          const baseDelay = 1000;
          const maxDelay = 30000;
          if (context.retryCount >= 5) {
            return 60000;
          }
          return Math.min(baseDelay * Math.pow(2, context.retryCount), maxDelay);
        }
      };

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        disconnectOnPageLeave: true,
        reconnectPolicy,
        stopLocalTrackOnUnpublish: true,
        webAudioMix: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
          sampleSize: 16,
          channelCount: 1
        },
        publishDefaults: {
          audioPreset: {
            maxBitrate: 64000,
            priority: 'high'
          },
          simulcast: false,
          stopMicTrackOnMute: true
        }
      });

      // Set up event handlers
      newRoom.on(RoomEvent.Connected, async () => {
        console.log('ON EVENT RoomEvent.Connected')
        setConnected(true);
        setConnecting(false);
        connectionAttemptRef.current = false;
        setReconnectAttempts(0);
        startQualityMonitoring(newRoom);
        setupRPCMethods(newRoom);
      });

      newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        if (
          participant.identity.includes('aivah-shared-multimodal-voice-agent') ||
          participant.identity.includes('agent') ||
          participant.identity.includes('AI')
        ) {
          setAgentConnected(true);
        }
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          const audioTrack = track as RemoteAudioTrack;
          const audioElement = audioTrack.attach() as HTMLAudioElement;
          audioElement.autoplay = true;
          audioElement.setAttribute('playsinline', 'true');
          audioElement.volume = 1.0;
          
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            audioElement.setAttribute('webkit-playsinline', 'true');
            audioElement.setAttribute('muted', 'false');
          }
          
          audioElementRef.current = audioElement;
          
          audioElement.addEventListener('play', () => {
            // Audio started playing
          });
          
          audioElement.addEventListener('ended', () => {
            // Audio ended
          });
          
          audioElement.addEventListener('error', (e) => {
            console.warn('Voice audio playback error:', e);
          });

          audioElement.play().catch((playError) => {
            console.warn('Audio autoplay blocked:', playError);
          });
        }
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        if (participant.identity.includes('agent') || participant.identity.includes('AI')) {
          setAgentConnected(false);
        }
      });

      newRoom.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, participant: Participant) => {
        if (participant === newRoom.localParticipant) {
          setConnectionQuality(quality);
          adjustAudioQuality(quality);
        }
      });
      
      newRoom.on(RoomEvent.MediaDevicesChanged, async () => {
        await updateAvailableDevices();
      });
      
      newRoom.on(RoomEvent.Reconnecting, () => {
        setConnecting(true);
      });
      
      newRoom.on(RoomEvent.Reconnected, () => {
        setConnecting(false);
        startQualityMonitoring(newRoom);
      });
      
      newRoom.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication, _participant: LocalParticipant) => {
        if (publication.kind === Track.Kind.Audio) {
          // Track published
        }
      });
      
      newRoom.on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication, _participant: LocalParticipant) => {
        if (publication.kind === Track.Kind.Audio) {
          // Track unpublished
        }
      });

      newRoom.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        setConnected(false);
        setConnecting(false);
        setAgentConnected(false);
        setIsListening(false);
        connectionAttemptRef.current = false;
        
        stopQualityMonitoring();

        if (reason && reason !== DisconnectReason.CLIENT_INITIATED) {
          const errorCategory = categorizeError(reason);
          let userMessage = '';
          
          switch (errorCategory) {
            case 'network':
              userMessage = '🌐 Network connection lost. Reconnection will be automatic.';
              break;
            case 'server':
              userMessage = '🔧 Server connection lost. Please try reconnecting.';
              break;
            default:
              userMessage = `❌ Connection lost: ${reason}. Please try reconnecting.`;
          }
          
          setError(userMessage);
          setReconnectAttempts(prev => prev + 1);
        }
      });

      // Handle transcription from AI agent
      newRoom.on(RoomEvent.TranscriptionReceived, (transcription: TranscriptionSegment[]) => {
        for (const segment of transcription) {
          transcriptionSegmentsRef.current[segment.id] = segment;
        }
        const segments = Object.values(transcriptionSegmentsRef.current).sort((a, b) => a.startTime - b.startTime);
        const fullText = segments.map((s) => s.text).join('');
        
        if (segments.length === 1 && segments[0].final === false) {
          setStreamingText('');
          setIsStreamComplete(false);
        }
        
        setStreamingText(fullText);

        if (segments.length > 0 && segments.every((s) => s.final)) {
          if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
          debounceTimeoutRef.current = setTimeout(() => {
            const newChatId = Date.now();
            setPendingChatId(newChatId);
            setStreamingText(fullText);
            setIsStreamComplete(true);
            transcriptionSegmentsRef.current = {};
            syncMessageToDb(fullText);
          }, 1200);
        } else {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
          }
        }
      });

      if (data.url && data.token) {
        try {
          await newRoom.prepareConnection(data.url, data.token);
        } catch (prepareError) {
          // Pre-warm errors are non-critical for voice apps
        }
      }
      
      const connectPromise = newRoom.connect(data.url, data.token);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Voice connection timeout')), 20000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      setRoom(newRoom);

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        setIsListening(true);
        setIsListeningForUser(true);
        setHasPermissions(true);
        setError('');
        setCallStartTime(Date.now());

      } catch (micError: any) {
        setHasPermissions(false);
        
        if (micError.name === 'NotAllowedError') {
          setError('❌ Microphone access denied. Please allow microphone access and try again.');
        } else if (micError.name === 'NotFoundError') {
          setError('❌ No microphone found. Please connect a microphone and try again.');
        } else if (micError.name === 'NotReadableError') {
          setError('❌ Microphone is being used by another application. Please close other apps and try again.');
        } else {
          setError('❌ Failed to access microphone. Please check your device settings and try again.');
        }
      }

    } catch (err: any) {
      setError('❌ Connection failed: ' + (err.message || 'Unknown error'));
      setConnecting(false);
      connectionAttemptRef.current = false;
    }
  };

  const livekitConnectionCleanup = (): void => {
    if (room) {
      console.log('Disconnecting room from livekitConnectionCleanup')
      room.disconnect();
      room.removeAllListeners();
      setRoom(null);
      setConnected(false);
      setAgentConnected(false);
      setIsListening(false);
    }
    
    stopQualityMonitoring();
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    
    connectionAttemptRef.current = false;
    setConnecting(false);
    setError('');
    setCallStartTime(null);
    setCallDuration('00:00');
    
    setStreamingText('');
    setIsStreamComplete(false);
    setPendingChatId('');
    setIsListeningForUser(false);
    transcriptionSegmentsRef.current = {};
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  };

  const handleClose = () => {
    livekitConnectionCleanup();
    setIsOpen(false);
    setHasPermissions(false);
    setError('');
  };

  const handleMicMute = async () => {
    if (!room || !connected) return;

    try {
      if (isListening) {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsListening(false);
        setIsMicMuted(true);
      } else {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsListening(true);
        setIsMicMuted(false);
      }
    } catch (err: any) {
      setError('Failed to toggle microphone: ' + err.message);
    }
  };

  // useEffect(() => {
  //   return () => {
  //     livekitConnectionCleanup();
  //     stopQualityMonitoring();
  //   };
  // }, [livekitConnectionCleanup]);


  useEffect(() => {
    if (streamingTextContainerRef.current) {
      streamingTextContainerRef.current.scrollTop = streamingTextContainerRef.current.scrollHeight;
    }
  }, [streamingText]);

  const getWrapperClasses = () => {
    const baseClasses = "rounded-2xl overflow-hidden border border-white/8 backdrop-blur-3xl font-sans transition-all duration-300";
    
    if (initialData.isIframe) {
      return `${baseClasses} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
    }
    
    if (initialData.viewType !== 'bubble') {
      return `${baseClasses} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
    }
    
    return baseClasses;
  };

  const getWidthClasses = () => {
    if (isOpen) {
      return initialData.viewType === 'bubble' ? 'w-[300px]' : 'w-[350px]';
    }
    return initialData.viewType === 'bubble' ? 'w-[240px]' : 'w-[280px]';
  };

  return (
    <div 
      className={`${getWrapperClasses()} ${getWidthClasses()}`}
      style={{
        background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: `
          0 20px 40px rgba(0, 0, 0, 0.3),
          0 8px 16px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `
      }}
    >
      {isLoading ? (
        <div className="p-3.5 px-5 flex flex-col items-center gap-2.5 w-full">
          <div className="text-white/80 text-xs font-medium animate-pulse">...</div>
          <div className="text-white/70 text-xs text-center font-medium tracking-wide">Loading...</div>
        </div>
      ) : (
        <div className={`p-4.5 px-6 flex flex-col items-center gap-2.5 w-full ${!isOpen ? 'flex-row' : ''}`}>
          {!isOpen && (
            <>
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="text-center text-white/90 text-sm font-medium tracking-wide mb-1.5">
                  Need support?
                </div>
                <button 
                  onClick={handleVoiceChatClick} 
                  disabled={isLoading || !initialData.validation.success}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold border-none cursor-pointer text-xs tracking-wide transition-all duration-200 shadow-lg bg-gradient-to-r from-white to-gray-50 text-gray-900 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Start voice chat
                </button>
              </div>
              
              {initialData.validation.error && (
                <div className="text-red-500 text-xs text-center bg-red-500/8 px-4 py-2.5 rounded-2xl border border-red-500/15 w-full box-border font-medium backdrop-blur-sm mt-2">
                  {initialData.validation.error}
                </div>
              )}
            </>
          )}

          {isOpen && (
            <>
              {connecting && (
                <>
                  <div className="text-white/70 text-xs text-center font-medium tracking-wide">
                    Connecting to voice agent...
                  </div>
                  <button 
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold border-none cursor-pointer text-xs tracking-wide transition-all duration-200 shadow-lg bg-white/12 text-white/95 border border-white/15 hover:bg-white/18 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleClose} 
                    disabled={connecting}
                  >
                    {connecting ? 'Connecting...' : 'Cancel'}
                  </button>
                </>
              )}
              
              {!connecting && (
                <>
                  {isListeningForUser && !streamingText && (
                    <div className="text-white/80 text-xs text-center bg-black/30 px-4 py-2 rounded-2xl w-full box-border font-medium backdrop-blur-sm border border-white/8 tracking-wider">
                      Listening...
                    </div>
                  )}
                  
                  {streamingText && (
                    <>
                      <div 
                        ref={streamingTextContainerRef} 
                        className={`text-white/90 text-xs text-left bg-white/8 px-5 py-4 rounded-xl w-full box-border font-normal max-h-20 overflow-y-auto break-words leading-relaxed transition-all duration-300 backdrop-blur-sm border border-white/10 relative mb-2 ${
                          streamingText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2.5'
                        }`}
                      >
                        <div className="whitespace-pre-line break-words">
                          {streamingText}
                        </div>
                      </div>
                      {!isStreamComplete && (
                        <div className="text-white/60 text-xs text-center mt-1 opacity-100 transition-opacity duration-300 tracking-wide">
                          Generating response...
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="text-white/70 text-xs text-center font-medium tracking-wide">
                    {callDuration}
                    {connectionQuality !== ConnectionQuality.Excellent && (
                      <div className="text-xs text-white/50">
                        Quality: {connectionQuality === ConnectionQuality.Poor ? 'Poor' : 'Good'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 items-center justify-center w-full">
                    <button 
                      onClick={handleClose} 
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold border-none cursor-pointer text-xs tracking-wide transition-all duration-200 shadow-lg bg-gradient-to-r from-red-500 to-red-700 text-white hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <PhoneIcon />
                      Hang up
                    </button>
                    <button 
                      className={`w-11 h-11 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 hover:shadow-xl ${
                        isMicMuted 
                          ? 'bg-gradient-to-r from-red-500 to-red-700 border border-red-500/30' 
                          : 'bg-white/15 border border-white/20'
                      }`}
                      onClick={handleMicMute}
                    >
                      {isMicMuted ? <MicOffIcon /> : <MicIcon />}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-500/8 px-4 py-2.5 rounded-2xl border border-red-500/15 w-full box-border font-medium backdrop-blur-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceOnlyClient;
