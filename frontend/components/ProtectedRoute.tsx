"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(function() {
    supabase.auth.getSession().then(function({ data: { session } }) {
      if (!session) {
        router.push('/login');
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
