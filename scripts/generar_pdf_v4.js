#!/usr/bin/env node
/**
 * Presupuesto PDF - V4 CORREGIDO
 * Layout limpio + valores pesos correctos
 */

const PDFKit = require('pdfkit');
const fs = require('fs');

function crearPresupuesto(datos, outputPath = 'presupuesto.pdf') {
    return new Promise((resolve, reject) => {
        const doc = new PDFKit({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Colores
        const AZUL = '#1e40af';
        const GRIS = '#64748b';
        const GRIS_FONDO = '#f1f5f9';
        const NEGRO = '#0f172a';
        
        // ====== HEADER ======
        doc.rect(0, 0, 595, 55).fill(AZUL);
        doc.fillColor('white');
        doc.fontSize(14).font('Helvetica-Bold').text('ARQ. LEONARDO DÍAZ', 40, 12);
        doc.fontSize(9).text('PRESUPUESTO GLOBAL DE OBRA', 40, 32);
        doc.fontSize(8).text('Ref: ' + (datos.ref || 'PRE-2026-001') + '   |   ' + (datos.fecha || 'Mayo 2026'), 400, 12, { width: 155, align: 'right' });
        
        let y = 70;
        
        // ====== DATOS PROYECTO ======
        doc.fillColor(NEGRO).fontSize(9).font('Helvetica-Bold').text('PROYECTO', 40, y);
        y += 15;
        
        const infos = [
            ['Cliente:', datos.cliente || ''],
            ['Obra:', datos.obra || ''],
            ['Ubicación:', datos.ubicacion || ''],
            ['Tipo:', datos.tipo || 'Obra Nueva'],
            ['Superficie:', datos.superficie || ''],
            ['Hº:', datos.hormigon || 'H-21'],
        ];
        
        doc.fontSize(8).font('Helvetica');
        let xi = 40;
        for (let i = 0; i < infos.length; i++) {
            doc.fillColor(GRIS).text(infos[i][0], xi, y);
            doc.fillColor(NEGRO).text(infos[i][1], xi + 55, y);
            if (i === 2) { xi = 250; }
            else { xi += 95; }
        }
        
        y += 18;
        
        // ====== TABLA RUBROS ======
        doc.fillColor(AZUL).rect(40, y, 515, 14).fill(AZUL);
        doc.fillColor('white').fontSize(7).font('Helvetica-Bold');
        doc.text('#', 43, y + 4);
        doc.text('RUBRO', 55, y + 4);
        doc.text('CANT.', 250, y + 4);
        doc.text('MAT.', 310, y + 4);
        doc.text('MO', 390, y + 4);
        doc.text('TOTAL', 480, y + 4, { width: 70, align: 'right' });
        
        y += 16;
        
        doc.fontSize(7).font('Helvetica');
        const rubros = datos.rubros || [];
        
        for (let i = 0; i < rubros.length; i++) {
            const r = rubros[i];
            
            if (i % 2 === 0) doc.fillColor(GRIS_FONDO).rect(40, y, 515, 11).fill(GRIS_FONDO);
            else doc.fillColor('white').rect(40, y, 515, 11).fill('white');
            
            doc.fillColor(NEGRO);
            doc.text(r.num || (i+1).toString().padStart(2,'0'), 43, y + 2);
            doc.text(r.desc || '', 55, y + 2);  // Descripcion mas a la derecha
            doc.text(r.cant || '', 250, y + 2);
            doc.text(r.mat || '', 310, y + 2);
            doc.text(r.mo || '', 390, y + 2);
            doc.text(r.total || '', 480, y + 2, { width: 70, align: 'right' });
            
            y += 11;
        }
        
        y += 5;
        
        // ====== RESUMEN ======
        doc.fillColor(GRIS).rect(40, y, 515, 0.5).fill(GRIS);
        y += 8;
        
        const resX = 370;
        doc.rect(resX, y, 185, 60).fill(GRIS_FONDO);
        
        doc.fontSize(8).font('Helvetica-Bold').fillColor(AZUL);
        doc.text('RESUMEN', resX + 5, y + 3);
        
        doc.fontSize(7).font('Helvetica').fillColor(NEGRO);
        doc.text('Materiales:', resX + 5, y + 18);
        doc.text('Mano Obra:', resX + 5, y + 30);
        doc.text('Imprevistos:', resX + 5, y + 42);
        
        doc.font('Helvetica-Bold');
        doc.text(datos.matTotal || '$0', resX + 115, y + 18, { width: 55, align: 'right' });
        doc.text(datos.moTotal || '$0', resX + 115, y + 30, { width: 55, align: 'right' });
        doc.text(datos.impTotal || '$0', resX + 115, y + 42, { width: 55, align: 'right' });
        
        doc.fontSize(8).font('Helvetica-Bold').fillColor(AZUL);
        doc.text('TOTAL:', resX + 5, y + 50);
        doc.text(datos.granTotal || '$0', resX + 115, y + 50, { width: 55, align: 'right' });
        
        // ====== FOOTER ======
        y = 760;
        doc.fontSize(6).fillColor(GRIS);
        doc.text('ARQ. LEONARDO DÍAZ | @soy.leo_ai | Presupuesto orientativo', 40, y, { width: 300 });
        doc.text('No reemplaza cómputo detallado. Var ±15%. Sin IVA ni honorarios.', 400, y, { width: 155, align: 'right' });
        
        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

// Datos corregidos - Ejemplo original ($12.5 millones)
const datos = {
    ref: 'PRE-2025-001',
    fecha: 'Mayo 2025',
    cliente: 'Angie',
    obra: 'Obra Nueva',
    ubicacion: 'Manantial, Tucumán',
    tipo: 'Obra Nueva',
    superficie: '26 m²',
    hormigon: 'H-21',
    
    rubros: [
        { num: '01', desc: 'Bases de fundación', cant: '4 bases 80×80×40', mat: '$244,945', mo: 'incl.', total: '$244,945' },
        { num: '02', desc: 'Encadenados horizontales', cant: '16 ml', mat: '$246,805', mo: 'incl.', total: '$246,805' },
        { num: '03', desc: 'Encadenados verticales', cant: '4 col.', mat: '$306,605', mo: 'incl.', total: '$306,605' },
        { num: '04', desc: 'Mampostería', cant: '55 m²', mat: '$717,695', mo: 'incl.', total: '$717,695' },
        { num: '05', desc: 'Cubierta', cant: '26 m²', mat: '$1,279,386', mo: 'incl.', total: '$1,279,386' },
        { num: '06', desc: 'Capa aisladora', cant: '16 ml', mat: '$140,200', mo: 'incl.', total: '$140,200' },
        { num: '07', desc: 'Revoques exteriores', cant: '55 m²', mat: '$838,846', mo: 'incl.', total: '$838,846' },
        { num: '08', desc: 'Contrapiso', cant: '26 m²', mat: '$247,748', mo: 'incl.', total: '$247,748' },
        { num: '09', desc: 'Piso cerámico', cant: '26 m²', mat: '$166,915', mo: 'incl.', total: '$166,915' },
        { num: '10', desc: 'Carpintería aluminio', cant: '4 aberturas', mat: '$975,297', mo: 'incl.', total: '$975,297' },
        { num: '11', desc: 'Pintura exterior', cant: '55 m²', mat: '$189,927', mo: 'incl.', total: '$189,927' },
        { num: '12', desc: 'Pintura interior', cant: '42 m²', mat: '$167,581', mo: 'incl.', total: '$167,581' },
        { num: '13', desc: 'Instalación eléctrica', cant: 'Global', mat: '$172,445', mo: '$901,000', total: '$1,073,445' },
        { num: '14', desc: 'Instalación sanitaria', cant: 'Global', mat: '$800,110', mo: '$385,000', total: '$1,185,110' },
    ],
    
    matTotal: '$6,494,505',
    moTotal: '$4,875,268',
    impTotal: '$1,136,977',
    granTotal: '$12,506,750'
};

crearPresupuesto(datos, '/home/node/clawd/outputs/presupuesto_v4.pdf')
.then(p => console.log('PDF creado:', p))
.catch(e => console.error('Error:', e.message));