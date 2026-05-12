#!/usr/bin/env python3
"""
Presupuesto-Arq: Calcular con reglas de construcción
"""

import json
import sys

# Reglas de construcción (% extra por overlap/desperdicio)
REGLAS = {
    "chapa sinusoidal": 0.10,      # 10% overlap
    "chapa trapezoidal": 0.08,     # 8% overlap
    "chapa": 0.10,                 # 10% default
    "ceramico": 0.10,              # 10% rotura
    "piso ceramico": 0.10,
    "pintura": 0.15,               # 15% desperdicio
    "piso": 0.05,                  # 5% rotura
    "hydro": 0.05,
    "cable": 0.20,                 # 20% conexiones
    "cableado": 0.20,
    "hierro": 0.05,                # 5% desperdicio
    "acero": 0.05,
    "hormigon": 0.10,              # 10% perdidas
    "mamposteria": 0.10,
    "techo": 0.15,                 # 15% general
    "default": 0.10                # 10% default
}

def get_regla(item_descripcion):
    """Obtener el % extra según el tipo de material"""
    item_lower = item_descripcion.lower()
    
    for material, regla in REGLAS.items():
        if material in item_lower:
            return regla
    
    return REGLAS["default"]

def calcular_item(cantidad, precio_unitario, descripcion=""):
    """Calcular total de un item con regla aplicada"""
    
    regla = get_regla(descripcion)
    cantidad_con_extra = cantidad * (1 + regla)
    total = cantidad_con_extra * precio_unitario
    
    return {
        "cantidad_base": cantidad,
        "cantidad_con_extra": round(cantidad_con_extra, 2),
        "regla": f"+{int(regla*100)}%",
        "precio_unitario": precio_unitario,
        "total": round(total, 2)
    }

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 calcular.py <cantidad> <precio> [descripcion]")
        print("Example: python3 calcular.py 27 85000 'chapa sinusoidal'")
        sys.exit(1)
    
    cantidad = float(sys.argv[1])
    precio = float(sys.argv[2])
    descripcion = sys.argv[3] if len(sys.argv) > 3 else ""
    
    result = calcular_item(cantidad, precio, descripcion)
    
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()