"use client";

import React from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Compass, LogIn } from "lucide-react";

export function Navbar({ isConfigured }: { isConfigured: boolean }) {
  return (
    <header className="w-full sticky top-0 z-30 bg-sand-50/85 backdrop-blur-md border-b border-brand-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a
          href="#"
          className="flex items-center gap-2.5 text-slate-900 no-underline group"
        >
          <span className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-800 transition-colors">
            <Compass className="w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-tight tracking-tight text-slate-900">
              מסע נירים
            </span>
            <span className="text-[11px] text-brand-700 font-medium leading-none">
              חינוך, שטח וקהילה
            </span>
          </div>
        </a>

        <nav
          aria-label="ניווט ראשי"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#about"
            className="hover:text-brand-700 transition-colors no-underline"
          >
            אודות המסע
          </a>
          <a
            href="#features"
            className="hover:text-brand-700 transition-colors no-underline"
          >
            מה באתר
          </a>
          <a
            href="#contact"
            className="hover:text-brand-700 transition-colors no-underline"
          >
            תמיכה וקשר
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isConfigured ? (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>התחברות</span>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Clerk מוכן לחיבור</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
