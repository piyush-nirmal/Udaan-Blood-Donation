import { mockApi } from './mockApi';
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

const getIsMock = (): boolean => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK !== undefined) {
    return import.meta.env.VITE_USE_MOCK !== 'false';
  }
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USE_MOCK !== undefined) {
    return process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
  }
  return true;
};

const USE_MOCK = getIsMock();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('udaan_firebase_token', token);
    } else {
      localStorage.removeItem('udaan_firebase_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('udaan_firebase_token');
  }
  return authToken;
};

async function httpFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ----------------------------------------------------
// AUTH CONTRACT
// ----------------------------------------------------
export async function getMe(): Promise<UserAuth | null> {
  if (USE_MOCK) return mockApi.getMe();
  return httpFetch<UserAuth | null>('/api/auth/me/');
}

export async function registerDonor(data: RegisterDonorInput): Promise<DonorProfile> {
  if (USE_MOCK) return mockApi.registerDonor(data);
  return httpFetch<DonorProfile>('/api/donors/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDonor(data: Partial<DonorProfile>): Promise<DonorProfile> {
  if (USE_MOCK) return mockApi.updateDonor(data);
  return httpFetch<DonorProfile>('/api/donors/profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function setAvailability(is_available: boolean): Promise<DonorProfile> {
  if (USE_MOCK) return mockApi.setAvailability(is_available);
  return httpFetch<DonorProfile>('/api/donors/availability/', {
    method: 'POST',
    body: JSON.stringify({ is_available }),
  });
}

// ----------------------------------------------------
// REQUESTS CONTRACT
// ----------------------------------------------------
export async function createRequest(data: CreateRequestInput): Promise<BloodRequest> {
  if (USE_MOCK) return mockApi.createRequest(data);
  return httpFetch<BloodRequest>('/api/requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listPublicRequests(params?: {
  blood_group?: string;
  city?: string;
  urgency?: string;
  q?: string;
}): Promise<PublicBloodRequest[]> {
  if (USE_MOCK) return mockApi.listPublicRequests(params);
  const searchParams = new URLSearchParams();
  if (params?.blood_group) searchParams.set('blood_group', params.blood_group);
  if (params?.city) searchParams.set('city', params.city);
  if (params?.urgency) searchParams.set('urgency', params.urgency);
  if (params?.q) searchParams.set('q', params.q);

  return httpFetch<PublicBloodRequest[]>(`/api/requests/public/?${searchParams.toString()}`);
}

export async function myRequests(): Promise<BloodRequest[]> {
  if (USE_MOCK) return mockApi.myRequests();
  return httpFetch<BloodRequest[]>('/api/requests/mine/');
}

export async function respondToRequest(requestId: string): Promise<DonorResponse> {
  if (USE_MOCK) return mockApi.respondToRequest(requestId);
  return httpFetch<DonorResponse>(`/api/requests/${requestId}/respond/`, {
    method: 'POST',
  });
}

export async function confirmDonor(
  requestId: string,
  responseId: string
): Promise<DonorResponse> {
  if (USE_MOCK) return mockApi.confirmDonor(requestId, responseId);
  return httpFetch<DonorResponse>(`/api/requests/${requestId}/confirm-donor/`, {
    method: 'POST',
    body: JSON.stringify({ response_id: responseId }),
  });
}

export async function cancelResponse(responseId: string): Promise<DonorResponse> {
  if (USE_MOCK) return mockApi.cancelResponse(responseId);
  return httpFetch<DonorResponse>(`/api/responses/${responseId}/cancel/`, {
    method: 'POST',
  });
}

export async function markNoShow(responseId: string): Promise<DonorResponse> {
  if (USE_MOCK) return mockApi.markNoShow(responseId);
  return httpFetch<DonorResponse>(`/api/responses/${responseId}/no-show/`, {
    method: 'POST',
  });
}

export async function markDonated(
  responseId: string
): Promise<{ response: DonorResponse; din: string }> {
  if (USE_MOCK) return mockApi.markDonated(responseId);
  return httpFetch<{ response: DonorResponse; din: string }>(
    `/api/responses/${responseId}/mark-donated/`,
    {
      method: 'POST',
    }
  );
}

export async function fulfillRequest(id: string): Promise<BloodRequest> {
  if (USE_MOCK) return mockApi.fulfillRequest(id);
  return httpFetch<BloodRequest>(`/api/requests/${id}/fulfill/`, {
    method: 'POST',
  });
}

// ----------------------------------------------------
// NOTIFICATIONS CONTRACT
// ----------------------------------------------------
export async function listNotifications(): Promise<AppNotification[]> {
  if (USE_MOCK) return mockApi.listNotifications();
  return httpFetch<AppNotification[]>('/api/notifications/');
}

export async function markNotificationsRead(): Promise<void> {
  if (USE_MOCK) return mockApi.markNotificationsRead();
  return httpFetch<void>('/api/notifications/mark-read/', { method: 'POST' });
}

// ----------------------------------------------------
// CAMPS CONTRACT
// ----------------------------------------------------
export async function listCamps(): Promise<Camp[]> {
  if (USE_MOCK) return mockApi.listCamps();
  return httpFetch<Camp[]>('/api/camps/');
}

export async function rsvpCamp(
  id: string,
  data: { name: string; mobile: string; blood_group: string }
): Promise<Camp> {
  if (USE_MOCK) return mockApi.rsvpCamp(id, data);
  return httpFetch<Camp>(`/api/camps/${id}/rsvp/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ----------------------------------------------------
// PARTNERS CONTRACT
// ----------------------------------------------------
export async function registerPartner(data: RegisterPartnerInput): Promise<Partner> {
  if (USE_MOCK) return mockApi.registerPartner(data);
  return httpFetch<Partner>('/api/partners/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listPartners(type?: 'ngo' | 'blood_bank'): Promise<Partner[]> {
  if (USE_MOCK) return mockApi.listPartners(type);
  const q = type ? `?type=${type}` : '';
  return httpFetch<Partner[]>(`/api/partners/${q}`);
}

export async function listBloodBanks(): Promise<BloodBank[]> {
  if (USE_MOCK) return mockApi.listBloodBanks();
  return httpFetch<BloodBank[]>('/api/blood-banks/');
}

// ----------------------------------------------------
// OTHER UTILITIES CONTRACT
// ----------------------------------------------------
export async function subscribeAlerts(data: {
  mobile: string;
  blood_group: BloodGroup;
  city: string;
  name?: string;
  via_whatsapp: boolean;
  via_sms: boolean;
}): Promise<AlertSubscription> {
  if (USE_MOCK) return mockApi.subscribeAlerts(data);
  return httpFetch<AlertSubscription>('/api/alerts/subscribe/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWellness(): Promise<WellnessTip[]> {
  if (USE_MOCK) return mockApi.getWellness();
  return httpFetch<WellnessTip[]>('/api/wellness/');
}

export async function submitFeedback(data: {
  role: 'donor' | 'receiver';
  rating: number;
  message: string;
}): Promise<Feedback> {
  if (USE_MOCK) return mockApi.submitFeedback(data);
  return httpFetch<Feedback>('/api/feedback/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getStats(): Promise<ImpactStats> {
  if (USE_MOCK) return mockApi.getStats();
  return httpFetch<ImpactStats>('/api/stats/');
}

export async function track(code: string): Promise<TrackingInfo | null> {
  if (USE_MOCK) return mockApi.track(code);
  return httpFetch<TrackingInfo | null>(`/api/track/${encodeURIComponent(code)}/`);
}

export async function getCertificate(params: {
  din?: string;
  mobile?: string;
}): Promise<DonationCertificate | null> {
  if (USE_MOCK) return mockApi.getCertificate(params);
  const q = new URLSearchParams();
  if (params.din) q.set('din', params.din);
  if (params.mobile) q.set('mobile', params.mobile);
  return httpFetch<DonationCertificate | null>(`/api/certificates/?${q.toString()}`);
}
