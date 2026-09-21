'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import {
  Compass,
  Calculator,
  Users,
  HelpCircle,
  FileText,
  ShieldCheck,
  User,
  LogIn,
  CheckCircle2,
  Menu,
  X,
  MapPin,
  ExternalLink,
  ChevronRight,
  LogOut,
  Smartphone,
  Bot,
} from 'lucide-react';

export function Navbar() {
  const { language, t } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: t.nav.home, icon: ShieldCheck },
    { href: '/find-scheme', label: t.nav.findScheme, icon: Compass, highlight: true },
    { href: '/schemes', label: t.nav.schemes, icon: FileText },
    { href: '/calculator', label: t.nav.calculator, icon: Calculator },
    { href: '/partners', label: t.nav.partners, icon: MapPin },
    { href: '/help', label: t.nav.help, icon: HelpCircle },
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t.nav.skipToContent}
      </a>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded shrink-0 min-w-0"
          >
            <img
              src="/logo.png"
              alt="AryaSaarthi"
              className="w-7 h-7 sm:w-10 sm:h-10 rounded-full object-contain shadow-xs shrink-0 border border-emerald-500/20"
            />
            <div className="min-w-0">
              <div className="font-black text-xs xs:text-sm sm:text-xl tracking-tight text-slate-900 leading-tight whitespace-nowrap">
                {t.nav.brand}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 font-bold tracking-tight hidden md:block">
                {t.nav.brandTagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Large Screens) */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : link.highlight
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-2xs'
                      : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-bold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/mobile"
              className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                pathname === '/mobile'
                  ? 'bg-emerald-600 text-white font-extrabold'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold'
              }`}
              title="Interactive Mobile Simulator"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile View</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (typeof (window as any).openAskArya === 'function') {
                    (window as any).openAskArya();
                  }
                  window.dispatchEvent(new CustomEvent('open-ask-arya'));
                }
                const trigger = document.getElementById('ask-arya-chat-trigger');
                if (trigger) trigger.click();
              }}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              title="Ask Arya — NSFDC Scheme Recommender"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Arya</span>
            </button>
          </nav>

          {/* Actions: Language Dropdown, User Login & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Dropdown beside Login button */}
            <LanguageDropdown />

            {/* User Auth Link & Logout */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors shadow-2xs"
                  title={user.name}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </Link>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-1 py-1.5 px-2 sm:px-2.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs"
                  title={'Logout'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{t.nav.login}</span>
              </Link>
            )}

            {/* Mobile & Tablet Hamburger Button (Visible below xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-slate-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Top Drawer Header */}
            <div>
              <div className="p-4 bg-linear-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="AryaSaarthi"
                    className="w-8 h-8 rounded-full object-contain border border-emerald-400"
                  />
                  <div>
                    <div className="font-extrabold text-sm leading-tight text-white">
                      {t.nav.brand}
                    </div>
                    <div className="text-[10px] text-emerald-200 font-medium">
                      Sahi Vyakti. Sahi Yojna. Sahi Marg.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-emerald-200 hover:text-white p-1.5 rounded-xl hover:bg-emerald-800 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Selector in Drawer */}
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                  Language / क्षेत्रीय भाषा
                </div>
                <LanguageDropdown className="w-full" />
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1" aria-label="Mobile Drawer Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold'
                          : link.highlight
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${link.highlight ? 'text-white' : isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span>{link.label}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                  );
                })}

                {/* Additional Quick Links */}
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
                  <Link
                    href="/mobile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>{'Mobile Simulator View'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span>{'Privacy Policy'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span>{'Terms & Disclaimers'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span>{t.nav.admin}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {/* Citizen Logout Button in Drawer */}
                  {isAuthenticated && user && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all shadow-2xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{'Log Out'} ({user.name.split(' ')[0]})</span>
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
