"""
FastAPI server for the Ecosystem Simulator.
Provides REST endpoints for the frontend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from schemas import EcosystemState, SimulationResult, UserIntervention
from simulation import create_initial_ecosystem, advance_simulation, chat_about_ecosystem

app = FastAPI(
    title="Ecosystem Simulator",
    description="AI-powered ecosystem simulation using Gemini 3",
    version="1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state (simple for hackathon - no persistence needed)
current_ecosystem: EcosystemState | None = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class InterventionRequest(BaseModel):
    action: str
    details: Optional[str] = None


@app.get("/")
async def root():
    return {"status": "ok", "message": "Ecosystem Simulator API"}


@app.post("/ecosystem/new", response_model=EcosystemState)
async def create_new_ecosystem(grid_size: int = 8):
    """Create a fresh ecosystem."""
    global current_ecosystem
    current_ecosystem = create_initial_ecosystem(grid_size)
    return current_ecosystem


@app.get("/ecosystem", response_model=EcosystemState)
async def get_ecosystem():
    """Get the current ecosystem state."""
    if current_ecosystem is None:
        raise HTTPException(status_code=404, detail="No ecosystem exists. Create one first.")
    return current_ecosystem


@app.post("/ecosystem/advance", response_model=SimulationResult)
async def advance_turn(intervention: Optional[InterventionRequest] = None):
    """Advance the simulation by one turn, optionally with a user intervention."""
    global current_ecosystem

    if current_ecosystem is None:
        raise HTTPException(status_code=404, detail="No ecosystem exists. Create one first.")

    user_intervention = None
    if intervention:
        user_intervention = UserIntervention(
            action=intervention.action,
            details=intervention.details
        )

    result = await advance_simulation(current_ecosystem, user_intervention)
    current_ecosystem = result.new_state

    return result


@app.post("/ecosystem/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat about the ecosystem without advancing time."""
    if current_ecosystem is None:
        raise HTTPException(status_code=404, detail="No ecosystem exists. Create one first.")

    response_text = await chat_about_ecosystem(current_ecosystem, request.message)
    return ChatResponse(response=response_text)


@app.get("/ecosystem/species")
async def get_species():
    """Get just the species list with populations."""
    if current_ecosystem is None:
        raise HTTPException(status_code=404, detail="No ecosystem exists. Create one first.")

    return [
        {"name": s.name, "population": s.population, "diet": s.diet}
        for s in current_ecosystem.species
    ]


@app.post("/ecosystem/load", response_model=EcosystemState)
async def load_ecosystem(state: EcosystemState):
    """Load a saved ecosystem state."""
    global current_ecosystem
    current_ecosystem = state
    return current_ecosystem


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
