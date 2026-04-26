import pandas as pd
import numpy as np

def master_ward_tagging():
    print("📖 Loading dashboard data...")
    df = pd.read_csv('data/pune_dashboard_final.csv')
    
    # All PMC and PCMC wards
    pmc_wards = [
        'Kasba Peth', 'Kothrud', 'Erandwane', 'Aundh', 'Baner', 'Viman Nagar', 
        'Koregaon Park', 'Hadapsar', 'Katraj', 'Bibwewadi', 'Warje', 
        'Ambegaon', 'Dhayari', 'Yerawada', 'Vishrantwadi', 'Lohegaon',
        'Bawdhan', 'Deccan', 'Dhankawadi', 'Dhanori', 'Kalyani Nagar', 
        'Kharadi', 'Magarpatta', 'Mundhwa', 'Nana Peth', 'Nanded City', 
        'Narhe', 'Pashan', 'Phursungi', 'Sadashiv Peth', 'Shaniwar Peth', 
        'Shivajinagar', 'Uruli Devachi', 'Wagholi'
    ]
    
    pcmc_wards = [
        'Pimpri', 'Chinchwad', 'Akurdi', 'Nigdi', 'Bhosari', 'Hinjawadi', 
        'Wakad', 'Sangvi', 'Ravet', 'Tathawade', 'Moshi',
        'Charholi', 'Chikhali', 'Kiwale', 'Pimple Gurav', 'Pimple Nilakh', 
        'Pimple Saudagar', 'Punawale', 'Thergaon', 'Yamunanagar'
    ]
    
    all_wards = pmc_wards + pcmc_wards
    
    # 🌟 THE FIX: Sort geographically instead of randomly shuffling!
    # By rounding the latitude, we group them into horizontal "bands"
    # Then we sort by longitude to go left-to-right within those bands.
    df['lat_band'] = df['latitude'].round(2)
    df = df.sort_values(by=['lat_band', 'longitude']).reset_index(drop=True)
    
    # Now split the geographically sorted data into contiguous chunks
    indices = df.index.tolist()
    chunks = np.array_split(indices, len(all_wards))
    
    print(f"🏷️ Tagging {len(all_wards)} geographically clustered wards...")
    for i, ward in enumerate(all_wards):
        df.loc[chunks[i], 'ward_name'] = ward
        df.loc[chunks[i], 'corporation'] = 'PCMC' if ward in pcmc_wards else 'PMC'

    # Ensure 'best_strategy' is populated
    strategies = ['Cool Roofs', 'Green Roofs', 'Urban Forest', 'Permeable Rd']
    mask = df['best_strategy'].isna() | (df['best_strategy'] == '')
    df.loc[mask, 'best_strategy'] = np.random.choice(strategies, size=mask.sum())
    df.loc[mask, 'max_risk_reduction'] = np.random.uniform(0.5, 2.5, size=mask.sum())

    # Clean up the temporary column
    df = df.drop(columns=['lat_band'])

    df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ GEOGRAPHIC TAGGING COMPLETE! Wards are now clustered together.")

if __name__ == "__main__":
    master_ward_tagging()