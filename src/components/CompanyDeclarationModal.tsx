import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, ShieldCheck, Award, FileText, CheckCircle2, 
  Download, Printer, Landmark, Building2, Stamp 
} from 'lucide-react';

export const CompanyDeclarationModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    settings, 
    t 
  } = useApp();

  if (activeModal !== 'declaration') {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F223D] border border-[#1E3A5F] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#132A4A] to-[#0A192F] p-5 border-b border-[#1E3A5F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Company Legal Declaration & Certificate
              </h3>
              <p className="text-xs text-slate-400">
                Official Regulatory Disclosure & Escrow Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate View */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          <div className="p-6 rounded-2xl bg-[#070F1E] border-2 border-[#D4AF37]/40 relative overflow-hidden">
            {/* Top Emblem */}
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#92400E] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0A192F] rounded-[14px] flex items-center justify-center">
                  <Award className="w-7 h-7 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="font-display font-extrabold text-lg text-white tracking-wider">
                {settings.companyName}
              </h2>
              <p className="text-[11px] text-[#D4AF37] font-semibold mt-0.5">
                CIN: U72900DL2024PTC419820 • ISO 9001:2015 CERTIFIED
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Registered Under the Ministry of Corporate Affairs, Govt. of India
              </p>
            </div>

            {/* Declaration Content */}
            <div className="py-4 space-y-3 leading-relaxed text-slate-300">
              <p>
                <strong className="text-white">1. Purpose & Business Model:</strong> LOGITECH operates a decentralized referral marketing, software enterprise management, and digital customer rewards platform. All membership contributions participate in high-yield daily top-up distributions.
              </p>
              <p>
                <strong className="text-white">2. Daily Distribution Commitment:</strong> Every active subscriber is guaranteed daily automated distributions credited to their wallet balance at 12:00 AM Indian Standard Time (IST) as specified per plan tier.
              </p>
              <p>
                <strong className="text-white">3. UPI Escrow & Verification:</strong> All incoming deposits and UPI transactions are verified against duplicate Unique Transaction References (UTR). No duplicate submissions are permitted.
              </p>
              <p>
                <strong className="text-white">4. Withdrawal Settlements:</strong> Member payouts are executed directly via UPI/IMPS banking gateways. If any transfer is rejected by the banking system, 100% of the funds are instantaneously credited back to the customer wallet.
              </p>
            </div>

            {/* Seal & Signature Stamp */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Authorized Officer</p>
                <p className="font-bold text-white text-xs mt-0.5">Chief Compliance Directorate</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Digitally Signed & Sealed
                </p>
              </div>

              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#D4AF37] flex flex-col items-center justify-center rotate-12 text-[#D4AF37] p-1 text-center">
                <span className="text-[8px] font-extrabold uppercase tracking-tight">LOGITECH</span>
                <span className="text-[7px] font-bold">OFFICIAL</span>
                <span className="text-[8px] font-extrabold">VERIFIED</span>
              </div>
            </div>

            {/* Financial Risk Notice (Short & English Only - End of Certificate) */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[10px] uppercase tracking-wider">
                <span>⚠️ Financial Risk Disclaimer</span>
                <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">Self-Risk Advisory</span>
              </div>
              <p className="text-slate-300">
                Participation is strictly at your own self-risk. Users must perform independent due diligence before depositing or allocating funds. LOGITECH Enterprise operates solely as a digital community referral and rewards network.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#D4AF37] hover:bg-[#E5B834] text-slate-950 font-bold rounded-xl transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
