import pandas as pd

def fix_strategy():
    print("📖 Loading dashboard data...")
    df = pd.read_csv('data/pune_dashboard_final.csv')
    
    # Rikamya (NaN) values la 'None' word ne replace kara
    df['best_strategy'] = df['best_strategy'].fillna('None')
    
    # Save the file back
    df.to_csv('data/pune_dashboard_final.csv', index=False)
    print("✅ Success! Empty strategies are now filled with 'None'.")

if __name__ == "__main__":
    fix_strategy()