---
name: presupuesto-arq
description: Genera presupuestos de arquitectura profesionales desde imágenes/planos/PDFs. Analiza planos, extrae cómputos métricos, busca precios, calcula costos y genera PDF listo para imprimir. Usar cuando Leo pide un presupuesto de obra, pasa un plano o computo métrico, o quiere calcular costos de materiales/obra.
---

# Skill: Presupuesto de Arquitectura

Genera presupuestos profesionales para proyectos de arquitectura en Argentina.

## Flujo completo

```
1. Recibir datos → 2. Extraer cómputo → 3. Buscar precios → 4. Calcular → 5. Generar PDF
```

### Paso 1: Recibir datos

Leo puede pasar:
- **Imagen** (foto de plano, plano escaneado)
- **PDF** (plano técnico, computo métrico)
- **Datos en texto** (m², materiales, medidas escritas)

Si pasa un PDF:
1. Usar `scripts/pdf_a_imagen.py` para convertir a PNG
2. Analizar la imagen resultante

### Paso 2: Extraer cómputo métrico

Analizar la imagen/datos y extraer:

```
RUBRO          | MATERIAL           | SUPERFICIE | ESPESOR/LADRILLO | CANTIDAD
Muros Ext.     | RETAK 21           | 168 m²     | 30 ladrillos/m²  | 
Muros Int.     | RETAK 12.5         | 98 m²      | 16 ladrillos/m²   |
Revoques Int.  | Revoque Interior   | 228 m²     |                  |
Rev. Piedra    | Piedra 20cm         | 161 m²     |                  |
Pisos          | (por confirmar)    | ... m²     |                  |
```

Datos necesarios: superficie (m²), tipo de material, espesor/Medidas, cantidad de elementos.

### Paso 3: Buscar precios

**Orden de búsqueda:**

1. **Notion** (primero, más actualizado):
   ```python
   from scripts.buscar_precio import search_precio
   result = search_precio("porcelanato 60x60")
   # DB Notion: 35e21246-9632-81ea-936d-d4964dee89eb
   ```

2. **precios_arg.py** (fallback, lista local):
   ```python
   from scripts.precios_arg import (
       PORCELANATO_60x60, CERAMICA_30x60,
       HIERRO_10mm, H17,
       MO_ALBAÑIL, PUNTO_ELECTRICO,
       # ... todos los precios definidos
   )
   ```
   Incluye: hormigones, hierros, mano de obra UOCRA, instalaciones, porcelanatos, cerámicas, revestimi entos,etc.

3. **Estimación manual** si no hay precio: informar y estimar.

### Paso 4: Calcular

Usar `scripts/calcular.py` para aplicar reglas de desperdicio:

```python
from scripts.calcular import calcular_item

resultado = calcular_item(cantidad=168, precio_unitario=89000, descripcion="ladrillo")
# Agrega +10% por desperdicio automáticamente
# Devuelve: cantidad_base, cantidad_con_extra, regla, precio_unitario, total
```

**Reglas de desperdicio incluidas:**
- Chapa: +10%
- Cerámico/Piso: +10%
- Pintura: +15%
- Cable: +20%
- Hierro/Aceros: +5%
- Hormigón: +10%
- Default: +10%

### Paso 5: Generar PDF

**Opción A — HTML profesional** (preferida):
```python
# Generar HTML con formato_presupuesto.py
#然后用 node generar_pdf_v4.js o convertir a PDF manualmente
```

**Opción B — HTML directo** (más simple):
Generar HTML con este formato básico:
```html
<h1PRESUPUESTO DE OBRA</h1>
<table>
  <tr><th>Rubro</th><th>Cantidad</th><th>Precio Unit.</th><th>Total</th></tr>
  ...
</table>
<p><strong>TOTAL:</strong> $X</p>
```

Guardar en `/home/node/.openclaw/workspace/presupuesto.html` para que Leo lo abra e imprima a PDF.

## Scripts disponibles

| Script | Función |
|--------|---------|
| `pdf_a_imagen.py` | Convierte página de PDF a PNG para análisis |
| `precios_arg.py` | Lista completa de preciosARG (Mayo 2026) |
| `buscar_precio.py` | Busca precio en Notion (API) |
| `calcular.py` | Aplica reglas de desperdicio y calcula totales |

## Precios clave (Mayo 2026)

### Materiales
| Item | Precio |
|------|--------|
| Ladrillo RETAK 21 | ~$89.000/m² (30 ladrillos) |
| Ladrillo RETAK 12.5 | ~$50.000/m² (16 ladrillos) |
| Hormigón H17 | $184.206/m³ |
| Hierro Ø10mm | $4.000/kg |
| Porcelanato 60x60 | $32.000/m² colocado |
| CERÁMICA 30x60 | $23.000/m² |
| Piedra (revestimiento) | Consultar (variable) |

### Mano de obra (UOCRA)
| Item | Precio |
|------|--------|
| Albañil general | $25.000/m² |
| Oficial especializado | $6.011/hora |
| Instalación punto eléctrico | $35.000/punto |

### Instalaciones (MO, sin materiales)
| Item | Precio |
|------|--------|
| Punto eléctrico | $35.000 |
| Punto agua | $47.500 |
| Boca cloaca | $47.500 |
| Baño nuevo (comple to) | $180-300k |

## Errores comunes y soluciones

- **"No tengo el precio"** → Buscar en Notion primero, luego en precios_arg.py, luego informar
- **"La imagen no se ve bien"** → Pedir a Leo que mande foto más clara o en formato PNG
- **"No puedo analisar el PDF"** → Usar `pdf_a_imagen.py` (requiere PyMuPDF)
- **"El cálculo parece raro"** → Verificar m² vs cantidad de ladrillos (RETAK 21 = 30/m², RETAK 12.5 = 16/m²)

## Workflow para presupuesto rápido

1. Leo pasa datos (imagen/PDF/texto)
2. Extraer cómputo en tabla clara
3. Buscar precios relevantes
4. Calcular con `calcular_item` por rubro
5. Sumar mano de obra (~65% de materiales como referencia)
6. Generar HTML en `/home/node/.openclaw/workspace/presupuesto.html`
7. Informar a Leo que lo abra e imprima a PDF

## Ubicación de trabajo

- Working directory: `/home/node/.openclaw/workspace/skills-de-presupuesto-arq`
- Scripts: `scripts/`
- Precios locales: `scripts/precios_arg.py`
- Notion API key: `ntn_b88965504503Di8LgvJ4TziiWHLFrmTvINyzyeBOMjS4zU`
- Notion DB: `35e21246-9632-81ea-936d-d4964dee89eb`

## Notas

- Precios en ARS (pesos argentinos) — Mayo 2026
- Actualizar precios_arg.py periódicamente
- La DB de Notion cubre: ladrillos, hierros, hormigón, instalaciones, adhesivos
- Categorías faltantes en Notion: pisos/porcelanatos (usar precios_arg.py como fallback)
- Honorarios de arquitecto: no incluídos en el cálculo base