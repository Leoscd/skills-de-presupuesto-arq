#!/usr/bin/env node
/**
 * Generador de Presupuesto en PDF
 * Usa pdfkit
 */

const PDFKit = require('pdfkit');
const fs = require('fs');

function crearPresupuesto(datos, outputPath = 'presupuesto.pdf') {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            
            // Colors
            const negro = '#000000';
            const gris = '#666666';
            
            // ========== HEADER ==========
            doc.fontSize(14).font('Helvetica-Bold').text('ARQ. LEONARDO DÍAZ', 50, 50, { align: 'center' });
            doc.fontSize(16).text('PRESUPUESTO GLOBAL DE OBRA', { align: 'center' });
            doc.moveDown();
            
            // Datos principales
            const y = 140;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Fecha:', 50, y);
            doc.text('Ref.:', 50, y + 15);
            doc.text('Precios:', 50, y + 30);
            
            doc.font('Helvetica').text(datos.fecha || 'Mayo 2026', 150, y);
            doc.text(datos.referencia || 'PRE-2026-001', 150, y + 15);
            doc.text(datos.fuente || 'Arq. & Const. NOA', 150, y + 30);
            
            doc.moveDown();
            
            // Datos del cliente
            doc.font('Helvetica-Bold').text('PROPIETARIO:', 50, y + 60);
            doc.text('UBICACIÓN:', 50, y + 75);
            doc.text('TIPO:', 50, y + 90);
            doc.text('SUPERFICIE:', 50, y + 105);
            
            doc.font('Helvetica').text(datos.propietario || 'Cliente', 150, y + 60);
            doc.text(datos.ubicacion || 'Tucumán', 150, y + 75);
            doc.text(datos.tipo || 'Obra Nueva', 150, y + 90);
            doc.text((datos.superficie || '0') + ' m²', 150, y + 105);
            
            // ========== RUBROS ==========
            let cursorY = 300;
            
            doc.fontSize(12).font('Helvetica-Bold').text('RUBROS', 50, cursorY);
            cursorY += 25;
            
            // Header table
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('#', 50, cursorY);
            doc.text('DESCRIPCIÓN', 80, cursorY);
            doc.text('CANTIDAD', 280, cursorY);
            doc.text('MATERIALES', 370, cursorY);
            doc.text('MO', 440, cursorY);
            doc.text('TOTAL', 490, cursorY);
            
            cursorY += 5;
            doc.rect(50, cursorY, 515, 0.5).fill(negro);
            cursorY += 10;
            
            // Rubros data
            doc.font('Helvetica').fontSize(8);
            const rubros = datos.rubros || [];
            
            for (let i = 0; i < rubros.length; i++) {
                const r = rubros[i];
                doc.text(r.num || String(i+1).padStart(2,'0'), 50, cursorY);
                doc.text(r.desc || '', 80, cursorY);
                doc.text(r.cant || '', 280, cursorY);
                doc.text(r.mat || '', 370, cursorY);
                doc.text(r.mo || '', 440, cursorY);
                doc.text(r.total || '', 490, cursorY);
                cursorY += 15;
            }
            
            // ========== TOTALES ==========
            cursorY += 20;
            doc.rect(50, cursorY, 515, 0.5).fill(negro);
            cursorY += 15;
            
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('MATERIALES', 50, cursorY);
            doc.text(datos.totalMateriales || '$0', 450, cursorY, { align: 'right' });
            cursorY += 15;
            
            doc.font('Helvetica');
            doc.text('MANO DE OBRA', 50, cursorY);
            doc.text(datos.totalMO || '$0', 450, cursorY, { align: 'right' });
            cursorY += 15;
            
            doc.text('IMPREVISTOS ' + (datos.imprevistos || '10%'), 50, cursorY);
            doc.text(datos.totalImprevistos || '$0', 450, cursorY, { align: 'right' });
            cursorY += 20;
            
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('TOTAL ESTIMADO', 50, cursorY);
            doc.text(datos.total || '$0', 450, cursorY, { align: 'right' });
            
            // ========== NOTAS ==========
            cursorY += 40;
            doc.fontSize(8).font('Helvetica');
            doc.text('NOTAS:', 50, cursorY);
            doc.moveDown(0.5);
            doc.text('— MO albañilería al 65% sobre materiales (referencia NOA)', 50);
            doc.text('— Tarifas UOCRA: Of. Esp. $6,011/h · Of. $5,142/h');
            doc.text('— El total puede variar ±15% según precios de mercado actualizados', 50);
            doc.text('— No incluye: cerámica de piso · accesorios · luminarias · honorarios · IVA', 50);
            
            // Footer
            doc.fontSize(8).text('Arq. Leonardo Díaz · @soy.leo_ai', 50, 750);
            
            doc.end();
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
            
        } catch (e) {
            reject(e);
        }
    });
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
    // Demo
    const datosDemo = {
        fecha: 'Mayo 2026',
        referencia: 'PRE-2026-001',
        fuente: 'Arq. & Const. NOA',
        propietario: 'Angie',
        ubicacion: 'Manantial, Tucumán',
        tipo: 'Obra Nueva',
        superficie: '26',
        rubros: [
            { num: '01', desc: 'Bases de fundación', cant: '4 bases 80×80', mat: '$244,945', mo: 'incl.', total: '$244,945' },
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
        totalMateriales: '$6,494,505',
        totalMO: '$4,875,268',
        totalImprevistos: '$1,136,977',
       total: '$12,506,750'
    };
    
    crearPresupuesto(datosDemo, '/home/node/clawd/outputs/presupuesto_ejemplo.pdf')
    .then(path => console.log('PDF creado:', path))
    .catch(e => console.error('Error:', e.message));
} else {
    // Parse JSON
    const datos = JSON.parse(args[0]);
    crearPresupuesto(datos, datos.output || 'presupuesto.pdf')
    .then(path => console.log('PDF creado:', path))
    .catch(e => console.error('Error:', e.message));
}