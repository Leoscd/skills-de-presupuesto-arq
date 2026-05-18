#!/usr/bin/env python3
"""
Presupuesto-Arq: Convertir página de PDF a imagen PNG
para análisis por IA.
"""
import sys
import fitz  # PyMuPDF


def pdf_a_png(pdf_path: str, pagina: int = 1, output_path: str = None, dpi: int = 150) -> str:
    """
    Convierte una página de PDF a PNG.

    Args:
        pdf_path: Ruta al archivo PDF
        pagina: Número de página (1-indexed)
        output_path: Ruta de salida (None = auto)
        dpi: Resolución (150 = bueno para análisis)

    Returns:
        Ruta del PNG generado
    """
    doc = fitz.open(pdf_path)

    if pagina < 1 or pagina > len(doc):
        raise ValueError(f"Página {pagina} fuera de rango (1-{len(doc)})")

    # Convertir página a imagen
    mat = fitz.Matrix(dpi/72, dpi/72)  # escalado relativo a 72dpi base
    pix = doc[pagina - 1].get_pixmap(matrix=mat)

    if output_path is None:
        base = pdf_path.rsplit('.', 1)[0]
        output_path = f"{base}_pag{pagina}.png"

    pix.save(output_path)
    doc.close()

    return output_path


def pdf_info(pdf_path: str) -> dict:
    """Info básica del PDF."""
    doc = fitz.open(pdf_path)
    info = {
        "paginas": len(doc),
        "path": pdf_path,
        "titulo": doc.metadata.get("title", ""),
    }
    doc.close()
    return info


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 pdf_a_imagen.py <pdf_path> [pagina] [output_path] [dpi]")
        print("Ej: python3 pdf_a_imagen.py plano.pdf 1 analisis.png 150")
        sys.exit(1)

    path = sys.argv[1]
    pagina = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    output = sys.argv[3] if len(sys.argv) > 3 else None
    dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 150

    resultado = pdf_a_png(path, pagina, output, dpi)
    print(f"PNG generado: {resultado}")