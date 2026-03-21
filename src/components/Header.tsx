"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-white hover:text-purple-200 transition">
        四柱推命
      </Link>
      <div className="flex gap-2">
        <Link href="/pricing">
          <Button variant="ghost" className="text-white hover:text-purple-200">
            料金プラン
          </Button>
        </Link>
        {loading ? (
          <div className="w-20" />
        ) : user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-purple-200">
                マイページ
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-purple-500/30 text-purple-200 hover:bg-purple-900/50"
            >
              ログアウト
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-purple-200">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                無料登録
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
