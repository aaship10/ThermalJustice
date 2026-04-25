import os
import requests
from dotenv import load_dotenv

# Load variables from .env into the system environment
load_dotenv()

def get_live_scaling():
    # Fetch the key from the environment
    api_key = os.getenv("OPENWEATHER_API_KEY")
    
    if not api_key:
        print("⚠️ Warning: OPENWEATHER_API_KEY not found in .env")
        return 41.5, 3.5 # Fallback
        
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q=Pune&appid={api_key}&units=metric"
        response = requests.get(url, timeout=5).json()
        
        if response.get("cod") != 200:
            raise Exception(response.get("message"))
            
        live_temp = response['main']['temp_max']
        baseline_avg = 38.0 
        shift = live_temp - baseline_avg
        return live_temp, shift
        
    except Exception as e:
        print(f"Weather API Error: {e}")
        return 41.5, 3.5