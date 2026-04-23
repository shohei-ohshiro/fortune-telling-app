"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-white/10 border-purple-500/30 max-w-md w-full">
        <CardContent className="pt-6 space-y-4 text-center">
          <div className="text-5xl">🌙</div>
          <h1 className="text-white text-xl font-bold">
            鑑定中にエラーが発生しました
          </h1>
          <p className="text-purple-200 text-sm leading-relaxed">
            一時的な不具合の可能性があります。もう一度お試しいただくか、トップページからやり直してください。
          </p>
          {error.digest && (
            <p className="text-purple-500 text-[10px] font-mono">
              エラーID: {error.digest}
            </p>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <Button
              onClick={() => reset()}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              再試行
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-900/50"
              >
                トップに戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
