"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams, hash } = new URL(window.location.href);
      const code = searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (hash) {
        // implicit flow: tokens in hash fragment
        // supabase client handles this automatically
      }

      // AuthProvider の onAuthStateChange がセッションを検知するのを待つ
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <p className="text-purple-300">ログイン処理中...</p>
    </div>
  );
}
