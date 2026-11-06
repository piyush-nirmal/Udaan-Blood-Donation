import React, { useState, useEffect, useCallback } from 'react';
import {
  BloodRequest,
  DonorResponse,
  UserAuth,
  AppNotification,
  DonorProfile,
} from '../types/api';
import {
  myRequests,
  confirmDonor,
  markNoShow,
  markDonated,
  fulfillRequest,
  setAvailability,
  listNotifications,
  markNotificationsRead,
} from '../lib/api';
import { Locale, translations } from '../lib/i18n';
import { StatusChip } from './StatusChip';
import {
  Activity,
  UserCheck,
  Bell,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Building,
  Check,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface DashboardProps {
  user: UserAuth;
  locale: Locale;
  onNavigateCertificate: (din: string) => void;
  onToast: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  locale,
  onNavigateCertificate,
  onToast,
}) => {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<'requests' | 'profile' | 'notifications'>('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | undefined>(user.donor_profile);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, notifs] = await Promise.all([myRequests(), listNotifications()]);
      setRequests(reqs || []);
      setNotifications(notifs || []);
    } catch (err: any) {
      onToast(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Confirm Donor
  const handleConfirm = async (reqId: string, respId: string) => {
    setActionInProgress(respId);
    try {
      await confirmDonor(reqId, respId);
      await loadDashboardData();
      onToast(locale === 'en' ? 'Donor confirmed! Contact details revealed.' : 'रक्तदाता की पुष्टि हो गई!');
    } catch (err: any) {
      onToast(err.message || 'Failed to confirm donor');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Mark No-Show
  const handleNoShow = async (respId: string) => {
    setActionInProgress(respId);
    try {
      await markNoShow(respId);
      await loadDashboardData();
      onToast(locale === 'en' ? 'Donor marked as No-Show' : 'रक्तदाता अनुपस्थित चिह्नित हुआ');
    } catch (err: any) {
      onToast(err.message || 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Mark Donated (Part 1.1: Generates DIN & updates donor cooldown)
  const handleMarkDonated = async (respId: string) => {
    setActionInProgress(respId);
    try {
      const res = await markDonated(respId);
      await loadDashboardData();
      onToast(`${t.toast_donation_recorded} DIN: ${res.din}`);
    } catch (err: any) {
      onToast(err.message || 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Fulfill Request
  const handleFulfillRequest = async (reqId: string) => {
    setActionInProgress(reqId);
    try {
      await fulfillRequest(reqId);
      await loadDashboardData();
      onToast(locale === 'en' ? 'Request marked as Fulfilled!' : 'अनुरोध पूर्ण चिह्नित हुआ!');
    } catch (err: any) {
      onToast(err.message || 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Availability Toggle
  const handleToggleAvailability = async () => {
    if (!donorProfile) return;
    const nextState = !donorProfile.is_available;
    try {
      const updated = await setAvailability(nextState);
      setDonorProfile(updated);
      onToast(
        nextState
          ? locale === 'en'
            ? 'Status: Available on Call'
            : 'स्थिति: कॉल पर उपलब्ध'
          : locale === 'en'
          ? 'Status: Paused'
          : 'स्थिति: विश्राम पर'
      );
    } catch (err: any) {
      onToast(err.message || 'Error updating status');
    }
  };

  // Cooldown calculation: 90 days from last donation date
  const cooldownDaysLeft = React.useMemo(() => {
    if (!donorProfile?.last_donation_date) return 0;
    const last = new Date(donorProfile.last_donation_date).getTime();
    const nextEligible = last + 90 * 24 * 60 * 60 * 1000;
    const diff = Math.ceil((nextEligible - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [donorProfile]);

  const handleMarkNotifsRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{locale === 'en' ? 'Verified Account Console' : 'सत्यापित खाता कंसोल'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.dash_title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.displayName} · <span className="font-mono">{user.email}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.dash_tab_requests}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.dash_tab_profile}</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t.dash_tab_notifs}</span>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: MY REQUESTS & DONORS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">{t.dash_no_requests}</p>
            </div>
          ) : (
            requests.map((req) => {
              const progressPct = Math.min(
                100,
                Math.round((req.units_donated / req.units_needed) * 100)
              );

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-xs">
                          {req.blood_group}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-700">
                          {req.req_code}
                        </span>
                        <StatusChip status={req.status} type="request" />
                        <span className="text-xs text-slate-500 font-medium uppercase">
                          {req.urgency}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-1">
                        {req.patient_name} · <span className="font-normal text-slate-600">{req.hospital_name} ({req.ward})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attendant: {req.attendant_name} ({req.contact_phone}) · {req.city}, {req.state} ({req.pincode})
                      </p>
                    </div>

                    <div className="w-full sm:w-48 text-right shrink-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">{t.units_donated}:</span>
                        <span className="font-mono font-bold text-slate-900">
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

                      {req.status !== 'Fulfilled' && (
                        <button
                          onClick={() => handleFulfillRequest(req.id)}
                          disabled={actionInProgress === req.id}
                          className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          {t.dash_btn_fulfill}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Responding Donors List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>
                        {t.dash_responding_donors} ({req.responses?.length || 0})
                      </span>
                    </h4>

                    {(!req.responses || req.responses.length === 0) ? (
                      <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {locale === 'en'
                          ? 'Waiting for nearby voluntary donors to respond to this SOS alert.'
                          : 'स्वैच्छिक रक्तदाताओं के संपर्क की प्रतीक्षा है।'}
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                        {req.responses.map((resp) => {
                          const isConfirmed = resp.response_status === 'Confirmed';
                          const isDonated = resp.response_status === 'Donated';
                          const phone = resp.donor_phone || req.contact_phone;

                          return (
                            <div
                              key={resp.id}
                              className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-200 shrink-0">
                                  {resp.donor_blood_group}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900">
                                      {resp.donor_name}
                                    </span>
                                    <StatusChip status={resp.response_status} type="response" />
                                    {resp.din && (
                                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                        {resp.din}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>
                                      {new Date(resp.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                    {isConfirmed && phone && (
                                      <span className="text-slate-600 font-mono font-medium">
                                        · {phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons per donor response */}
                              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                                {/* After Confirm, show WhatsApp and Call buttons (Part 3.A) */}
                                {(isConfirmed || isDonated) && phone && (
                                  <>
                                    <a
                                      href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `Hello ${resp.donor_name}, thank you for stepping forward to donate blood for ${req.patient_name} at ${req.hospital_name} via UDAAN.`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-1 min-h-[36px]"
                                      title="WhatsApp Donor"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>WhatsApp</span>
                                    </a>

                                    <a
                                      href={`tel:${phone}`}
                                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1 min-h-[36px]"
                                      title="Call Donor"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      <span>Call</span>
                                    </a>
                                  </>
                                )}

                                {!isConfirmed && !isDonated && (
                                  <button
                                    onClick={() => handleConfirm(req.id, resp.id)}
                                    disabled={actionInProgress === resp.id}
                                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs min-h-[36px]"
                                  >
                                    {t.dash_btn_confirm}
                                  </button>
                                )}

                                {isConfirmed && !isDonated && (
                                  <>
                                    <button
                                      onClick={() => handleMarkDonated(resp.id)}
                                      disabled={actionInProgress === resp.id}
                                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg min-h-[36px]"
                                    >
                                      {t.dash_btn_markdonated}
                                    </button>

                                    <button
                                      onClick={() => handleNoShow(resp.id)}
                                      disabled={actionInProgress === resp.id}
                                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg min-h-[36px]"
                                    >
                                      {t.dash_btn_noshow}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: MY DONOR PROFILE */}
      {activeTab === 'profile' && donorProfile && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {donorProfile.blood_group}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{donorProfile.name}</h3>
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {donorProfile.donor_code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {donorProfile.city}, {donorProfile.state} ({donorProfile.pincode}) · {donorProfile.phone}
                  </p>
                </div>
              </div>

              {/* Availability Toggle (Part 3.A) */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">
                  {t.dash_availability_label}:
                </span>
                <button
                  onClick={handleToggleAvailability}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    donorProfile.is_available
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {donorProfile.is_available ? t.dash_avail_active : t.dash_avail_paused}
                </button>
              </div>
            </div>

            {/* 90-Day Cooldown Countdown */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{t.dash_cooldown_title}</span>
                  </span>
                  <div className="mt-2 text-2xl font-bold">
                    {cooldownDaysLeft === 0 ? (
                      <span className="text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        {t.dash_cooldown_ready}
                      </span>
                    ) : (
                      <span>
                        {cooldownDaysLeft} {t.dash_days_remaining}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  Last Donation Date:{' '}
                  <span className="font-mono font-bold text-white">
                    {donorProfile.last_donation_date || 'No recent record'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Donation History with DIN & "Get Certificate" button (Part 3.A) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-rose-600" />
              <span>{t.dash_history_title}</span>
            </h4>

            {(!donorProfile.donation_history || donorProfile.donation_history.length === 0) ? (
              <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
                {t.dash_history_empty}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {donorProfile.donation_history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {item.din}
                        </span>
                        <span className="text-xs font-bold text-rose-700">{item.blood_group}</span>
                        <span className="text-xs text-slate-500 capitalize">· {item.component.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 flex items-center gap-1 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.hospital_name}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Date: {item.date} · Units: {item.units}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateCertificate(item.din)}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px] border border-rose-200"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{t.dash_btn_getcert}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-base text-slate-900">
              {locale === 'en' ? 'System Alerts & Logs' : 'सिस्टम सूचनाएं'}
            </h4>
            <button
              onClick={handleMarkNotifsRead}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              {t.notifs_mark_all_read}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">{t.notifs_empty}</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                      {!n.read && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
