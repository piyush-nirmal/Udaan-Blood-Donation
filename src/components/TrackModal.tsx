import React, { useState } from 'react';
import { track } from '../lib/api';
import { TrackingInfo } from '../types/api';
import { Locale, translations } from '../lib/i18n';
import { Search, CheckCircle2, Clock, MapPin, Building2, Droplet, ShieldCheck, X } from 'lucide-react';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  initialCode?: string;
}

export const TrackModal: React.FC<TrackModalProps> = ({
  isOpen,
  onClose,
  locale,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHi = locale === 'hi';

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await track(code.trim().toUpperCase());
      setResult(data);
    } catch (err: any) {
      setError(err.message || (isHi ? 'कोई रिकॉर्ड नहीं मिला' : 'No record found with this code.'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleTrack();
    }
  }, [initialCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-red-200" />
            <h2 className="text-lg font-bold">
              {isHi ? 'अनुरोध या DIN ट्रैक करें' : 'Track Request or DIN'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isHi ? 'दर्ज करें REQ-1234 या #DIN1234' : 'Enter REQ-1234 or #DIN1234'}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isHi ? 'ट्रैक' : 'Track'}
            </button>
          </form>

          {/* Privacy Notice */}
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {isHi
              ? 'गोपनीयता नियम: व्यक्तिगत मरीज संपर्क यहां प्रदर्शित नहीं किए जाते।'
              : 'Privacy Protected: Patient contact details are kept strictly confidential.'}
          </p>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Tracking Result */}
          {result && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {result.type === 'REQ' ? 'Blood Request' : 'Donation DIN'}
                  </span>
                  <h3 className="text-lg font-mono font-bold text-slate-900">{result.code}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  {result.status}
                </span>
              </div>

              {/* Safe Details Strip */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    <strong>{result.details.blood_group}</strong> ({result.details.units} unit
                    {result.details.units > 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{result.details.city}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{result.details.hospital}</span>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {result.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          step.completed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.step}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{step.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
