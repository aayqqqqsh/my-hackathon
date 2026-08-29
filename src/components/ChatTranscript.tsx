/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranscriptMessage } from '../types';
import { Bot, User, Sparkles, CloudRain, Trash2, CheckCircle2, Zap } from 'lucide-react';

interface ChatTranscriptProps {
  messages: TranscriptMessage[];
  onClear: () => void;
}

export function ChatTranscript({ messages, onClear }: ChatTranscriptProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div
      id="home-ai-transcript-container"
      className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col h-[360px] sm:h-[400px] overflow-hidden shadow-xl"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Activity Log
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ({messages.length})
          </span>
        </div>

        {messages.length > 0 && (
          <button
            id="clear-transcript-btn"
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Clear Chat Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono">Clear</span>
          </button>
        )}
      </div>

      {/* Messages List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 text-amber-400/40 mb-2" />
            <p className="text-sm font-medium text-slate-400">No interaction logs yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Hold the Push-to-Talk button above or pick a sample command to interact with your smart home.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isSystem
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isSystem ? <CloudRain className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tr-sm shadow-md'
                      : isSystem
                      ? 'bg-amber-950/30 text-amber-100 border border-amber-500/30 rounded-tl-sm'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                  }`}
                >
                  {/* Sender label and timestamp */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px]">
                    <span
                      className={`font-semibold font-mono ${
                        isUser
                          ? 'text-sky-300'
                          : isSystem
                          ? 'text-amber-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {isUser ? 'You' : isSystem ? 'KeepSafe Automation' : 'KeepSafe AI'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{msg.timestamp}</span>
                  </div>

                  {/* Message body */}
                  <p className="whitespace-pre-wrap font-normal">{msg.text}</p>

                  {/* Device updates badge if applicable */}
                  {msg.deviceUpdates && Object.keys(msg.deviceUpdates).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px] text-sky-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-mono text-slate-400">Applied:</span>
                      {Object.entries(msg.deviceUpdates).map(([room, updates]) => (
                        <span
                          key={room}
                          className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300"
                        >
                          {room}: {Object.keys(updates as object).join(', ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.type === 'preference' && (
                    <div className="mt-2 pt-1.5 border-t border-amber-500/20 flex items-center gap-1 text-[11px] text-amber-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Automation rule saved to Preferences</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
