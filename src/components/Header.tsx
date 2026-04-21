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
    <header className="flex items-center justify-between px-4 sm:px-6 py-4">
      <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-white hover:text-purple-200 transition shrink-0">
        四柱推命
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        {loading ? (
          <div className="w-16 sm:w-20" />
        ) : user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-purple-200 text-xs sm:text-sm px-2 sm:px-4">
                マイページ
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-purple-500/30 text-purple-200 hover:bg-purple-900/50 text-xs sm:text-sm px-2 sm:px-4"
            >
              ログアウト
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-purple-200 text-xs sm:text-sm px-2 sm:px-4">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm px-2 sm:px-4">
                無料登録
              </Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
