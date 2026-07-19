import { useState } from "react";
import { X, Copy, Mail, MessageSquare, Send, Check, QrCode } from "lucide-react";
import { TravelPlan } from "../types";

interface ShareModalProps {
  plan: TravelPlan;
  onClose: () => void;
}

export default function ShareModal({ plan, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Fallback production URL or development address
  const shareUrl = window.location.href;
  const shareText = `Check out my awesome AI-generated travel itinerary for ${plan.destination}! Standard Currency is ${plan.currency} and they speak ${plan.language}. Planned with AI Travel Planner.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    const subject = `Travel Plan Blueprint: ${plan.destination}`;
    const body = `Hi!\n\nI just designed a comprehensive travel itinerary for ${plan.destination} using AI Travel Planner.\n\nSummary:\n- Duration: ${plan.itinerary.length} Days\n- Currency: ${plan.currency}\n- Language: ${plan.language}\n- Weather forecast: ${plan.weather.forecast} (${plan.weather.temperature})\n\nTake a look at the full interactive map, budget tracker, and checklist here: ${shareUrl}\n\nSafe travels!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  // Google Charts high-fidelity secure QR Generator
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fade-in" id="share-trip-modal">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Share Travel Blueprint
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Distribute your {plan.destination} travel plan with friends.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4">
          {/* Quick link copying */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 truncate select-all pr-2 max-w-[260px] font-mono">
              {shareUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                copied ? "bg-emerald-500 text-white" : "bg-slate-900 hover:bg-black text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>

          {/* Core Sharing buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp
            </button>

            <button
              onClick={shareTelegram}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-sky-100 bg-sky-50/40 hover:bg-sky-50 text-sky-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-500" /> Telegram
            </button>

            <button
              onClick={shareEmail}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer col-span-2"
            >
              <Mail className="w-4 h-4 text-slate-500" /> Email Itinerary
            </button>
          </div>

          {/* Toggle QR code section */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> {showQR ? "Hide QR Code" : "Show QR Code"}
            </button>

            {showQR && (
              <div className="mt-4 flex flex-col items-center animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <img
                  src={qrCodeUrl}
                  alt="Trip Share QR Code"
                  referrerPolicy="no-referrer"
                  className="w-40 h-40 object-contain rounded-lg shadow-sm border border-white"
                />
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  Scan this QR code with any mobile camera to view.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
