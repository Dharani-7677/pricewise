"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, UserPlus, ArrowLeft, ShieldPlus, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[80vh] p-6">
        <div className="w-full max-w-md bg-[#1e293b] p-10 rounded-3xl border border-[#334155] text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-4">Check your email</h1>
          <p className="text-[#94a3b8] mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-white font-bold">{email}</span>. 
            Please check your inbox and click the link to activate your account.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-[#6366f1] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f46e5]">
            <ArrowLeft size={18} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[80vh] p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366f1]/10 rounded-2xl mb-4 border border-[#6366f1]/20">
              <ShieldPlus className="w-8 h-8 text-[#6366f1]" />
            </div>
            <h1 className="text-2xl font-black text-[#f1f5f9] mb-2">Create Account</h1>
            <p className="text-[#94a3b8] text-sm">Join PriceWise to start tracking deals</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2 ml-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    required
                    type="password"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl py-3 pl-11 pr-4 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1] transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-2xl font-black shadow-lg shadow-[#6366f1]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Creating account..." : (
                <>
                  Create Account <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#334155]/50 text-center">
            <p className="text-[#94a3b8] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#6366f1] font-bold hover:underline inline-flex items-center gap-1">
                Sign In <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
