'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { OnboardingModal } from '@/components/OnboardingModal';
import { AskAryaChatbot } from '@/components/AskAryaChatbot';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobileSimulator = pathname === '/mobile';

  if (isMobileSimulator) {
    return (
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
        <AskAryaChatbot />
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <OnboardingModal />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <AskAryaChatbot />
      <MobileNav />
      <Footer />
    </>
  );
}
