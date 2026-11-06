import React, { useState, useRef, useEffect } from 'react';
import { Locale, translations } from '../lib/i18n';
import {
  Heart,
  Activity,
  Users,
  Building2,
  Award,
  Search,
  LogIn,
  LogOut,
  LayoutDashboard,
  Plus,
  PhoneCall,
  User as UserIcon,
} from 'lucide-react';
import { UserAuth } from '../types/api';
import { NotificationBell } from './NotificationBell';

export type NavTab = 'board' | 'donors' | 'banks' | 'certificate' | 'dashboard' | 'camps' | 'partners';

interface NavbarProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onRequestBlood: () => void;
  user: UserAuth | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenTrack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  setLocale,
  activeTab,
  setActiveTab,
  onRequestBlood,
  user,
  onSignIn,
  onSignOut,
  onOpenTrack,
}) => {
  const t = translations[locale];
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <>
      {/* 1. Header: ONE row, white, sticky, 64px, bottom border */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E0DA] h-16 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Left: Logo mark + UDAAN wordmark with small subtext */}
          <div
            onClick={() => setActiveTab('board')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FDECEE] text-[#D62839] flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-[#D62839] stroke-[1.75]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1C1917] leading-none">
                UDAAN
              </span>
              <span className="text-[10px] text-[#6B625C] font-medium tracking-wide mt-0.5">
                {locale === 'hi' ? 'रक्तदान नेटवर्क' : 'Voluntary Blood Network'}
              </span>
            </div>
          </div>

          {/* Center (desktop only): 4 links max */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6B625C]">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                activeTab === 'board'
                  ? 'text-[#D62839] font-bold'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              <Activity className="w-4 h-4 stroke-[1.75]" />
              <span>{t.nav_live_board}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('donors')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                activeTab === 'donors'
                  ? 'text-[#D62839] font-bold'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              <Users className="w-4 h-4 stroke-[1.75]" />
              <span>{t.nav_donors}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banks')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                activeTab === 'banks'
                  ? 'text-[#D62839] font-bold'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              <Building2 className="w-4 h-4 stroke-[1.75]" />
              <span>{t.nav_banks}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                activeTab === 'certificate'
                  ? 'text-[#D62839] font-bold'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              <Award className="w-4 h-4 stroke-[1.75]" />
              <span>{t.nav_certificate}</span>
            </button>
          </nav>

          {/* Right: Track icon, Bell, Language toggle (EN | हि), Avatar menu, ONE Primary button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Track icon button */}
            {onOpenTrack && (
              <button
                type="button"
                onClick={onOpenTrack}
                title={locale === 'hi' ? 'अनुरोध या DIN ट्रैक करें' : 'Track Blood Request or DIN'}
                aria-label="Track request"
                className="w-11 h-11 rounded-xl text-[#1C1917] hover:bg-[#F3EEEA] transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839]"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>
            )}

            {/* Notification bell */}
            <NotificationBell locale={locale} />

            {/* Language toggle: EN | हि segmented control */}
            <div
              role="radiogroup"
              aria-label="Language selection"
              className="flex items-center bg-[#F3EEEA] p-0.5 rounded-full border border-[#E8E0DA]"
            >
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all min-h-[32px] cursor-pointer ${
                  locale === 'en'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#6B625C] hover:text-[#1C1917]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('hi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all min-h-[32px] cursor-pointer ${
                  locale === 'hi'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#6B625C] hover:text-[#1C1917]'
                }`}
              >
                हि
              </button>
            </div>

            {/* Avatar Menu / Sign In */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F3EEEA] transition-colors min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839]"
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white font-bold text-xs flex items-center justify-center">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-11 h-11 rounded-xl text-[#1C1917] hover:bg-[#F3EEEA] transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839]"
                  title={locale === 'en' ? 'Sign In' : 'साइन इन'}
                  aria-label="Sign In"
                >
                  <LogIn className="w-5 h-5 stroke-[1.75]" />
                </button>
              )}

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E0DA] rounded-[16px] shadow-[0_8px_24px_rgba(28,25,23,0.12)] z-50 py-2 animate-in fade-in slide-in-from-top-1 text-xs">
                  {user && (
                    <div className="px-3.5 py-2 border-b border-[#E8E0DA]/80">
                      <p className="font-bold text-[#1C1917] truncate">{user.displayName}</p>
                      <p className="text-[11px] text-[#6B625C] truncate">{user.email}</p>
                    </div>
                  )}

                  <div className="py-1">
                    {user && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left font-medium text-[#1C1917] hover:bg-[#F3EEEA] transition-colors flex items-center gap-2 min-h-[36px]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6B625C] stroke-[1.75]" />
                        <span>{t.nav_dashboard}</span>
                      </button>
                    )}

                    {/* Small Emergency 104/112 link per Group 1 specs */}
                    <a
                      href="tel:104"
                      className="w-full px-3.5 py-2.5 text-left font-medium text-[#D62839] hover:bg-[#FDECEE] transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <PhoneCall className="w-4 h-4 stroke-[1.75]" />
                      <span>{locale === 'hi' ? 'आपातकालीन 104/112 (निःशुल्क)' : 'Emergency 104/112 (Free)'}</span>
                    </a>

                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSignOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left font-medium text-[#6B625C] hover:text-[#D62839] hover:bg-[#F3EEEA] transition-colors flex items-center gap-2 border-t border-[#E8E0DA]/80 mt-1 min-h-[36px]"
                      >
                        <LogOut className="w-4 h-4 stroke-[1.75]" />
                        <span>{t.auth_sign_out}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSignIn();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left font-medium text-[#1C1917] hover:bg-[#F3EEEA] transition-colors flex items-center gap-2 border-t border-[#E8E0DA]/80 mt-1 min-h-[36px]"
                      >
                        <LogIn className="w-4 h-4 stroke-[1.75]" />
                        <span>{locale === 'en' ? 'Sign In' : 'साइन इन'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop ONE Primary Action: Request Blood (Solid Red) */}
            <button
              type="button"
              onClick={onRequestBlood}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D62839] hover:bg-[#B81F2E] text-white font-semibold text-xs tracking-tight transition-all duration-150 shadow-sm shadow-[#D62839]/25 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.25]" />
              <span>{t.request_blood_cta}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Mobile: Fixed bottom tab bar (Board, Donors, Raised Request, Banks, Certificate) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E0DA] h-16 pb-safe grid grid-cols-5 items-center select-none"
      >
        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'board' ? 'text-[#D62839] font-bold' : 'text-[#6B625C]'
          }`}
        >
          <Activity className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">
            {locale === 'hi' ? 'लाइव' : 'Board'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donors')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'donors' ? 'text-[#D62839] font-bold' : 'text-[#6B625C]'
          }`}
        >
          <Users className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">
            {locale === 'hi' ? 'दाता' : 'Donors'}
          </span>
        </button>

        {/* Raised Center Red "Request" Button */}
        <div className="flex flex-col items-center justify-center relative -top-3">
          <button
            type="button"
            onClick={onRequestBlood}
            aria-label="Request Blood Now"
            className="w-12 h-12 rounded-full bg-[#D62839] hover:bg-[#B81F2E] active:scale-95 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(214,40,57,0.4)] border-2 border-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839]"
          >
            <Plus className="w-6 h-6 stroke-[2.25]" />
          </button>
          <span className="text-[9px] font-bold text-[#D62839] mt-0.5 leading-none">
            {locale === 'hi' ? 'अनुरोध' : 'Request'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'banks' ? 'text-[#D62839] font-bold' : 'text-[#6B625C]'
          }`}
        >
          <Building2 className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">
            {locale === 'hi' ? 'बैंक' : 'Banks'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificate')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'certificate' ? 'text-[#D62839] font-bold' : 'text-[#6B625C]'
          }`}
        >
          <Award className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">
            {locale === 'hi' ? 'कार्ड' : 'Card'}
          </span>
        </button>
      </nav>
    </>
  );
};
