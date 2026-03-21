"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
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
            無料会員登録
          </CardTitle>
          <p className="text-purple-300 text-center text-sm">
            登録して、あなた専用の鑑定結果を保存しましょう
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                minLength={6}
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
              {loading ? "登録中..." : "無料で登録する"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-purple-300 hover:text-white text-sm">
              すでにアカウントをお持ちの方はこちら
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
