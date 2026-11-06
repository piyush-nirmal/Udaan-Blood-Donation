export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'critical' | 'urgent' | 'scheduled';

export type RequirementType = 'whole_blood' | 'platelets' | 'plasma' | 'rbc';

export type RequestStatus = 'Pending' | 'Matched' | 'PartiallyFulfilled' | 'Fulfilled';

export type ResponseStatus =
  | 'Interested'
  | 'Confirmed'
  | 'Waitlisted'
  | 'NoShow'
  | 'Donated'
  | 'Cancelled';

export interface DonorResponse {
  id: string;
  request_id: string;
  donor_id: string;
  donor_name: string;
  donor_phone?: string;
  can_see_contact: boolean;
  donor_blood_group: BloodGroup;
  response_status: ResponseStatus;
  din?: string;
  created_at: string;
  confirmed_at?: string;
  donated_at?: string;
}

export interface PublicBloodRequest {
  id: string;
  req_code: string;
  hospital_name: string;
  ward: string;
  city: string;
  state: string;
  pincode: string;
  district?: string;
  blood_group: BloodGroup;
  component_type: RequirementType;
  units_needed: number;
  units_donated: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  created_at: string;
  lat?: number;
  lng?: number;
  responses?: DonorResponse[];
}

export interface BloodRequest extends PublicBloodRequest {
  patient_name: string;
  attendant_name: string;
  contact_phone: string;
  doctor_note?: string;
}

export interface DonorProfile {
  id: string;
  uid: string;
  donor_code: string;
  name: string;
  blood_group: BloodGroup;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  last_donation_date: string | null;
  total_donations: number;
  is_available: boolean;
  is_verified: boolean;
  consent_display: boolean;
  weight_kg: number;
  gender: 'male' | 'female' | 'other';
  donation_history?: DonationRecord[];
}

export interface DonationRecord {
  id: string;
  din: string;
  date: string;
  hospital_name: string;
  blood_group: BloodGroup;
  component: RequirementType;
  units: number;
}

export interface UserAuth {
  uid: string;
  email: string;
  displayName: string;
  token: string;
  role: 'donor' | 'requester' | 'coordinator';
  donor_profile?: DonorProfile;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  verified: boolean;
  lat?: number;
  lng?: number;
  stock_updated_at: string;
  stock: Record<BloodGroup, number>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'match' | 'confirmed' | 'donated' | 'alert';
  link?: string;
}

export interface Camp {
  id: string;
  title: string;
  organizer: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  total_slots: number;
  booked_slots: number;
  contact_phone: string;
}

export interface Partner {
  id: string;
  type: 'ngo' | 'blood_bank';
  name: string;
  city: string;
  phone: string;
  email?: string;
  registration_no?: string;
  license_no?: string;
  hospital_or_org?: string;
  available_blood_types?: string[];
  about?: string;
  status: 'pending' | 'verified';
  created_at: string;
}

export interface AlertSubscription {
  id: string;
  mobile: string;
  blood_group: BloodGroup;
  city: string;
  name?: string;
  via_whatsapp: boolean;
  via_sms: boolean;
  created_at: string;
}

export interface WellnessTip {
  id: string;
  title_en: string;
  title_hi: string;
  body_en: string;
  body_hi: string;
  category: 'pre' | 'post' | 'eligibility';
}

export interface Feedback {
  id: string;
  role: 'donor' | 'receiver';
  rating: number;
  message: string;
  created_at: string;
}

export interface ImpactStats {
  total_donors: number;
  active_donors: number;
  fulfilled_requests: number;
  camps_organized: number;
  lives_impacted: number;
}

export interface TrackingInfo {
  code: string;
  type: 'REQ' | 'DIN';
  status: string;
  timeline: { step: string; timestamp: string; completed: boolean }[];
  details: {
    blood_group: BloodGroup;
    city: string;
    hospital: string;
    units: number;
  };
}

export interface DonationCertificate {
  din: string;
  donor_name: string;
  blood_group: BloodGroup;
  donation_date: string;
  hospital_or_camp: string;
  units: number;
  component: string;
}

export interface CreateRequestInput {
  patient_name: string;
  attendant_name: string;
  contact_phone: string;
  hospital_name: string;
  ward: string;
  city: string;
  state: string;
  pincode: string;
  district?: string;
  blood_group: BloodGroup;
  component_type: RequirementType;
  units_needed: number;
  urgency: UrgencyLevel;
  doctor_note?: string;
  lat?: number;
  lng?: number;
  auto_register_donor?: boolean;
}

export interface RegisterDonorInput {
  name: string;
  blood_group: BloodGroup;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  last_donation_date?: string | null;
  weight_kg: number;
  gender: 'male' | 'female' | 'other';
  consent_display: boolean;
}

export interface RegisterPartnerInput {
  type: 'ngo' | 'blood_bank';
  name: string;
  city: string;
  phone: string;
  email?: string;
  registration_no?: string;
  license_no?: string;
  hospital_or_org?: string;
  available_blood_types?: string[];
  about?: string;
}
