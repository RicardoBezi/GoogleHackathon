import type { EcosystemState, SimulationResult, InterventionRequest } from './types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function createEcosystem(gridSize: number = 8): Promise<EcosystemState> {
  const response = await fetch(`${API_BASE}/ecosystem/new?grid_size=${gridSize}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create ecosystem');
  return response.json();
}

export async function getEcosystem(): Promise<EcosystemState> {
  const response = await fetch(`${API_BASE}/ecosystem`);
  if (!response.ok) throw new Error('Failed to get ecosystem');
  return response.json();
}

export async function advanceTurn(intervention?: InterventionRequest): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE}/ecosystem/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: intervention ? JSON.stringify(intervention) : undefined,
  });
  if (!response.ok) throw new Error('Failed to advance turn');
  return response.json();
}

export async function chatAboutEcosystem(message: string): Promise<string> {
  const response = await fetch(`${API_BASE}/ecosystem/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to chat');
  const data = await response.json();
  return data.response;
}

export async function loadEcosystem(state: EcosystemState): Promise<EcosystemState> {
  const response = await fetch(`${API_BASE}/ecosystem/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }
  return response.json();
}
