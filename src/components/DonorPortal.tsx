import React, { useState } from 'react';
import { DonorProfile, BloodGroup, RegisterDonorInput } from '../types/api';
import { Locale, translations } from '../lib/i18n';
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Check,
} from 'lucide-react';

interface DonorPortalProps {
  donors: DonorProfile[];
  locale: Locale;
  onRegisterDonor: (donor: RegisterDonorInput) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorPortal: React.FC<DonorPortalProps> = ({ donors, locale, onRegisterDonor }) => {
  const t = translations[locale];
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>('all');
  const [showRegModal, setShowRegModal] = useState(false);

  // Eligibility Calculator State
  const [userWeight, setUserWeight] = useState<number>(58);
  const [lastDonation, setLastDonation] = useState<string>('2026-05-01');

  // Registration Form State
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [consentDisplay, setConsentDisplay] = useState(true);

  // Cooldown calculation: 90 days required between whole blood donations
  const cooldownDaysLeft = React.useMemo(() => {
    if (!lastDonation) return 0;
    const lastDate = new Date(lastDonation);
    const nextEligible = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const diffTime = nextEligible.getTime() - Date.now();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }, [lastDonation]);

  const isEligible = userWeight >= 45 && cooldownDaysLeft === 0;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onRegisterDonor({
      name: name.trim(),
      blood_group: bloodGroup,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@donor.udaan.org`,
      last_donation_date: lastDonation || null,
      weight_kg: Number(userWeight) || 55,
      gender,
      consent_display: consentDisplay,
    });
    setShowRegModal(false);
  };

  const filteredDonors = donors.filter(
    (d) => selectedGroup === 'all' || d.blood_group === selectedGroup
  );

  return (
    <div className="space-y-6">
      {/* Donor Eligibility & Cooldown Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{locale === 'en' ? 'National Donor Registry & Guidelines' : 'राष्ट्रीय स्वैच्छिक रक्तदाता नियम'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {t.donor_checker_title}
            </h2>
            <p className="text-sm text-slate-600 mb-4">{t.donor_checker_subtitle}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="font-semibold text-slate-800">{t.criteria_age}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Govt of India rule</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="font-semibold text-slate-800">{t.criteria_weight}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Safe extraction limit</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="font-semibold text-slate-800">{t.criteria_gap}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Iron replenishment</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="font-semibold text-slate-800">{t.criteria_hb}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Checked at blood bank</div>
              </div>
            </div>
          </div>

          {/* Cooldown Interactive Widget */}
          <div className="w-full md:w-80 p-5 bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-2xl shadow-md shrink-0">
            <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{locale === 'en' ? '90-Day Cooldown Calculator' : 'रक्तदान कूलडाउन गणक'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  {locale === 'en' ? 'Last Donation Date:' : 'अंतिम रक्तदान तिथि:'}
                </label>
                <input
                  type="date"
                  value={lastDonation}
                  onChange={(e) => setLastDonation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  {locale === 'en' ? 'Body Weight (kg):' : 'शरीर का वजन (किग्रा):'}
                </label>
                <input
                  type="number"
                  min="30"
                  max="150"
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                {isEligible ? (
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{locale === 'en' ? 'Eligible to Donate Blood Today!' : 'आप आज रक्तदान करने हेतु पूरी तरह पात्र हैं!'}</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-300 font-medium">
                    {cooldownDaysLeft > 0 ? (
                      <span>
                        {cooldownDaysLeft} {locale === 'en' ? 'days cooldown remaining' : 'दिनों का विश्राम शेष'}
                      </span>
                    ) : (
                      <span>{locale === 'en' ? 'Minimum 45 kg weight required' : 'न्यूनतम 45 किग्रा वजन आवश्यक'}</span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowRegModal(true)}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-rose-600" />
                <span>{t.nav_register_donor}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Donors Directory */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {locale === 'en' ? 'Verified On-Call Donors' : 'सत्यापित ऑन-कॉल रक्तदाता'}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === 'en'
                ? 'Voluntary donors registered on the UDAAN network.'
                : 'उड़ान नेटवर्क पर पंजीकृत स्वैच्छिक रक्तदाता।'}
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                selectedGroup === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  selectedGroup === bg
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="p-4 border border-slate-200 rounded-2xl hover:border-rose-300 transition-all bg-white shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex flex-col items-center justify-center font-extrabold text-base shrink-0">
                  {donor.blood_group}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{donor.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {donor.donor_code}
                    </span>
                    {donor.is_verified && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {donor.city}, {donor.state} ({donor.pincode})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {donor.total_donations} {locale === 'en' ? 'donations given' : 'बार रक्तदान किया'}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <a
                  href={`tel:${donor.phone}`}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{locale === 'en' ? 'Connect' : 'कॉल'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {locale === 'en' ? 'Register as On-Call Hero Donor' : 'ऑन-कॉल रक्तदाता पंजीकरण'}
                </h3>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {locale === 'en' ? 'Full Name' : 'पूरा नाम'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Varma"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {locale === 'en' ? 'Blood Group' : 'रक्त समूह'} *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 text-sm font-bold text-rose-700 border border-slate-200 rounded-xl bg-white"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {locale === 'en' ? 'Gender' : 'लिंग'}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {locale === 'en' ? 'City' : 'शहर'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {locale === 'en' ? 'State' : 'राज्य'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {locale === 'en' ? 'Pincode' : 'पिनकोड'} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {locale === 'en' ? 'Phone (WhatsApp reachable)' : 'मोबाइल फोन (व्हाट्सएप)'} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentDisplay}
                  onChange={(e) => setConsentDisplay(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="consent" className="text-xs text-slate-600">
                  {locale === 'en'
                    ? 'Consent to display my donor availability status to emergency coordinators'
                    : 'आपातकालीन समन्वयकों को मेरी उपलब्धता प्रदर्शित करने की सहमति'}
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md min-h-[44px]"
                >
                  {locale === 'en' ? 'Complete Registration' : 'पंजीकरण पूरा करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
