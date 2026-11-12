import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, MessageSquare, Send, Bot, ShieldCheck, User as UserIcon, 
  HelpCircle, Clock, CheckCheck, RefreshCw, Zap, Sparkles 
} from 'lucide-react';

export const HelpChatModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    currentUser, 
    supportMessages, 
    sendSupportMessage, 
    markChatAsRead,
    isCloudSynced 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'GENERAL' | 'RECHARGE' | 'WITHDRAWAL' | 'PLAN'>('GENERAL');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const userId = currentUser?.id || 'GUEST';

  // Filter messages for current user (or broadcast/guest)
  const userMessages = supportMessages.filter(m => m.userId === userId || m.userId === 'U-ALL');

  // Mark messages as read by user when modal opens or new messages arrive
  useEffect(() => {
    if (activeModal === 'help-chat' && userId) {
      markChatAsRead(userId, 'user');
    }
  }, [activeModal, supportMessages.length, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeModal === 'help-chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessages.length, activeModal]);

  if (activeModal !== 'help-chat') {
    return null;
  }

  const handleSend = (textToSend?: string, categoryToSend?: 'GENERAL' | 'RECHARGE' | 'WITHDRAWAL' | 'PLAN') => {
    const text = textToSend || inputMessage;
    const cat = categoryToSend || selectedCategory;
    if (!text || !text.trim()) return;

    sendSupportMessage(text.trim(), cat, userId);
    setInputMessage('');
  };

  const quickPrompts = [
    { text: 'Maine recharge submit kiya hai, kab tak verify hoga?', category: 'RECHARGE' as const, label: '⚡ Recharge UTR status' },
    { text: 'Withdrawal request account me aane me kitna samay lagta hai?', category: 'WITHDRAWAL' as const, label: '💰 Withdrawal timing' },
    { text: 'Plan purchase karne ke bad daily income kaise claim karein?', category: 'PLAN' as const, label: '📈 Plan & Daily profit' },
    { text: 'Referral team commission kaise calculate hota hai?', category: 'GENERAL' as const, label: '🤝 Referral commission' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-1.5">
                  24/7 Live Customer Support
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </h3>
              </div>
              <p className="text-slate-400 text-xs">
                सपोर्ट चैट व सहायता केंद्र • Logitech Direct Admin Desk {isCloudSynced && '• Cloud Synced'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal(null)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info & Category Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">User:</span>
            <span className="font-semibold text-emerald-400">{currentUser?.name || 'Guest User'}</span>
            <span className="text-slate-500">({currentUser?.id || 'ID: GUEST'})</span>
            {currentUser?.planId && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold">
                {currentUser.planId}
              </span>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] hidden sm:inline">Category:</span>
            {(['GENERAL', 'RECHARGE', 'WITHDRAWAL', 'PLAN'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                {cat === 'GENERAL' ? 'सामान्य' : cat === 'RECHARGE' ? 'रिचार्ज/UTR' : cat === 'WITHDRAWAL' ? 'निकासी' : 'प्लान'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick FAQ / Prompt Chips */}
        <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/40 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick:</span>
          </div>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.text, q.category)}
              className="text-[11px] shrink-0 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-all flex items-center gap-1"
            >
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950/40 to-slate-950/80">
          {userMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h4 className="text-white font-semibold text-base mb-1">
                How can Admin support help you today?
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                यदि आपको रिचार्ज UTR, निकासी, या प्लान से सम्बंधित कोई सवाल है तो यहाँ मैसेज करें। एडमिन तुरंत रिप्लाई करेंगे।
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left w-full max-w-md">
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text, q.category)}
                    className="p-2.5 rounded-xl bg-slate-850/80 border border-slate-750 hover:border-emerald-500/40 text-left text-xs text-slate-200 transition-all hover:bg-slate-800"
                  >
                    <div className="text-[10px] text-emerald-400 font-bold mb-0.5">{q.label}</div>
                    <div className="text-slate-300 line-clamp-2">{q.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            userMessages.map(msg => {
              const isUser = msg.sender === 'user';
              const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    {!isUser ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-emerald-300">Logitech Support Admin</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-slate-300">You ({currentUser?.name || 'Member'})</span>
                      </>
                    )}
                    <span className="text-[10px] text-slate-500">• {timeFormatted}</span>
                    {msg.category && (
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400">
                        {msg.category}
                      </span>
                    )}
                  </div>

                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-800/95 border border-emerald-500/30 text-slate-100 rounded-tl-none shadow-emerald-500/5'
                    }`}
                  >
                    {msg.message}
                  </div>

                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-500">
                    {isUser ? (
                      msg.readByAdmin ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCheck className="w-3 h-3" /> Seen by Admin
                        </span>
                      ) : (
                        <span>Sent to Admin</span>
                      )
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question or query here... (एडमिन को अपना सवाल लिखें)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <span className="hidden sm:inline text-sm">Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
