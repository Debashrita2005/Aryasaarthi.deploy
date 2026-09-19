'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { ExternalLink, ShieldCheck, Mail } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();

  return (
    <footer
      className="text-slate-100 pt-10 sm:pt-14 pb-28 md:pb-14 border-t border-[#075E54]/70"
      style={{
        backgroundColor: '#043831',
      }}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Disclaimer Banner */}
        <div className="bg-[#022622]/90 border border-[#25D366]/35 rounded-2xl p-6 mb-10 text-emerald-50 leading-relaxed shadow-sm backdrop-blur-xs">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-white text-base sm:text-lg mb-1.5">
                {t.footer.disclaimerTitle}
              </p>
              <p className="text-emerald-100/90 text-sm sm:text-base font-normal">
                {t.footer.disclaimerText}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-10 items-start">
          {/* Col 1: About */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="font-extrabold text-white text-xl sm:text-2xl flex items-center gap-2.5 mb-3.5">
              <img
                src="/logo.png"
                alt="AryaSaarthi"
                className="w-10 h-10 rounded-full object-contain shadow-xs shrink-0 border border-[#25D366]/40"
              />
              <span>{t.nav.brand}</span>
            </div>
            <p className="text-emerald-100/85 text-sm leading-relaxed font-normal">
              {t.footer.aboutDesc}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-white mb-4 text-base uppercase tracking-wider">
              {t.footer.coreFeatures}
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/find-scheme" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.nav.findScheme}
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.nav.schemes}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.nav.calculator}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.nav.partners}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.nav.help}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Governance */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-white mb-4 text-base uppercase tracking-wider">
              {t.footer.trustCompliance}
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/privacy" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-emerald-100/90 hover:text-white hover:underline transition-colors block">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-emerald-200/70 hover:text-white hover:underline transition-colors block">
                  {t.footer.adminCenter}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Source */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-white mb-4 text-base uppercase tracking-wider">
              {t.footer.authoritativeSource}
            </h3>
            <p className="text-sm text-emerald-100/85 leading-relaxed mb-3 font-normal">
              {t.footer.nsfdcGov}
            </p>
            <a
              href="https://nsfdc.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-emerald-200 font-bold underline"
            >
              <span>nsfdc.nic.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Col 5: Contact and Support */}
          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="font-extrabold text-white mb-4 text-base uppercase tracking-wider">
              {language === 'hi' ? 'संपर्क एवं सहायता' : 'Contact and Support'}
            </h3>
            <p className="text-sm text-emerald-100/85 leading-relaxed mb-3 font-normal">
              {language === 'hi'
                ? 'नागरिक सहायता एवं प्रश्नों के लिए संपर्क करें:'
                : 'For inquiries and citizen support, reach out to us:'}
            </p>
            <a
              href="mailto:contactaryasaarthi@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-emerald-200 font-bold underline transition-colors"
              title="Send an email to contactaryasaarthi@gmail.com"
            >
              <Mail className="w-4 h-4 shrink-0 text-[#25D366]" />
              <span className="whitespace-nowrap">contactaryasaarthi@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-[#075E54]/60 text-sm sm:text-base text-emerald-100/80 text-center sm:text-left">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
