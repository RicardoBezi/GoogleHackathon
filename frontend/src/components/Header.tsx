import { useRef } from 'react';

interface HeaderProps {
  turn: number;
  season: string;
  onSave: () => void;
  onLoad: (file: File) => void;
}

export default function Header({ turn, season, onSave, onLoad }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const seasonEmoji: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    autumn: '🍂',
    winter: '❄️',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoad(file);
      // Reset input so same file can be loaded again
      e.target.value = '';
    }
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🌍</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">EcoSim AI</h1>
          <p className="text-xs text-zinc-500">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Save/Load buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded transition-colors"
            title="Download save file"
          >
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded transition-colors"
            title="Load save file"
          >
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.ecosim"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

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
