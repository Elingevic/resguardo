# Resguardo — Pitch AseguraTech26

> **Si la tierra tiembla o el agua sube, te pagamos sin que lo pidas.**

**Desafío principal:** 1 — Seguros paramétricos y resiliencia
**Desafío secundario:** 2 — Seguros inclusivos, microseguros y masivos
**Etapa:** Pre-semilla (problema identificado y solución definida), con prototipo funcional en línea

---

## 1. El problema

- **El doble terremoto del 24 de junio de 2026** (magnitudes 7,2 y 7,5) golpeó el centro-norte del país. Dos meses después, el balance oficial era de 6.509 fallecidos. La ONU (OCHA) estima los daños en $37.000 millones.
- **Las lluvias no dan tregua:** en agosto de 2026 una onda tropical dejó al menos seis desaparecidos, 20 heridos y más de 150 viviendas afectadas en Caracas y dos estados.
- **Casi nadie está asegurado:** menos del 3 % de las edificaciones tiene póliza y apenas 6 % de los venezolanos tiene algún seguro. Con la caída del crédito hipotecario también desapareció el seguro de vivienda.
- **El seguro tradicional no sirve en la emergencia:** exige peritos, inventarios y meses de trámites justo cuando la familia lo perdió todo. Algunas pólizas que existían excluían el terremoto; la SUDEASEG tuvo que ordenar suspender esa exclusión en las pólizas de salud.

> 📌 **Por hacer antes del evento:** conversar con FUNVISIS e INAMEH sobre acceso a datos en tiempo real, y con una aseguradora y un reasegurador sobre la tarifa.

## 2. La solución

**Resguardo** es un **microseguro paramétrico** de terremoto y lluvia extrema para hogares y pequeños negocios. **No hay reclamo ni perito**: el pago se activa solo cuando un dato objetivo pasa un umbral en la zona del asegurado.

1. **Se contrata desde $1,20 al mes** (referencial), por la app del banco, una cooperativa, una microfinanciera o la junta de condominio.
2. **Vigila los datos de cada zona:**
   - **Sismo:** intensidad en la zona según el mapa de sacudida (USGS ShakeMap), contrastado con FUNVISIS.
   - **Lluvia:** acumulado en 24 horas por satélite (NASA GPM), contrastado con estaciones del INAMEH.
3. **Si se pasa el umbral, paga un monto fijo** por Pago Móvil, con un objetivo de 48 horas. No hay que demostrar daños.

### Tabla de pagos (referencial)

| Evento | Umbral en la zona | Plan Básico ($1,20/mes) | Plan Hogar ($2,50/mes) |
|---|---|---|---|
| Sismo | Intensidad VI | $75 | $150 |
| Sismo | Intensidad VII | $200 | $400 |
| Sismo | Intensidad VIII o más | $400 | $800 |
| Lluvia | 100 mm o más en 24 h | $50 | $100 |
| Lluvia | 150 mm o más en 24 h | $125 | $250 |

### Riesgo base, explicado con claridad

El pago depende del dato de la zona, no del daño de cada casa. Puede haber daño sin pago (si la zona no pasó el umbral) y pago sin daño. Resguardo lo explica antes de contratar, con la tabla de pagos y la consulta "Mi zona". Es el estándar internacional de los seguros paramétricos.

### Los actores

| Actor | Qué hace |
|---|---|
| **Asegurado** (hogar o pequeño negocio) | Contrata, registra su zona y su Pago Móvil, y recibe el pago sin reclamar |
| **Canal** (banco, cooperativa, microfinanciera, condominio) | Ofrece Resguardo a sus clientes o miembros y cobra la prima |
| **Aseguradora** | Asume el riesgo en una póliza colectiva y libera los lotes de pago |
| **Reasegurador** | Toma el riesgo catastrófico con el mismo índice |
| **Intermediario autorizado** | Coloca la póliza colectiva con cada canal |

## 3. Por qué ahora

- **Los desastres de 2026 dejaron la necesidad a la vista** de todo el país.
- **La región ya lo regula y lo usa:** en septiembre de 2026 la SBS del Perú aprobó un reglamento de seguros paramétricos con pagos automáticos ante sismos y lluvias. MiCRO opera microseguros paramétricos en seis países de América Latina con 690.000 asegurados.
- **Los datos ya existen y son públicos:** mapas de sacudida, satélites de lluvia y redes nacionales.
- **El pago digital es masivo:** Pago Móvil permite pagar a miles de personas en horas.

## 4. Modelo de negocio

| Fuente | Descripción |
|---|---|
| Comisión tecnológica | Porcentaje de la prima por operar el monitoreo, el cálculo de lotes y los pagos |
| Licencia del índice | Venta del índice y del motor de cálculo a aseguradoras y reaseguradores |
| Programas colectivos | Pólizas para alcaldías, gremios o empresas que protegen a sus comunidades o trabajadores |

**Por qué es sostenible:** sin peritos ni reclamos, el costo de gestión por siniestro cae casi a cero, y el riesgo catastrófico se transfiere al reaseguro internacional con el mismo índice. En la demo, un sismo como el escenario de prueba pagaría unos $26 millones a 56.800 asegurados: la aseguradora retiene $1,5 millones y el resto lo cubre el reaseguro (cifras ilustrativas).

## 5. Cumplimiento regulatorio

- **Resguardo no asume riesgo ni intermedia:** el riesgo es de una aseguradora autorizada por la SUDEASEG, la colocación la hace un intermediario autorizado y el riesgo catastrófico va al reaseguro.
- **Marco paramétrico:** Venezuela no tiene hoy una norma específica de seguros paramétricos. Proponemos arrancar con un **piloto supervisado** y tomar como referencia el reglamento peruano de 2026: índice, umbral, área geográfica y monto definidos en la póliza, e información clara sobre el riesgo base.
- **Transparencia:** el índice y las fuentes se publican; cualquiera puede verificar por qué se pagó o no.
- **Datos personales:** solo la zona y la cuenta de pago; no se piden inventarios ni fotos de la vivienda.

## 6. Hoja de ruta

| Fase | Qué |
|---|---|
| Hoy | Prototipo en línea: app del asegurado, monitor de la aseguradora con lotes de pago y consulta por zona |
| 0–3 meses | Acuerdos de datos con FUNVISIS e INAMEH; modelo de tarifa con una aseguradora y un reasegurador |
| 3–6 meses | Piloto supervisado en La Guaira y Caracas con un canal aliado (cooperativa o banco) |
| 6–12 meses | Más zonas y canales; plan para pequeños negocios (pérdida de ingresos) |
| 12+ meses | Programas colectivos con alcaldías y gremios; nuevos riesgos (sequía para productores) |

## 7. Métricas del piloto

- Asegurados por zona y canal
- Tiempo del evento al pago
- % de asegurados que entienden el riesgo base (encuesta)
- Diferencia entre pagos y daños reportados (riesgo base observado)
- Renovación a 12 meses

## 8. Equipo

> Completar: nombre, rol y experiencia de cada integrante.

---

## Guion del pitch (≈ 5 minutos)

**[0:00 – 0:40] Gancho**
"El 24 de junio la tierra tembló dos veces. ¿Cuántas familias recibieron un pago de su seguro en la primera semana? … Casi ninguna, porque menos del 3 % de las edificaciones tenía póliza, y las que la tenían empezaron un trámite de meses."

**[0:40 – 1:30] Problema**
Terremoto, lluvias, bajísima cobertura y el seguro tradicional que llega tarde.

**[1:30 – 3:00] Solución y demo en vivo**
1. App de José en Catia La Mar → "Simular sismo"
2. Aviso automático: intensidad VIII en su zona, $800, sin reclamar
3. Evento detectado → verificado con 2 fuentes → Pago Móvil
4. Monitor de la aseguradora: mapa, zonas activadas, lote y reparto con el reaseguro
5. "Mi zona": cuánto pagaría en cada escenario

**[3:00 – 3:45] Modelo de negocio**
Microprima, comisión tecnológica, licencia del índice, programas colectivos.

**[3:45 – 4:30] Viabilidad y regulación**
Aseguradora, intermediario y reaseguro; piloto supervisado con referencia al reglamento peruano; riesgo base explicado.

**[4:30 – 5:00] Cierre**
"El próximo sismo o la próxima vaguada van a llegar. Con Resguardo, el dinero llega antes que los papeles."

---

## Preguntas probables del jurado

- **¿Qué pasa si mi casa se cae pero mi zona no pasó el umbral?** → Ese es el riesgo base. Se explica antes de contratar y se reduce con zonas pequeñas y dos fuentes de datos. Resguardo complementa al seguro tradicional, no lo reemplaza.
- **¿Quién garantiza los datos?** → Fuentes públicas e independientes (USGS, NASA) contrastadas con las nacionales (FUNVISIS, INAMEH). El índice se publica.
- **¿Una aseguradora local aguanta un terremoto?** → No sola: retiene una parte y el resto va al reaseguro paramétrico internacional, como hacen los programas de la región.
- **¿Por qué una persona pagaría si "nunca pasa nada"?** → Por el precio (lo de un pasaje) y porque las lluvias activan pagos con más frecuencia que los sismos. Los canales colectivos (condominios, cooperativas) bajan la barrera.
- **¿Es legal en Venezuela?** → Se puede estructurar como póliza colectiva con monto fijo por evento. Proponemos un piloto supervisado por la SUDEASEG.

## Fuentes

- Doble terremoto y fallecidos: [Teleamazonas](https://www.teleamazonas.com/actualidad/noticias/internacional/venezuela-fallecidos-dos-meses-terremotos-126180/)
- Daños estimados en $37.000 millones: [OCHA, adenda al Plan de Respuesta Humanitaria 2026](https://test-assets-opsaa.iica.int/storage/frames/frame_1786552273_es.pdf)
- Menos del 3 % de edificaciones aseguradas: [El Diario](https://eldiario.com/2026/07/30/edificaciones-polizas-seguros-desastres-venezuela/), [La Patilla](https://lapatilla.com/2026/07/30/los-terremotos-evidenciaron-una-grave-vulnerabilidad-apenas-6-de-los-venezolanos-esta-asegurado/)
- Lluvias de agosto de 2026: [Primicias / EFE](https://www.primicias.ec/internacional/onda-tropical-venezuela-lluvias-inundaciones-desaparecidos-130910/)
- Sudeaseg suspende exclusión de terremotos en salud: [Finanzas Digital](https://finanzasdigital.com/tag/seguros/)
- Reglamento de seguros paramétricos del Perú: [SBS](https://www.sbs.gob.pe/noticia/detallenoticia/idnoticia/3995/trk//coopac)
- MiCRO, microseguros paramétricos en América Latina: [Howden](https://www.howdengroup.com/mx-es/micro-seguro)
