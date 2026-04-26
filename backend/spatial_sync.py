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
    print("🚀 Starting Geographically Intelligent Sync for PMC & PCMC...")
    df = pd.read_csv('data/pune_dashboard_final.csv')
    pmc = load_geojson('data/pune-admin-wards.geojson')
    pcmc = load_geojson('data/pcmc-electoral-wards.geojson')
    
    # 1. Standardize Admin/Zone Names
    pmc['corporation'] = 'PMC'
    pmc['parent_zone'] = pmc['name'].str.replace(r'Admin Ward \d+ ', '', regex=True)
    
    pcmc['corporation'] = 'PCMC'
    # PCMC GeoJSON has a 'zone' property (A, B, C, D, E, F)
    pcmc['parent_zone'] = 'Zone ' + pcmc['zone']

    reference_map = pd.concat([pmc, pcmc], ignore_index=True)

    # 2. Spatial Join
    print("📍 Mapping blocks to PMC/PCMC boundaries...")
    geometry = [Point(xy) for xy in zip(df['longitude'], df['latitude'])]
    gdf_blocks = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
    joined = gpd.sjoin(gdf_blocks, reference_map, how='left', predicate='within')

    # 3. MASTER GEOGRAPHIC PARTITIONING DICTIONARY
    # We sort neighborhoods from West to East (Longitude) for every zone
    master_mapping = {
        # --- PMC ZONES ---
        'Aundh': ['Pashan', 'Baner', 'Aundh'],
        'Kothrud Karveroad': ['Bavdhan', 'Kothrud', 'Erandwane'],
        'Warje Karvenagar': ['Dhayari', 'Warje'],
        'Dhankawadi': ['Nanded City', 'Narhe', 'Ambegaon', 'Dhankawadi', 'Katraj'],
        'Hadapsar': ['Mundhwa', 'Magarpatta', 'Hadapsar', 'Phursungi', 'Uruli Devachi'],
        'Nagar Road': ['Kalyani Nagar', 'Viman Nagar', 'Dhanori', 'Kharadi', 'Wagholi'],
        'Yerawda - Sangamwadi': ['Yerawada', 'Koregaon Park', 'Vishrantwadi', 'Lohegaon'],
        'KasbaVishrambaugwada': ['Deccan', 'Shivajinagar', 'Shaniwar Peth', 'Kasba Peth', 'Nana Peth'],

        # --- PCMC ZONES ---
        'Zone D': ['Hinjawadi', 'Punawale', 'Tathawade', 'Wakad', 'Ravet'], # West PCMC
        'Zone F': ['Nigdi', 'Akurdi', 'Yamunanagar'], # North-West
        'Zone A': ['Chinchwad', 'Pimpri'], # Central
        'Zone B': ['Kiwale', 'Chikhali'], # North
        'Zone E': ['Bhosari', 'Moshi', 'Charholi'], # East PCMC
        'Zone C': ['Thergaon', 'Pimple Nilakh', 'Pimple Saudagar', 'Pimple Gurav', 'Sangvi'] # South-East
    }

    def partition_geographically(group):
        zone = group.name
        if zone in master_mapping:
            sub_neighborhoods = master_mapping[zone]
            # 🌟 Sort all blocks in this zone by Longitude (West to East)
            group = group.sort_values(by='longitude')
            
            indices = group.index.tolist()
            chunks = np.array_split(indices, len(sub_neighborhoods))
            
            for i, name in enumerate(sub_neighborhoods):
                group.loc[chunks[i], 'ward_name'] = name
        else:
            group['ward_name'] = zone
        return group

    print("🎯 Sorting all 54 neighborhoods geographically...")
    final_gdf = joined.groupby('parent_zone', group_keys=False).apply(partition_geographically)

    # 4. Final Cleanup
    final_gdf['ward_name'] = final_gdf['ward_name'].fillna('Other')
    final_gdf['corporation'] = final_gdf['corporation_right'].fillna('Other')
    
    final_df = final_gdf.drop(columns=[
        'geometry', 'index_right', 'name', 'parent_zone', 
        'corporation_right', 'corporation_left', 'zone', 'wardnum'
    ], errors='ignore')

    # 5. Save the final synchronized CSV
    final_df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ MASTER SYNC COMPLETE! Both PMC and PCMC are now geographically intelligent.")
    
    # Display results to verify
    print("\nSample PCMC Accuracy:")
    print(final_df[final_df['ward_name'].isin(['Hinjawadi', 'Bhosari'])].groupby('ward_name')['longitude'].mean())

if __name__ == "__main__":
    run_spatial_join()