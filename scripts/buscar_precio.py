#!/usr/bin/env python3
"""
Presupuesto-Arq: Buscar precios en Notion
"""

import requests
import json
import sys

NOTION_KEY = "ntn_b88965504503Di8LgvJ4TziiWHLFrmTvINyzyeBOMjS4zU"
DB_ID = "35e21246-9632-81ea-936d-d4964dee89eb"

def search_precio(search_term, max_results=5):
    """Buscar precio en Notion por término"""
    
    url = f"https://api.notion.com/v1/databases/{DB_ID}/query"
    
    # Buscar solo en descripción
    data = {
        "filter": {
            "property": "Descripción",
            "rich_text": {"contains": search_term}
        },
        "page_size": max_results
    }
    
    headers = {
        "Authorization": f"Bearer {NOTION_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    try:
        r = requests.post(url, headers=headers, json=data, timeout=10)
        if r.status_code != 200:
            return {"error": r.text[:200]}
        
        results = r.json().get("results", [])
        items = []
        
        for item in results:
            props = item.get("properties", {})
            items.append({
                "categoria": props.get("Categoría", {}).get("select", {}).get("name", ""),
                "descripcion": props.get("Descripción", {}).get("rich_text", [{}])[0].get("plain_text", ""),
                "precio": props.get("Precio", {}).get("number", 0),
                "proveedor": props.get("Proveedor", {}).get("select", {}).get("name", "")
            })
        
        return {"results": items, "total": len(items)}
    
    except Exception as e:
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 buscar_precio.py <termino>")
        sys.exit(1)
    
    search = sys.argv[1]
    result = search_precio(search)
    
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()