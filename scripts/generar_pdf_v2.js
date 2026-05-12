#!/usr/bin/env node
/**
 * Generador de Presupuesto en PDF - MEJORADO
 * Diseño profesional
 */

const PDFKit = require('pdfkit');
const fs = require('fs');

function crearPresupuesto(datos, outputPath = 'presupuesto.pdf') {
    return new Promise((resolve, reject) => {
        const doc = new PDFKit({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 50, right: 50 }
        });
        
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Colores
        const negro = '#1a1a1a';
        const azul = '#2c5282';
        const gris = '#718096';
        const grisClaro = '#e2e8f0';
        
        // ========== HEADER con LINEA AZUL ==========
        doc.rect(0, 0, 595, 80).fill(azul);
        
        doc.fillColor('white');
        doc.fontSize(18).font('Helvetica-Bold').text('ARQ. LEONARDO DÍAZ', 50, 25);
        doc.fontSize(10).font('Helvetica').text('Presupuesto Global de Obra', 50, 48);
        
        doc.fontSize(9).font('Helvetica');
        doc.text('Ref: ' + (datos.referencia || 'PRE-2026-001'), 450, 25, { width: 100, align: 'right' });
        doc.text('Fecha: ' + (datos.fecha || 'Mayo 2026'), 450, 40, { width: 100, align: 'right' });
        
        // ========== DATOS DEL PROYECTO ==========
        let y = 110;
        
        doc.fillColor(negro);
        doc.fontSize(11).font('Helvetica-Bold').text('DATOS DEL PROYECTO', 50, y);
        y += 20;
        
        // Caja de datos
        doc.rect(50, y, 495, 70).fill(grisClaro);
        
        doc.fontSize(10).font('Helvetica');
        doc.fillColor(negro);
        
        const info = [
            ['Propietario:', datos.propietario || 'Cliente'],
            ['Ubicación:', datos.ubicacion || 'Tucumán'],
            ['Tipo de Obra:', datos.tipo || 'Obra Nueva'],
            ['Superficie:', (datos.superficie || '0') + ' m²'],
            ['Hormigon:', 'H-21'],
        ];
        
        let xInfo = 60;
        for (let i = 0; i < info.length; i++) {
            doc.font('Helvetica-Bold').text(info[i][0], xInfo, y + 10);
            doc.font('Helvetica').text(info[i][1], xInfo + 90, y + 10);
            if (i === 2) { xInfo = 300; y -= 15; }
            else { xInfo += 95; }
        }
        
        y += 80;
        
        // ========== RUBROS ==========
        doc.fontSize(11).font('Helvetica-Bold').fillColor(azul).text('DETALLE DE RUBROS', 50, y);
        y += 15;
        
        // Header tabla
        doc.rect(50, y, 495, 20).fill(azul);
        doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
        doc.text('#', 55, y + 5);
        doc.text('DESCRIPCIÓN', 80, y + 5);
        doc.text('CANT.', 280, y + 5);
        doc.text('MATERIALES', 360, y + 5);
        doc.text('MANO OBRA', 430, y + 5);
        doc.text('SUBTOTAL', 500, y + 5, { width: 40, align: 'right' });
        
        y += 22;
        
        // Datos rubros
        doc.fillColor(negro).font('Helvetica').fontSize(8);
        const rubros = datos.rubros || [];
        
        for (let i = 0; i < rubros.length; i++) {
            const r = rubros[i];
            
            // Alternating row
            if (i % 2 === 0) {
                doc.rect(50, y, 495, 14).fill('#f7fafc');
            }
            
            doc.text(r.num || String(i+1).padStart(2,'0'), 55, y + 3);
            doc.text(r.desc || '', 80, y + 3);
            doc.text(r.cant || '', 280, y + 3);
            doc.text(r.mat || '', 360, y + 3);
            doc.text(r.mo || '', 430, y + 3);
            doc.text(r.total || '', 500, y + 3, { width: 40, align: 'right' });
            
            y += 14;
        }
        
        y += 10;
        
        // ========== RESUMEN ==========
        doc.rect(350, y, 195, 90).fill('#edf2f7');
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor(negro);
        doc.text('RESUMEN FINANCIERO', 360, y + 10);
        
        doc.fontSize(9).font('Helvetica');
        doc.text('Materiales:', 360, y + 30);
        doc.text('Mano de Obra:', 360, y + 45);
        doc.text('Imprevistos (' + (datos.imprevistos || '10%') + '):', 360, y + 60);
        
        doc.font('Helvetica-Bold');
        doc.text(datos.totalMateriales || '$0', 545, y + 30, { width: 45, align: 'right' });
        doc.text(datos.totalMO || '$0', 545, y + 45, { width: 45, align: 'right' });
        doc.text(datos.totalImprevistos || '$0', 545, y + 60, { width: 45, align: 'right' });
        
        doc.rect(350, y + 75, 195, 1).fill(gris);
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL OBRA:', 360, y + 85);
        doc.text(datos.total || '$0', 545, y + 85, { width: 45, align: 'right' });
        
        y += 110;
        
        // ========== NOTAS ==========
        doc.fontSize(8).font('Helvetica').fillColor(gris);
        doc.text('NOTAS:', 50, y);
        doc.moveDown(0.3);
        
        doc.fillColor(negro);
        const notas = datos.notas || [
            '— MO albañilería al 65% sobre materiales (referencia NOA)',
            '— Tarifas UOCRA: Of. Esp. $6,011/h · Of. $5,142/h',
            '— El total puede variar ±15% según precios de mercado',
            '— No incluye: cerámica de piso · accesorios · luminarias · honorarios · IVA'
        ];
        
        for (const nota of notas) {
            doc.text(nota, 50);
        }
        
        // ========== FOOTER ==========
        doc.fontSize(8).fillColor(gris);
        doc.text('Arq. Leonardo Díaz · @soy.leo_ai ·', 50, 770);
        
        // Pie de página
        doc.rect(0, 780, 595, 40).fill(grisClaro);
        doc.fillColor(gris).fontSize(7);
        doc.text('Este presupuesto tiene carácter orientativo. No reemplaza cómputo-metraje detallado.', 50, 790, { width: 495, align: 'center' });
        
        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

// Demo con DATOS REALES de las 22 bases
const datosReales = {
    fecha: 'Mayo 2026',
    referencia: 'PRE-2026-001',
    fuente: 'Arq. & Const. NOA + Precios propios',
    propietario: 'Proyecto Base Columnas',
    ubicacion: 'Tucumán',
    tipo: 'Obra Nueva',
    superficie: '22 bases',
    
    rubros: [
        { num: '01', desc: 'Bases de columnas (22 uds)', cant: '10.10 m³', mat: '$1,860,480', mo: 'incl.', total: '$1,860,480' },
        { num: '02', desc: 'Excavación', cant: '5.63 m³', mat: '$84,480', mo: 'incl.', total: '$84,480' },
        { num: '03', desc: 'Mano de obra (global)', cant: '10.10 m²', mat: '-', mo: '$1,616,000', total: '$1,616,000' },
    ],
    
    totalMateriales: '$1,944,960',
    totalMO: '$1,616,000',
    inesperistos: '10%',
    totalImprevistos: '$356,096',
    total: '$3,560,961'
};

crearPresupuesto(datosReales, '/home/node/clawd/outputs/presupuesto_22bases.pdf')
.then(path => console.log('PDF creado:', path))
.catch(e => console.error('Error:', e.message));