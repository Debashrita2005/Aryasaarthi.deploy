"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/authContext";
import {
  Home,
  Compass,
  Calculator,
  MapPin,
  User,
  LogIn,
  LayoutDashboard,
  Bot,
} from "lucide-react";

export function MobileNav() {
  const { language, t } = useI18n();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const items = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/find-scheme", label: t.nav.findScheme, icon: Compass },
    { href: "/calculator", label: t.nav.calculator, icon: Calculator },
    { href: "/partners", label: t.nav.partners, icon: MapPin },
    {
      href: "#ask-arya",
      label: "Ask Arya",
      icon: Bot,
      isAskArya: true,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 grid grid-cols-5 items-center"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.isAskArya) {
          return (
            <button
              key="ask-arya-nav"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined') {
                  if (typeof (window as any).openAskArya === 'function') {
                    (window as any).openAskArya();
                  }
                  window.dispatchEvent(new CustomEvent('open-ask-arya'));
                }
                const trigger = document.getElementById('ask-arya-chat-trigger');
                if (trigger) trigger.click();
              }}
              className="flex flex-col items-center justify-center py-1 px-0.5 rounded-lg touch-target transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-emerald-500 -mt-3 bg-white relative">
                <Image
                  src="/arya_dp.jpg"
                  alt="Ask Arya"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
              </div>
              <span className="text-[9.5px] font-bold mt-1 text-center leading-tight min-h-[22px] flex items-center justify-center text-emerald-700">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg touch-target transition-colors ${
              isActive
                ? "text-emerald-700 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[9.5px] font-bold mt-1 text-center leading-tight min-h-[22px] flex items-center justify-center">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
