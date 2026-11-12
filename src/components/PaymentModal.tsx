import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, QrCode, Copy, Check, Clock, ShieldCheck, 
  Upload, AlertCircle, CheckCircle2, ArrowRight, ExternalLink,
  Smartphone
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    selectedPlanForPurchase, 
    settings, 
    submitPayment, 
    t, 
    language 
  } = useApp();

  const [utr, setUtr] = useState('');
  const [method, setMethod] = useState<'PHONEPE' | 'UPI_QR' | 'GPAY' | 'PAYTM'>('PHONEPE');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // 5 minute countdown timer
  useEffect(() => {
    if (activeModal !== 'payment') {
      setTimeLeft(300);
      setUtr('');
      setErrorMsg('');
      setSuccessMsg('');
      setScreenshotPreview(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeModal]);

  if (activeModal !== 'payment' || !selectedPlanForPurchase) {
    return null;
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setScreenshotPreview(compressedDataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = submitPayment(
      selectedPlanForPurchase.id,
      selectedPlanForPurchase.price,
      utr,
      method,
      screenshotPreview || undefined
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveModal(null);
      }, 2500);
    } else {
      setErrorMsg(res.message);
    }
  };

  // UPI deep link
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.payeeName)}&am=${selectedPlanForPurchase.price}&cu=INR&tn=LOGITECH_${selectedPlanForPurchase.id.toUpperCase()}`;

  // High quality QR code URL encoded with UPI URI
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F223D] border border-[#1E3A5F] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#132A4A] to-[#0A192F] p-4 sm:p-5 border-b border-[#1E3A5F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {t.payWithUpi}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                {language === 'hi' ? selectedPlanForPurchase.nameHi : selectedPlanForPurchase.name} • ₹{selectedPlanForPurchase.price.toLocaleString('en-IN')}
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

        {/* 5-Min Timer Bar */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{t.timerRemaining}:</span>
          </div>
          <span className="font-mono text-base font-extrabold text-amber-300 tracking-wider">
            {formatTimer(timeLeft)}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Submission Error:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Success!</strong>
                {successMsg}
              </div>
            </div>
          )}

          {/* Company Official QR Code Payment Card */}
          <div className="bg-[#070F1E] p-5 rounded-2xl border border-[#1E3A5F] flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {language === 'hi' ? 'कंपनी आधिकारिक क्यूआर कोड' : 'Official Company Payment QR'}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/40 border-2 border-[#D4AF37]/50 inline-block">
              <img
                src={qrCodeUrl}
                alt="LOGITECH Official QR"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-900 font-extrabold uppercase tracking-wider block">
                  Scan to Pay ₹{selectedPlanForPurchase.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  PhonePe • Google Pay • Paytm • BHIM
                </span>
              </div>
            </div>

            {/* Mobile Direct Pay Action */}
            <div className="mt-4 w-full max-w-xs">
              <a
                href={upiDeepLink}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{language === 'hi' ? 'सीधे UPI ऐप में खोलें' : 'Open in UPI App Directly'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 max-w-sm">
              {language === 'hi' 
                ? 'ऊपर दिए गए आधिकारिक QR कोड को स्कैन करके भुगतान पूरा करें, फिर नीचे 12-अंकों का UTR नंबर दर्ज करें।'
                : 'Scan the official company QR code above with any UPI app, then submit the 12-digit UTR reference number below.'}
            </p>
          </div>

          {/* UTR Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-200">
                  {t.enterUtr} <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">12 Digits Number</span>
              </div>
              <input
                type="text"
                required
                maxLength={16}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                placeholder={t.utrPlaceholder}
                className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-sm font-mono text-amber-300 placeholder-slate-600 focus:outline-none transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {t.utrHelp}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paid Via App
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['PHONEPE', 'UPI_QR', 'GPAY', 'PAYTM'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition ${
                      method === m
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F3E5AB]'
                        : 'bg-[#070F1E] border-[#1E3A5F] text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'PHONEPE' ? 'PhonePe' : m === 'GPAY' ? 'Google Pay' : m === 'PAYTM' ? 'Paytm' : 'QR Scan'}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.uploadReceipt}
              </label>
              <div className="relative border-2 border-dashed border-[#1E3A5F] hover:border-[#D4AF37]/60 rounded-xl p-3 text-center bg-[#070F1E]/60 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>{screenshotPreview ? 'Receipt Attached (Click to change)' : 'Attach screenshot of UPI success screen'}</span>
                </div>
              </div>
              {screenshotPreview && (
                <div className="mt-2 flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-slate-700">
                  <img src={screenshotPreview} alt="Receipt Preview" className="w-8 h-8 rounded object-cover" />
                  <span className="text-[11px] text-emerald-400 font-medium">Receipt ready for submission</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !utr}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : t.submitPayment}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
