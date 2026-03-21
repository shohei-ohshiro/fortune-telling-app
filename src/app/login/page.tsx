"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/10 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            ログイン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-purple-200">メールアドレス</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                required
              />
            </div>
            <div>
              <Label className="text-purple-200">パスワード</Label>
              <Input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/signup" className="text-purple-300 hover:text-white text-sm">
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-xs">
              &larr; トップに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
