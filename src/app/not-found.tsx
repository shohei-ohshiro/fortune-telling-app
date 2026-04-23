import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-white/10 border-purple-500/30 max-w-md w-full">
        <CardContent className="pt-6 space-y-4 text-center">
          <div className="text-5xl">🔮</div>
          <h1 className="text-white text-xl font-bold">
            ページが見つかりません
          </h1>
          <p className="text-purple-200 text-sm leading-relaxed">
            お探しのページは存在しないか、移動した可能性があります。
            トップページから改めて占術を選んでみてください。
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                トップに戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
