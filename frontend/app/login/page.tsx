"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[80vh] p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366f1]/10 rounded-2xl mb-4 border border-[#6366f1]/20">
              <ShieldCheck className="w-8 h-8 text-[#6366f1]" />
            </div>
            <h1 className="text-2xl font-black text-[#f1f5f9] mb-2">Welcome Back</h1>
            <p className="text-[#94a3b8] text-sm">Sign in to manage your price trackers</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  required
                  type="email"
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl py-3 pl-11 pr-4 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1] transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  required
                  type="password"
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl py-3 pl-11 pr-4 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-2xl font-black shadow-lg shadow-[#6366f1]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Signing in..." : (
                <>
                  Sign In <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#334155]/50 text-center">
            <p className="text-[#94a3b8] text-sm">
              {"Don't have an account? "}
              <Link href="/signup" className="text-[#6366f1] font-bold hover:underline inline-flex items-center gap-1">
                Sign Up <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
