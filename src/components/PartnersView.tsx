import React, { useState, useEffect } from 'react';
import { listPartners, registerPartner } from '../lib/api';
import { Partner, RegisterPartnerInput } from '../types/api';
import { Locale } from '../lib/i18n';
import { Building2, ShieldCheck, CheckCircle2, PlusCircle, Phone, MapPin, Award, X } from 'lucide-react';

interface PartnersViewProps {
  locale: Locale;
  showToast: (msg: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ locale, showToast }) => {
  const [activeTab, setActiveTab] = useState<'ngo' | 'blood_bank'>('ngo');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<RegisterPartnerInput>({
    type: 'ngo',
    name: '',
    city: '',
    phone: '',
    email: '',
    registration_no: '',
    license_no: '',
    hospital_or_org: '',
    about: '',
    available_blood_types: ['A+', 'B+', 'O+', 'AB+'],
  });

  const isHi = locale === 'hi';

  const fetchPartners = async () => {
    try {
      const data = await listPartners();
      setPartners(data);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.phone.trim()) {
      showToast(isHi ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await registerPartner(formData);
      showToast(
        isHi
          ? 'पंजीकरण प्राप्त हुआ! सत्यापन के बाद सक्रिय किया जाएगा।'
          : 'Registration submitted! Verification is pending review.'
      );
      setIsRegisterModalOpen(false);
      setFormData({
        type: activeTab,
        name: '',
        city: '',
        phone: '',
        email: '',
        registration_no: '',
        license_no: '',
        hospital_or_org: '',
        about: '',
        available_blood_types: ['A+', 'B+', 'O+', 'AB+'],
      });
      fetchPartners();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPartners = partners.filter((p) => p.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            {isHi ? 'साझेदार नेटवर्क' : 'Partner Network'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHi ? 'सहयोगी गैर-सरकारी संगठन एवं ब्लड बैंक' : 'Accredited NGOs & Blood Banks'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {isHi
              ? 'उड़ान के साथ मिलकर रक्तदान को बढ़ावा देने वाले पंजीकृत साझेदार।'
              : 'Verified healthcare institutions and voluntary humanitarian organizations collaborating with UDAAN.'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData((prev) => ({ ...prev, type: activeTab }));
            setIsRegisterModalOpen(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {activeTab === 'ngo'
            ? isHi
              ? 'NGO पंजीकृत करें'
              : 'Register as NGO Partner'
            : isHi
            ? 'ब्लड बैंक पंजीकृत करें'
            : 'Register Blood Bank'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('ngo')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ngo'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          {isHi ? 'गैर-सरकारी संगठन (NGOs)' : 'NGO Partners'}
        </button>
        <button
          onClick={() => setActiveTab('blood_bank')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'blood_bank'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {isHi ? 'लाइसेंसी ब्लड बैंक' : 'Licensed Blood Banks'}
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {partner.city}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${
                    partner.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {partner.status === 'verified' ? 'Verified Partner' : 'Pending Verification'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{partner.name}</h3>
              {partner.registration_no && (
                <p className="text-xs text-slate-400 font-mono mb-2">Reg: {partner.registration_no}</p>
              )}
              {partner.license_no && (
                <p className="text-xs text-slate-400 font-mono mb-2">Lic: {partner.license_no}</p>
              )}

              {partner.about && (
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {partner.about}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${partner.phone}`} className="hover:text-red-600 font-medium">
                  {partner.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{partner.city}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <h3 className="font-bold text-base">
                {activeTab === 'ngo' ? 'Register NGO Partner' : 'Register Licensed Blood Bank'}
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Blood Bank Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. LifeCare Blood Foundation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Jaipur"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeTab === 'ngo' ? 'NGO Registration / Darpan ID' : 'Drug Controller License Number'}
                </label>
                <input
                  type="text"
                  value={activeTab === 'ngo' ? formData.registration_no : formData.license_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [activeTab === 'ngo' ? 'registration_no' : 'license_no']: e.target.value,
                    })
                  }
                  placeholder={activeTab === 'ngo' ? 'e.g. DL/2019/0129' : 'e.g. BB-RJ-2015-88'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">About / Accreditation</label>
                <textarea
                  rows={3}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Briefly describe your activities or facility facilities..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <p className="text-xs text-slate-500">
                Note: Submissions will display as "Pending verification" until documents are verified by the UDAAN core team.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Partner Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
