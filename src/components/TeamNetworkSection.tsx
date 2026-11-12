import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Copy, Check, Share2, Award, QrCode, 
  Sparkles, ArrowRight, UserCheck, ShieldCheck, 
  Search, Filter, Phone, CheckCircle2, Zap, Eye, Clock
} from 'lucide-react';

export const TeamNetworkSection: React.FC = () => {
  const { 
    currentUser, 
    users, 
    plans,
    teamFilter,
    setTeamFilter,
    setSelectedTeamMember,
    setActiveModal, 
    t, 
    language 
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) {
    return (
      <div className="py-16 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Login to View Your Team</h3>
        <p className="text-sm text-slate-400 mb-6">
          Access your unique referral link, invite friends, and earn 10% direct commission instantly.
        </p>
        <button
          onClick={() => setActiveModal('user-login')}
          className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 cursor-pointer"
        >
          {t.login}
        </button>
      </div>
    );
  }

  // Find all downline members invited by this user
  const myTeam = useMemo(() => {
    return users.filter(u => u.referredBy === currentUser.referralCode);
  }, [users, currentUser.referralCode]);

  const activeMembers = useMemo(() => {
    return myTeam.filter(u => u.planId !== 'free');
  }, [myTeam]);

  const freeMembers = useMemo(() => {
    return myTeam.filter(u => u.planId === 'free');
  }, [myTeam]);

  // Filtered members based on active tab and search query
  const filteredTeam = useMemo(() => {
    let list = myTeam;
    if (teamFilter === 'active') {
      list = activeMembers;
    } else if (teamFilter === 'free') {
      list = freeMembers;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query) ||
      m.mobile.includes(query) ||
      m.planId.toLowerCase().includes(query)
    );
  }, [myTeam, activeMembers, freeMembers, teamFilter, searchQuery]);

  // Construct referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://logitech-rewards.app';
  const referralLink = `${origin}/?ref=${encodeURIComponent(currentUser.referralCode)}`;

  // WhatsApp share message
  const shareMessage = encodeURIComponent(
    `🚀 Join LOGITECH Rewards! Earn guaranteed daily income directly in your bank account every midnight at 12:00 AM.\n\nUse my Referral Code: ${currentUser.referralCode}\nSign up here: ${referralLink}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareMessage}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0D1E38] via-[#0A192F] to-[#132A4A] rounded-3xl border border-[#1E3A5F] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              10% Instant Referral Commission Program
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              {t.shareAndEarn}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'अपने डायरेक्ट रेफरल साथियों की स्थिति, उनके सक्रिय प्लान और आपको प्राप्त होने वाले 10% डायरेक्ट कमीशन का लाइव डेटा यहाँ देखें।'
                : 'Track your downline network members, active investment packages, and instant 10% direct commissions credited to your wallet.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-[#070F1E] p-4 rounded-2xl border border-[#1E3A5F] shrink-0">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Total Team</span>
              <span className="text-2xl font-black text-white font-mono">{myTeam.length}</span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div>
              <span className="text-[11px] text-emerald-400 block uppercase font-bold">Active Paid</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{activeMembers.length}</span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div>
              <span className="text-[11px] text-amber-300 block uppercase font-bold">Commissions</span>
              <span className="text-2xl font-black text-amber-300 font-mono">
                ₹{currentUser.referralEarnings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Referral Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#1E3A5F]">
          {/* Box 1: Code */}
          <div className="bg-[#070F1E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t.yourReferralCode}</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-mono font-extrabold text-amber-300 tracking-wider">
                {currentUser.referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Box 2: Link */}
          <div className="bg-[#070F1E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t.yourReferralLink}</span>
            <div className="flex items-center justify-between mt-2 gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-[#D4AF37] hover:bg-[#E5B834] text-slate-950 font-bold rounded-lg transition shrink-0 cursor-pointer"
                title="Copy Referral Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Box 3: WhatsApp Share */}
          <div className="bg-[#070F1E] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Instant Invitation</span>
              <span className="text-sm font-bold text-emerald-400">Share on WhatsApp</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 3 Clickable Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0A192F] p-1 rounded-2xl border border-[#1E3A5F]">
          <button
            onClick={() => setTeamFilter('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              teamFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-emerald-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'hi' ? 'सक्रिय प्लान मेंबर्स' : 'Active Paid Members'} ({activeMembers.length})</span>
          </button>

          <button
            onClick={() => setTeamFilter('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              teamFilter === 'all'
                ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सभी मेंबर्स' : 'All Members'} ({myTeam.length})</span>
          </button>

          <button
            onClick={() => setTeamFilter('free')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              teamFilter === 'free'
                ? 'bg-slate-700 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{language === 'hi' ? 'फ्री टियर मेंबर्स' : 'Free Tier'} ({freeMembers.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नाम, मोबाइल या ID खोजें...' : 'Search name, mobile, ID...'}
            className="w-full bg-[#070F1E] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      {/* FILTER ACTIVE BANNER */}
      {teamFilter === 'active' && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-[#0A192F] to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-slate-200">
              {language === 'hi'
                ? `वर्तमान में केवल सक्रिय प्लान वाले ${activeMembers.length} मेंबर्स का डेटा दिखाया जा रहा है। इन सभी से 10% डायरेक्ट कमीशन आपके वॉलेट में जुड़ा है।`
                : `Currently displaying only ${activeMembers.length} active paid members. Instant 10% direct commission was credited from each account.`}
            </span>
          </div>
          <button
            onClick={() => setTeamFilter('all')}
            className="text-xs font-bold text-amber-300 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
          >
            {language === 'hi' ? 'सभी मेंबर्स दिखाएं (Show All)' : 'Show All Members'} →
          </button>
        </div>
      )}

      {/* Team Member List Table & Mobile Cards */}
      <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
              <span>{t.myTeamList}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30">
                {filteredTeam.length} {teamFilter === 'active' ? 'Active Paid' : teamFilter === 'free' ? 'Free Tier' : 'Total'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'hi' 
                ? 'किसी भी मेंबर के नाम या "पूरा डेटा देखें" पर क्लिक करके उनका विस्तृत विवरण देखें।' 
                : 'Click any member row or "View Full Data" button to inspect their full plan and earnings history.'}
            </p>
          </div>

          <span className="text-xs font-bold text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-xl border border-cyan-500/30 self-start sm:self-auto">
            10% Instant Direct Commission
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                <th className="py-3 px-4">{t.memberId}</th>
                <th className="py-3 px-4">{t.name}</th>
                <th className="py-3 px-4">{t.mobile}</th>
                <th className="py-3 px-4">Active Package</th>
                <th className="py-3 px-4">Daily Income</th>
                <th className="py-3 px-4">Your 10% Commission</th>
                <th className="py-3 px-4">Member Wallet</th>
                <th className="py-3 px-4">{t.joinedDate}</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-bold text-white text-sm">
                      {teamFilter === 'active'
                        ? (language === 'hi' ? 'कोई सक्रिय प्लान मेंबर नहीं मिला।' : 'No active paid members found in this view.')
                        : (language === 'hi' ? 'कोई टीम मेंबर नहीं मिला।' : 'No members found in your team yet.')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {language === 'hi' 
                        ? 'अपना रेफरल लिंक ऊपर से शेयर करें। जैसे ही कोई नया सदस्य जुड़ेगा, उसका डेटा यहाँ स्वतः दिखने लगेगा।'
                        : 'Share your referral link above. When a new member registers or buys a plan, their live data appears here immediately.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => {
                  const pInfo = plans.find(p => p.id === member.planId);
                  const isPaid = member.planId !== 'free' && pInfo && pInfo.price > 0;
                  const commissionAmount = isPaid ? Math.round(pInfo.price * 0.1) : 0;

                  return (
                    <tr 
                      key={member.id} 
                      onClick={() => setSelectedTeamMember(member)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">
                        {member.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="group-hover:text-cyan-300 transition">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {member.mobile.slice(0, 3)}****{member.mobile.slice(7)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px] inline-flex items-center gap-1 ${
                          isPaid 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {isPaid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          <span>{pInfo ? pInfo.name : member.planId.toUpperCase()}</span>
                          {isPaid && <span className="font-mono text-white">₹{pInfo.price}</span>}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {isPaid ? `+₹${pInfo.dailyEarning}/day` : '₹0'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                          isPaid ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'
                        }`}>
                          {isPaid ? `+₹${commissionAmount.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        ₹{member.walletBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeamMember(member);
                          }}
                          className="px-3 py-1 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer mx-auto active:scale-95 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'पूरा डेटा देखें' : 'View Full Data'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
