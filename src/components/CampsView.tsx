import React, { useState, useEffect } from 'react';
import { listCamps, rsvpCamp } from '../lib/api';
import { Camp, BloodGroup } from '../types/api';
import { Locale } from '../lib/i18n';
import { Calendar, MapPin, Clock, Phone, Users, CheckCircle2, X, PlusCircle, AlertCircle } from 'lucide-react';

interface CampsViewProps {
  locale: Locale;
  showToast: (msg: string) => void;
}

export const CampsView: React.FC<CampsViewProps> = ({ locale, showToast }) => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpMobile, setRsvpMobile] = useState('');
  const [rsvpBloodGroup, setRsvpBloodGroup] = useState<BloodGroup>('O+');
  const [submitting, setSubmitting] = useState(false);

  const isHi = locale === 'hi';

  const fetchCamps = async () => {
    try {
      const data = await listCamps();
      setCamps(data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleOpenRsvp = (camp: Camp) => {
    setSelectedCamp(camp);
    setIsRsvpOpen(true);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamp) return;

    if (!/^[6-9]\d{9}$/.test(rsvpMobile.replace(/\D/g, ''))) {
      showToast(isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      await rsvpCamp(selectedCamp.id, {
        name: rsvpName,
        mobile: rsvpMobile,
        blood_group: rsvpBloodGroup,
      });
      showToast(isHi ? 'RSVP स्लॉट सफलतापूर्वक बुक हुआ!' : 'RSVP slot confirmed successfully!');
      setIsRsvpOpen(false);
      setRsvpName('');
      setRsvpMobile('');
      fetchCamps();
    } catch (err: any) {
      showToast(err.message || 'Failed to RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotBadge = (booked: number, total: number) => {
    const available = total - booked;
    if (available <= 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
          {isHi ? 'स्लॉट फुल' : 'Slots Full'}
        </span>
      );
    }
    if (available < 15) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          {available} {isHi ? 'स्लॉट शेष (कम)' : 'slots left (Filling fast)'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
        {available} {isHi ? 'स्लॉट उपलब्ध' : 'slots available'}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            {isHi ? 'सामुदायिक शिविर' : 'Community Camps'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHi ? 'आगामी स्वैच्छिक रक्तदान शिविर' : 'Upcoming Voluntary Blood Donation Camps'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {isHi
              ? 'निकटतम सरकारी व रेड क्रॉस अधिकृत शिविरों में अपनी सुविधा अनुसार स्लॉट बुक करें।'
              : 'RSVP for upcoming blood drives organized by accredited hospitals, Red Cross, and registered NGOs.'}
          </p>
        </div>
      </div>

      {/* Grid of Camps */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading donation camps...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => {
            const isFull = camp.booked_slots >= camp.total_slots;
            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {camp.city}
                    </span>
                    {getSlotBadge(camp.booked_slots, camp.total_slots)}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-red-600 font-medium mb-4">
                    {camp.organizer}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{camp.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{camp.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{camp.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`tel:${camp.contact_phone}`} className="hover:text-red-600 underline">
                        {camp.contact_phone}
                      </a>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{isHi ? 'बुक किए गए स्लॉट' : 'Booked capacity'}</span>
                      <span className="font-semibold">{Math.round((camp.booked_slots / camp.total_slots) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-red-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, (camp.booked_slots / camp.total_slots) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    disabled={isFull}
                    onClick={() => handleOpenRsvp(camp)}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 text-white shadow-xs"
                  >
                    {isFull ? (
                      isHi ? 'स्लॉट भर चुके हैं' : 'Slots Full'
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        {isHi ? 'स्लॉट बुक करें (RSVP)' : 'RSVP Free Slot'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RSVP Modal */}
      {isRsvpOpen && selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-base">{isHi ? 'शिविर हेतु RSVP' : 'RSVP for Camp Drive'}</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{selectedCamp.title}</p>
              </div>
              <button
                onClick={() => setIsRsvpOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRsvpSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? 'रक्तदाता का पूरा नाम *' : 'Donor Full Name *'}
                </label>
                <input
                  required
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? 'मोबाइल नंबर *' : '10-digit Mobile Number *'}
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={rsvpMobile}
                  onChange={(e) => setRsvpMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? 'रक्त समूह *' : 'Blood Group *'}
                </label>
                <select
                  value={rsvpBloodGroup}
                  onChange={(e) => setRsvpBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Confirming...' : isHi ? 'RSVP की पुष्टि करें' : 'Confirm Free RSVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
