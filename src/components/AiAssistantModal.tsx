import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bot, Send, Sparkles, X, User, Shield, HelpCircle, 
  TrendingUp, RefreshCw, Copy, Check, MessageSquare 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const { currentUser, users, payments, withdrawals, plans, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  const defaultGreeting: ChatMessage = {
    id: 'ai-welcome',
    sender: 'ai',
    text: isAdmin
      ? (language === 'hi'
          ? `नमस्ते सुपर एडमिन! मैं आपका लॉजिटेक AI असिस्टेंट हूँ। आप मुझसे आज के नए साइनअप, पेंडिंग पेमेंट्स, 12:00 AM दैनिक रिटर्न या डेटाबेस स्टेटस के बारे में कभी भी पूछ सकते हैं।`
          : `Hello Super Admin! I am your LOGITECH AI Copilot. Ask me about real-time signups, pending UTRs, 12:00 AM daily return distribution, or payout summaries!`)
      : (language === 'hi'
          ? `नमस्ते ${currentUser?.name || 'साथी'}! मैं लॉजिटेक का स्मार्ट AI असिस्टेंट हूँ। आप मुझसे प्लान्स, रात 12:00 AM की दैनिक आय, 10% रेफरल कमीशन या विड्रॉल नियमों के बारे में पूछ सकते हैं।`
          : `Hello ${currentUser?.name || 'Member'}! I am the LOGITECH AI Copilot. Ask me anything about our plans, 12:00 AM daily returns, 10% referral rewards, or withdrawals!`),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);

  const quickQuestionsMember = [
    '📊 ब्रॉन्ज और गोल्ड प्लान की दैनिक आय क्या है?',
    '🕛 रात 12:00 बजे दैनिक रिटर्न कैसे क्रेडिट होता है?',
    '🤝 10% रेफरल कमीशन कैसे मिलता है?',
    '💳 मिनिमम विड्रॉल और TDS नियम क्या हैं?',
  ];

  const quickQuestionsAdmin = [
    '📈 आज के कुल मेंबर्स और एक्टिव प्लान्स का सारांश दें',
    '⚡ पेंडिंग रिचार्ज UTRs कैसे तुरंत वेरिफाई करें?',
    '🕛 12:00 AM ऑटोमैटिक दैनिक रिटर्न इंजन कैसे काम करता है?',
    '🚀 लाइव लॉन्च के लिए क्लीन स्लेट रीसेट कैसे करें?',
  ];

  const activeQuickQuestions = isAdmin ? quickQuestionsAdmin : quickQuestionsMember;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const activeMembersCount = users.filter(u => u.role !== 'admin' && u.planId !== 'free').length;
      const totalMembersCount = users.filter(u => u.role !== 'admin').length;
      const pendingPayCount = payments.filter(p => p.status === 'pending').length;
      const pendingWithCount = withdrawals.filter(w => w.status === 'pending').length;

      const context = {
        role: currentUser?.role || 'guest',
        userName: currentUser?.name || 'Guest',
        userId: currentUser?.id || 'GUEST',
        activePlan: currentUser?.planId || 'free',
        walletBalance: currentUser?.walletBalance || 0,
        totalMembersCount,
        activeMembersCount,
        pendingPayCount,
        pendingWithCount,
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userRole: currentUser?.role || 'member',
          language,
          context,
        }),
      });

      const data = await res.json();
      const aiReplyText = data.reply || data.message || 'Apologies, could not process that request. Please try again.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: language === 'hi'
            ? 'क्षमा करें, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
            : 'Sorry, communication with AI server failed. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-extrabold shadow-xl shadow-cyan-900/40 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/30"
          title="Open LOGITECH AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-200 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
          </div>
          <span className="text-xs tracking-wide hidden sm:inline font-mono">
            {isAdmin ? 'ADMIN AI COPILOT' : 'AI ASSISTANT'}
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-[10px] text-cyan-200 border border-cyan-400/30 font-mono">
            LIVE
          </span>
        </button>
      </div>

      {/* AI Assistant Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg h-[90vh] max-h-[680px] bg-[#070F1E] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A192F] via-[#10243E] to-[#0A192F] px-4 py-3.5 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      LOGITECH AI Copilot
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                      24/7 ONLINE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAdmin ? 'Super Admin Mode • Gemini 3.8 Intelligence' : 'Member Fintech Support • Instant Answers'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Questions Carousel */}
            <div className="bg-[#0B1528] px-3 py-2 border-b border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 w-max">
                <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick:
                </span>
                {activeQuickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    disabled={loading}
                    className="text-[11px] bg-slate-900/90 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#070F1E] to-[#040810]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mb-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`relative group rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                          : 'bg-[#0E1E36] border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words font-sans">
                        {msg.text}
                      </div>

                      {/* Copy snippet button for AI message */}
                      {msg.sender === 'ai' && (
                        <button
                          type="button"
                          onClick={() => copyMessage(msg.text, msg.id)}
                          className="absolute -top-2 -right-2 p-1 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse">Thinking with Gemini AI...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#0A1628] border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isAdmin
                    ? 'Ask admin analytics, pending UTRs, 12 AM ROI...'
                    : 'Ask about plans, daily income, referral bonus...'
                }
                className="flex-1 bg-[#060D1A] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
