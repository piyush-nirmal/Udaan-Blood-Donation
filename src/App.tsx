/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveBoard } from './components/LiveBoard';
import { DonorPortal } from './components/DonorPortal';
import { CertificateGenerator } from './components/CertificateGenerator';
import { BloodBanksDirectory } from './components/BloodBanksDirectory';
import { RequestBloodModal } from './components/RequestBloodModal';
import { Dashboard } from './components/Dashboard';
import { TrackModal } from './components/TrackModal';
import { CampsView } from './components/CampsView';
import { PartnersView } from './components/PartnersView';
import { WellnessModal } from './components/WellnessModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Toast, Modal, Button } from './components/ui';
import { Locale, translations } from './lib/i18n';
import {
  PublicBloodRequest,
  BloodBank,
  UserAuth,
  CreateRequestInput,
  RegisterDonorInput,
} from './types/api';
import {
  getMe,
  listPublicRequests,
  createRequest,
  respondToRequest,
  cancelResponse,
  listBloodBanks,
  registerDonor,
  setAuthToken,
} from './lib/api';
import { Heart } from 'lucide-react';

export default function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const [activeTab, setActiveTab] = useState<NavTab>('board');
  const [selectedDin, setSelectedDin] = useState<string>('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [requestDraft, setRequestDraft] = useState<Partial<CreateRequestInput>>({});
  const [pendingOpenRequestAfterAuth, setPendingOpenRequestAfterAuth] = useState(false);

  const [requests, setRequests] = useState<PublicBloodRequest[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [user, setUser] = useState<UserAuth | null>(null);

  const t = translations[locale];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    try {
      const [currentUser, publicReqs, banks] = await Promise.all([
        getMe(),
        listPublicRequests(),
        listBloodBanks(),
      ]);
      setUser(currentUser);
      setRequests(publicReqs);
      setBloodBanks(banks);
    } catch {
      // Handled
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenRequestModal = () => {
    if (!user) {
      showToast(t.login_required_request);
      setPendingOpenRequestAfterAuth(true);
      setIsAuthModalOpen(true);
      return;
    }
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = async (newReqData: CreateRequestInput) => {
    try {
      await createRequest(newReqData);
      setRequestDraft({});
      await loadData();
      setActiveTab('board');
      showToast(t.toast_request_created);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request');
    }
  };

  const handleRespond = async (reqId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      showToast(locale === 'en' ? 'Please sign in to offer blood donation' : 'रक्तदान प्रस्ताव हेतु साइन इन करें');
      return;
    }

    try {
      await respondToRequest(reqId);
      await loadData();
      showToast(t.toast_interest_recorded);
    } catch (err: any) {
      showToast(err.message || 'Could not register response');
    }
  };

  const handleCancelResponse = async (responseId: string) => {
    try {
      await cancelResponse(responseId);
      await loadData();
      showToast(locale === 'en' ? 'Response cancelled' : 'प्रस्ताव रद्द किया गया');
    } catch (err: any) {
      showToast(err.message || 'Error cancelling response');
    }
  };

  const handleShareWhatsApp = (req: PublicBloodRequest) => {
    const text = `🚨 *URGENT BLOOD REQUIRED (${req.blood_group}) - UDAAN NGO* 🚨\n\nCode: ${
      req.req_code
    }\nComponent: ${req.component_type.replace('_', ' ').toUpperCase()}\nHospital: ${
      req.hospital_name
    } (${req.ward})\nLocation: ${req.city}, ${req.state}\nUnits Needed: ${
      req.units_needed - req.units_donated
    } remaining\nUrgency: ${req.urgency.toUpperCase()}\n\nVerified via UDAAN Blood Donation Network.\nConfidential attendant contact is revealed to verified donors upon confirmation.\n\nPlease forward to help save a life!`;

    navigator.clipboard?.writeText(text);
    showToast(t.toast_copied_sos);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRegisterDonor = async (newDonorData: RegisterDonorInput) => {
    try {
      await registerDonor(newDonorData);
      await loadData();
      showToast(t.toast_donor_registered);
    } catch (err: any) {
      showToast(err.message || 'Error registering donor');
    }
  };

  const handleNavigateCertificate = (din: string) => {
    setSelectedDin(din);
    setActiveTab('certificate');
  };

  const handleSignIn = async () => {
    const mockUser: UserAuth = {
      uid: 'usr_volunteer_01',
      email: 'greenedgeinfratech@gmail.com',
      displayName: 'Volunteer Coordinator',
      token: 'mock-firebase-token-' + Date.now(),
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

    setAuthToken(mockUser.token);
    setUser(mockUser);
    setIsAuthModalOpen(false);

    if (pendingOpenRequestAfterAuth) {
      setPendingOpenRequestAfterAuth(false);
      setIsRequestModalOpen(true);
    }

    showToast(locale === 'en' ? 'Signed in successfully via Firebase Auth' : 'फायरबेस द्वारा साइन इन संपन्न');
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthToken(null);
    if (activeTab === 'dashboard') setActiveTab('board');
    showToast(locale === 'en' ? 'Signed out successfully' : 'लॉग आउट संपन्न');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#1C1917] flex flex-col font-sans selection:bg-[#D62839] selection:text-white pb-20 md:pb-8">
      {/* 1. Header (Group 1 specification) */}
      <Navbar
        locale={locale}
        setLocale={setLocale}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRequestBlood={handleOpenRequestModal}
        user={user}
        onSignIn={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenTrack={() => setIsTrackModalOpen(true)}
      />

      {/* Main page container: max-w-6xl, 16px gutters mobile, 24px desktop */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {activeTab === 'board' && (
          <LiveBoard
            requests={requests}
            locale={locale}
            onRequestBlood={handleOpenRequestModal}
            onRespond={handleRespond}
            onCancelResponse={handleCancelResponse}
            user={user}
            onShareWhatsApp={handleShareWhatsApp}
            onNavigateToCamps={() => setActiveTab('camps')}
            showToast={showToast}
          />
        )}

        {activeTab === 'donors' && (
          <DonorPortal
            donors={[]}
            locale={locale}
            onRegisterDonor={handleRegisterDonor}
          />
        )}

        {activeTab === 'banks' && (
          <BloodBanksDirectory banks={bloodBanks} locale={locale} />
        )}

        {activeTab === 'camps' && (
          <CampsView locale={locale} showToast={showToast} />
        )}

        {activeTab === 'partners' && (
          <PartnersView locale={locale} showToast={showToast} />
        )}

        {activeTab === 'certificate' && (
          <CertificateGenerator locale={locale} initialDin={selectedDin} />
        )}

        {activeTab === 'dashboard' && user && (
          <Dashboard
            user={user}
            locale={locale}
            onNavigateCertificate={handleNavigateCertificate}
            onToast={showToast}
          />
        )}
      </main>

      {/* SOS Request Modal */}
      <RequestBloodModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
        locale={locale}
        initialDraft={requestDraft}
        onDraftChange={setRequestDraft}
      />

      {/* Sign-in Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingOpenRequestAfterAuth(false);
        }}
        maxWidth="sm"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FDECEE] text-[#D62839] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-[#D62839]" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917] mb-1">
            {locale === 'en' ? 'Firebase Authentication' : 'फायरबेस प्रमाणीकरण'}
          </h3>
          <p className="text-xs text-[#6B625C] mb-6 leading-relaxed">
            {pendingOpenRequestAfterAuth
              ? t.login_required_request
              : locale === 'en'
              ? 'Sign in securely with Google or Email to link your donor verification status.'
              : 'रक्तदाता या आपातकालीन समन्वयक के रूप में साइन इन करें।'}
          </p>

          <div className="space-y-2.5">
            <Button
              variant="secondary"
              onClick={handleSignIn}
              className="w-full text-xs"
            >
              <span>Continue with Google</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="w-full text-xs"
            >
              <span>Sign in with Email / Password</span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAuthModalOpen(false);
              setPendingOpenRequestAfterAuth(false);
            }}
            className="mt-5 text-xs text-[#6B625C] hover:text-[#1C1917] transition-colors"
          >
            {t.btn_cancel}
          </button>
        </div>
      </Modal>

      {/* Accessible Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Auxiliary Modals */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        locale={locale}
      />

      <WellnessModal
        isOpen={isWellnessModalOpen}
        onClose={() => setIsWellnessModalOpen(false)}
        locale={locale}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        locale={locale}
        showToast={showToast}
      />

      {/* 5. Footer (Group 1 specification) */}
      <Footer
        locale={locale}
        onOpenTrack={() => setIsTrackModalOpen(true)}
        onNavigateTab={setActiveTab}
        onOpenWellness={() => setIsWellnessModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />
    </div>
  );
}
