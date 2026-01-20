import type { SimulationEvent } from '../types';

interface EventLogProps {
  events: SimulationEvent[];
  narration: string;
  warnings: string[];
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'border-l-red-500 bg-red-900/20';
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-900/20';
    default:
      return 'border-l-blue-500 bg-blue-900/20';
  }
}

export default function EventLog({ events, narration, warnings }: EventLogProps) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-4 flex flex-col h-full">
      <div className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
        Event Log
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {/* Narration */}
        {narration && (
          <div className="text-sm text-zinc-300 leading-relaxed pb-3 border-b border-zinc-700">
            {narration}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, i) => (
              <div
                key={i}
                className="text-sm text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded px-3 py-2"
              >
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Events */}
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((event, i) => (
              <div
                key={i}
                className={`text-sm border-l-2 pl-3 py-2 rounded-r ${getSeverityColor(
                  event.severity
                )}`}
              >
                <div className="text-zinc-200">{event.description}</div>
                {event.affected_species.length > 0 && (
                  <div className="text-xs text-zinc-500 mt-1">
                    Affected: {event.affected_species.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && !narration && (
          <div className="text-sm text-zinc-500 italic">
            Advance the simulation to see what happens...
          </div>
        )}
      </div>
    </div>
  );
}
