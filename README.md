# Resguardo

> Si la tierra tiembla o el agua sube, te pagamos sin que lo pidas.

Microseguro paramétrico de terremoto y lluvia extrema para hogares y pequeños negocios en Venezuela. No hay reclamo ni perito: cuando los datos confirman un sismo fuerte o una lluvia extrema en la zona del asegurado, paga un monto fijo por Pago Móvil. Postulación a **AseguraTech26**, desafío 1 (seguros paramétricos y resiliencia).

## Carpetas

```
web/          prototipo (HTML, CSS y JS sin dependencias)
postulacion/  PDF único, lámina, video, guion y fuentes HTML
PITCH.md      pitch, guion de 5 minutos, preguntas del jurado y fuentes
vercel.json   le dice a Vercel que publique la carpeta web/
```

## Publicar en Vercel

Importa el repositorio en Vercel con *Framework Preset* = **Other** y sin comando de build. El `vercel.json` ya apunta a `web/`. Nombre sugerido del proyecto: **resguardove** (la URL `resguardove.vercel.app` es la que traen los PDF y el video).

## Qué hace el prototipo

| Vista | Ruta | Qué muestra |
|---|---|---|
| Inicio | `#/` | Problema, cómo funciona y simulación "¿y si hubiera existido?" |
| Asegurado | `#/persona` | App de José en Catia La Mar: estado, simulación de sismo o lluvia, aviso automático, pasos hasta el Pago Móvil, tabla de pagos e historial |
| Aseguradora | `#/monitor` | Mapa esquemático de zonas, intensidad o lluvia por zona, asegurados afectados, lote de pagos y reparto entre retención y reaseguro |
| Mi zona | `#/zona` | Consulta por municipio: cuánto pagaría cada plan en cada escenario |

Todo corre en el navegador y el estado se guarda en `localStorage`. **Reiniciar demo** vuelve a los datos de ejemplo. Personas, aseguradoras, montos, umbrales e intensidades son **ficticios o ilustrativos**.
