import React, { useState } from 'react';
import { z } from 'zod';
import { BloodGroup, UrgencyLevel, RequirementType, CreateRequestInput } from '../types/api';
import { Locale, translations } from '../lib/i18n';
import { X, ShieldAlert, HeartHandshake } from 'lucide-react';

interface RequestBloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateRequestInput) => void;
  locale: Locale;
  initialDraft?: Partial<CreateRequestInput>;
  onDraftChange?: (draft: Partial<CreateRequestInput>) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Zod Schema for strict validation (10-digit mobile, 6-digit PIN, units 1-10)
const requestSchema = z.object({
  patient_name: z.string().min(2, 'Patient name must be at least 2 characters'),
  hospital_name: z.string().min(2, 'Hospital name is required'),
  ward: z.string().min(1, 'Ward or Bed is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian PIN code'),
  units_needed: z.number().min(1, 'Minimum 1 unit').max(10, 'Maximum 10 units per request'),
  attendant_name: z.string().min(2, 'Attendant name is required'),
  contact_phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10 || (val.length === 12 && val.startsWith('91')), {
      message: 'Enter a valid 10-digit mobile number',
    }),
});

export const RequestBloodModal: React.FC<RequestBloodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  locale,
  initialDraft,
  onDraftChange,
}) => {
  const t = translations[locale];

  const [patientName, setPatientName] = useState(initialDraft?.patient_name || '');
  const [hospitalName, setHospitalName] = useState(initialDraft?.hospital_name || '');
  const [ward, setWard] = useState(initialDraft?.ward || 'ICU Bed 4');
  const [city, setCity] = useState(initialDraft?.city || 'New Delhi');
  const [state, setState] = useState(initialDraft?.state || 'Delhi');
  const [pincode, setPincode] = useState(initialDraft?.pincode || '110029');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialDraft?.blood_group || 'O+');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(initialDraft?.units_needed || 2);
  const [urgency, setUrgency] = useState<UrgencyLevel>(initialDraft?.urgency || 'critical');
  const [requirementType, setRequirementType] = useState<RequirementType>(
    initialDraft?.component_type || 'whole_blood'
  );
  const [attendantName, setAttendantName] = useState(initialDraft?.attendant_name || '');
  const [contactPhone, setContactPhone] = useState(initialDraft?.contact_phone || '');
  const [prescriptionNote, setPrescriptionNote] = useState(initialDraft?.doctor_note || '');
  const [futureDonor, setFutureDonor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const updateField = (field: string, val: unknown) => {
    if (onDraftChange) {
      onDraftChange({
        patient_name: field === 'patient' ? (val as string) : patientName,
        hospital_name: field === 'hospital' ? (val as string) : hospitalName,
        ward: field === 'ward' ? (val as string) : ward,
        city: field === 'city' ? (val as string) : city,
        state: field === 'state' ? (val as string) : state,
        pincode: field === 'pincode' ? (val as string) : pincode,
        blood_group: field === 'group' ? (val as BloodGroup) : bloodGroup,
        units_needed: field === 'units' ? (val as number) : unitsNeeded,
        urgency: field === 'urgency' ? (val as UrgencyLevel) : urgency,
        component_type: field === 'component' ? (val as RequirementType) : requirementType,
        attendant_name: field === 'attendant' ? (val as string) : attendantName,
        contact_phone: field === 'phone' ? (val as string) : contactPhone,
        doctor_note: field === 'note' ? (val as string) : prescriptionNote,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = requestSchema.safeParse({
      patient_name: patientName,
      hospital_name: hospitalName,
      ward: ward,
      city: city,
      state: state,
      pincode: pincode,
      units_needed: Number(unitsNeeded),
      attendant_name: attendantName,
      contact_phone: contactPhone,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      (result.error.issues || []).forEach((err: any) => {
        if (err.path && err.path[0]) errMap[err.path[0] as string] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    onSubmit({
      patient_name: patientName.trim(),
      hospital_name: hospitalName.trim(),
      ward: ward.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      blood_group: bloodGroup,
      units_needed: Number(unitsNeeded) || 1,
      urgency,
      component_type: requirementType,
      attendant_name: attendantName.trim(),
      contact_phone: contactPhone.trim(),
      doctor_note: prescriptionNote.trim(),
      auto_register_donor: futureDonor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-200" />
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">{t.modal_request_title}</h2>
              <p className="text-xs text-rose-100">{t.modal_request_subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-700 text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_patient_name} *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  updateField('patient', e.target.value);
                }}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              {errors.patient_name && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.patient_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_city} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  updateField('city', e.target.value);
                }}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_hospital_name} *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => {
                  setHospitalName(e.target.value);
                  updateField('hospital', e.target.value);
                }}
                placeholder="e.g. AIIMS Trauma Center"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
              {errors.hospital_name && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.hospital_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_ward} *
              </label>
              <input
                type="text"
                required
                value={ward}
                onChange={(e) => {
                  setWard(e.target.value);
                  updateField('ward', e.target.value);
                }}
                placeholder="e.g. ICU Bed 14"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_state} *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  updateField('state', e.target.value);
                }}
                placeholder="e.g. Delhi"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_pincode} * (6-digits)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  updateField('pincode', e.target.value);
                }}
                placeholder="e.g. 110029"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl"
              />
              {errors.pincode && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_blood_group} *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => {
                  setBloodGroup(e.target.value as BloodGroup);
                  updateField('group', e.target.value);
                }}
                className="w-full px-3.5 py-2 text-sm font-bold text-rose-700 border border-slate-200 rounded-xl bg-white"
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
                {t.label_units} *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={unitsNeeded}
                onChange={(e) => {
                  setUnitsNeeded(Number(e.target.value));
                  updateField('units', Number(e.target.value));
                }}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl"
              />
              {errors.units_needed && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.units_needed}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_urgency} *
              </label>
              <select
                value={urgency}
                onChange={(e) => {
                  setUrgency(e.target.value as UrgencyLevel);
                  updateField('urgency', e.target.value);
                }}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
              >
                <option value="critical">{t.urgency_critical}</option>
                <option value="urgent">{t.urgency_urgent}</option>
                <option value="scheduled">{t.urgency_scheduled}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_contact_person} *
              </label>
              <input
                type="text"
                required
                value={attendantName}
                onChange={(e) => {
                  setAttendantName(e.target.value);
                  updateField('attendant', e.target.value);
                }}
                placeholder="e.g. Suresh Kumar"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
              {errors.attendant_name && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.attendant_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.label_contact_phone} * (10-digits)
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                  updateField('phone', e.target.value);
                }}
                placeholder="9876543210"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl"
              />
              {errors.contact_phone && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.label_prescription_notes}
            </label>
            <textarea
              rows={2}
              value={prescriptionNote}
              onChange={(e) => {
                setPrescriptionNote(e.target.value);
                updateField('note', e.target.value);
              }}
              placeholder="Clinical reason, doctor instruction..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          {/* Part 3.D: Step 2 checkbox "I will donate in the future" */}
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="futureDonor"
              checked={futureDonor}
              onChange={(e) => setFutureDonor(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
            />
            <label htmlFor="futureDonor" className="text-xs text-rose-950 font-medium cursor-pointer">
              {t.checkbox_future_donor}
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl min-h-[44px]"
            >
              {t.btn_cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/30 active:scale-[0.98] transition-all min-h-[44px]"
            >
              {t.btn_submit_request}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
