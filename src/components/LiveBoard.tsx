import React, { useState, useMemo, useEffect } from 'react';
import {
  PublicBloodRequest,
  BloodGroup,
  UrgencyLevel,
  UserAuth,
  ImpactStats,
  Camp,
} from '../types/api';
import { getStats, listCamps, subscribeAlerts } from '../lib/api';
import { Locale, translations } from '../lib/i18n';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Share2,
  CheckCircle,
  AlertTriangle,
  List,
  Map as MapIcon,
  Flame,
  Check,
  Building,
  ShieldCheck,
  XCircle,
  Calendar,
  BellRing,
  HeartHandshake,
  CreditCard,
  X,
} from 'lucide-react';

interface LiveBoardProps {
  requests: PublicBloodRequest[];
  locale: Locale;
  onRequestBlood: () => void;
  onRespond: (reqId: string) => Promise<void>;
  onCancelResponse?: (responseId: string) => Promise<void>;
  user: UserAuth | null;
  onShareWhatsApp: (req: PublicBloodRequest) => void;
  onNavigateToCamps?: () => void;
  showToast?: (msg: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const LiveBoard: React.FC<LiveBoardProps> = ({
  requests,
  locale,
  onRequestBlood,
  onRespond,
  onCancelResponse,
  user,
  onShareWhatsApp,
  onNavigateToCamps,
  showToast,
}) => {
  const t = translations[locale];
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activePin, setActivePin] = useState<PublicBloodRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  // Home Additions State
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [upcomingCamps, setUpcomingCamps] = useState<Camp[]>([]);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<string>('500');

  // Emergency Alert Form State
  const [alertMobile, setAlertMobile] = useState('');
  const [alertBloodGroup, setAlertBloodGroup] = useState<BloodGroup>('O+');
  const [alertCity, setAlertCity] = useState('');
  const [alertName, setAlertName] = useState('');
  const [viaWhatsApp, setViaWhatsApp] = useState(true);
  const [viaSms, setViaSms] = useState(true);
  const [subscribingAlert, setSubscribingAlert] = useState(false);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    listCamps()
      .then((camps) => setUpcomingCamps(camps.slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleSubscribeAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(alertMobile.replace(/\D/g, ''))) {
      showToast?.(locale === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!alertCity.trim()) {
      showToast?.(locale === 'hi' ? 'कृपया अपना शहर दर्ज करें' : 'Please enter your city');
      return;
    }

    setSubscribingAlert(true);
    try {
      await subscribeAlerts({
        mobile: alertMobile,
        blood_group: alertBloodGroup,
        city: alertCity,
        name: alertName,
        via_whatsapp: viaWhatsApp,
        via_sms: viaSms,
      });
      showToast?.(
        locale === 'hi'
          ? 'आपातकालीन अलर्ट सदस्यता सक्रिय हो गई!'
          : 'Emergency SOS alerts activated for your city & group!'
      );
      setAlertMobile('');
      setAlertCity('');
      setAlertName('');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to subscribe to alerts');
    } finally {
      setSubscribingAlert(false);
    }
  };

  const handleTriggerRazorpay = () => {
    const key =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY) ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RAZORPAY_KEY) ||
      'rzp_test_udaan_demo';
    setIsDonateOpen(false);
    showToast?.(
      locale === 'hi'
        ? `₹${donateAmount} का Razorpay टेस्ट चेकआउट शुरू किया गया (${key})`
        : `Simulated Razorpay Checkout for ₹${donateAmount} initiated (Key: ${key})`
    );
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchGroup = selectedGroup === 'all' || r.blood_group === selectedGroup;
      const matchUrgency = selectedUrgency === 'all' || r.urgency === selectedUrgency;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        r.hospital_name.toLowerCase().includes(query) ||
        r.city.toLowerCase().includes(query) ||
        r.req_code.toLowerCase().includes(query);
      return matchGroup && matchUrgency && matchSearch;
    });
  }, [requests, selectedGroup, selectedUrgency, searchQuery]);

  const getTimeAgo = (dateStr: string) => {
    const diffMin = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60)));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  const handleRespondClick = async (reqId: string) => {
    setIsSubmitting(reqId);
    try {
      await onRespond(reqId);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Strip / Metric Summary */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{locale === 'en' ? 'National NGO Response Network' : 'राष्ट्रीय एनजीओ सहायता नेटवर्क'}</span>
            <span aria-hidden="true">·</span>
            <span>24x7 India Emergency</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-balance">
            {t.hero_headline}
          </h1>
          <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed max-w-2xl mb-6">
            {t.hero_desc}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRequestBlood}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-rose-950/40 active:scale-[0.98]"
            >
              {t.request_blood_cta}
            </button>
            <div className="flex items-center gap-4 text-xs text-rose-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {locale === 'en' ? 'Zero Commercial Charges' : 'कोई व्यावसायिक शुल्क नहीं'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {locale === 'en' ? 'Patient Privacy Shield' : 'गोपनीयता सुरक्षा'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric counters (Impact Stats) */}
        <div className="mt-8 pt-6 border-t border-rose-700/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
              {stats ? stats.active_donors : '1,280'}
            </div>
            <div className="text-xs text-rose-200">
              {locale === 'hi' ? 'सक्रिय रक्तदाता' : 'Active Donors'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-200">
              {stats ? stats.fulfilled_requests : '384'}
            </div>
            <div className="text-xs text-rose-200">
              {locale === 'hi' ? 'पूर्ण आपात अनुरोध' : 'Fulfilled SOS'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-200">
              {stats ? stats.camps_organized : '24'}
            </div>
            <div className="text-xs text-rose-200">
              {locale === 'hi' ? 'आयोजित शिविर' : 'Camps Organized'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-200">
              {stats ? `${stats.lives_impacted}+` : '1,150+'}
            </div>
            <div className="text-xs text-rose-200">
              {locale === 'hi' ? 'सुरक्षित जीवन' : 'Lives Impacted'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'en' ? 'Search by hospital, city, or request code (e.g. REQ-4091)...' : 'अस्पताल, शहर या अनुरोध कोड (REQ-####) खोजें...'}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.view_list}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'map'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t.view_map}</span>
            </button>
          </div>
        </div>

        {/* Blood Group Filter Bar */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">
            {locale === 'en' ? 'Filter by Blood Group:' : 'रक्त समूह अनुसार चुनें:'}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedGroup === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filter_all}
            </button>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedGroup === bg
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            {locale === 'en' ? 'Urgency:' : 'प्राथमिकता:'}
          </span>
          <button
            onClick={() => setSelectedUrgency('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              selectedUrgency === 'all' ? 'text-slate-900 font-bold underline' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.filter_urgency_all}
          </button>
          <button
            onClick={() => setSelectedUrgency('critical')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              selectedUrgency === 'critical' ? 'text-rose-600 font-bold underline' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            {t.urgency_critical}
          </button>
          <button
            onClick={() => setSelectedUrgency('urgent')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              selectedUrgency === 'urgent' ? 'text-amber-600 font-bold underline' : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            {t.urgency_urgent}
          </button>
          <button
            onClick={() => setSelectedUrgency('scheduled')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              selectedUrgency === 'scheduled' ? 'text-blue-600 font-bold underline' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            {t.urgency_scheduled}
          </button>
        </div>
      </div>

      {/* Main Content: List or Map View */}
      {viewMode === 'map' ? (
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-100 relative shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-semibold text-sm text-slate-200">
                {locale === 'en' ? 'Live Geospatial Radar (India)' : 'रीयल-टाइम अस्पताल आवश्यकता रडार'}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {filteredRequests.length} {locale === 'en' ? 'Active SOS Centers' : 'सक्रिय केंद्र'}
            </div>
          </div>

          <div className="relative w-full h-[440px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <svg viewBox="0 0 400 450" className="w-[320px] h-[360px] fill-rose-950 stroke-rose-800 stroke-[1.5]">
                <path d="M190,40 C220,50 250,80 240,110 C270,120 280,150 290,190 C310,210 270,240 260,270 C240,310 210,360 200,410 C190,360 170,320 150,290 C130,260 100,240 110,200 C110,160 140,120 150,90 Z" />
              </svg>
            </div>

            <div className="absolute w-80 h-80 rounded-full border border-rose-500/20 pointer-events-none animate-pulse"></div>

            {/* Pins positioned based on request location if available */}
            {filteredRequests.map((req, idx) => {
              const topPos = req.city.includes('Delhi') ? '28%' : req.city.includes('Jaipur') ? '34%' : req.city.includes('Lucknow') ? '36%' : req.city.includes('Mumbai') ? '56%' : '72%';
              const leftPos = req.city.includes('Delhi') ? '46%' : req.city.includes('Jaipur') ? '40%' : req.city.includes('Lucknow') ? '54%' : req.city.includes('Mumbai') ? '38%' : '50%';

              return (
                <div
                  key={req.id}
                  style={{ top: topPos, left: leftPos }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  onClick={() => setActivePin(req)}
                >
                  <div className="relative">
                    <span className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                      req.urgency === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></span>
                    <div className={`relative px-2 py-1 rounded-lg text-white font-extrabold text-xs flex items-center gap-1 shadow-lg border ${
                      req.urgency === 'critical'
                        ? 'bg-rose-600 border-rose-400'
                        : 'bg-amber-600 border-amber-400'
                    }`}>
                      <Flame className="w-3 h-3" />
                      <span>{req.blood_group}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {activePin && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold">
                        {activePin.blood_group}
                      </span>
                      <span className="text-xs text-rose-400 font-semibold uppercase">
                        {activePin.urgency}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activePin.req_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {activePin.hospital_name} ({activePin.ward})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activePin.city}, {activePin.state}
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePin(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {activePin.units_needed - activePin.units_donated} {locale === 'en' ? 'units still required' : 'यूनिट शेष'}
                  </span>
                  <button
                    onClick={() => handleRespondClick(activePin.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
                  >
                    {t.btn_i_can_donate}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View: Blood Request Cards */
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {locale === 'en' ? 'No Matching Active Requests' : 'कोई सक्रिय अनुरोध नहीं मिला'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                {locale === 'en'
                  ? 'All matched emergency requirements are currently fulfilled or in progress.'
                  : 'इस श्रेणी के सभी आपातकालीन अनुरोध पूर्ण हो चुके हैं।'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isUrgent = req.urgency === 'critical';
              // Part 1.1: Progress bar = donated units / units needed
              const progressPct = Math.min(
                100,
                Math.round((req.units_donated / req.units_needed) * 100)
              );

              // Check if current user already responded
              const myResponse = req.responses?.find(
                (r) => r.donor_id === user?.donor_profile?.id
              );
              const hasResponded = !!myResponse && myResponse.response_status !== 'Cancelled';
              const canSeeContact = !!myResponse?.can_see_contact;
              // Patient name / phone is hidden on public board per Part 1.2
              const confidentialPhone = (req as any).contact_phone;

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                    isUrgent
                      ? 'border-rose-200 bg-gradient-to-r from-rose-50/20 via-white to-white'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left: Blood Group Badge & Details (No Patient Name on Public Board) */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-rose-600 text-white font-extrabold text-xl shadow-sm shadow-rose-600/30 shrink-0">
                        <span>{req.blood_group}</span>
                        <span className="text-[9px] font-medium tracking-tight uppercase opacity-90">
                          {req.component_type.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        {/* Unboxed Metadata Line with typographic separators */}
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                            {req.req_code}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span
                            className={`font-bold ${
                              isUrgent ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {req.urgency === 'critical'
                              ? t.urgency_critical
                              : req.urgency === 'urgent'
                              ? t.urgency_urgent
                              : t.urgency_scheduled}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(req.created_at)}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {req.city}, {req.state} ({req.pincode})
                          </span>
                        </div>

                        {/* Part 1.2: Hospital name & ward shown; patient name hidden on public feed */}
                        <h3 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span>{req.hospital_name}</span>
                          <span className="text-xs font-normal text-slate-500">· {req.ward}</span>
                        </h3>

                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.contact_confidential}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Progress & Action Controls */}
                    <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Units Donated / Units Needed Progress */}
                      <div className="w-full sm:w-44 text-right">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">
                            {t.units_donated}:
                          </span>
                          <span className="font-mono tabular-nums font-bold text-slate-900">
                            {req.units_donated} / {req.units_needed} Units
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progressPct >= 100 ? 'bg-emerald-500' : 'bg-rose-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button Row */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Part 1.2: Call Contact visible ONLY to confirmed donor */}
                        {canSeeContact && confidentialPhone && (
                          <a
                            href={`tel:${confidentialPhone}`}
                            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[44px] border border-emerald-200"
                            title={t.btn_call_attendant}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.btn_call_attendant}</span>
                          </a>
                        )}

                        <button
                          onClick={() => onShareWhatsApp(req)}
                          className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[44px]"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{t.btn_share_whatsapp}</span>
                        </button>

                        {/* Part 1.1 & Part 3.C: Donor Response flow */}
                        {hasResponded ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 min-h-[44px]">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{t.status_waiting_confirmation}</span>
                            </span>
                            {onCancelResponse && myResponse && (
                              <button
                                onClick={() => onCancelResponse(myResponse.id)}
                                title={t.btn_cancel_response}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRespondClick(req.id)}
                            disabled={isSubmitting === req.id || req.status === 'Fulfilled'}
                            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs min-h-[44px] ${
                              req.status === 'Fulfilled'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.98]'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>
                              {req.status === 'Fulfilled' ? t.status_fulfilled : t.btn_i_can_donate}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 1. Upcoming Camps Preview Strip (Group 4 Home Additions) */}
      {upcomingCamps.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {locale === 'hi' ? 'आगामी रक्तदान शिविर' : 'Upcoming Donation Camps'}
              </h3>
            </div>
            {onNavigateToCamps && (
              <button
                onClick={onNavigateToCamps}
                className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
              >
                {locale === 'hi' ? 'सभी शिविर देखें →' : 'View all drives →'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingCamps.map((camp) => (
              <div
                key={camp.id}
                onClick={onNavigateToCamps}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-red-600">{camp.date}</span>
                    <span>{camp.city}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate mb-1">{camp.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{camp.venue}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{camp.time}</span>
                  <span className="text-emerald-700 font-semibold">
                    {camp.total_slots - camp.booked_slots} {locale === 'hi' ? 'स्लॉट' : 'slots'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Emergency Alert Subscription Form (Group 4 Home Additions) */}
      <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mt-8">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <BellRing className="w-3.5 h-3.5" />
            {locale === 'hi' ? 'आपातकालीन अलर्ट सदस्यता' : 'Emergency Blood Alerts'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            {locale === 'hi'
              ? 'अपने शहर में आपातकालीन रक्त की आवश्यकता होने पर तुरंत अलर्ट पाएं'
              : 'Never miss an emergency SOS in your city'}
          </h3>
          <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
            {locale === 'hi'
              ? 'जब आपके रक्त समूह की आवश्यकता होगी, तो हम आपको तुरंत व्हाट्सएप या एसएमएस द्वारा सूचित करेंगे।'
              : 'Receive real-time WhatsApp and SMS notifications when critical blood matches are needed near you.'}
          </p>
        </div>

        <form onSubmit={handleSubscribeAlerts} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            required
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder={locale === 'hi' ? 'आपका नाम' : 'Your Name'}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 placeholder-white/60 text-white text-xs border border-white/20 focus:outline-hidden focus:bg-white focus:text-slate-900 transition-all"
          />
          <input
            type="tel"
            required
            maxLength={10}
            value={alertMobile}
            onChange={(e) => setAlertMobile(e.target.value.replace(/\D/g, ''))}
            placeholder={locale === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit Mobile'}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 placeholder-white/60 text-white text-xs border border-white/20 focus:outline-hidden focus:bg-white focus:text-slate-900 transition-all"
          />
          <input
            type="text"
            required
            value={alertCity}
            onChange={(e) => setAlertCity(e.target.value)}
            placeholder={locale === 'hi' ? 'शहर (e.g. Delhi, Jaipur)' : 'City (e.g. Delhi, Jaipur)'}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 placeholder-white/60 text-white text-xs border border-white/20 focus:outline-hidden focus:bg-white focus:text-slate-900 transition-all"
          />
          <select
            value={alertBloodGroup}
            onChange={(e) => setAlertBloodGroup(e.target.value as BloodGroup)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-xs border border-white/20 focus:outline-hidden focus:bg-white focus:text-slate-900 transition-all"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg} className="text-slate-900">
                Blood Group: {bg}
              </option>
            ))}
          </select>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center gap-4 text-xs text-white/90">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={viaWhatsApp}
                onChange={(e) => setViaWhatsApp(e.target.checked)}
                className="rounded text-red-600 focus:ring-0"
              />
              <span>WhatsApp Alerts</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={viaSms}
                onChange={(e) => setViaSms(e.target.checked)}
                className="rounded text-red-600 focus:ring-0"
              />
              <span>SMS Alerts</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={subscribingAlert}
            className="col-span-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-red-700 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            {subscribingAlert ? 'Subscribing...' : locale === 'hi' ? 'अलर्ट चालू करें' : 'Subscribe Free'}
          </button>
        </form>
      </div>

      {/* 3. Support UDAAN Financial Contribution Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-400 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {locale === 'hi' ? 'उड़ान के नि:शुल्क राहत कार्य में सहयोग दें' : 'Support UDAAN Voluntary Operations'}
            </h4>
            <p className="text-xs text-slate-400">
              {locale === 'hi'
                ? 'हम 100% गैर-व्यावसायिक हैं। आपकी मदद से शिविर और आपातकालीन हेल्पलाइन संचालित होते हैं।'
                : '100% non-profit voluntary initiative. Contributions fund community camps & 24x7 SOS helpline.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDonateOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>{locale === 'hi' ? 'सहयोग राशि दें' : 'Donate to UDAAN'}</span>
        </button>
      </div>

      {/* Razorpay Simulated Donation Modal */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {locale === 'hi' ? 'उड़ान में योगदान' : 'Contribute to UDAAN'}
                </h3>
              </div>
              <button
                onClick={() => setIsDonateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {locale === 'hi'
                ? 'सुरक्षित Razorpay गेटवे (टेस्ट मोड) के माध्यम से स्वैच्छिक योगदान दें।'
                : 'Support emergency voluntary blood donor drives via secure Razorpay checkout.'}
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex gap-2">
                {['250', '500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateAmount(amt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      donateAmount === amt
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="Custom Amount (₹)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              onClick={handleTriggerRazorpay}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed ₹{donateAmount} (Razorpay)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

