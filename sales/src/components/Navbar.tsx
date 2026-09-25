"use client";

import Link from "next/link";
import { FileText, Mail, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "AI Tools", href: "#ai" },
  { name: "Student Support", href: "#student" },
  { name: "Readiness", href: "#readiness" },
  { name: "Demo", href: "#demo" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b transition-all duration-200",
        isScrolled
          ? "border-[#d7dde7] bg-white/92 shadow-sm backdrop-blur"
          : "border-transparent bg-[#f7f9fb]/90 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Sikhsha home">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0b1220] text-sm font-semibold text-white">
            S
          </span>
          <span className="text-xl font-semibold text-[#0b1220]">Sikhsha</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-semibold text-[#526070] transition hover:text-[#0b1220]">
              {link.name}
            </a>
          ))}
          <a
            href="/sikhsha-brochure.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#1f6feb] px-4 text-sm font-semibold text-[#1f6feb] transition hover:bg-[#eef5ff] focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2"
          >
            <FileText size={16} aria-hidden="true" />
            Brochure
          </a>
          <a
            href="mailto:sales@sikhsha.ai?subject=Sikhsha%20product%20walkthrough"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0b1220] px-4 text-sm font-semibold text-white transition hover:bg-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2"
          >
            <Mail size={16} aria-hidden="true" />
            Book Demo
          </a>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-[#cbd5e1] bg-white text-[#0b1220] md:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-[#d7dde7] bg-white px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-semibold text-[#526070]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/sikhsha-brochure.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#1f6feb] px-2 py-2 text-center text-sm font-semibold text-[#1f6feb]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText size={16} aria-hidden="true" />
              Open brochure
            </a>
            <a
              href="mailto:sales@sikhsha.ai?subject=Sikhsha%20product%20walkthrough"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0b1220] px-2 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Mail size={16} aria-hidden="true" />
              Book demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
