"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alerts", label: "Alerts" },
  { href: "/compare", label: "Compare" },
  { href: "/community", label: "Community" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#334155] bg-[#0f172a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:bg-[#4f46e5] transition-colors">
              P
            </div>
            <span className="font-bold text-lg text-[#f1f5f9]">
              Price<span className="text-[#6366f1]">Wise</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "nav-link-active" : "nav-link"}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              + Track Product
            </Link>
          </div>

          <button
            className="md:hidden text-[#94a3b8] hover:text-[#f1f5f9] p-2"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-[#334155] mt-2 pt-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={pathname === link.href ? "nav-link-active" : "nav-link"}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary text-sm mt-2 text-center">
              + Track Product
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}