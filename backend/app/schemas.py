from pydantic import BaseModel
from typing import List, Optional

class OptimiseRequest(BaseModel):
    area: str      # Name of the ward
    budget: float  # In Rupees (e.g., 50000000)
    alpha: float   # 0.0 to 1.0 (Efficiency vs Equity)

class Intervention(BaseModel):
    block_id: int
    strategy: str
    cost: float
    material_cost: float  
    labor_cost: float     
    impact: float
    live_lst: float
    latitude: float      
    longitude: float

class OptimiseResponse(BaseModel):
    live_pune_temp: float
    summary: dict
    selected_interventions: List[Intervention]