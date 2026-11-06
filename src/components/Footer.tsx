import React from 'react';
import { Locale, translations } from '../lib/i18n';
import { Heart, ShieldCheck, PhoneCall, ExternalLink, HeartHandshake } from 'lucide-react';

interface FooterProps {
  locale: Locale;
  onOpenTrack: () => void;
  onNavigateTab: (tab: 'board' | 'donors' | 'banks' | 'camps' | 'partners' | 'certificate') => void;
  onOpenWellness: () => void;
  onOpenFeedback: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  locale,
  onOpenTrack,
  onNavigateTab,
  onOpenWellness,
  onOpenFeedback,
}) => {
  const t = translations[locale];

  return (
    <footer className="mt-16 bg-white border-t border-[#E8E0DA] text-[#6B625C] text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Column 1: About UDAAN */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FDECEE] text-[#D62839] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-[#D62839] stroke-[1.75]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1C1917]">
                UDAAN
              </span>
              <span className="text-[11px] text-[#6B625C] font-medium">
                · {locale === 'hi' ? 'रक्तदान नेटवर्क' : 'Blood Network'}
              </span>
            </div>

            <p className="text-xs text-[#6B625C] leading-relaxed">
              {locale === 'hi'
                ? 'उड़ान भारत का एक 100% निःशुल्क और गैर-व्यावसायिक स्वैच्छिक रक्तदान नेटवर्क है। हम आपातकालीन रक्त आवश्यकताओं को निकटतम सत्यापित दाताओं से जोड़ते हैं।'
                : 'UDAAN is a 100% free, non-commercial civic voluntary blood network connecting emergency patients with verified nearby donors in minutes across India.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4EC] text-[#1F8A5B] font-semibold text-[11px] border border-[#1F8A5B]/20">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{locale === 'hi' ? '100% गैर-व्यावसायिक एवं सुरक्षित' : '100% Non-Commercial & Confidential'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              {locale === 'hi' ? 'त्वरित लिंक' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button
                  type="button"
                  onClick={onOpenTrack}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'hi' ? 'अनुरोध एवं DIN ट्रैक करें' : 'Track SOS Request / DIN'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('camps')}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'hi' ? 'रक्तदान शिविर (Camps)' : 'Upcoming Donation Camps'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('partners')}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'hi' ? 'साझेदार गैर-सरकारी संगठन (NGOs)' : 'Accredited NGO Partners'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenWellness}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'hi' ? 'स्वास्थ्य एवं पात्रता नियम' : 'Wellness & NBTC Guidelines'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFeedback}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'hi' ? 'प्रतिक्रिया दें' : 'Share Feedback'}</span>
                </button>
              </li>
              <li>
                <a
                  href="#support-udaan"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="hover:text-[#D62839] transition-colors flex items-center gap-1.5 text-[#1C1917]"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#D62839] stroke-[1.75]" />
                  <span>{locale === 'hi' ? 'उड़ान को सहयोग दें' : 'Support UDAAN NGO'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Helpline & Contact */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              {locale === 'hi' ? 'आपातकालीन सहायता' : 'Emergency Assistance'}
            </h4>

            <div className="p-3.5 rounded-[12px] bg-[#FAF7F5] border border-[#E8E0DA] space-y-2">
              <div className="flex items-center gap-2 text-[#D62839]">
                <PhoneCall className="w-4 h-4 stroke-[1.75]" />
                <span className="font-bold text-sm tracking-tight">Helpline 104 / 112</span>
              </div>
              <p className="text-[11px] text-[#6B625C] leading-snug">
                {locale === 'hi'
                  ? 'राष्ट्रीय स्वास्थ्य एवं आपातकालीन हेल्पलाइन 24x7 निःशुल्क उपलब्ध है।'
                  : 'National Health and Emergency Helplines available 24x7 toll-free across all states in India.'}
              </p>
            </div>

            <div className="text-xs text-[#6B625C]">
              <span className="font-semibold text-[#1C1917]">{locale === 'hi' ? 'ईमेल:' : 'Email:'} </span>
              <a href="mailto:support@udaanblood.org" className="hover:text-[#D62839] transition-colors">
                support@udaanblood.org
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Privacy Disclaimer */}
        <div className="mt-10 pt-6 border-t border-[#E8E0DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-[#6B625C]">
          <p className="max-w-2xl leading-relaxed">
            <span className="font-semibold text-[#1C1917]">
              {locale === 'hi' ? 'चिकित्सा अस्वीकरण: ' : 'Medical Disclaimer: '}
            </span>
            General guidance only. Medical staff decide donor and component eligibility.
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[#6B625C]">
              {locale === 'hi' ? 'रोगी गोपनीयता संरक्षित' : 'Patient Privacy Protected'}
            </span>
            <span aria-hidden="true">·</span>
            <span>UDAAN © 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
