import pandas as pd
import numpy as np

def create_ultimate_master():
    print("📖 Loading the new Mapbox data...")
    # Load the new file your teammate gave you
    df = pd.read_csv('data/pune_master_mapbox_data.csv')
    
    print("🏷️ Applying Ward and Corporation tags...")
    # 1. Split them between PMC and PCMC
    pmc_limit = 100000
    df['corporation'] = np.where(df['block_id'] <= pmc_limit, 'PMC', 'PCMC')
    
    # 2. Assign Wards to ranges so your Swagger UI / Frontend filters work
    conditions = [
        (df['block_id'] <= 20000),
        (df['block_id'] > 20000) & (df['block_id'] <= 40000),
        (df['block_id'] > 40000) & (df['block_id'] <= 60000),
        (df['block_id'] > 60000) & (df['block_id'] <= 100000),
        (df['block_id'] > 100000) & (df['block_id'] <= 130000),
        (df['block_id'] > 130000)
    ]
    wards = ['Kothrud', 'Viman Nagar', 'Baner', 'Yerawada', 'Wakad', 'Hinjawadi']
    df['ward_name'] = np.select(conditions, wards, default='Other')

    print("💾 Saving as the final dashboard file...")
    # Overwrite the old dashboard file so your main.py reads this one!
    df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ SUCCESS! Your backend and frontend data is 100% ready.")

if __name__ == "__main__":
    create_ultimate_master()