# Formato ENTREGA de Presupuesto
# Basado en ejemplo: PRE-2025-001 - Mayo 2025

FORMATO_ENCABEZADO = """
Arq. Leonardo Díaz
P R E S U P U E S T O   G L O B A L   D E   O B R A
· B O R R A D O R
Fecha {fecha}
Ref. {referencia}
Precios {fuente_precios}

P R O P I E T A R I O {propietario}
U B I C A C I Ó N {ubicacion}
T I P O {tipo_obra} (Obra Nueva / Refacción / Ampliación)
S U P E R F I C I E {superficie} m²
H O R M I G Ó N H-21
"""

FORMATO_RUBROS = """
{RUBRO} {descripcion}
{cantidad} · {detalles}
{precio_formato}
"""

# Estructura de cada RUBRO
# 01 Bases de fundación · 4 bases 80×80×40 cm · H-21 · hierro Ø10 + estribos Ø6
# 02 Encadenados horizontales · 16 ml · 20×20 cm · 4Ø8 + est.Ø6 c/20cm
# ...etc

RESUMEN = """
MATERIALES ${total_materiales}
{num_rubros} rubros · NOA

M A N O D E O B R A ${total_mo}
Tarifas UOCRA + instalaciones

I M P R E V I S T O S  {imprevistos}%
${total_imprevistos}
Sobre subtotal obra

T O T A L   E S T I M A D O ${total}
Sin honorarios · Sin cerámica
"""

# Notas técnicas estándar
NOTAS_TECNICAS = """
— MO albañilería al {pct_mo}% sobre materiales (referencia NOA).
— Tarifas UOCRA: Of. Esp. $6.011/h · Of. $5.142/h · El total puede variar ±15% según precios de mercado actualizados.
— El usuario Arq. Leonardo Díaz · @soy.leo_ai
"""

# Cálculo de MO
# Albañilería默认值: 65% sobre materiales
# Eléctrica: desglosado (tablero, pilar, termomagnéticas)
# Sanitaria: desglosado (cañerías, colocación)