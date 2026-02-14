
import React, { useState, useRef, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-[450px] bg-white shadow-2xl z-[100] flex flex-col md:border-l border-slate-100 animate-in slide-in-from-right duration-300">
      <div className="p-6 md:p-10 bg-[#2C0D36] text-white flex flex-col items-center shrink-0 relative">
        <button onClick={onClose} className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 text-white/40 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        
        <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] mb-4 ${isTyping ? 'orb-active' : 'orb-idle'}`}></div>
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Veira AI</h3>
        <p className="text-xs md:text-sm font-light text-slate-300 tracking-wide">{isTyping ? 'Thinking...' : `Logged in as: ${userRole}`}</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50">
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
      </div>

      <div className="p-4 md:p-8 border-t border-slate-100 bg-white space-y-4">
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
        <div className="relative">
          <input
            type="text"
            placeholder="Ask Veira anything about your sales..."
            className="w-full pl-6 pr-14 py-4 md:py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:bg-white focus:border-[#2D9B9B]/30 transition-all text-sm font-medium placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-12 md:w-14 flex items-center justify-center bg-[#2D9B9B] text-white rounded-full disabled:bg-slate-200 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
