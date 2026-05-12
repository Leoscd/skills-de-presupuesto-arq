#!/usr/bin/env python3
"""
Generador de Presupuesto en PDF
Based on formato_presupuesto.py
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys
import os

# Register font (minimal - using built-in)
pdfmetrics.registerFont(TTFont('Helvetica', 'Helvetica'))

def crear_presupuesto(datos, output_path="presupuesto.pdf"):
    """Crear PDF de presupuesto"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        spaceAfter=10,
        alignment=1  # Center
    )
    
    # Story
    story = []
    
    # Header
    story.append(Paragraph("ARQ. LEONARDO DÍAZ", title_style))
    story.append(Paragraph("PRESUPUESTO GLOBAL DE OBRA", title_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Datos principales
    datos_tabla = [
        ["Fecha:", datos.get('fecha', 'Mayo 2026')],
        ["Ref.:", datos.get('referencia', 'PRE-2026-001')],
        ["Propietario:", datos.get('propietario', 'Cliente')],
        ["Ubicación:", datos.get('ubicacion', 'Tucumán')],
        ["Tipo:", datos.get('tipo', 'Obra Nueva')],
        ["Superficie:", f"{datos.get('superficie', '0')} m²"],
    ]
    
    t = Table(datos_tabla, colWidths=[4*cm, 10*cm])
    t.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))
    
    # Rubros
    if 'rubros' in datos:
        story.append(Paragraph("<b>RUBROS</b>", styles['Heading3']))
        story.append(Spacer(1, 0.3*cm))
        
        # Table header
        header = ['#', 'Descripción', 'Cantidad', 'Materiales', 'MO', 'Total']
        table_data = [header]
        
        for i, rub in enumerate(datos['rubros']):
            table_data.append([
                rub.get('num', str(i+1).zfill(2)),
                rub.get('desc', ''),
                rub.get('cant', ''),
                rub.get('mat', ''),
                rub.get('mo', ''),
                rub.get('total', ''),
            ])
        
        # Rubros table
        col_w = [1*cm, 6*cm, 2*cm, 3*cm, 3*cm, 3*cm]
        rt = Table(table_data, colWidths=col_w)
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ]))
        story.append(rt)
        story.append(Spacer(1, 0.5*cm))
    
    # Totales
    totales = [
        ["MATERIALES", datos.get('total_materiales', '$0')],
        ["MANO DE OBRA", datos.get('total_mo', '$0')],
        ["IMPREVISTOS", datos.get('imprevistos', '10%')],
        ["", ""],
        ["TOTAL ESTIMADO", datos.get('total', '$0')],
    ]
    
    tt = Table(totales, colWidths=[10*cm, 6*cm])
    tt.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,-1), (1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(tt)
    story.append(Spacer(1, 1*cm))
    
    # Notas
    notas = """
    NOTAS:<br/>
    — MO albañilería al 65% sobre materiales (referencia NOA).<br/>
    — Tarifas UOCRA: Of. Esp. $6.011/h · Of. $5.142/h.<br/>
    — El total puede variar ±15% según precios de mercado actualizados.<br/>
    — No incluye: cerámica de piso · accesorios · luminarias · honorarios · IVA.
    """
    story.append(Paragraph(notas, styles['Normal']))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("Arq. Leonardo Díaz · @soy.leo_ai", styles['Normal']))
    
    # Build
    doc.build(story)
    return output_path

def main():
    if len(sys.argv) < 2:
        # Demo data
        datos = {
            'fecha': 'Mayo 2026',
            'referencia': 'PRE-2026-001',
            'propietario': 'Cliente Ejemplo',
            'ubicacion': 'Tucumán',
            'tipo': 'Obra Nueva',
            'superficie': '26',
            'rubros': [
                {'num': '01', 'desc': 'Bases de fundación', 'cant': '4 bases 80x80x40', 'mat': '$244.945', 'mo': 'incl.', 'total': '$244.945'},
                {'num': '02', 'desc': 'Encadenados horizontales', 'cant': '16 ml', 'mat': '$246.805', 'mo': 'incl.', 'total': '$246.805'},
                {'num': '03', 'desc': 'Encadenados verticales', 'cant': '4 columnas', 'mat': '$306.605', 'mo': 'incl.', 'total': '$306.605'},
                {'num': '04', 'desc': 'Mampostería', 'cant': '55 m²', 'mat': '$717.695', 'mo': 'incl.', 'total': '$717.695'},
                {'num': '05', 'desc': 'Cubierta', 'cant': '26 m²', 'mat': '$1.279.386', 'mo': 'incl.', 'total': '$1.279.386'},
            ],
            'total_materiales': '$6.494.505',
            'total_mo': '$4.875.268',
            'imprevistos': '10%',
            'total': '$12.506.750',
        }
    else:
        # Parse JSON
        import json
        datos = json.loads(sys.argv[1])
    
    output = datos.get('output', 'presupuesto.pdf')
    crear_presupuesto(datos, output)
    print(f"PDF creado: {output}")

if __name__ == "__main__":
    main()