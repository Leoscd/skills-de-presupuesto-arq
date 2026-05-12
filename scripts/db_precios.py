#!/usr/bin/env python3
"""
Base de datos de precios para presupuestos de construcción.
Prioridades:
1. CSV local (actualizable)
2. Notion DB
3. precios_arg.py (fallback hardcoded)
"""
import csv
import json
import os
from pathlib import Path

# Rutas
CSV_LOCAL = "/home/node/clawd/agente-presupuesto-telegram/empresas/_plantilla/precios_materiales.csv"
CSV_NOTION = "/home/node/clawd/presupuesto-arq/data/precios_notion.csv"
NOTION_API_DB = "35e21246963281ea936dd4964dee89eb"
NOTION_TOKEN = "ntn_b88965504503Di8LgvJ4TziiWHLFrmTvINyzyeBOMjS4zU"

# Fallback
from precios_arg import (
    H13, H17, H20, H21, H25, H30,
    ENCOFRADO_Madera, ENCOFRADO_Fenolico,
    HIERRO_6mm, HIERRO_8mm, HIERRO_10mm, HIERRO_12mm, HIERRO_16mm, HIERRO_20mm, HIERRO_25mm,
    TABLA_SALIGNA, TABLA_PINO, PUNTAL_3x3, VIGA_H20_2m, VIGA_H20_4m, TABLERO_FENOLICO,
    EXCAVACION, EXCAVACION_DURA,
    MO_ALBAÑIL, MO_CARPINTERO, MO_ESPECIALIZADO, MO_ENCOFRADO,
    ALAMBRE_ATAR, CLAVO_4,
    CIMIENTO_CONVENCIONAL, PIEDRA_MAMP,
)

# Cache
_cache = {'local': None, 'notion': None}

def load_csv(path):
    """Carga un CSV de precios."""
    db = {}
    if not os.path.exists(path):
        return db
    try:
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                codigo = row.get('codigo', row.get('Código', '')).strip().upper()
                if codigo:
                    db[codigo] = {
                        'descripcion': row.get('descripcion', row.get('Descripción', '')),
                        'unidad': row.get('unidad', row.get('Unidad', 'u')),
                        'precio': float(row.get('precio', row.get('Precio', 0))),
                    }
    except Exception as e:
        print(f"Error loading {path}: {e}")
    return db

def load_local():
    """Carga CSV local."""
    if _cache['local'] is None:
        _cache['local'] = load_csv(CSV_LOCAL)
        print(f"Loaded {len(_cache['local'])} prices from local CSV")
    return _cache['local']

def load_notion():
    """Carga CSV de Notion."""
    if _cache['notion'] is None:
        _cache['notion'] = load_csv(CSV_NOTION)
        print(f"Loaded {len(_cache['notion'])} prices from Notion CSV")
    return _cache['notion']

def refresh_notion():
    """Actualiza datos desde Notion API."""
    import requests
    url = f"https://api.notion.com/v1/databases/{NOTION_API_DB}/query"
    headers = {
        "Authorization": NOTION_TOKEN,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    try:
        r = requests.post(url, headers=headers, json={"page_size": 100}, timeout=30)
        data = r.json()
        
        # Save raw
        os.makedirs("/home/node/clawd/presupuesto-arq/data", exist_ok=True)
        with open("/home/node/clawd/presupuesto-arq/data/notion_precios.json", 'w') as f:
            json.dump(data, f)
        
        # Export CSV
        with open(CSV_NOTION, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['codigo','descripcion','unidad','precio','categoria'])
            
            for i, item in enumerate(data.get('results', []), 1):
                props = item.get('properties', {})
                desc = ' '.join([x.get('plain_text','') for x in props.get('Descripción', {}).get('rich_text', [])])
                precio = props.get('Precio', {}).get('number', 0)
                cat = props.get('Categoría', {}).get('select', {}).get('name', '')
                writer.writerow([f"NOTION_{i:03d}", desc, 'u', precio, cat])
        
        # Clear cache
        _cache['notion'] = None
        print("Notion updated!")
        return True
    except Exception as e:
        print(f"Notion update failed: {e}")
        return False

def buscar_precio(codigo, default=None):
    """
    Busca precio en orden: Local CSV → Notion → Fallback.
    """
    codigo = codigo.strip().upper()
    
    # 1. Local CSV
    local = load_local()
    if codigo in local:
        return local[codigo]['precio']
    
    # 2. Notion
    notion = load_notion()
    if codigo in notion:
        return notion[codigo]['precio']
    
    # 3. Fallback map
    fallback = {
        'H21': H21, 'H20': H20, 'H17': H17, 'H13': H13, 'H25': H25, 'H30': H30,
        'HIERRO_6': HIERRO_6mm, 'HIERRO_8': HIERRO_8mm, 
        'HIERRO_10': HIERRO_10mm, 'HIERRO_12': HIERRO_12mm,
        'HIERRO_16': HIERRO_16mm, 'HIERRO_20': HIERRO_20mm, 'HIERRO_25': HIERRO_25mm,
        'TABLA_SALIGNA': TABLA_SALIGNA, 'TABLA_PINO': TABLA_PINO,
        'PUNTAL': PUNTAL_3x3, 'VIGA_H20_2M': VIGA_H20_2m, 'VIGA_H20_4M': VIGA_H20_4m,
        'TABLERO_FENOLICO': TABLERO_FENOLICO,
        'ENCOFRADO_MADERA': ENCOFRADO_Madera, 'ENCOFRADO_FENOLICO': ENCOFRADO_Fenolico,
        'EXCAVACION': EXCAVACION, 'EXCAVACION_DURA': EXCAVACION_DURA,
        'MO_ALBAÑIL': MO_ALBAÑIL, 'MO_CARPINTERO': MO_CARPINTERO,
        'MO_ESPECIALIZADO': MO_ESPECIALIZADO, 'MO_ENCOFRADO': MO_ENCOFRADO,
        'ALAMBRE_ATAR': ALAMBRE_ATAR, 'CLAVO': CLAVO_4,
        'CIMIENTO': CIMIENTO_CONVENCIONAL, 'PIEDRA_MAMP': PIEDRA_MAMP,
    }
    
    if codigo in fallback:
        return fallback[codigo]
    
    if default is not None:
        return default
    
    print(f"WARNING: Price not found for {codigo}")
    return 0

def get_sources():
    """Retorna info de fuentes."""
    return {
        'local_csv': {'path': CSV_LOCAL, 'items': len(load_local())},
        'notion': {'path': CSV_NOTION, 'items': len(load_notion())},
    }

if __name__ == "__main__":
    print("=== Precios DB ===")
    print(f"Sources: {get_sources()}")
    
    print("\n--- Test search ---")
    test = ['CHAPA_GALV_075', 'CEMENTO_PORTLAND', 'HIERRO_10', 'EXCAVACION']
    for t in test:
        print(f"  {t}: ${buscar_precio(t):,.0f}")