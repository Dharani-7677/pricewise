"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, LogOut, LogIn, UserPlus, Menu, X, PlusCircle } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/smart-compare", label: "Smart Compare" },
  { href: "/alerts", label: "Alerts" },
  { href: "/compare", label: "Compare" },
  { href: "/community", label: "Community" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#334155] bg-[#0f172a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/20">
              P
            </div>
            <span className="font-bold text-lg text-[#f1f5f9]">
              Price<span className="text-[#6366f1]">Wise</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 mx-4 overflow-x-auto no-scrollbar">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "px-4 py-2 text-xs font-bold text-[#f1f5f9] bg-[#1e293b] border border-[#334155] rounded-lg transition-all"
                    : "px-4 py-2 text-xs font-bold text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50 rounded-lg transition-all"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e293b] rounded-xl border border-[#334155]">
                    <div className="w-6 h-6 bg-[#6366f1]/10 rounded-lg flex items-center justify-center">
                      <User size={14} className="text-[#6366f1]" />
                    </div>
                    <span className="text-xs font-bold text-[#94a3b8] max-w-[120px] truncate">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                  <Link 
                    href="/dashboard" 
                    className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold text-xs shadow-lg shadow-[#6366f1]/20"
                  >
                    + Track
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-xs font-bold text-[#94a3b8] hover:text-[#f1f5f9] transition-all">
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold text-xs shadow-lg shadow-[#6366f1]/20"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#94a3b8] hover:text-[#f1f5f9] p-2"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6 border-t border-[#334155] mt-2 pt-6 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === link.href
                    ? "px-4 py-3 text-sm font-bold text-[#f1f5f9] bg-[#1e293b] border border-[#334155] rounded-xl transition-all"
                    : "px-4 py-3 text-sm font-bold text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50 rounded-xl transition-all"
                }
              >
                {link.label}
              </Link>
            ))}
            
            {!loading && (
              user ? (
                <div className="mt-4 pt-4 border-t border-[#334155]/50 space-y-3">
                  <div className="px-4 py-3 flex items-center gap-3 text-[#94a3b8] bg-[#0f172a] rounded-xl border border-[#334155]">
                    <User size={18} />
                    <span className="text-sm font-bold truncate">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setMenuOpen(false)} 
                    className="flex items-center justify-center gap-2 py-3 bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#6366f1]/20"
                  >
                    <PlusCircle size={18} /> Track Product
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-[#334155]/50 flex flex-col gap-3">
                  <Link 
                    href="/login" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1e293b] text-white rounded-xl border border-[#334155] font-bold text-sm"
                  >
                    <LogIn size={18} /> Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 bg-[#6366f1] text-white rounded-xl font-bold text-sm"
                  >
                    <UserPlus size={18} /> Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
