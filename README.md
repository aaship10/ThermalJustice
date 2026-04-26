# ThermalJustice: Urban Heat Intervention Intelligence
ThermalJustice is a full-stack spatial intelligence platform designed for the Pune and Pimpri-Chinchwad Municipal Corporations (PMC/PCMC). It leverages Graph Neural Networks (GNN) and multi-objective optimization to identify where urban cooling interventions (trees, green roofs, cool pavements) will save the most lives while maintaining socio-economic equity.

## 🚀 Core Features
Geographically Intelligent Mapping: Precinct-level accuracy for 54+ neighborhoods using official administrative boundaries and longitudinal partitioning (e.g., distinguishing Bavdhan from Erandwane).

Thermal Vulnerability Scoring (TVS): A GNN-based risk metric that combines Land Surface Temperature (LST), population density, building density, and vegetation cover (NDVI).

Pareto-Optimal Optimization: A multi-objective knapsack solver that balances maximum cooling impact with equity weighting (α).

Grid Intelligence UI: Translucent geospatial overlays featuring a Green Base (protected ward area) and Red Heat Cells (high-risk intervention points) with 3D building extrusions.

Scenario Comparison: Side-by-side "swipe" views and saved scenario logs to compare different budget and policy outcomes.

## 🛠️ Setup & Installation
## 1. Backend (Python)
Ensure you have Python 3.10+ installed.

Bash


cd backend


python -m venv venv


source venv/bin/activate  # Windows: .\venv\Scripts\activate


pip install -r requirements.txt


Run Geographic Intelligence Sync:


This script aligns the 163k blocks with official PMC/PCMC boundaries and partitions neighborhoods by longitude.

Bash


python spatial_sync.py


Start the Server:

Bash


uvicorn main:app --reload

## 2. Frontend (React)


Bash


cd frontend


npm install


Mapbox Configuration:


Ensure your Mapbox Token is set in src/components/map/MapView.jsx.

Start the Dashboard:

Bash


npm run dev

## 📊 Data Pipeline
Ingestion: High-resolution LST and NDVI data extracted from Landsat 8/9 and Sentinel-2.

Spatial Join: Point data is clipped into official ward polygons using geopandas.

Partitioning: Within shared administrative zones, blocks are sorted by longitude to assign specific neighborhood tags (e.g., Bavdhan = West, Erandwane = East).

Optimization: The backend runs a greedy knapsack algorithm on the pune_dashboard_final.csv to select the top-performing blocks for intervention based on user-defined Budget and Alpha (Equity) values.

## 🧪 Technical Stack
Frontend: React, Mapbox GL (react-map-gl), Tailwind CSS, Framer Motion.

Backend: FastAPI, Pandas, Geopandas, NumPy, Scikit-learn.

Data Formats: GeoJSON (Boundaries), CSV (Block Data), JSON (Intervention Metadata).
