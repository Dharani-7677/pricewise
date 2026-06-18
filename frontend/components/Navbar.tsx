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

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:bg-[#4f46e5] transition-colors">
              P
            </div>
            <span className="font-bold text-lg text-[#f1f5f9]">
              Price<span className="text-[#6366f1]">Wise</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "px-4 py-2 text-sm font-medium text-[#f1f5f9] bg-[#1e293b] rounded-lg transition-all"
                    : "px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50 rounded-lg transition-all"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Track Product Button */}
          <div className="hidden md:block">
            <Link 
              href="/dashboard" 
              className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold text-sm"
            >
              + Track Product
            </Link>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-[#334155] mt-2 pt-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === link.href
                    ? "px-4 py-3 text-sm font-medium text-[#f1f5f9] bg-[#1e293b] rounded-lg transition-all"
                    : "px-4 py-3 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50 rounded-lg transition-all"
                }
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/dashboard" 
              onClick={() => setMenuOpen(false)} 
              className="mt-2 w-full text-center py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold text-sm"
            >
              + Track Product
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
