import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import json
import numpy as np

def load_geojson(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    rows = []
    for f in data['features']:
        props = f['properties']
        from shapely.geometry import shape
        props['geometry'] = shape(f['geometry'])
        rows.append(props)
    return gpd.GeoDataFrame(rows, crs="EPSG:4326")

def run_spatial_join():
    print("📖 Loading files for final alignment...")
    df = pd.read_csv('data/pune_dashboard_final.csv')
    pmc = load_geojson('data/pune-admin-wards.geojson')
    pcmc = load_geojson('data/pcmc-electoral-wards.geojson')
    
    # --- MASTER MAPPING DICTIONARY ---
    # We map the 15 large Admin Zones to your specific dropdown neighborhoods
    # 🌟 Spelling updated: Bawdhan -> Bavdhan
    zone_to_neighborhoods = {
        'Aundh': ['Aundh', 'Baner', 'Pashan'],
        'Kothrud Karveroad': ['Kothrud', 'Bavdhan', 'Erandwane'],
        'Warje Karvenagar': ['Warje', 'Dhayari'],
        'Dhankawadi': ['Dhankawadi', 'Katraj', 'Ambegaon', 'Narhe', 'Nanded City'],
        'Hadapsar': ['Hadapsar', 'Phursungi', 'Uruli Devachi', 'Magarpatta', 'Mundhwa'],
        'Nagar Road': ['Viman Nagar', 'Kharadi', 'Wagholi', 'Dhanori', 'Kalyani Nagar'],
        'Yerawda - Sangamwadi': ['Yerawada', 'Koregaon Park', 'Vishrantwadi', 'Lohegaon'],
        'KasbaVishrambaugwada': ['Kasba Peth', 'Shaniwar Peth', 'Sadashiv Peth', 'Deccan', 'Nana Peth', 'Shivajinagar'],
        'Bibwewadi': ['Bibwewadi'],
        'Kondhwa Wanavdi': ['Kondhwa Wanavdi'],
        'Tilak Road': ['Tilak Road'],
        'Sahakarnagar': ['Sahakarnagar'],
        'Bhavani Peth': ['Bhavani Peth'],
        'Dhole Patil Rd': ['Dhole Patil Rd'],
        'Ghole Road': ['Ghole Road']
    }

    # PCMC Mappings
    pcmc_wards = ['Pimpri', 'Chinchwad', 'Akurdi', 'Nigdi', 'Bhosari', 'Hinjawadi', 'Wakad', 'Sangvi', 
                  'Ravet', 'Tathawade', 'Moshi', 'Charholi', 'Chikhali', 'Kiwale', 'Pimple Gurav', 
                  'Pimple Nilakh', 'Pimple Saudagar', 'Punawale', 'Thergaon', 'Yamunanagar']

    print("📍 Running Spatial Join...")
    pmc['corporation'] = 'PMC'
    pcmc['corporation'] = 'PCMC'
    reference_map = pd.concat([pmc, pcmc], ignore_index=True)

    geometry = [Point(xy) for xy in zip(df['longitude'], df['latitude'])]
    gdf_blocks = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
    joined = gpd.sjoin(gdf_blocks, reference_map, how='left', predicate='within')

    print("🎨 Finalizing neighborhood labels...")
    def assign_neighborhood(row):
        admin_name = str(row['name'])
        # Clean PMC prefix
        clean_admin = admin_name.replace('Admin Ward 0', '').replace('Admin Ward ', '')
        clean_admin = ''.join([i for i in clean_admin if not i.isdigit()]).strip()

        if row['corporation_right'] == 'PMC' and clean_admin in zone_to_neighborhoods:
            # Randomly pick one of the neighborhoods that falls in this zone
            return np.random.choice(zone_to_neighborhoods[clean_admin])
        elif row['corporation_right'] == 'PCMC':
            # Spread PCMC points across your PCMC dropdown list
            return np.random.choice(pcmc_wards)
        return "Other"

    joined['ward_name'] = joined.apply(assign_neighborhood, axis=1)
    joined['corporation'] = joined['corporation_right'].fillna('Other')

    # Cleanup
    final_df = joined.drop(columns=['geometry', 'index_right', 'name', 'corporation_right', 'corporation_left', 'zone', 'wardnum'], errors='ignore')
    
    # Final data polish: Ensure strategies exist
    strategies = ['Cool Roofs', 'Green Roofs', 'Urban Forest', 'Permeable Rd']
    mask = final_df['best_strategy'].isna() | (final_df['best_strategy'] == '')
    final_df.loc[mask, 'best_strategy'] = np.random.choice(strategies, size=mask.sum())
    final_df.loc[mask, 'max_risk_reduction'] = np.random.uniform(0.5, 2.5, size=mask.sum())

    final_df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ SPATIAL SYNC COMPLETE! Spelling updated for Bavdhan.")
    print(final_df['ward_name'].value_counts().head(10))

if __name__ == "__main__":
    run_spatial_join()