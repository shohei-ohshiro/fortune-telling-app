export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-pulse">🔮</div>
        <p className="text-purple-200 text-sm">読み込み中...</p>
      </div>
    </div>
  );
}
