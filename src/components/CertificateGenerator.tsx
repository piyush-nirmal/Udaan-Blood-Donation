import React, { useState, useRef, useEffect } from 'react';
import { DonationCertificate } from '../types/api';
import { getCertificate } from '../lib/api';
import { Locale, translations } from '../lib/i18n';
import { Award, Download, Share2, Printer, Search, AlertCircle, CheckCircle } from 'lucide-react';

interface CertificateGeneratorProps {
  locale: Locale;
  initialDin?: string;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ locale, initialDin }) => {
  const t = translations[locale];
  const [dinInput, setDinInput] = useState(initialDin || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [certData, setCertData] = useState<DonationCertificate | null>(null);
  const [cardType, setCardType] = useState<'certificate' | 'story'>('certificate');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Search certificate by DIN or registered mobile number (Part 1.3)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dinInput.trim() && !phoneInput.trim()) {
      setErrorMsg(
        locale === 'en'
          ? 'Please enter a DIN (#DIN####) or registered mobile number'
          : 'कृपया DIN (#DIN####) या पंजीकृत मोबाइल नंबर दर्ज करें'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getCertificate({
        din: dinInput.trim() || undefined,
        mobile: phoneInput.trim() || undefined,
      });

      if (!res) {
        setCertData(null);
        setErrorMsg(t.cert_not_found);
      } else {
        setCertData(res);
      }
    } catch {
      setErrorMsg(t.cert_not_found);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialDin) {
      setDinInput(initialDin);
      getCertificate({ din: initialDin }).then((res) => {
        if (res) setCertData(res);
      });
    }
  }, [initialDin]);
  useEffect(() => {
    if (!certData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cardType === 'certificate') {
      canvas.width = 1200;
      canvas.height = 850;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1200, 850);

      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1140, 790);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(45, 45, 1110, 760);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.03)';
      ctx.beginPath();
      ctx.arc(600, 425, 240, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#9f1239';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('UDAAN NATIONAL BLOOD DONATION COUNCIL', 600, 110);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        'Registered Voluntary Health NGO · Govt. Recognized Transfusion Initiative',
        600,
        138
      );

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px serif';
      ctx.fillText('CERTIFICATE OF APPRECIATION', 600, 210);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'italic 18px serif';
      ctx.fillText('This honor is gratefully presented to', 600, 260);

      ctx.fillStyle = '#881337';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText(certData.donor_name, 600, 340);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(400, 365, 400, 2);

      ctx.fillStyle = '#334155';
      ctx.font = '18px sans-serif';
      ctx.fillText(
        `for selflessly donating ${certData.units} unit(s) of ${certData.blood_group} blood at ${certData.hospital_or_camp}`,
        600,
        420
      );
      ctx.fillText(
        'and giving the priceless gift of life to emergency patients in need.',
        600,
        455
      );

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(600, 560, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('OFFICIAL', 600, 550);
      ctx.fillText('LIFE SAVER', 600, 572);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Dr. S. K. Mukherjee', 160, 700);
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.fillText('Director of Medical Services, UDAAN', 160, 725);
      ctx.fillRect(160, 680, 220, 1);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Date: ' + certData.donation_date, 1040, 700);
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      // Certificate ID = DIN per Part 1.3
      ctx.fillText('Certificate ID: ' + certData.din, 1040, 725);
      ctx.fillRect(840, 680, 200, 1);
    } else {
      // 9:16 Social Story Card
      canvas.width = 720;
      canvas.height = 1280;

      const gradient = ctx.createLinearGradient(0, 0, 720, 1280);
      gradient.addColorStop(0, '#881337');
      gradient.addColorStop(0.5, '#4c0519');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 720, 1280);

      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('UDAAN · NGO INDIA', 360, 140);

      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(360, 320, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 70px sans-serif';
      ctx.fillText(certData.blood_group, 360, 345);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText('I SAVED A LIFE', 360, 520);
      ctx.fillStyle = '#fda4af';
      ctx.fillText('TODAY.', 360, 580);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(certData.donor_name, 360, 680);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px sans-serif';
      ctx.fillText('Voluntarily donated blood at', 360, 760);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(certData.hospital_or_camp, 360, 800);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`DIN: ${certData.din} · Date: ${certData.donation_date}`, 360, 880);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.roundRect(80, 1020, 560, 120, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Be a Hero. Join UDAAN Blood Network.', 360, 1070);
      ctx.fillStyle = '#fda4af';
      ctx.font = '16px sans-serif';
      ctx.fillText('24x7 India Emergency · 104 / 112', 360, 1105);
    }
  }, [certData, cardType]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certData) return;
    const link = document.createElement('a');
    link.download = `UDAAN_${certData.din}_${certData.donor_name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Part 3.K: navigator.share with fallback links
  const handleShare = async () => {
    if (!certData) return;
    const shareText = `I proudly saved a life by donating blood through UDAAN NGO India! My Verified Donation ID: ${certData.din}`;
    const canvas = canvasRef.current;

    if (canvas && navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `UDAAN_${certData.din}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'UDAAN Blood Donor Certificate',
                text: shareText,
                files: [file],
              });
              return;
            }
          }
          await navigator.share({
            title: 'UDAAN Blood Donor Certificate',
            text: shareText,
            url: window.location.href,
          });
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    // Fallback: WhatsApp share
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>{locale === 'en' ? 'Official Donor Verification' : 'आधिकारिक रक्तदाता सत्यापन'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {t.certificate_title}
          </h2>
          <p className="text-sm text-slate-600">{t.certificate_desc}</p>
        </div>

        {/* Search by DIN or Phone form */}
        <form onSubmit={handleSearch} className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.input_din_label}
              </label>
              <input
                type="text"
                value={dinInput}
                onChange={(e) => setDinInput(e.target.value)}
                placeholder={t.input_din_placeholder}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.input_phone_label}
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={t.input_phone_placeholder}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {locale === 'en' ? 'Try sample DIN: #DIN4821 or #DIN8912' : 'नमूना DIN आजमाएं: #DIN4821 या #DIN8912'}
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Verifying...' : t.btn_fetch_certificate}</span>
            </button>
          </div>
        </form>

        {certData && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-xs">
              <button
                onClick={() => setCardType('certificate')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  cardType === 'certificate'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.card_mode_certificate}
              </button>
              <button
                onClick={() => setCardType('story')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  cardType === 'story'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.card_mode_story}
              </button>
            </div>

            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>Verified: {certData.din}</span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Display (Only rendered if record verified) */}
      {certData ? (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl border border-slate-700 bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block object-contain max-h-[500px]"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>{t.btn_download_png}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.btn_share_card}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>{t.btn_print}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">
            {locale === 'en' ? 'No Certificate Loaded' : 'कोई प्रमाण पत्र लोड नहीं है'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {locale === 'en'
              ? 'Enter your Donation Identification Number (DIN) or phone number above to fetch your verified appreciation certificate.'
              : 'अपना आधिकारिक प्रमाण पत्र प्राप्त करने के लिए ऊपर अपना DIN (#DIN####) अथवा मोबाइल नंबर दर्ज करें।'}
          </p>
        </div>
      )}
    </div>
  );
};
