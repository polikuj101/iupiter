'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutsideClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutsideClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="md:hidden">
      <button
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-[#525252] hover:text-[#0A0A0A] transition-colors rounded-md"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
          {open ? (
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <line x1="2" y1="5"  x2="16" y2="5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="9"  x2="16" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute top-full left-0 w-full bg-[#FAFAF9]/95 backdrop-blur-md border-b border-[#EAEAEA] px-6 py-4 flex flex-col gap-1"
        >
          <Link href="#how-it-works" onClick={close} className="py-2.5 text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
            How it works
          </Link>
          <Link href="#pricing" onClick={close} className="py-2.5 text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
            Pricing
          </Link>
          <Link href="#demo" onClick={close} className="py-2.5 text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
            Demo
          </Link>

          <div className="border-t border-[#EAEAEA] mt-2 pt-4 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={close}
                className="text-center text-sm font-medium text-white bg-[#0A0A0A] px-4 py-2.5 rounded-md hover:bg-[#262626] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={close} className="py-2.5 text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={close}
                  className="text-center text-sm font-medium text-white bg-[#0A0A0A] px-4 py-2.5 rounded-md hover:bg-[#262626] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
