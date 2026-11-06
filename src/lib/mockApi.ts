import {
  BloodRequest,
  PublicBloodRequest,
  DonorProfile,
  DonorResponse,
  BloodBank,
  UserAuth,
  AppNotification,
  Camp,
  Partner,
  AlertSubscription,
  WellnessTip,
  Feedback,
  ImpactStats,
  TrackingInfo,
  DonationCertificate,
  CreateRequestInput,
  RegisterDonorInput,
  RegisterPartnerInput,
  BloodGroup,
} from '../types/api';

const STORAGE_KEYS = {
  USER: 'udaan_user_v3',
  TOKEN: 'udaan_firebase_token_v3',
  REQUESTS: 'udaan_requests_v3',
  DONORS: 'udaan_donors_v3',
  BLOOD_BANKS: 'udaan_banks_v3',
  NOTIFICATIONS: 'udaan_notifications_v3',
  CAMPS: 'udaan_camps_v3',
  PARTNERS: 'udaan_partners_v3',
  SUBSCRIPTIONS: 'udaan_subscriptions_v3',
  FEEDBACKS: 'udaan_feedbacks_v3',
  CERTIFICATES: 'udaan_certificates_v3',
};

const DEFAULT_USER: UserAuth = {
  uid: 'usr_volunteer_01',
  email: 'greenedgeinfratech@gmail.com',
  displayName: 'Volunteer Coordinator',
  token: 'mock-firebase-id-token-udaan-2026',
  role: 'coordinator',
  donor_profile: {
    id: 'don_usr_01',
    uid: 'usr_volunteer_01',
    donor_code: 'DNR-8012',
    name: 'Volunteer Coordinator',
    blood_group: 'O+',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phone: '+91 98112 00000',
    email: 'greenedgeinfratech@gmail.com',
    last_donation_date: '2026-05-10',
    total_donations: 4,
    is_available: true,
    is_verified: true,
    consent_display: true,
    weight_kg: 68,
    gender: 'other',
    donation_history: [
      {
        id: 'donrec_01',
        din: '#DIN4821',
        date: '2026-05-10',
        hospital_name: 'AIIMS Blood Bank, New Delhi',
        blood_group: 'O+',
        component: 'whole_blood',
        units: 1,
      },
    ],
  },
};

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req_001',
    req_code: 'REQ-4091',
    patient_name: 'Rajesh Sharma',
    attendant_name: 'Anita Sharma',
    contact_phone: '+91 98112 45910',
    hospital_name: 'AIIMS Trauma Centre',
    ward: 'ICU Bed 12',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110029',
    district: 'South Delhi',
    blood_group: 'O-',
    component_type: 'whole_blood',
    units_needed: 3,
    units_donated: 1,
    urgency: 'critical',
    status: 'PartiallyFulfilled',
    doctor_note: 'Severe highway trauma accident. High urgent demand for rare O- negative blood.',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lat: 28.5672,
    lng: 77.21,
    responses: [
      {
        id: 'resp_01',
        request_id: 'req_001',
        donor_id: 'don_usr_01',
        donor_name: 'Volunteer Coordinator',
        donor_phone: '+91 98112 00000',
        can_see_contact: false,
        donor_blood_group: 'O-',
        response_status: 'Interested',
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req_002',
    req_code: 'REQ-7712',
    patient_name: 'Aarav Patel (Age 8)',
    attendant_name: 'Suresh Patel',
    contact_phone: '+91 98201 88342',
    hospital_name: 'KEM Hospital, Parel',
    ward: 'Pediatric Ward 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400012',
    district: 'Mumbai City',
    blood_group: 'B+',
    component_type: 'platelets',
    units_needed: 4,
    units_donated: 2,
    urgency: 'critical',
    status: 'Matched',
    doctor_note: 'Dengue induced critical thrombocytopenia. Platelets required today.',
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    lat: 19.0028,
    lng: 72.8427,
    responses: [
      {
        id: 'resp_02',
        request_id: 'req_002',
        donor_id: 'don_102',
        donor_name: 'Pooja Iyer',
        donor_phone: '+91 98211 77209',
        can_see_contact: true,
        donor_blood_group: 'B+',
        response_status: 'Confirmed',
        created_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req_003',
    req_code: 'REQ-1284',
    patient_name: 'Sunita Devi',
    attendant_name: 'Vikram Gowda',
    contact_phone: '+91 94481 23091',
    hospital_name: 'Victoria Hospital',
    ward: 'Maternity OT-2',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560002',
    district: 'Bengaluru Urban',
    blood_group: 'AB-',
    component_type: 'whole_blood',
    units_needed: 2,
    units_donated: 0,
    urgency: 'urgent',
    status: 'Pending',
    doctor_note: 'Emergency cesarean section backup required.',
    created_at: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    lat: 12.9647,
    lng: 77.5756,
    responses: [],
  },
];

const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb_01',
    name: 'Indian Red Cross Society NHQ Blood Bank',
    address: '1 Red Cross Road, Near Parliament, New Delhi',
    city: 'New Delhi',
    phone: '011-23711551',
    verified: true,
    stock_updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lat: 28.6219,
    lng: 77.209,
    stock: {
      'A+': 18,
      'A-': 4,
      'B+': 24,
      'B-': 3,
      'AB+': 8,
      'AB-': 1,
      'O+': 32,
      'O-': 2,
    },
  },
  {
    id: 'bb_02',
    name: 'Rotary Central Blood Bank',
    address: 'Dr. E Moses Road, Worli, Mumbai',
    city: 'Mumbai',
    phone: '022-24933990',
    verified: true,
    stock_updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lat: 19.006,
    lng: 72.818,
    stock: {
      'A+': 12,
      'A-': 2,
      'B+': 20,
      'B-': 4,
      'AB+': 6,
      'AB-': 2,
      'O+': 28,
      'O-': 1,
    },
  },
];

const INITIAL_CERTIFICATES: DonationCertificate[] = [
  {
    din: '#DIN4821',
    donor_name: 'Volunteer Coordinator',
    blood_group: 'O+',
    donation_date: '2026-05-10',
    hospital_or_camp: 'AIIMS Blood Bank, New Delhi',
    units: 1,
    component: 'whole_blood',
  },
  {
    din: '#DIN8912',
    donor_name: 'Pooja Iyer',
    blood_group: 'B+',
    donation_date: '2026-05-10',
    hospital_or_camp: 'KEM Hospital, Mumbai',
    units: 1,
    component: 'platelets',
  },
];

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function seedMockStore(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    setItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setItem(STORAGE_KEYS.USER, DEFAULT_USER);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOOD_BANKS)) {
    setItem(STORAGE_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    setItem(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  }
}

export const mockApi = {
  async getMe(): Promise<UserAuth | null> {
    seedMockStore();
    return getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
  },

  async registerDonor(data: RegisterDonorInput): Promise<DonorProfile> {
    seedMockStore();
    const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newProfile: DonorProfile = {
      id: `don_${Date.now()}`,
      uid: user ? user.uid : `usr_${Date.now()}`,
      donor_code: `DNR-${codeNum}`,
      name: data.name,
      blood_group: data.blood_group,
      city: data.city,
      state: data.state || 'Delhi',
      pincode: data.pincode,
      phone: data.phone,
      email: data.email,
      last_donation_date: data.last_donation_date ?? null,
      total_donations: 0,
      is_available: true,
      is_verified: true,
      consent_display: data.consent_display,
      weight_kg: data.weight_kg,
      gender: data.gender,
      donation_history: [],
    };

    if (user) {
      user.donor_profile = newProfile;
      setItem(STORAGE_KEYS.USER, user);
    }
    return newProfile;
  },

  async updateDonor(data: Partial<DonorProfile>): Promise<DonorProfile> {
    const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
    if (!user || !user.donor_profile) {
      throw new Error('Donor profile not found');
    }
    user.donor_profile = { ...user.donor_profile, ...data };
    setItem(STORAGE_KEYS.USER, user);
    return user.donor_profile;
  },

  async setAvailability(is_available: boolean): Promise<DonorProfile> {
    return mockApi.updateDonor({ is_available });
  },

  async createRequest(data: CreateRequestInput): Promise<BloodRequest> {
    seedMockStore();
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newReq: BloodRequest = {
      id: `req_${Date.now()}`,
      req_code: `REQ-${codeNum}`,
      patient_name: data.patient_name,
      attendant_name: data.attendant_name,
      contact_phone: data.contact_phone,
      hospital_name: data.hospital_name,
      ward: data.ward || 'General',
      city: data.city,
      state: data.state || 'Delhi',
      pincode: data.pincode || '110001',
      district: data.district || data.city,
      blood_group: data.blood_group,
      component_type: data.component_type,
      units_needed: data.units_needed,
      units_donated: 0,
      urgency: data.urgency,
      status: 'Pending',
      doctor_note: data.doctor_note,
      created_at: new Date().toISOString(),
      lat: data.lat,
      lng: data.lng,
      responses: [],
    };

    const updated = [newReq, ...requests];
    setItem(STORAGE_KEYS.REQUESTS, updated);

    if (data.auto_register_donor) {
      const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
      if (user && !user.donor_profile) {
        user.donor_profile = {
          id: `don_${Date.now()}`,
          uid: user.uid,
          donor_code: `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: data.attendant_name || data.patient_name,
          blood_group: data.blood_group,
          city: data.city,
          state: data.state || 'Delhi',
          pincode: data.pincode || '110001',
          phone: data.contact_phone,
          email: user.email,
          last_donation_date: null,
          total_donations: 0,
          is_available: true,
          is_verified: true,
          consent_display: true,
          weight_kg: 60,
          gender: 'other',
          donation_history: [],
        };
        setItem(STORAGE_KEYS.USER, user);
      }
    }

    return newReq;
  },

  // Part 1.1 & 1.2: Returns PublicBloodRequest[] without patient_name, attendant_name, contact_phone, doctor_note
  async listPublicRequests(params?: {
    blood_group?: string;
    city?: string;
    urgency?: string;
    q?: string;
  }): Promise<PublicBloodRequest[]> {
    seedMockStore();
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, null);

    let filtered = requests;
    if (params?.blood_group && params.blood_group !== 'all') {
      filtered = filtered.filter((r) => r.blood_group === params.blood_group);
    }
    if (params?.urgency && params.urgency !== 'all') {
      filtered = filtered.filter((r) => r.urgency === params.urgency);
    }
    if (params?.city) {
      filtered = filtered.filter((r) => r.city.toLowerCase() === params.city?.toLowerCase());
    }
    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.hospital_name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.req_code.toLowerCase().includes(q)
      );
    }

    // Public shape: omit confidential patient and attendant info
    return filtered.map((req) => {
      const myResp = req.responses?.find((resp) => resp.donor_id === user?.donor_profile?.id);
      const isConfirmed = myResp?.response_status === 'Confirmed' || myResp?.response_status === 'Donated';

      const sanitizedResponses = req.responses?.map((r) => ({
        ...r,
        donor_phone: r.can_see_contact ? r.donor_phone : undefined,
      }));

      const publicReq: PublicBloodRequest = {
        id: req.id,
        req_code: req.req_code,
        hospital_name: req.hospital_name,
        ward: req.ward,
        city: req.city,
        state: req.state,
        pincode: req.pincode,
        district: req.district,
        blood_group: req.blood_group,
        component_type: req.component_type,
        units_needed: req.units_needed,
        units_donated: req.units_donated,
        urgency: req.urgency,
        status: req.status,
        created_at: req.created_at,
        lat: req.lat,
        lng: req.lng,
        responses: sanitizedResponses,
      };

      // Only confirmed donor gets phone attached
      if (isConfirmed && user) {
        return {
          ...publicReq,
          patient_name: req.patient_name,
          attendant_name: req.attendant_name,
          contact_phone: req.contact_phone,
        } as unknown as PublicBloodRequest;
      }

      return publicReq;
    });
  },

  async myRequests(): Promise<BloodRequest[]> {
    seedMockStore();
    return getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  },

  async respondToRequest(requestId: string): Promise<DonorResponse> {
    seedMockStore();
    const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
    if (!user || !user.donor_profile) {
      throw new Error('Please register as a donor first.');
    }

    if (user.donor_profile.last_donation_date) {
      const last = new Date(user.donor_profile.last_donation_date).getTime();
      const diffDays = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        throw new Error(
          `You are on cooldown. ${90 - diffDays} days remaining before your next safe donation.`
        );
      }
    }

    if (!user.donor_profile.is_available) {
      throw new Error('Your donor status is currently paused/unavailable.');
    }

    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const confirmedCount =
      req.responses?.filter((r) => r.response_status === 'Confirmed' || r.response_status === 'Donated').length || 0;

    const status = confirmedCount >= req.units_needed ? 'Waitlisted' : 'Interested';

    const newResponse: DonorResponse = {
      id: `resp_${Date.now()}`,
      request_id: requestId,
      donor_id: user.donor_profile.id,
      donor_name: user.donor_profile.name,
      donor_phone: user.donor_profile.phone,
      can_see_contact: false,
      donor_blood_group: user.donor_profile.blood_group,
      response_status: status,
      created_at: new Date().toISOString(),
    };

    req.responses = [newResponse, ...(req.responses || [])];
    if (req.status === 'Pending') {
      req.status = 'Matched';
    }
    setItem(STORAGE_KEYS.REQUESTS, requests);
    return newResponse;
  },

  async confirmDonor(requestId: string, responseId: string): Promise<DonorResponse> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const req = requests.find((r) => r.id === requestId);
    if (!req || !req.responses) throw new Error('Request not found');

    const confirmedCount = req.responses.filter(
      (r) => r.response_status === 'Confirmed' || r.response_status === 'Donated'
    ).length;

    if (confirmedCount >= req.units_needed) {
      throw new Error(`Cannot confirm more than ${req.units_needed} donors for this request.`);
    }

    const resp = req.responses.find((r) => r.id === responseId);
    if (!resp) throw new Error('Donor response not found');

    resp.response_status = 'Confirmed';
    resp.can_see_contact = true;
    resp.confirmed_at = new Date().toISOString();
    setItem(STORAGE_KEYS.REQUESTS, requests);
    return resp;
  },

  async cancelResponse(responseId: string): Promise<DonorResponse> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    for (const req of requests) {
      const resp = req.responses?.find((r) => r.id === responseId);
      if (resp) {
        resp.response_status = 'Cancelled';
        resp.can_see_contact = false;
        setItem(STORAGE_KEYS.REQUESTS, requests);
        return resp;
      }
    }
    throw new Error('Response not found');
  },

  async markNoShow(responseId: string): Promise<DonorResponse> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    for (const req of requests) {
      const resp = req.responses?.find((r) => r.id === responseId);
      if (resp) {
        resp.response_status = 'NoShow';
        resp.can_see_contact = false;
        setItem(STORAGE_KEYS.REQUESTS, requests);
        return resp;
      }
    }
    throw new Error('Response not found');
  },

  async markDonated(responseId: string): Promise<{ response: DonorResponse; din: string }> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    for (const req of requests) {
      const resp = req.responses?.find((r) => r.id === responseId);
      if (resp) {
        const din = `#DIN${Math.floor(1000 + Math.random() * 9000)}`;
        resp.response_status = 'Donated';
        resp.donated_at = new Date().toISOString();
        resp.din = din;

        req.units_donated = (req.units_donated || 0) + 1;
        if (req.units_donated >= req.units_needed) {
          req.status = 'Fulfilled';
        } else {
          req.status = 'PartiallyFulfilled';
        }

        setItem(STORAGE_KEYS.REQUESTS, requests);

        const todayStr = new Date().toISOString().split('T')[0];
        const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, DEFAULT_USER);
        if (user && user.donor_profile) {
          user.donor_profile.last_donation_date = todayStr;
          user.donor_profile.total_donations = (user.donor_profile.total_donations || 0) + 1;
          const newRecord = {
            id: `donrec_${Date.now()}`,
            din,
            date: todayStr,
            hospital_name: req.hospital_name,
            blood_group: req.blood_group,
            component: req.component_type,
            units: 1,
          };
          user.donor_profile.donation_history = [
            newRecord,
            ...(user.donor_profile.donation_history || []),
          ];
          setItem(STORAGE_KEYS.USER, user);
        }

        const certificates = getItem<DonationCertificate[]>(
          STORAGE_KEYS.CERTIFICATES,
          INITIAL_CERTIFICATES
        );
        const newCert: DonationCertificate = {
          din,
          donor_name: resp.donor_name,
          blood_group: resp.donor_blood_group,
          donation_date: todayStr,
          hospital_or_camp: req.hospital_name,
          units: 1,
          component: req.component_type,
        };
        setItem(STORAGE_KEYS.CERTIFICATES, [newCert, ...certificates]);

        return { response: resp, din };
      }
    }
    throw new Error('Response not found');
  },

  async fulfillRequest(id: string): Promise<BloodRequest> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const req = requests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    req.status = 'Fulfilled';
    setItem(STORAGE_KEYS.REQUESTS, requests);
    return req;
  },

  async listNotifications(): Promise<AppNotification[]> {
    seedMockStore();
    return getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  async markNotificationsRead(): Promise<void> {
    const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      notifs.map((n) => ({ ...n, read: true }))
    );
  },

  async listCamps(): Promise<Camp[]> {
    seedMockStore();
    return getItem<Camp[]>(STORAGE_KEYS.CAMPS, []);
  },

  async rsvpCamp(
    id: string,
    data: { name: string; mobile: string; blood_group: string }
  ): Promise<Camp> {
    const camps = getItem<Camp[]>(STORAGE_KEYS.CAMPS, []);
    const camp = camps.find((c) => c.id === id);
    if (!camp) throw new Error('Camp not found');
    if (camp.booked_slots >= camp.total_slots) {
      throw new Error('All slots are full for this camp.');
    }
    camp.booked_slots += 1;
    setItem(STORAGE_KEYS.CAMPS, camps);
    return camp;
  },

  async registerPartner(data: RegisterPartnerInput): Promise<Partner> {
    seedMockStore();
    const partners = getItem<Partner[]>(STORAGE_KEYS.PARTNERS, []);
    const newPartner: Partner = {
      id: `part_${Date.now()}`,
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PARTNERS, [newPartner, ...partners]);
    return newPartner;
  },

  async listPartners(type?: 'ngo' | 'blood_bank'): Promise<Partner[]> {
    seedMockStore();
    const partners = getItem<Partner[]>(STORAGE_KEYS.PARTNERS, []);
    if (type) {
      return partners.filter((p) => p.type === type);
    }
    return partners;
  },

  async listBloodBanks(): Promise<BloodBank[]> {
    seedMockStore();
    return getItem<BloodBank[]>(STORAGE_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
  },

  async subscribeAlerts(data: {
    mobile: string;
    blood_group: BloodGroup;
    city: string;
    name?: string;
    via_whatsapp: boolean;
    via_sms: boolean;
  }): Promise<AlertSubscription> {
    const subs = getItem<AlertSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const newSub: AlertSubscription = {
      id: `sub_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...subs]);
    return newSub;
  },

  async getWellness(): Promise<WellnessTip[]> {
    return [
      {
        id: 'tip_01',
        category: 'pre',
        title_en: 'Hydrate Generously Before Donation',
        title_hi: 'रक्तदान से पहले पर्याप्त पानी पिएं',
        body_en: 'Drink at least 500ml of water or fresh juice 30 minutes before donating to keep blood pressure stable.',
        body_hi: 'रक्तचाप स्थिर रखने हेतु रक्तदान से 30 मिनट पहले कम से कम 500 मिली पानी अथवा ताजा फलों का रस पिएं।',
      },
      {
        id: 'tip_02',
        category: 'post',
        title_en: 'Rest 10-15 Minutes and Keep Arm Bandaged',
        title_hi: '10-15 मिनट विश्राम करें और पट्टी बंधी रहने दें',
        body_en: 'Keep the donation site bandage on for at least 4 hours. Avoid heavy weightlifting or strenuous exercise for 24 hours.',
        body_hi: 'सुई लगे स्थान पर कम से कम 4 घंटे पट्टी बंधी रखें। 24 घंटे तक भारी वजन उठाने व कड़े व्यायाम से बचें।',
      },
    ];
  },

  async submitFeedback(data: {
    role: 'donor' | 'receiver';
    rating: number;
    message: string;
  }): Promise<Feedback> {
    const feedbacks = getItem<Feedback[]>(STORAGE_KEYS.FEEDBACKS, []);
    const newFb: Feedback = {
      id: `fb_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.FEEDBACKS, [newFb, ...feedbacks]);
    return newFb;
  },

  async getStats(): Promise<ImpactStats> {
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const fulfilled = requests.filter((r) => r.status === 'Fulfilled').length;
    return {
      total_donors: 1840,
      active_donors: 1210,
      fulfilled_requests: 3120 + fulfilled,
      camps_organized: 48,
      lives_impacted: 4120 + fulfilled * 3,
    };
  },

  async track(code: string): Promise<TrackingInfo | null> {
    seedMockStore();
    const clean = code.trim().toUpperCase();
    const requests = getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const req = requests.find((r) => r.req_code === clean || r.id === clean);

    if (req) {
      return {
        code: req.req_code,
        type: 'REQ',
        status: req.status,
        timeline: [
          {
            step: 'Request Submitted',
            timestamp: req.created_at,
            completed: true,
          },
          {
            step: 'Matched with Donors',
            timestamp: req.responses && req.responses.length > 0 ? req.responses[0].created_at : '',
            completed: (req.responses?.length || 0) > 0,
          },
          {
            step: 'Fulfilled & Donated',
            timestamp: req.status === 'Fulfilled' ? new Date().toISOString() : '',
            completed: req.status === 'Fulfilled',
          },
        ],
        details: {
          blood_group: req.blood_group,
          city: req.city,
          hospital: req.hospital_name,
          units: req.units_needed,
        },
      };
    }

    const certs = getItem<DonationCertificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    const cert = certs.find((c) => c.din.toUpperCase() === clean);
    if (cert) {
      return {
        code: cert.din,
        type: 'DIN',
        status: 'Completed',
        timeline: [
          {
            step: 'Donation Completed at Camp/Hospital',
            timestamp: cert.donation_date,
            completed: true,
          },
          {
            step: 'Blood Screened and Stored',
            timestamp: cert.donation_date,
            completed: true,
          },
          {
            step: 'Issued to Emergency Patient',
            timestamp: cert.donation_date,
            completed: true,
          },
        ],
        details: {
          blood_group: cert.blood_group,
          city: 'Verified Center',
          hospital: cert.hospital_or_camp,
          units: cert.units,
        },
      };
    }

    return null;
  },

  async getCertificate(params: { din?: string; mobile?: string }): Promise<DonationCertificate | null> {
    seedMockStore();
    const certs = getItem<DonationCertificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    if (params.din) {
      const match = certs.find(
        (c) => c.din.toLowerCase().replace('#', '') === params.din?.toLowerCase().replace('#', '')
      );
      if (match) return match;
    }

    if (params.mobile) {
      const cleanPhone = params.mobile.replace(/\D/g, '');
      const user = getItem<UserAuth | null>(STORAGE_KEYS.USER, null);
      if (user?.donor_profile?.phone.replace(/\D/g, '') === cleanPhone) {
        return certs[0] || null;
      }
    }
    return null;
  },
};
