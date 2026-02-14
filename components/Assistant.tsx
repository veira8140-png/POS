
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Transaction, Product, OwnerProfile, BusinessType, UserRole } from '../types';
import { Icons, QUICK_PROMPTS } from '../constants';
import { getAssistantResponse } from '../services/geminiService';

interface AssistantProps {
  transactions: Transaction[];
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  ownerProfile: OwnerProfile;
  businessType: BusinessType;
  userRole: UserRole;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Assistant: React.FC<AssistantProps> = ({ transactions, products, isOpen, onClose, ownerProfile, businessType, userRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi! I'm Veira, your business assistant. How can I help you check your records today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio & Live API Refs
  const liveSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentOutputTranscriptionRef = useRef('');
  const currentInputTranscriptionRef = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isVoiceMode]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getAssistantResponse(text, history, transactions, products, ownerProfile, businessType, userRole);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText || "Sorry, I can't connect right now. Please try again." }]);
    setIsTyping(false);
  };

  // --- Voice Integration Logic ---

  const startVoiceMode = async () => {
    try {
      setIsLiveActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputTranscriptionRef.current) {
                setMessages(prev => [...prev, { role: 'user', text: currentInputTranscriptionRef.current }]);
              }
              if (currentOutputTranscriptionRef.current) {
                setMessages(prev => [...prev, { role: 'model', text: currentOutputTranscriptionRef.current }]);
              }
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            // Handle Audio Data
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decodeBase64(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of audioSourcesRef.current) {
                source.stop();
              }
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live Voice Error:', e),
          onclose: () => stopVoiceMode(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Veira, a helpful retail business assistant for Kenya. 
          Context: Business is ${businessType}. Owner profile is ${ownerProfile}. 
          Job role: ${userRole}. 
          Latest Stats: Total Sales KES ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}.
          Speak clearly and professionally. Use KES for money. Keep it conversational but concise.`
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice mode:', err);
      setIsLiveActive(false);
    }
  };

  const stopVoiceMode = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsLiveActive(false);
  };

  // --- Helper Functions ---

  function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-[450px] bg-white shadow-2xl z-[100] flex flex-col md:border-l border-slate-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 md:p-10 bg-[#2C0D36] text-white flex flex-col items-center shrink-0 relative">
        <button onClick={() => { stopVoiceMode(); onClose(); }} className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 text-white/40 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="absolute top-4 md:top-6 left-4 md:left-6">
           <button 
            onClick={() => {
              if (isVoiceMode) stopVoiceMode();
              setIsVoiceMode(!isVoiceMode);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
              isVoiceMode ? 'bg-[#2D9B9B] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {isVoiceMode ? 'Voice Mode' : 'Chat Mode'}
          </button>
        </div>
        
        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] mb-4 flex items-center justify-center relative ${isLiveActive ? 'orb-active shadow-[0_0_50px_rgba(138,63,160,0.8)]' : 'orb-idle'}`}>
           {isLiveActive && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping"></div>
           )}
           {isVoiceMode && <Icons.Mic />}
        </div>
        
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Veira Intelligence</h3>
        <p className="text-xs md:text-sm font-light text-slate-300 tracking-wide">
          {isLiveActive ? 'Listening Live...' : (isTyping ? 'Veira is thinking...' : `Kore is ready for your questions`)}
        </p>
      </div>

      {/* Main Content (Chat or Voice View) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 relative">
        {isVoiceMode && !isLiveActive ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="p-8 bg-white rounded-full border border-slate-100 shadow-sm text-[#2C0D36]">
                <Icons.Mic />
             </div>
             <div>
                <h4 className="font-display text-xl text-[#2C0D36]">Ready for a Conversation?</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Talk naturally to Veira about your sales, stock, and business health.</p>
             </div>
             <button 
              onClick={startVoiceMode}
              className="bg-[#2D9B9B] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Start Speaking
            </button>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] md:max-w-[85%] p-4 md:p-5 rounded-[20px] md:rounded-[24px] text-xs md:text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-[#2C0D36] text-white rounded-tr-none shadow-xl' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm font-medium'
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="w-12 h-6 flex items-center justify-center gap-1 bg-white border border-slate-100 rounded-full px-3 py-4 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-[#8A3FA0] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#8A3FA0] rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#8A3FA0] rounded-full animate-bounce [animation-delay:-.5s]"></div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 md:p-8 border-t border-slate-100 bg-white space-y-4">
        {isLiveActive ? (
          <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in zoom-in duration-300">
             <div className="flex gap-1 h-8 items-center">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-[#2D9B9B] rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
             </div>
             <button 
              onClick={stopVoiceMode}
              className="flex items-center gap-3 px-8 py-3 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <Icons.Stop /> Stop Conversation
            </button>
          </div>
        ) : (
          <>
            {!isVoiceMode && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wider border border-slate-200 bg-white text-slate-500 px-3 py-2 rounded-xl hover:bg-[#8A3FA0] hover:text-white hover:border-[#8A3FA0] transition-all shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            
            <div className="relative">
              <input
                type="text"
                disabled={isVoiceMode}
                placeholder={isVoiceMode ? "Voice Mode Active" : "Ask Veira anything about your sales..."}
                className={`w-full pl-6 pr-14 py-4 md:py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:bg-white focus:border-[#2D9B9B]/30 transition-all text-sm font-medium placeholder:text-slate-400 ${isVoiceMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping || isVoiceMode}
                className="absolute right-2 top-2 bottom-2 w-12 md:w-14 flex items-center justify-center bg-[#2D9B9B] text-white rounded-full disabled:bg-slate-200 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assistant;
