import React from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { 
  X, UserCheck, ShieldCheck, Award, Calendar, Phone, 
  Wallet, Zap, Share2, Sparkles, Clock, CheckCircle2 
} from 'lucide-react';

interface MemberDetailModalProps {
  member: User | null;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const { plans, ledger, language } = useApp();

  if (!member) return null;

  const memberPlan = plans.find(p => p.id === member.planId);
  const isActivePaid = member.planId !== 'free' && memberPlan && memberPlan.price > 0;
  
  // Find ledger bonus received from this member
  const relatedBonus = ledger.filter(l => 
    l.type === 'REFERRAL_BONUS' && 
    (l.description.includes(member.name) || l.description.includes(member.id) || l.referenceId?.includes(member.id))
  );

  const totalBonusFromThisMember = relatedBonus.reduce((sum, l) => sum + l.amount, 0) || 
    (isActivePaid ? Math.round(memberPlan.price * 0.1) : 0);

  const cleanMobile = member.mobile.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(
    `Hello ${member.name}, I am your LOGITECH sponsor. Welcome to our team!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#122744] border-2 border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-[#0A192F] rounded-[14px] flex items-center justify-center text-amber-300 font-extrabold text-xl font-mono">
              {member.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {member.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isActivePaid 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isActivePaid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                {isActivePaid ? 'Active Paid Member' : 'Free Tier Member'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1 font-display">
              {member.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Mobile: {member.mobile}
            </p>
          </div>
        </div>

        {/* Referral Bonus Highlight Card */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'hi' ? 'आपको प्राप्त 10% डायरेक्ट कमीशन' : '10% Commission Earned by You'}
              </span>
              <span className="text-xs text-slate-300">
                {isActivePaid 
                  ? `From ${memberPlan?.name} (₹${memberPlan?.price}) activation` 
                  : 'Commission will credit when member buys a plan'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              ₹{totalBonusFromThisMember.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              {isActivePaid ? '✓ Credited in Wallet' : 'Pending Activation'}
            </span>
          </div>
        </div>

        {/* Detailed Member Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Plan Info */}
          <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Current Package
            </span>
            <div className="text-base font-extrabold text-white">
              {memberPlan ? memberPlan.name : member.planId.toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-amber-300 block mt-0.5">
              {memberPlan && memberPlan.price > 0 ? `Package Price: ₹${memberPlan.price}` : 'Free Tier'}
            </span>
          </div>

          {/* Daily Income */}
          <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Member Daily Income
            </span>
            <div className="text-base font-extrabold text-cyan-300 font-mono">
              ₹{memberPlan ? memberPlan.dailyEarning : 0} <span className="text-xs font-normal text-slate-400">/ day</span>
            </div>
            <span className="text-[11px] text-emerald-400 block mt-0.5">
              Automated 12:00 AM Credit
            </span>
          </div>

          {/* Joined Date */}
          <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Registration Date
            </span>
            <div className="text-xs font-bold text-slate-200">
              {new Date(member.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(member.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Activation Date */}
          <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Plan Activation
            </span>
            <div className="text-xs font-bold text-emerald-400">
              {member.planActivatedAt 
                ? new Date(member.planActivatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Not Activated Yet'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {member.planActivatedAt ? 'Status: Active ID' : 'Pending Plan Buy'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${member.mobile}`}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Phone className="w-4 h-4 text-cyan-400" />
            <span>Call Member</span>
          </a>
        </div>
      </div>
    </div>
  );
};
