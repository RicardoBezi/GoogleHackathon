import { useState, useEffect } from 'react';
import type { EcosystemState, SimulationEvent } from './types';
import { createEcosystem, advanceTurn, loadEcosystem } from './api';
import Header from './components/Header';
import EcosystemViewport from './components/EcosystemViewport';
import ControlPanel from './components/ControlPanel';
import SpeciesPanel from './components/SpeciesPanel';
import EventLog from './components/EventLog';

// Save file format
interface SaveFile {
  version: 1;
  savedAt: string;
  ecosystem: EcosystemState;
  events: SimulationEvent[];
  narration: string;
}

function App() {
  const [ecosystem, setEcosystem] = useState<EcosystemState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [narration, setNarration] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize ecosystem on mount
  useEffect(() => {
    initializeEcosystem();
  }, []);

  const initializeEcosystem = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const state = await createEcosystem(8);
      setEcosystem(state);
      setNarration('A new ecosystem has been created. Click "Advance Turn" to begin the simulation.');
    } catch (err) {
      setError('Failed to connect to backend. Make sure the server is running on localhost:8000');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanceTurn = async (intervention?: { action: string; details?: string }) => {
    if (!ecosystem) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await advanceTurn(intervention);
      setEcosystem(result.new_state);
      setEvents(result.events);
      setNarration(result.narration);
      setWarnings(result.warnings);
    } catch (err) {
      setError('Failed to advance simulation. Check the backend logs.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save ecosystem to file
  const handleSave = () => {
    if (!ecosystem) return;

    const saveData: SaveFile = {
      version: 1,
      savedAt: new Date().toISOString(),
      ecosystem,
      events,
      narration,
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosim-turn${ecosystem.turn}-${ecosystem.season}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load ecosystem from file
  const handleLoad = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      let saveData: SaveFile;

      try {
        saveData = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON file');
      }

      // Check if it's our save format or raw ecosystem state
      let ecosystemToLoad: EcosystemState;

      if (saveData.version && saveData.ecosystem) {
        // It's our save format
        ecosystemToLoad = saveData.ecosystem;
      } else if ((saveData as unknown as EcosystemState).species && (saveData as unknown as EcosystemState).tiles) {
        // It's a raw ecosystem state (maybe exported differently)
        ecosystemToLoad = saveData as unknown as EcosystemState;
      } else {
        throw new Error('Invalid save file format - missing required data');
      }

      // Load into backend
      const loadedState = await loadEcosystem(ecosystemToLoad);
      setEcosystem(loadedState);
      setEvents(saveData.events || []);
      setNarration(saveData.narration || 'Save file loaded successfully!');
      setWarnings([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load: ${errorMessage}`);
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!ecosystem && isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-zinc-400">Initializing ecosystem...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !ecosystem) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={initializeEcosystem}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ecosystem) return null;

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <Header
        turn={ecosystem.turn}
        season={ecosystem.season}
        onSave={handleSave}
        onLoad={handleLoad}
      />

      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Main 3D Viewport */}
        <div className="flex-1 relative">
          <EcosystemViewport
            species={ecosystem.species}
            season={ecosystem.season}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-4 flex flex-col gap-4 overflow-y-auto">
          <ControlPanel
            temperature={ecosystem.temperature}
            season={ecosystem.season}
            selectedTile={null}
            onAdvanceTurn={handleAdvanceTurn}
            isLoading={isLoading}
          />

          <SpeciesPanel species={ecosystem.species} />

          <div className="flex-1 min-h-48">
            <EventLog
              events={events}
              narration={narration}
              warnings={warnings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
