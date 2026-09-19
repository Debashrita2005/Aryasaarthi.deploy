'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useI18n } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  History,
  Bookmark,
  Bell,
  Trash2,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Search,
  Star,
  AlertCircle,
  ChevronRight,
  LogIn,
  Clock,
  IndianRupee,
  Percent,
  Target,
  Send,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PhoneCall,
  MapPin,
  FileText,
  LogOut,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface SchemeInquiry {
  id: string;
  schemeCode: string;
  schemeName: string;
  schemeCategory?: string | null;
  purpose?: string | null;
  requestedLoanAmount?: number | null;
  projectCost?: number | null;
  providerName?: string | null;
  providerDistrict?: string | null;
  status: string;
  applicantPhone?: string | null;
  applicantState?: string | null;
  applicantDistrict?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface SchemeNotification {
  id: string;
  schemeCode: string;
  schemeName: string;
  title: string;
  titleHi?: string | null;
  message: string;
  messageHi?: string | null;
  changeType: string;
  oldValue?: string | null;
  newValue?: string | null;
  verifiedDate: string;
  sourceUrl: string;
  isRead: boolean;
  createdAt: string;
}

interface SearchRecord {
  id: string;
  purpose: string;
  projectCost: number;
  annualIncome: number;
  scCertificate: string;
  recommendedSchemeName: string | null;
  fitScore: number | null;
  matchedRule: string | null;
  createdAt: string;
}

interface SavedScheme {
  id: string;
  schemeId: string;
  schemeCode: string;
  schemeName: string;
  fitScore: number | null;
  savedAt: string;
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function FitBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : pct >= 50
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-red-100 text-red-700 border-red-300';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      <Target className="w-3 h-3" />
      {pct}% fit
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLakh(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { language, t } = useI18n();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'inquiries' | 'alerts' | 'saved' | 'history'>('inquiries');
  const [inquiries, setInquiries] = useState<SchemeInquiry[]>([]);
  const [notifications, setNotifications] = useState<SchemeNotification[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingData(true);
    try {
      const [inqRes, notifRes, savedRes, searchRes] = await Promise.all([
        fetch(`/api/user/inquiries?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/user/notifications?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/user/saved-schemes?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/user/searches?userId=${encodeURIComponent(user.id)}&limit=50`),
      ]);

      if (inqRes.ok) {
        const d = await inqRes.json();
        setInquiries(d.inquiries || []);
      }
      if (notifRes.ok) {
        const d = await notifRes.json();
        setNotifications(d.notifications || []);
      }
      if (savedRes.ok) {
        const d = await savedRes.json();
        setSavedSchemes(d.savedSchemes || []);
      }
      if (searchRes.ok) {
        const d = await searchRes.json();
        setSearches(d.searches || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, loadData]);

  const cancelInquiry = async (id: string) => {
    if (!user?.id) return;
    setDeletingId(id);
    try {
      await fetch(`/api/user/inquiries?id=${id}&userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const removeSaved = async (id: string) => {
    if (!user?.id) return;
    setDeletingId(id);
    try {
      await fetch(`/api/user/saved-schemes?id=${id}&userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      setSavedSchemes((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSearch = async (id: string) => {
    if (!user?.id) return;
    setDeletingId(id);
    try {
      await fetch(`/api/user/searches?id=${id}&userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading / Unauthenticated states ──────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black mx-auto">
            आ
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to view your dashboard</h2>
          <p className="text-slate-500 text-sm">Your scheme inquiries, notifications, and saved items appear here.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Tab definition ────────────────────────────────────
  const tabs = [
    {
      id: 'inquiries' as const,
      label: t.dashboardPage.mySchemes,
      icon: Send,
      count: inquiries.length,
    },
    {
      id: 'alerts' as const,
      label: t.dashboardPage.schemeAlerts,
      icon: Bell,
      count: notifications.length,
    },
    {
      id: 'saved' as const,
      label: t.dashboardPage.savedSchemes,
      icon: Bookmark,
      count: savedSchemes.length,
    },
    {
      id: 'history' as const,
      label: t.dashboardPage.searchHistory,
      icon: History,
      count: searches.length,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              <span>Browse All 93 Verified Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── User Header Card ────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.phone ? `📱 ${user.phone}` : ''}{' '}
                  {user.gender ? `• 👤 ${user.gender === 'FEMALE' ? 'महिला (Female)' : user.gender === 'MALE' ? 'पुरुष (Male)' : user.gender}` : ''}{' '}
                  {user.district && user.state ? `• 📍 ${user.district}, ${user.state}` : user.state ? `• 📍 ${user.state}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={loadData}
                disabled={loadingData}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/find-scheme"
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find New Scheme</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/');
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                title={t.dashboardPage.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.dashboardPage.logout}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab Selector ────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab: My Schemes & Inquiries (PRIMARY) ─────── */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {loadingData && (
              <div className="text-center py-12 text-slate-400 text-sm">Loading your scheme inquiries...</div>
            )}
            {!loadingData && inquiries.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Send className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {t.dashboardPage.noInquiriesYet}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {t.dashboardPage.noInquiriesSub}
                  </p>
                </div>
                <Link
                  href="/schemes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.dashboardPage.browseAllSchemes}</span>
                </Link>
              </div>
            )}

            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md">
                      {inq.schemeCode}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {inq.schemeCategory || 'Welfare Scheme'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ref #{inq.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                      inq.status === 'INQUIRY_SUBMITTED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : inq.status === 'ELIGIBLE_CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : inq.status === 'FORWARDED_TO_PARTNER'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    ● {inq.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{inq.schemeName}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
                    {inq.requestedLoanAmount && (
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        Loan Requested: {formatLakh(inq.requestedLoanAmount)}
                      </span>
                    )}
                    {inq.purpose && (
                      <span>Purpose: <strong className="text-slate-800">{inq.purpose}</strong></span>
                    )}
                    {inq.applicantState && (
                      <span>Location: <strong className="text-slate-800">{inq.applicantState}</strong></span>
                    )}
                  </div>
                </div>

                {inq.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{inq.notes}"
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted on {formatDate(inq.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/schemes/${inq.schemeCode.toLowerCase().replace(/_/g, '-')}`}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <span>View Scheme Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => cancelInquiry(inq.id)}
                      disabled={deletingId === inq.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Cancel Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Genuine Scheme Alerts & Rate Updates ── */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {loadingData && (
              <div className="text-center py-12 text-slate-400 text-sm">Loading verified notifications...</div>
            )}
            {!loadingData && notifications.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {t.dashboardPage.allUpToDate}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t.dashboardPage.allUpToDateSub}
                </p>
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-2.5 ${
                  n.isRead ? 'border-slate-200' : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                      {n.schemeCode}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {n.changeType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified: {n.verifiedDate}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {language === 'hi' && n.titleHi ? n.titleHi : n.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'hi' && n.messageHi ? n.messageHi : n.message}
                  </p>
                </div>

                {n.newValue && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 flex items-center gap-3">
                    {n.oldValue && (
                      <span className="line-through text-slate-400">Previous: {n.oldValue}</span>
                    )}
                    <span className="font-bold text-emerald-700">New Verified: {n.newValue}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={n.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    <span>Official Circular ({n.sourceUrl.replace('https://', '')})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[11px] text-slate-400">{formatDate(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Saved Schemes ─────────────────────── */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {loadingData && (
              <div className="text-center py-12 text-slate-400 text-sm">Loading saved schemes...</div>
            )}
            {!loadingData && savedSchemes.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-sm">No saved schemes yet</p>
                <p className="text-slate-400 text-xs mt-1">Bookmark any recommended scheme to review it later</p>
                <Link
                  href="/find-scheme"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Find a Scheme
                </Link>
              </div>
            )}
            {savedSchemes.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {s.schemeCode}
                      </span>
                      <FitBadge score={s.fitScore} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">{s.schemeName}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Saved {formatDate(s.savedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/schemes/${s.schemeCode.toLowerCase().replace(/_/g, '-')}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => removeSaved(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Search History ────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {loadingData && (
              <div className="text-center py-12 text-slate-400 text-sm">Loading search history...</div>
            )}
            {!loadingData && searches.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-sm">No search history yet</p>
                <p className="text-slate-400 text-xs mt-1">Run the scheme finder to generate recommendations</p>
              </div>
            )}
            {searches.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {s.purpose}
                      </span>
                      <FitBadge score={s.fitScore} />
                    </div>
                    {s.recommendedSchemeName && (
                      <p className="text-sm font-bold text-slate-900 truncate">
                        → {s.recommendedSchemeName}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Project: {formatLakh(s.projectCost)}</span>
                      <span>Income: {formatLakh(s.annualIncome)}/yr</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => deleteSearch(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
