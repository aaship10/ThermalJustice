import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, ConfigDict, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone

# Auth Config
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "thermal_justice_development_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Enable CORS for the Vite frontend (port 5173 or similar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neon DB Postgres URL
DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Execute an initialization block to create our table if it doesn't exist
try:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PortfolioQueries" (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    location VARCHAR(255),
                    budget FLOAT,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "Users" (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "SearchHistory" (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES "Users"(id) ON DELETE CASCADE,
                    location VARCHAR(255),
                    budget FLOAT,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
except Exception as e:
    print(f"Error during database initialization: {e}")

class QueryPayload(BaseModel):
    # CRITICAL REQUIREMENT: Forbid any extra fields like 'alpha'
    model_config = ConfigDict(extra='forbid')
    location: str
    budget: float

class UserAuth(BaseModel):
    email: str
    password: str


@app.post("/api/save-query")
async def save_query(payload: QueryPayload):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "PortfolioQueries" (location, budget)
                    VALUES (%s, %s);
                    """,
                    (payload.location, payload.budget)
                )
                conn.commit()
        return {"success": True}
    except Exception as e:
        print(f"Error saving to DB: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.post("/api/history/save")
async def save_search_history(payload: QueryPayload, user_id: str = Depends(get_current_user_id)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "SearchHistory" (user_id, location, budget)
                    VALUES (%s, %s, %s);
                    """,
                    (user_id, payload.location, payload.budget)
                )
                conn.commit()
        return {"success": True}
    except Exception as e:
        print(f"Error saving history to DB: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/history")
async def get_search_history(user_id: str = Depends(get_current_user_id)):
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, location, budget, createdAt, user_id
                    FROM "SearchHistory"
                    WHERE user_id = %s
                    ORDER BY createdAt DESC;
                    """,
                    (user_id,)
                )
                history = cur.fetchall()
        return {"success": True, "history": history}
    except Exception as e:
        print(f"Error fetching history from DB: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.post("/api/register")
async def register(user: UserAuth):
    hashed_password = get_password_hash(user.password)
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check exist
                cur.execute('SELECT email FROM "Users" WHERE email = %s', (user.email,))
                if cur.fetchone():
                    raise HTTPException(status_code=400, detail="Email already registered")
                
                cur.execute(
                    'INSERT INTO "Users" (email, password_hash) VALUES (%s, %s) RETURNING id',
                    (user.email, hashed_password)
                )
                new_user_id = cur.fetchone()[0]
                conn.commit()
                
        # Generate token
        access_token = create_access_token(data={"sub": str(new_user_id), "email": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Db error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/login")
async def login(user: UserAuth):
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute('SELECT * FROM "Users" WHERE email = %s', (user.email,))
                db_user = cur.fetchone()
                
                if not db_user or not verify_password(user.password, db_user['password_hash']):
                    raise HTTPException(status_code=401, detail="Incorrect email or password")
                
                access_token = create_access_token(data={"sub": str(db_user['id']), "email": db_user['email']})
                return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Db error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")
import os
import zipfile
import torch
import pandas as pd
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# --- STEP 1: DEFINE THE GNN ARCHITECTURE ---
# This MUST match your teammate's model class exactly
import torch.nn as nn
from torch_geometric.nn import GATv2Conv

class ThermalGAT(nn.Module):
    def __init__(self, input_dim, hidden_dim, heads=4):
        super(ThermalGAT, self).__init__()
        self.conv1 = GATv2Conv(input_dim, hidden_dim, heads=heads)
        self.conv2 = GATv2Conv(hidden_dim * heads, 1, heads=1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = torch.relu(self.conv1(x, edge_index))
        x = self.conv2(x, edge_index)
        return x

# --- STEP 2: APP INITIALIZATION & DATA LOADING ---
# Title configuration is ignored here since app is already instantiated at the top of the file

# Global Data Objects
dashboard_df = None
gnn_model = None

@app.on_event("startup")
async def startup_event():
    global dashboard_df, gnn_model
    
    # 1. Unzip the Model
    zip_path = 'models/thermal_gat_pune_model1.zip'
    model_path = 'models/thermal_gat_pune_model1.pth'
    
    if os.path.exists(zip_path):
        print("📦 Extracting GNN Model...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall('models/')
            
    # 2. Load the GNN Model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    if os.path.exists(model_path):
        # We load the weights. Map_location ensures it works on CPU or GPU
        gnn_model = torch.load(model_path, map_location=device)
        print("🧠 GNN Model Loaded.")

    # 3. Load the 163k CSV (The output from your teammate's XGBoost)
    csv_path = 'data/pune_dashboard_final.csv'
    if os.path.exists(csv_path):
        dashboard_df = pd.read_csv(csv_path)
        print(f"📊 Dashboard data loaded: {len(dashboard_df)} blocks.")

# --- STEP 3: WEATHER SERVICE (LIVE SCALING) ---
def get_live_pune_temp():
    """Fetches real-time temp from OpenWeatherMap."""
    # Replace with your actual API Key
    API_KEY = "your_openweathermap_api_key_here" 
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q=Pune&appid={API_KEY}&units=metric"
        response = requests.get(url, timeout=5).json()
        return response['main']['temp_max']
    except:
        # Fallback to a high summer temp if API fails
        print("⚠️ Weather API failed. Using fallback temp.")
        return 41.5 

# --- STEP 4: REQUEST SCHEMA ---
class OptimiseRequest(BaseModel):
    area: str      # e.g., "Kothrud"
    budget: float  # e.g., 50000000 (5 Cr)
    alpha: float   # Slider value 0 to 1

# --- STEP 5: THE OPTIMISE ROUTE ---
@app.post("/optimise")
async def optimise(request: OptimiseRequest):
    global dashboard_df
    
    if dashboard_df is None:
        raise HTTPException(status_code=500, detail="Data not loaded.")

    # 1. Get Live Weather & Scale
    live_temp = get_live_pune_temp()
    baseline_avg = 38.0 
    temp_shift = live_temp - baseline_avg
    
    # 2. Filter Area (Ward)
    if 'ward_name' in dashboard_df.columns:
        target_area = dashboard_df[dashboard_df['ward_name'] == request.area].copy()
    else:
        target_area = dashboard_df.copy()

    # 3. The Multi-View Priority Scoring
    # S = (1-alpha) * (Risk * Impact) + alpha * (Risk)
    target_area['priority_score'] = (
        (1 - request.alpha) * (target_area['gnn_vulnerability_pred'] * target_area['max_risk_reduction']) +
        (request.alpha * target_area['gnn_vulnerability_pred'])
    )

    # 4. Knapsack Selection (Budget Allocation)
    ranked_blocks = target_area.sort_values('priority_score', ascending=False)
    
    portfolio = []
    remaining_budget = request.budget

    # The Official PMC 1-Hectare Pricing Model (Material + Labor split)
    COST_DICT = {
        "Cool Roofs": {"material": 1500000, "labor": 500000},      # 20 Lakhs total
        "Urban Forest": {"material": 2000000, "labor": 1000000},   # 30 Lakhs total
        "Permeable Rd": {"material": 7500000, "labor": 2000000},   # 95 Lakhs total
        "Green Roofs": {"material": 10000000, "labor": 3500000}    # 1.35 Cr total
    }
    
    for _, block in ranked_blocks.iterrows():
        strategy = block['best_strategy']
        
        # Skip blocks where strategy is NaN, missing, or explicitly 'None'
        if pd.isna(strategy) or strategy == 'None':
            continue
            
        # Get specific cost (Default to Urban Forest costs if mismatch)
        pricing = COST_DICT.get(strategy, {"material": 2000000, "labor": 1000000}) 
        total_block_cost = pricing["material"] + pricing["labor"]
        
        if total_block_cost <= remaining_budget:
            portfolio.append({
                "block_id": int(block['block_id']),
                "strategy": strategy,
                "cost": total_block_cost,
                "material_cost": pricing["material"],
                "labor_cost": pricing["labor"],
                "impact": float(block['max_risk_reduction']),
                "live_lst": float(block['LST_Celsius'] + temp_shift),
                "latitude": float(block['latitude']),      
                "longitude": float(block['longitude'])     
            })
            remaining_budget -= total_block_cost
            
        # Stop if budget is too low for even the cheapest measure (Cool Roofs @ 20L)
        if remaining_budget < 2000000:
            break

    return {
        "live_pune_temp": live_temp,
        "summary": {
            "total_budget": request.budget,
            "remaining_budget": remaining_budget,
            "blocks_treated": len(portfolio)
        },
        "selected_interventions": portfolio
    }