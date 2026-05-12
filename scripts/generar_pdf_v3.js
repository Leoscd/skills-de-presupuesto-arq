#!/usr/bin/env node
/**
 * Generador de Presupuesto PDF - LAYOUT A4 OPTIMIZADO
 * Formato compacto profesional
 */

const PDFKit = require('pdfkit');
const fs = require('fs');

function crearPresupuesto(datos, outputPath = 'presupuesto.pdf') {
    return new Promise((resolve, reject) => {
        const doc = new PDFKit({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // ========== COLORES ==========
        const AZUL = '#1e40af';
        const AZUL_CLARO = '#3b82f6';
        const GRIS = '#64748b';
        const GRIS_FONDO = '#f1f5f9';
        const NEGRO = '#0f172a';
        
        // ========== HEADER ==========
        doc.rect(0, 0, 595, 60).fill(AZUL);
        doc.fillColor('white');
        doc.fontSize(14).font('Helvetica-Bold').text('ARQ. LEONARDO DÍAZ', 40, 15);
        doc.fontSize(9).font('Helvetica').text('PRESUPUESTO GLOBAL DE OBRA', 40, 35);
        doc.fontSize(8).text('Ref: ' + (datos.ref || 'PRE-2026-001') + '   |   ' + (datos.fecha || 'Mayo 2026'), 400, 15, { width: 160, align: 'right' });
        
        // ========== DATOS ==========
        let y = 75;
        doc.fillColor(NEGRO).fontSize(9).font('Helvetica-Bold').text('PROYECTO:', 40, y);
        
        const infos = [
            ['Cliente:', datos.cliente || '-'],
            ['Obra:', datos.obra || '-'],
            ['Ubicación:', datos.ubicacion || '-'],
            ['Tipo:', datos.tipo || 'Obra Nueva'],
            ['Superficie:', datos.superficie || '-'],
            ['Hº:', datos.hormigon || 'H-21'],
        ];
        
        doc.fontSize(8).font('Helvetica');
        let xi = 100;
        for (let i = 0; i < infos.length; i++) {
            doc.fillColor(GRIS).text(infos[i][0], xi, y);
            doc.fillColor(NEGRO).text(infos[i][1], xi + 50, y);
            if (i === 2) { xi = 280; }
            else { xi += 95; }
        }
        
        y += 18;
        
        // ========== TABLA RUBROS ==========
        doc.fillColor(AZUL).rect(40, y, 515, 16).fill(AZUL);
        doc.fillColor('white').fontSize(8).font('Helvetica-Bold');
        doc.text('#', 45, y + 4);
        doc.text('RUBRO', 60, y + 4);
        doc.text('CANT.', 260, y + 4);
        doc.text('MAT.', 320, y + 4);
        doc.text('MO', 390, y + 4);
        doc.text('TOTAL', 485, y + 4, { width: 60, align: 'right' });
        
        y += 18;
        
        doc.fontSize(7).font('Helvetica');
        const rubros = datos.rubros || [];
        let alto = 0;
        
        for (let i = 0; i < rubros.length; i++) {
            const r = rubros[i];
            
            // Alternating
            if (i % 2 === 0) doc.fillColor(GRIS_FONDO).rect(40, y, 515, 12).fill(GRIS_FONDO);
            
            doc.fillColor(NEGRO);
            doc.text(r.num || '', 45, y + 3);
            doc.text((r.desc || '').substring(0, 35), 60, y + 3);
            doc.text(r.cant || '', 260, y + 3);
            doc.text(r.mat || '', 320, y + 3);
            doc.text(r.mo || '', 390, y + 3);
            doc.text(r.total || '', 485, y + 3, { width: 60, align: 'right' });
            
            y += 12;
            alto += 12;
        }
        
        y += 5;
        
        // ========== RESUMEN ==========
        // Línea
        doc.fillColor(GRIS).rect(40, y, 515, 0.5).fill(GRIS);
        y += 8;
        
        // Cuadro resumen
        const resX = 370;
        doc.rect(resX, y, 185, 65).fill(GRIS_FONDO);
        
        doc.fontSize(8).font('Helvetica-Bold');
        doc.fillColor(AZUL).text('RESUMEN', resX + 5, y + 5);
        
        doc.fontSize(7).font('Helvetica').fillColor(NEGRO);
        doc.text('Materiales:', resX + 5, y + 20);
        doc.text('M.Obra:', resX + 5, y + 32);
        doc.text('Imprevistos:', resX + 5, y + 44);
        
        doc.font('Helvetica-Bold');
        doc.text(datos.matTotal || '$0', resX + 130, y + 20, { width: 45, align: 'right' });
        doc.text(datos.moTotal || '$0', resX + 130, y + 32, { width: 45, align: 'right' });
        doc.text(datos.impTotal || '$0', resX + 130, y + 44, { width: 45, align: 'right' });
        
        doc.fontSize(9).font('Helvetica-Bold');
        doc.fillColor(AZUL).text('TOTAL:', resX + 5, y + 54);
        doc.fillColor(NEGRO).text(datos.granTotal || '$0', resX + 130, y + 54, { width: 45, align: 'right' });
        
        // ========== FOOTER ==========
        y = 760;
        doc.fontSize(6).fillColor(GRIS);
        doc.text('ARQ. LEONARDO DÍAZ | @soy.leo_ai | Presupuesto orientativo - No reemplaza cómputo detallado', 40, y, { width: 300 });
        doc.text('Los valores pueden variar ±15% según mercado. No incluye IVA ni honorarios.', 400, y, { width: 155, align: 'right' });
        
        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

// Demo
const demo = {
    ref: 'BASE-2026-001',
    fecha: 'Mayo 2026',
    cliente: 'Cliente Prueba',
    obra: '22 Bases Columnas',
    ubicacion: 'Tucumán',
    tipo: 'Obra Nueva',
    superficie: '22 uds / 10.10m³',
    hormigon: 'H-17',
    
    rubros: [
        { num: '01', desc: 'Bases columnas 80x80', cant: '13 uds', mat: '$3,380', mo: 'incl.', total: '$3,380' },
        { num: '02', desc: 'Bases columnas 90x90', cant: '1 ud', mat: '$320', mo: 'incl.', total: '$320' },
        { num: '03', desc: 'Bases columnas 100x100', cant: '1 ud', mat: '$400', mo: 'incl.', total: '$400' },
        { num: '04', desc: 'Bases columnas 110x110', cant: '1 ud', mat: '$480', mo: 'incl.', total: '$480' },
        { num: '05', desc: 'Bases columnas 120x120', cant: '1 ud', mat: '$580', mo: 'incl.', total: '$580' },
        { num: '06', desc: 'Bases columnas 150x150', cant: '1 ud', mat: '$900', mo: 'incl.', total: '$900' },
        { num: '07', desc: 'Bases columnas 160x160', cant: '1 ud', mat: '$1,020', mo: 'incl.', total: '$1,020' },
        { num: '08', desc: 'Bases columnas 180x180', cant: '2 uds', mat: '$2,600', mo: 'incl.', total: '$2,600' },
        { num: '09', desc: 'Bases columnas 200x180', cant: '1 ud', mat: '$1,440', mo: 'incl.', total: '$1,440' },
        { num: '10', desc: 'Hormigon H-17 (10.10m³)', cant: '10.10m³', mat: '$1,860,480', mo: '-', total: '$1,860,480' },
        { num: '11', desc: 'Excavacion', cant: '5.63m³', mat: '$84,480', mo: '-', total: '$84,480' },
        { num: '12', desc: 'Mano de obra', cant: 'Global', mat: '-', mo: '$1,616,000', total: '$1,616,000' },
    ],
    
    matTotal: '$1,944,960',
    moTotal: '$1,616,000',
    impTotal: '$356,096',
    granTotal: '$3,560,961'
};

crearPresupuesto(demo, '/home/node/clawd/outputs/presupuesto_A4.pdf')
.then(p => console.log('PDF:', p))
.catch(e => console.error('Error:', e.message));