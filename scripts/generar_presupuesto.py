#!/usr/bin/env python3
"""
Generador de presupuestos de arquitectura — formato Leo Díaz
Usa el template/template_presupuesto.html como base.

用法:
    python3 generar_presupuesto.py <obra> <ref> <mes> <fecha> "<info_json>"
    
Ejemplo:
    python3 generar_presupuesto.py "Casa Paz" "COMP-PAZ-2026-001" "Mayo" "18/05/2026" '[["01","Muros","168 m²","$89.000","$14.952.000"],["02","Revoques","228 m²","$18.000","$4.104.000"]]'

El JSON es una lista de rubros, cada rubro es:
    [num_seccion, titulo_rubro, [[n_item, desc, cant, unit, total], ...]]
"""
import json
import sys
import re
from pathlib import Path

TEMPLATE = Path(__file__).parent / "template_presupuesto.html"
OUTPUT = Path("/tmp/presupuesto_generado.html")


def _notas_default():
    return """• Precios en Pesos Argentinos — Mes Año. Fuente: mercado local Tucumán.
• El total puede variar ±15% según precios de mercado actualizados.
• Sin honorarios de arquitecto · Sin cerámica de pisos · Sin artefactos.
• Instrumento: Arq. Leonardo Díaz · @soy.leo_ai · soyleoai.com"""


def generar(titulo_obra: str, ref: str, mes: str, info_cliente: dict,
            rubros_data: list, notas: str = "", output_path: str = None) -> str:
    """
    Genera HTML de presupuesto.
    
    Args:
        titulo_obra: Nombre de la obra
        ref: Referencia (ej: COMP-PAZ-2026-001)
        mes: Mes y año (ej: Mayo 2026)
        info_cliente: dict con keys: cliente, ubicacion, tipo, superficie, hormigon
        rubros_data: lista de dicts con keys: seccion, titulo, items
            items = lista de [num, descripcion, detalle, cantidad, unitario, total]
        notas: string con notas (separadas por •)
        output_path: ruta de salida (None = /tmp/...)
    """
    template = TEMPLATE.read_text(encoding="utf-8")

    # Reemplazos de cabecera
    template = re.sub(r'(?<=Ref: ).*(?=<\/div>)', ref, template)
    template = re.sub(r'(?<=<strong>).*?(?=<\/strong>\s*<br)', f'{mes}', template, flags=re.DOTALL)
    template = re.sub(r'Nombre de Obra', titulo_obra, template)
    template = re.sub(r'(?<=<label>Cliente</label>\s*<span>).*?(?=</span>)',
                      info_cliente.get('cliente', '---'), template)
    template = re.sub(r'(?<=<label>Ubicación</label>\s*<span>).*?(?=</span>)',
                      info_cliente.get('ubicacion', 'Tucumán, Arg.'), template)
    template = re.sub(r'(?<=<label>Tipo de Obra</label>\s*<span>).*?(?=</span>)',
                      info_cliente.get('tipo', 'Obra Nueva'), template)
    template = re.sub(r'(?<=<label>Superficie</label>\s*<span>).*?(?=</span>)',
                      info_cliente.get('superficie', '---'), template)
    template = re.sub(r'(?<=<label>Hormigón</label>\s*<span>).*?(?=</span>)',
                      info_cliente.get('hormigon', 'H-21'), template)

    # Generar bloques de rubros
    bloques_rubros = []
    for rubric in rubros_data:
        num_sec = rubric['seccion']
        titulo_sec = rubric['titulo']
        items = rubric['items']

        # Cabecera de sección
        seccion_html = f'<div class="rubro-seccion"><span class="seccion-badge">{num_sec}</span>{titulo_sec}</div>\n<table>\n<thead>\n<tr>\n<th>#</th>\n<th>Descripción</th>\n<th>Cantidad</th>\n<th>Precio Unit.</th>\n<th>Total</th>\n</tr>\n</thead>\n<tbody>\n'

        for item in items:
            n, desc, detalle, cant, unit, total = item
            seccion_html += f'''<tr>
<td>{n}</td>
<td>
    <div class="descripcion">{desc}</div>
    <div class="detalle">{detalle}</div>
</td>
<td>{cant}</td>
<td>{unit}</td>
<td>{total}</td>
</tr>
'''

        seccion_html += '</tbody>\n</table>\n'
        bloques_rubros.append(seccion_html)

    # Encontrar donde inyectar los rubros (después de .rubros-titulo)
    template = re.sub(
        r'(<div class="rubros-titulo">.*?</div>\s*)',
        r'\1\n            ' + '\n            '.join(bloques_rubros),
        template,
        flags=re.DOTALL
    )

    # Notas
    if notas:
        notas_html = '\n'.join(f'<li>• {n.strip()}</li>' for n in notas.split('•') if n.strip())
        template = re.sub(
            r'(<ul>\s*).*?(\s*</ul>)',
            rf'\1{notas_html}\2',
            template,
            flags=re.DOTALL
        )
    else:
        template = re.sub(
            r'<li>• Nota 1.*',
            _notas_default().replace('\n', '</li>\n<li>• '),
            template,
            flags=re.DOTALL
        )

    out = output_path or str(OUTPUT)
    Path(out).write_text(template, encoding='utf-8')
    return out


def main():
    if len(sys.argv) < 2:
        # Ejemplo interactivo
        info = {
            'cliente': 'Casa Paz',
            'ubicacion': 'Tucumán, Arg.',
            'tipo': 'Obra Nueva',
            'superficie': '~220 m²',
            'hormigon': 'H-21',
        }
        rubros = [
            {
                'seccion': '01',
                'titulo': 'Muros — RETAK 21 sin revoque',
                'items': [['01', 'Muro Exterior RETAK 21 sin revoque', 'Ladrillo RETAK 21 · 30 und/m² · mortero + colocación', '168,00 m²', '$ 89.000', '$ 14.952.000']]
            },
            {
                'seccion': '02',
                'titulo': 'Muros — RETAK 12.5 sin revoque',
                'items': [['02', 'Muro Interior RETAK 12.5 sin revoque', 'Ladrillo RETAK 12.5 · 16 und/m² · mortero + colocación', '98,00 m²', '$ 50.000', '$ 4.900.000']]
            },
        ]
        path = generar("Casa Paz", "COMP-PAZ-2026-001", "Mayo 2026", info, rubros)
        print(f"Generado: {path}")
        return

    obra = sys.argv[1]
    ref = sys.argv[2]
    mes = sys.argv[3]
    data = json.loads(sys.argv[4])

    info = data.get('info', {})
    rubros = data.get('rubros', [])
    notas = data.get('notas', '')
    output = data.get('output', '')

    path = generar(obra, ref, mes, info, rubros, notas, output or None)
    print(f"Generado: {path}")


if __name__ == "__main__":
    main()