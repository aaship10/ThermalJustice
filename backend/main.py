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
    allow_origins=["*"], 
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
