interface HeaderProps {
  turn: number;
  season: string;
}

export default function Header({ turn, season }: HeaderProps) {
  const seasonEmoji: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    autumn: '🍂',
    winter: '❄️',
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🌍</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Ecosystem Simulator</h1>
          <p className="text-xs text-zinc-500">Powered by Gemini 3</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Turn</div>
          <div className="text-2xl font-mono font-bold">{turn}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Season</div>
          <div className="text-lg font-semibold capitalize flex items-center gap-2">
            {seasonEmoji[season.toLowerCase()] || '🌍'}
            {season}
          </div>
        </div>
      </div>
    </header>
  );
}
