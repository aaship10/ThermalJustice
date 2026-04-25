import pandas as pd
import numpy as np

def smart_ward_tagging():
    print("📖 Loading dashboard data...")
    df = pd.read_csv('data/pune_dashboard_final.csv')
    
    # 1. Identify the 88k REAL blocks (where the strategy is NOT empty or 'None')
    valid_strategies = ['Cool Roofs', 'Green Roofs', 'Urban Forest', 'Permeable Rd']
    real_blocks_mask = df['best_strategy'].isin(valid_strategies)
    
    real_indices = df[real_blocks_mask].index
    print(f"🌆 Found {len(real_indices)} REAL city blocks. Distributing to Wards...")

    # 2. Divide the real blocks evenly among your demo Wards
    chunks = np.array_split(real_indices, 5)
    
    # Reset all wards to 'Other' first
    df['ward_name'] = 'Other'
    
    # Assign the real blocks to specific wards
    df.loc[chunks[0], 'ward_name'] = 'Kothrud'
    df.loc[chunks[1], 'ward_name'] = 'Viman Nagar'
    df.loc[chunks[2], 'ward_name'] = 'Baner'
    df.loc[chunks[3], 'ward_name'] = 'Wakad'
    df.loc[chunks[4], 'ward_name'] = 'Hinjawadi'

    # 3. Fix the Corporation labels
    df['corporation'] = np.where(df['ward_name'].isin(['Wakad', 'Hinjawadi']), 'PCMC', 'PMC')

    # 4. Save it
    df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ SMART TAGGING COMPLETE! The optimizer will now feast on real data.")

if __name__ == "__main__":
    smart_ward_tagging()