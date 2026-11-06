import React from 'react';
import { BloodBank, BloodGroup } from '../types/api';
import { Locale, translations } from '../lib/i18n';
import { Building2, Phone, MapPin, Clock } from 'lucide-react';

interface BloodBanksDirectoryProps {
  banks: BloodBank[];
  locale: Locale;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BloodBanksDirectory: React.FC<BloodBanksDirectoryProps> = ({ banks, locale }) => {
  const t = translations[locale];

  const formatTimeAgo = (dateStr: string) => {
    const diffMin = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60)));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>{locale === 'en' ? 'Central Health Facility Registry' : 'केंद्रीय स्वास्थ्य केंद्र निर्देशिका'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          {t.blood_banks_title}
        </h2>
        <p className="text-sm text-slate-600">{t.blood_banks_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">{bank.name}</h3>
                  {bank.verified && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Govt Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{bank.address}</span>
                </div>
              </div>

              {/* Part 1.4: Display "Updated <time ago>" from stock_updated_at */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {t.stock_updated} {formatTimeAgo(bank.stock_updated_at)}
                  </span>
                </span>
              </div>
            </div>

            {/* Blood Stock Matrix from real API object */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {locale === 'en' ? 'Component Stock Available (Units)' : 'उपलब्ध रक्त स्टॉक (यूनिट)'}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {BLOOD_GROUPS.map((bg) => {
                  const count = bank.stock[bg] || 0;
                  const isDepleted = count === 0;
                  const isLow = count < 3;

                  return (
                    <div
                      key={bg}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isDepleted
                          ? 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                          : isLow
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-600">{bg}</div>
                      <div className="text-xs font-mono font-extrabold mt-0.5 tabular-nums">
                        {isDepleted ? 'Nil' : `${count}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{bank.phone.split('/')[0]}</span>
              </span>

              <a
                href={`tel:${bank.phone.replace(/[^0-9]/g, '')}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.call_bank}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
