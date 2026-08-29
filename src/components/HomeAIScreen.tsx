/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Square,
  Send,
  Sparkles,
  CloudRain,
  Sun,
  Snowflake,
  Moon,
  Sliders,
  Bot,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertCircle,
  Box,
  Compass,
  AudioWaveform,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { VoiceOrb } from './VoiceOrb';
import { ChatTranscript } from './ChatTranscript';
import { PreferencesPanel } from './PreferencesPanel';
import { LiveDeviceMonitor } from './LiveDeviceMonitor';
import { House3DViewer } from './HouseScene/House3DViewer';
import type {
  AllRoomsState,
  OrbState,
  WeatherCondition,
  TranscriptMessage,
  PreferenceRule,
} from '../types';

interface HomeAIScreenProps {
  onBack: () => void;
  roomsState: AllRoomsState;
  setRoomsState: Dispatch<SetStateAction<AllRoomsState>>;
  preferences: PreferenceRule[];
  setPreferences: Dispatch<SetStateAction<PreferenceRule[]>>;
  transcriptHistory: TranscriptMessage[];
  setTranscriptHistory: Dispatch<SetStateAction<TranscriptMessage[]>>;
  currentWeather: WeatherCondition;
  setCurrentWeather: Dispatch<SetStateAction<WeatherCondition>>;
}

// Global window extension for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function HomeAIScreen({
  onBack,
  roomsState,
  setRoomsState,
  preferences,
  setPreferences,
  transcriptHistory,
  setTranscriptHistory,
  currentWeather,
  setCurrentWeather,
}: HomeAIScreenProps) {
  const [activeTab, setActiveTab] = useState<'spatial' | 'voice' | 'preferences'>('spatial');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [weatherTriggerNotice, setWeatherTriggerNotice] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [recordDuration, setRecordDuration] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const pressStartTimestampRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Check API health / key presence
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });

    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Helper to stop audio stream & analysis
  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Helper to speak AI responses if TTS is turned on
  const speakResponse = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  };

  // Process user transcript via server-side Gemini endpoint
  const processTranscript = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) {
      setOrbState('idle');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message to transcript log
    const userMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp,
    };

    setTranscriptHistory((prev) => [...prev, userMsg]);
    setOrbState('thinking');
    setInterimTranscript('');

    try {
      const response = await fetch('/api/home-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          currentState: roomsState,
          preferences,
          currentWeather,
        }),
      });

      const data = await response.json();

      const aiMsgTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Handle Device Commands
      if (data.type === 'command' && data.deviceUpdates) {
        // Deep merge updates into roomsState
        setRoomsState((prev) => {
          const next = { ...prev };
          for (const [roomKey, roomUpdates] of Object.entries(data.deviceUpdates)) {
            if (next[roomKey as keyof AllRoomsState]) {
              next[roomKey as keyof AllRoomsState] = {
                ...next[roomKey as keyof AllRoomsState],
                ...(roomUpdates as object),
              } as any;
            }
          }
          return next;
        });

        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: data.message || 'Command executed.',
          timestamp: aiMsgTimestamp,
          type: 'command',
          deviceUpdates: data.deviceUpdates,
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
      // Handle Stated Preferences / Automation Rules
      else if (data.type === 'preference' && data.preference) {
        const newPref: PreferenceRule = {
          id: data.preference.id || `pref-${Date.now()}`,
          ruleText: data.preference.ruleText || text,
          condition: data.preference.condition || 'rainy',
          conditionDescription: data.preference.conditionDescription || 'Automated condition',
          summary: data.preference.summary || `Execute custom automation for ${data.preference.condition}`,
          deviceUpdates: data.preference.deviceUpdates || {},
          createdAt: 'Just now',
        };

        setPreferences((prev) => [newPref, ...prev]);

        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text:
            data.message ||
            `I've remembered your preference: "${newPref.ruleText}". It has been added to your rules list.`,
          timestamp: aiMsgTimestamp,
          type: 'preference',
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
      // Handle General Chat
      else {
        const aiMsg: TranscriptMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: data.message || "I'm listening and monitoring your home systems.",
          timestamp: aiMsgTimestamp,
          type: 'chat',
        };

        setTranscriptHistory((prev) => [...prev, aiMsg]);
        speakResponse(aiMsg.text);
      }
    } catch (err: any) {
      console.error('Home AI processing failure:', err);
      const aiErrMsg: TranscriptMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: 'Sorry, I had trouble processing that request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'chat',
      };
      setTranscriptHistory((prev) => [...prev, aiErrMsg]);
    } finally {
      setOrbState('idle');
    }
  };

  // Process raw audio via server-side Gemini multimodal endpoint
  const processAudioBlob = async (blob: Blob) => {
    if (blob.size < 1000) {
      setOrbState('idle');
      return;
    }

    setOrbState('thinking');
    setInterimTranscript('Transcribing & analyzing spoken audio...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          const mimeType = blob.type.split(';')[0] || 'audio/webm';

          const response = await fetch('/api/home-ai/process-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType,
              currentState: roomsState,
              preferences,
              currentWeather,
            }),
          });

          const data = await response.json();
          const spokenText = data.transcript || 'Spoken Audio Command';
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // 1. Add user's spoken words
          const userMsg: TranscriptMessage = {
            id: `msg-${Date.now()}-user`,
            sender: 'user',
            text: spokenText,
            timestamp,
          };
          setTranscriptHistory((prev) => [...prev, userMsg]);

          // 2. Handle commands
          if (data.type === 'command' && data.deviceUpdates) {
            setRoomsState((prev) => {
              const next = { ...prev };
              for (const [roomKey, roomUpdates] of Object.entries(data.deviceUpdates)) {
                if (next[roomKey as keyof AllRoomsState]) {
                  next[roomKey as keyof AllRoomsState] = {
                    ...next[roomKey as keyof AllRoomsState],
                    ...(roomUpdates as object),
                  } as any;
                }
              }
              return next;
            });

            const aiMsg: TranscriptMessage = {
              id: `msg-${Date.now()}-ai`,
              sender: 'ai',
              text: data.message || 'Command executed.',
              timestamp,
              type: 'command',
              deviceUpdates: data.deviceUpdates,
            };
            setTranscriptHistory((prev) => [...prev, aiMsg]);
            speakResponse(aiMsg.text);
          } else if (data.type === 'preference' && data.preference) {
            const newPref: PreferenceRule = {
              id: data.preference.id || `pref-${Date.now()}`,
              ruleText: data.preference.ruleText || spokenText,
              condition: data.preference.condition || 'rainy',
              conditionDescription: data.preference.conditionDescription || 'Automated condition',
              summary: data.preference.summary || `Execute custom automation for ${data.preference.condition}`,
              deviceUpdates: data.preference.deviceUpdates || {},
              createdAt: 'Just now',
            };
            setPreferences((prev) => [newPref, ...prev]);

            const aiMsg: TranscriptMessage = {
              id: `msg-${Date.now()}-ai`,
              sender: 'ai',
              text: data.message || `I've saved your preference: "${newPref.ruleText}".`,
              timestamp,
              type: 'preference',
            };
            setTranscriptHistory((prev) => [...prev, aiMsg]);
            speakResponse(aiMsg.text);
          } else {
            const aiMsg: TranscriptMessage = {
              id: `msg-${Date.now()}-ai`,
              sender: 'ai',
              text: data.message || "I've heard your voice command.",
              timestamp,
              type: 'chat',
            };
            setTranscriptHistory((prev) => [...prev, aiMsg]);
            speakResponse(aiMsg.text);
          }
        } catch (e: any) {
          console.error('Audio processing fetch failure:', e);
          const aiErrMsg: TranscriptMessage = {
            id: `msg-${Date.now()}-error`,
            sender: 'ai',
            text: 'I could not recognize your voice audio clearly. You can try speaking closer to the mic or typing your command.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'chat',
          };
          setTranscriptHistory((prev) => [...prev, aiErrMsg]);
        } finally {
          setOrbState('idle');
          setInterimTranscript('');
        }
      };

      reader.readAsDataURL(blob);
    } catch (e) {
      console.error('FileReader error:', e);
      setOrbState('idle');
      setInterimTranscript('');
    }
  };

  // Start Recording Pipeline (MediaStream + Analyser + MediaRecorder + SpeechRecognition)
  const startRecordingPipeline = async () => {
    setSpeechError(null);
    setInterimTranscript('');
    accumulatedTranscriptRef.current = '';
    audioChunksRef.current = [];
    setRecordDuration(0);

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setMicPermission('granted');
      setIsRecording(true);
      setOrbState('listening');

      // 2. Start Web Audio Analyser for live volume meter
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);
            animFrameRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        }
      } catch (e) {
        console.warn('AudioContext visualization setup notice:', e);
      }

      // 3. Start MediaRecorder for backup direct audio capture
      try {
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(150);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('MediaRecorder notice:', e);
      }

      // 4. Start SpeechRecognition for real-time text transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch {
              // ignore
            }
          }

          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setSpeechError(null);
          };

          recognition.onresult = (event: any) => {
            let currentInterim = '';
            let currentFinal = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcriptPiece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                currentFinal += transcriptPiece + ' ';
              } else {
                currentInterim += transcriptPiece;
              }
            }

            if (currentFinal) {
              accumulatedTranscriptRef.current += currentFinal;
            }

            const activeDisplay = (currentInterim || accumulatedTranscriptRef.current).trim();
            if (activeDisplay) {
              setInterimTranscript(activeDisplay);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('SpeechRecognition event error:', event.error);
            if (event.error === 'not-allowed') {
              setSpeechError('Microphone access denied in browser settings.');
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition start failed:', e);
        }
      }

      // 5. Start Duration Timer
      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone request error:', err);
      setMicPermission('denied');
      setSpeechError('Microphone access blocked. Please allow mic permission in your browser or type commands below.');
      setOrbState('idle');
      setIsRecording(false);
    }
  };

  // Stop Recording Pipeline & Process Intent
  const stopRecordingPipeline = (cancel = false) => {
    setIsRecording(false);
    setIsPressed(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (cancel) {
      stopAudioAnalysis();
      setOrbState('idle');
      setInterimTranscript('');
      accumulatedTranscriptRef.current = '';
      audioChunksRef.current = [];
      return;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Allow 280ms for final data chunks to arrive
    setTimeout(() => {
      const finalTranscript = (accumulatedTranscriptRef.current.trim() || interimTranscript.trim());

      // If speech recognition transcribed text, process directly
      if (finalTranscript && finalTranscript.length > 1) {
        stopAudioAnalysis();
        processTranscript(finalTranscript);
        return;
      }

      // Otherwise, fallback to direct audio blob upload
      const chunks = audioChunksRef.current;
      if (chunks.length > 0) {
        const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mime });
        stopAudioAnalysis();

        if (audioBlob.size > 2000) {
          processAudioBlob(audioBlob);
          return;
        }
      }

      // No speech caught
      stopAudioAnalysis();
      setOrbState('idle');
      setInterimTranscript('');
      setSpeechError('No voice recognized. Try speaking into your microphone or selecting a quick action below.');
      setTimeout(() => setSpeechError(null), 6000);
    }, 280);
  };

  // Toggle Mode Click Handler
  const handleToggleClick = () => {
    if (orbState === 'thinking') return;

    if (isRecording) {
      stopRecordingPipeline(false);
    } else {
      startRecordingPipeline();
    }
  };

  // Push-to-Talk Mouse Handlers (Optional Hold Mode)
  const handleMouseDown = () => {
    if (orbState === 'thinking') return;
    pressStartTimestampRef.current = Date.now();
    setIsPressed(true);
    if (!isRecording) {
      startRecordingPipeline();
    }
  };

  const handleMouseUp = () => {
    if (!isPressed) return;
    setIsPressed(false);
    const holdDuration = Date.now() - pressStartTimestampRef.current;

    // If held for more than 400ms, treat as push-to-talk release
    if (holdDuration > 400 && isRecording) {
      stopRecordingPipeline(false);
    }
  };

  // Handle weather change simulation & apply matching stored preferences
  const handleWeatherChange = (newWeather: WeatherCondition) => {
    if (newWeather === currentWeather) return;

    setCurrentWeather(newWeather);

    // Find any preferences matching this new weather condition
    const matchingRules = preferences.filter((pref) => {
      const condition = pref.condition.toLowerCase();
      const desc = pref.conditionDescription.toLowerCase();
      const target = newWeather.toLowerCase();
      return condition === target || desc.includes(target) || (target === 'rainy' && (condition.includes('rain') || condition.includes('storm')));
    });

    if (matchingRules.length > 0) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Apply all matching device updates
      let mergedUpdates: Record<string, any> = {};

      matchingRules.forEach((rule) => {
        mergedUpdates = { ...mergedUpdates, ...rule.deviceUpdates };
      });

      setRoomsState((prev) => {
        const next = { ...prev };
        for (const [roomKey, roomUpdates] of Object.entries(mergedUpdates)) {
          if (next[roomKey as keyof AllRoomsState]) {
            next[roomKey as keyof AllRoomsState] = {
              ...next[roomKey as keyof AllRoomsState],
              ...(roomUpdates as object),
            } as any;
          }
        }
        return next;
      });

      // Craft proactive notification text as requested
      let notificationText = '';
      if (newWeather === 'rainy') {
        notificationText = "It's raining — I've closed the doors and windows. I remembered you wanted that.";
      } else if (newWeather === 'winter') {
        notificationText = "Winter conditions detected — I've turned off AC units and ceiling fans as you instructed.";
      } else if (newWeather === 'sunny') {
        notificationText = "It's sunny outside — I've optimized the climate controls according to your preference.";
      } else {
        notificationText = `Weather changed to ${newWeather} — I've applied your ${matchingRules.length} saved automation rule(s).`;
      }

      const systemMsg: TranscriptMessage = {
        id: `msg-${Date.now()}-system`,
        sender: 'system',
        text: notificationText,
        timestamp,
        type: 'weather_trigger',
        deviceUpdates: mergedUpdates,
      };

      setTranscriptHistory((prev) => [...prev, systemMsg]);
      speakResponse(notificationText);

      setWeatherTriggerNotice(notificationText);
      setTimeout(() => setWeatherTriggerNotice(null), 5000);
    }
  };

  // Trigger individual preference manually
  const handleTriggerPreference = (rule: PreferenceRule) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRoomsState((prev) => {
      const next = { ...prev };
      for (const [roomKey, roomUpdates] of Object.entries(rule.deviceUpdates)) {
        if (next[roomKey as keyof AllRoomsState]) {
          next[roomKey as keyof AllRoomsState] = {
            ...next[roomKey as keyof AllRoomsState],
            ...(roomUpdates as object),
          } as any;
        }
      }
      return next;
    });

    const triggerMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-pref-manual`,
      sender: 'system',
      text: `Manual Automation Trigger: Applied rule "${rule.ruleText}".`,
      timestamp,
      type: 'weather_trigger',
      deviceUpdates: rule.deviceUpdates,
    };

    setTranscriptHistory((prev) => [...prev, triggerMsg]);
    speakResponse(`Executed rule: ${rule.ruleText}`);
  };

  const handleRemovePreference = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSampleRule = (rule: Omit<PreferenceRule, 'id' | 'createdAt'>) => {
    const newPref: PreferenceRule = {
      ...rule,
      id: `pref-${Date.now()}`,
      createdAt: 'Just now',
    };
    setPreferences((prev) => [newPref, ...prev]);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiMsg: TranscriptMessage = {
      id: `msg-${Date.now()}-ai-sample`,
      sender: 'ai',
      text: `Added new automation recipe: "${newPref.ruleText}".`,
      timestamp,
      type: 'preference',
    };
    setTranscriptHistory((prev) => [...prev, aiMsg]);
  };

  // Quick sample command chip clicked
  const handleSamplePrompt = (prompt: string) => {
    processTranscript(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="home-ai-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline text-lg sm:text-xl text-white font-bold tracking-wide">
                Voice & Automation Hub
              </h2>
              <span className="text-xs font-mono text-emerald-400">
                • 9 Rooms Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live acoustic command reception and proactive weather protection rules
            </p>
          </div>
        </div>

        {/* Right side controls: Segmented Weather Switcher & TTS Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Segmented Weather Simulation Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-2.5">
              Weather:
            </span>

            <div className="flex items-center gap-1">
              <button
                id="weather-toggle-sunny"
                onClick={() => handleWeatherChange('sunny')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'sunny'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Sunny Climate"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sunny</span>
              </button>

              <button
                id="weather-toggle-rainy"
                onClick={() => handleWeatherChange('rainy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'rainy'
                    ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Rainy Weather (Triggers Rain Rules)"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rainy</span>
              </button>

              <button
                id="weather-toggle-winter"
                onClick={() => handleWeatherChange('winter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentWeather === 'winter'
                    ? 'bg-indigo-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Simulate Winter Weather"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Winter</span>
              </button>
            </div>
          </div>

          {/* Spoken Output Toggle */}
          <button
            id="toggle-tts-audio"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-colors ${
              ttsEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={ttsEnabled ? 'Spoken Voice Output: Enabled' : 'Spoken Voice Output: Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="font-mono text-xs">{ttsEnabled ? 'Voice Active' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Proactive Weather Trigger Notification Toast */}
      <AnimatePresence>
        {weatherTriggerNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <CloudRain className="w-5 h-5 text-sky-400 shrink-0" />
              <p className="text-xs sm:text-sm text-sky-100 font-medium">
                {weatherTriggerNotice}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Rule Applied
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          id="tab-spatial-3d"
          onClick={() => setActiveTab('spatial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'spatial'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Box className="w-4 h-4 text-sky-400" />
          <span>3D House Scene</span>
        </button>

        <button
          id="tab-voice-ai"
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'voice'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Mic className="w-4 h-4 text-sky-400" />
          <span>Voice Terminal</span>
        </button>

        <button
          id="tab-preferences"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Autonomous Protection Rules</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-amber-300 border border-slate-800">
            {preferences.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 3D Spatial House Interactive Scene */}
      {activeTab === 'spatial' && (
        <div className="space-y-6">
          <House3DViewer
            roomsState={roomsState}
            setRoomsState={setRoomsState}
            onDeviceAction={(msg) => {
              // Add entry to transcript history
              setTranscriptHistory((prev) => [
                ...prev,
                {
                  id: `action-${Date.now()}`,
                  sender: 'system',
                  text: `[3D Spatial Interaction] ${msg}`,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  type: 'command',
                },
              ]);
            }}
          />

          {/* Quick Telemetry & Voice Companion Strip underneath 3D Scene */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <LiveDeviceMonitor roomsState={roomsState} />
            </div>
            <div className="lg:col-span-5">
              <ChatTranscript
                messages={transcriptHistory}
                onClear={() => setTranscriptHistory([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Voice & Chat Terminal */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          {/* Integrated House Zone & Push-to-Talk Interactive Console */}
          <div
            id="voice-interaction-console"
            className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-5 sm:p-7 flex flex-col items-center justify-center relative shadow-xl"
          >
            {/* Real-time House Zone Acoustic Console */}
            <VoiceOrb
              state={orbState}
              interimTranscript={interimTranscript}
              isPressed={isPressed || isRecording}
              roomsState={roomsState}
              audioLevel={audioLevel}
            />

            {/* Live Recording HUD when active */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mt-4 px-4 py-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <div className="text-xs font-mono font-bold text-sky-200">
                      RECORDING ACTIVE ({Math.floor(recordDuration / 60)}:{String(recordDuration % 60).padStart(2, '0')})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Speak naturally — say a room command or preference rule
                    </div>
                  </div>
                </div>

                {/* Real-time decibel volume gauge */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Input:</span>
                  <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 transition-all duration-75"
                      style={{ width: `${Math.max(5, audioLevel)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-sky-300 w-7 text-right">
                    {audioLevel}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* Unified Command Toolstrip: Microphone Controls + Text Input */}
            <div className="w-full mt-5 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-center gap-3">
              {/* Primary Microphone Trigger Controls */}
              <div className="w-full md:w-auto flex items-center gap-2">
                {!isRecording ? (
                  <button
                    id="push-to-talk-btn"
                    onClick={handleToggleClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    disabled={orbState === 'thinking'}
                    className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all select-none cursor-pointer shrink-0 ${
                      orbState === 'thinking'
                        ? 'bg-slate-800 text-amber-300 border border-amber-500/30 cursor-wait'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md hover:shadow-amber-500/20 active:scale-95'
                    }`}
                    title="Click to start listening, or hold to speak"
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      {orbState === 'thinking' ? 'Processing Voice...' : 'Click to Speak'}
                    </span>
                  </button>
                ) : (
                  <div className="w-full md:w-auto flex items-center gap-2">
                    <button
                      id="voice-stop-send-btn"
                      onClick={() => stopRecordingPipeline(false)}
                      className="flex-1 md:flex-initial px-5 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Finish & Send</span>
                    </button>
                    <button
                      id="voice-cancel-btn"
                      onClick={() => stopRecordingPipeline(true)}
                      className="px-3.5 py-3.5 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
                      title="Discard audio"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Integrated Text Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim() && orbState !== 'thinking') {
                    processTranscript(textInput);
                    setTextInput('');
                  }
                }}
                className="w-full flex-1 flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-slate-600 transition-colors"
              >
                <input
                  id="voice-text-command-input"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Or type a command (e.g. 'Turn on dining chandelier', 'Close doors when it rains')..."
                  disabled={orbState === 'thinking' || isRecording}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                <button
                  id="voice-text-command-submit"
                  type="submit"
                  disabled={!textInput.trim() || orbState === 'thinking' || isRecording}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Send Command"
                >
                  <span>Execute</span>
                  <Send className="w-3 h-3 text-sky-400" />
                </button>
              </form>
            </div>

            {/* Error or status notifications */}
            {speechError && (
              <div className="mt-3 w-full p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-2 text-xs text-rose-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{speechError}</span>
                </div>
                <button
                  onClick={() => startRecordingPipeline()}
                  className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 cursor-pointer font-mono"
                >
                  Retry Mic
                </button>
              </div>
            )}

            {/* Quick Action Shortcuts */}
            <div className="w-full mt-4 flex flex-wrap items-center justify-start gap-2 pt-3 border-t border-slate-800/40 text-xs">
              <span className="text-slate-400 font-mono text-[11px] mr-1">Quick voice commands:</span>
              {[
                'Close doors and windows when it rains',
                'Lock all exterior doors',
                'Turn on dining chandelier',
                'Set living room AC to 68',
                'Turn off bedroom fans',
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSamplePrompt(sample)}
                  disabled={orbState === 'thinking' || isRecording}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Transcript Log and Live Synchronized Device States */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ChatTranscript
                messages={transcriptHistory}
                onClear={() => setTranscriptHistory([])}
              />
            </div>
            <div className="lg:col-span-5">
              <LiveDeviceMonitor roomsState={roomsState} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stored Rules & Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <PreferencesPanel
            preferences={preferences}
            currentWeather={currentWeather}
            onRemovePreference={handleRemovePreference}
            onTriggerPreference={handleTriggerPreference}
            onAddSampleRule={handleAddSampleRule}
          />
          <LiveDeviceMonitor roomsState={roomsState} />
        </div>
      )}
    </motion.div>
  );
}
