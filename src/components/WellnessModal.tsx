import React, { useState, useEffect } from 'react';
import { getWellness } from '../lib/api';
import { WellnessTip } from '../types/api';
import { Locale } from '../lib/i18n';
import { HeartPulse, CheckCircle2, ShieldCheck, X, Sparkles } from 'lucide-react';

interface WellnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export const WellnessModal: React.FC<WellnessModalProps> = ({ isOpen, onClose, locale }) => {
  const [tips, setTips] = useState<WellnessTip[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pre' | 'post' | 'eligibility'>('all');
  const isHi = locale === 'hi';

  useEffect(() => {
    if (isOpen) {
      getWellness().then(setTips).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = activeTab === 'all' ? tips : tips.filter((t) => t.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-200" />
            <h3 className="font-bold text-lg">
              {isHi ? 'रक्तदाता स्वास्थ्य एवं सुरक्षा मार्गदर्शिका' : 'Donor Wellness & Safety Guide'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-2 shrink-0 bg-slate-50">
          {[
            { id: 'all', label: isHi ? 'सभी सुझाव' : 'All Guidelines' },
            { id: 'pre', label: isHi ? 'रक्तदान से पहले' : 'Pre-Donation' },
            { id: 'post', label: isHi ? 'रक्तदान के बाद' : 'Post-Donation' },
            { id: 'eligibility', label: isHi ? 'पात्रता नियम' : 'Eligibility' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filtered.map((tip) => (
            <div key={tip.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-red-100 text-red-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    {isHi ? tip.title_hi : tip.title_en}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHi ? tip.body_hi : tip.body_en}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Eligibility Checklist */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 mt-4">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {isHi ? 'NBTC राष्ट्रीय मानक सारांश' : 'NBTC National Criteria Quick Checklist'}
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-emerald-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Age: 18 – 65 years</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Min Weight: 45 kg (Whole blood)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Min Hemoglobin: 12.5 g/dL</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>90 days gap between donations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
