import pandas as pd

# CSV file load kara (Global variable jene karun speed waadhel)
# Tumchi dashboard file ithe load hot aahe
try:
    DASHBOARD_DATA = pd.read_csv('data/pune_dashboard_final.csv')
except:
    DASHBOARD_DATA = pd.DataFrame()

def filter_by_ward(df, area_input):
    """
    User ne dilelya area nawa nusar blocks filter karto.
    1. Jar 'PMC' kiwa 'PCMC' asel tar purna city filter hote.
    2. Jar specific ward asel (e.g. 'Baner') tar to ward filter hoto.
    """
    if not area_input:
        return df.copy()

    input_clean = area_input.strip().upper()

    # Case 1: Purna Corporation filter (PMC/PCMC)
    # Yaasathi tumcha CSV madhe 'corporation' column asne garjeche aahe
    if input_clean in ["PMC", "PUNE MUNICIPAL CORPORATION"]:
        if 'corporation' in df.columns:
            return df[df['corporation'].str.upper() == "PMC"].copy()
        return df.copy() # Fallback jar column nasel tar

    if input_clean in ["PCMC", "PIMPRI-CHINCHWAD MUNICIPAL CORPORATION"]:
        if 'corporation' in df.columns:
            return df[df['corporation'].str.upper() == "PCMC"].copy()
        return df.copy()

    # Case 2: Specific Ward filter (e.g. 'Kothrud', 'Hinjawadi')
    column = 'ward_name' if 'ward_name' in df.columns else 'ward'
    
    if column in df.columns:
        # Partial match (jar user ne 'Koth' takle tar 'Kothrud' sapdel)
        filtered = df[df[column].str.contains(area_input, case=False, na=False)].copy()
        return filtered

    return df.copy()