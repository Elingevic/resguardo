"use strict";
/* Resguardo — prototipo de demostración (AseguraTech26).
   Seguro paramétrico: paga automático cuando los datos confirman el evento en la zona.
   Personas, aseguradoras, montos, umbrales e intensidades son ficticios o ilustrativos. */

// ---------------------------------------------------------------------------
// Parámetros
// ---------------------------------------------------------------------------
const PLANES = {
  basico: { n: "Básico", precio: 1.2, sismo: [75, 200, 400], lluvia: [50, 125] },
  hogar: { n: "Hogar", precio: 2.5, sismo: [150, 400, 800], lluvia: [100, 250] },
};
const UMBRAL_SISMO = [6, 7, 8];          // intensidad Mercalli (VI, VII, VIII o más)
const UMBRAL_LLUVIA = [100, 150];        // mm acumulados en 24 h
const ROMANO = { 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX" };
const ASEGURADORA = { nombre: "Seguros Tepuy", corredor: "Corretaje Andino", reaseguro: "reaseguro paramétrico internacional" };

// Zonas (coordenadas aproximadas; asegurados ficticios)
const ZONAS = [
  { id: "laguaira", n: "Catia La Mar (La Guaira)", lat: 10.60, lon: -67.03, aseg: 8200 },
  { id: "libertador", n: "Libertador (Caracas)", lat: 10.50, lon: -66.92, aseg: 21400 },
  { id: "sucre", n: "Sucre · Petare (Miranda)", lat: 10.48, lon: -66.81, aseg: 12600 },
  { id: "baruta", n: "Baruta (Miranda)", lat: 10.43, lon: -66.87, aseg: 6400 },
  { id: "guarenas", n: "Guarenas–Guatire (Miranda)", lat: 10.47, lon: -66.56, aseg: 4300 },
  { id: "losteques", n: "Los Teques (Miranda)", lat: 10.34, lon: -67.04, aseg: 3900 },
  { id: "maracay", n: "Maracay (Aragua)", lat: 10.25, lon: -67.60, aseg: 7100 },
  { id: "valencia", n: "Valencia (Carabobo)", lat: 10.16, lon: -68.00, aseg: 9800 },
  { id: "pcabello", n: "Puerto Cabello (Carabobo)", lat: 10.47, lon: -68.01, aseg: 2500 },
  { id: "barquisimeto", n: "Barquisimeto (Lara)", lat: 10.07, lon: -69.32, aseg: 5600 },
  { id: "cumana", n: "Cumaná (Sucre)", lat: 10.45, lon: -64.18, aseg: 2100 },
  { id: "merida", n: "Mérida (Mérida)", lat: 8.59, lon: -71.14, aseg: 1800 },
];
const MIX_HOGAR = 0.55; // % de asegurados en plan Hogar (resto Básico)

// Escenarios de simulación (intensidades y lluvias ilustrativas, no oficiales)
const ESCENARIOS = {
  sismo: { id: "sismo", n: "Escenario sismo M7,5 frente a La Guaira", corto: "Sismo M7,5", ic: "🌋", lat: 10.66, lon: -66.97, fuente: "Intensidad por zona: mapa de sacudida (USGS ShakeMap) contrastado con FUNVISIS" },
  lluvia: { id: "lluvia", n: "Escenario lluvia intensa por onda tropical en Caracas", corto: "Lluvia 24 h", ic: "🌧️", fuente: "Lluvia acumulada 24 h: satélite (NASA GPM) contrastado con estaciones del INAMEH",
    mm: { libertador: 162, sucre: 141, baruta: 118, laguaira: 106, losteques: 96, guarenas: 88, maracay: 40, valencia: 22, pcabello: 30, barquisimeto: 12, cumana: 8, merida: 15 } },
};
function km(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function medida(esc, z) {
  if (esc.id === "sismo") return Math.max(2, Math.min(9, 8.9 - km(esc, z) / 22));
  return esc.mm[z.id] || 0;
}
function tramo(esc, v) {
  const u = esc.id === "sismo" ? UMBRAL_SISMO : UMBRAL_LLUVIA;
  let t = -1; u.forEach((x, i) => { if (Math.floor(v + 1e-9) >= x) t = i; });
  return t;
}
function pago(esc, plan, t) { return t < 0 ? 0 : PLANES[plan][esc.id][t]; }
function etiqueta(esc, v) { return esc.id === "sismo" ? `Intensidad ${ROMANO[Math.floor(v)] || Math.floor(v)}` : `${Math.round(v)} mm en 24 h`; }
function resultado(esc) {
  return ZONAS.map((z) => {
    const v = medida(esc, z), t = tramo(esc, v);
    const hog = Math.round(z.aseg * MIX_HOGAR), bas = z.aseg - hog;
    const monto = hog * pago(esc, "hogar", t) + bas * pago(esc, "basico", t);
    return { ...z, v, t, monto, activa: t >= 0 };
  });
}

const SEMILLA = () => ({
  v: 1, pestana: "inicio", plan: "hogar", zona: "laguaira",
  evento: null,       // { esc, hora, etapa } en la app del asegurado
  lote: null,         // { esc, estado: "Detectado" | "Pagado", hora }
  historial: [{ fecha: "23/08/2026", tipo: "Lluvia intensa", det: "112 mm en 24 h", monto: 100, estado: "Pagado" }],
  consulta: "laguaira",
});

// ---------------------------------------------------------------------------
// Estado y utilidades
// ---------------------------------------------------------------------------
const CLAVE = "resguardo_demo";
let S = cargar();
function cargar() { try { const s = JSON.parse(localStorage.getItem(CLAVE)); if (s && s.v === SEMILLA().v) return s; } catch { /* */ } return SEMILLA(); }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch { /* */ } }
function set(c) { Object.assign(S, c); guardar(); render(); }
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const usd = (n) => "$" + Math.round(n).toLocaleString("es-VE");
const usd2 = (n) => "$" + Number(n).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ent = (n) => Math.round(n).toLocaleString("es-VE");
const hhmm = (ts) => new Date(ts).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", hour12: false });
const zona = (id) => ZONAS.find((z) => z.id === id);
function toast(m) { document.querySelectorAll(".toast").forEach((t) => t.remove()); const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }
let temporizadores = [];
function limpiarTemp() { temporizadores.forEach(clearTimeout); temporizadores = []; }

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------
function ruta() { const [p, q] = (location.hash.slice(1) || "/").split("?"); return { path: p || "/", q: new URLSearchParams(q || "") }; }
function render() {
  const r = ruta().path.replace(/^\//, "").split("/")[0];
  document.querySelectorAll("#roles a").forEach((a) => a.classList.toggle("activo", a.dataset.r === r));
  const vistas = { "": landing, persona, monitor, zona: vistaZona };
  $("#app").innerHTML = (vistas[r] || landing)();
}
window.addEventListener("hashchange", () => { document.querySelectorAll(".toast").forEach((t) => t.remove()); render(); window.scrollTo(0, 0); });
$("#reiniciar").addEventListener("click", () => { limpiarTemp(); S = SEMILLA(); guardar(); render(); toast("Demo reiniciada con los datos de ejemplo"); });

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------
function landing() {
  const r = resultado(ESCENARIOS.sismo);
  const pers = r.filter((z) => z.activa).reduce((a, z) => a + z.aseg, 0), total = r.reduce((a, z) => a + z.monto, 0);
  return `
  <section class="hero">
    <div class="hero-in">
      <div class="aparecer">
        <span class="chip">🌎 AseguraTech26 · Desafío 1: seguros paramétricos y resiliencia</span>
        <h1>Si la tierra tiembla o el agua sube,<br><span>te pagamos sin que lo pidas.</span></h1>
        <p class="lead">Resguardo es un microseguro paramétrico para hogares y pequeños negocios. No hay reclamo ni perito: cuando los datos confirman un sismo fuerte o una lluvia extrema en tu zona, te llega el dinero por Pago Móvil.</p>
        <div class="ctas">
          <a class="btn btn-pri btn-lg" href="#/persona">Probar como asegurado</a>
          <a class="btn btn-borde btn-lg" href="#/monitor">Ver panel de la aseguradora</a>
        </div>
        <div class="hero-datos">
          <div><b>&lt; 3 %</b><span>de las edificaciones tiene seguro</span></div>
          <div><b>Desde $1,20</b><span>al mes, pagos de hasta $800</span></div>
          <div><b>48 h</b><span>del evento al pago, sin trámites</span></div>
        </div>
      </div>
      <div class="hero-tarjeta aparecer" style="animation-delay:.1s">
        <div class="eyebrow" style="color:var(--r400)">Cómo funciona</div>
        <div class="linea-tiempo" style="margin-top:14px">
          <div class="lt-item"><span class="hora">00:00</span><b>Tiembla frente a La Guaira</b><span>Los sismógrafos y el mapa de sacudida miden la intensidad en cada zona.</span></div>
          <div class="lt-item"><span class="hora">00:20</span><b>Se cruza con 2 fuentes</b><span>Si tu zona pasó el umbral, tu Resguardo se activa solo.</span></div>
          <div class="lt-item"><span class="hora">+6 h</span><b>Te avisamos cuánto recibes</b><span>Monto fijo según la intensidad. No tienes que demostrar daños.</span></div>
          <div class="lt-item"><span class="hora">+48 h</span><b>El dinero llega por Pago Móvil</b><span>Para lo urgente: comida, alquiler temporal, reparaciones.</span></div>
        </div>
      </div>
    </div>
  </section>
  <section class="seccion">
    <span class="eyebrow">El problema</span>
    <h2>Los desastres llegan en segundos. La ayuda tarda meses.</h2>
    <p class="lead">El doble terremoto del 24 de junio de 2026 y las lluvias de agosto mostraron cuánto cuesta no tener protección. Casi nadie está asegurado y, cuando lo está, el reclamo tradicional exige peritos y papeles justo cuando la familia lo perdió todo.</p>
    <div class="grid-3">
      <div class="tarjeta"><div class="card-ic">🏚️</div><h3>Menos del 3 % asegurado</h3><p>Menos del 3 % de las edificaciones tiene una póliza, y apenas 6 % de los venezolanos tiene algún seguro.</p><div class="dato-fuente">Fuente: El Diario, julio 2026</div></div>
      <div class="tarjeta"><div class="card-ic">📉</div><h3>$37.000 millones en daños</h3><p>Es la estimación de daños del doble terremoto de magnitud 7,2 y 7,5 en el plan humanitario de la ONU.</p><div class="dato-fuente">Fuente: OCHA, adenda al Plan de Respuesta Humanitaria 2026</div></div>
      <div class="tarjeta"><div class="card-ic">🌧️</div><h3>Lluvias que no dan tregua</h3><p>En agosto de 2026 una onda tropical dejó desaparecidos y más de 150 viviendas afectadas en Caracas y dos estados.</p><div class="dato-fuente">Fuente: EFE vía Primicias, agosto 2026</div></div>
    </div>
  </section>
  <section class="seccion">
    <span class="eyebrow">¿Y si hubiera existido?</span>
    <h2>Con ${ent(ZONAS.reduce((a, z) => a + z.aseg, 0))} asegurados, un sismo como el escenario de prueba habría pagado ${usd(total)} a ${ent(pers)} familias en 48 horas.</h2>
    <p class="lead">Simulación con intensidades ilustrativas, no oficiales. Pruébala en el <a href="#/monitor">panel de la aseguradora</a>.</p>
  </section>
  <section class="seccion">
    <span class="eyebrow">Prueba el prototipo</span>
    <h2>Tres vistas, un mismo evento.</h2>
    <div class="banda-roles">
      <a class="tarjeta rol-card" href="#/persona"><div class="card-ic">🏠</div><h3>Asegurado</h3><p>Simula un sismo o una lluvia extrema y mira cómo llega el pago sin reclamar nada.</p><div class="ir">Abrir app →</div></a>
      <a class="tarjeta rol-card" href="#/monitor"><div class="card-ic">🛰️</div><h3>Aseguradora</h3><p>Mapa de zonas, intensidad medida, asegurados afectados y lote de pagos automático.</p><div class="ir">Abrir panel →</div></a>
      <a class="tarjeta rol-card" href="#/zona"><div class="card-ic">📍</div><h3>Mi zona</h3><p>Elige tu municipio y mira cuánto pagaría Resguardo en cada escenario.</p><div class="ir">Consultar →</div></a>
    </div>
  </section>
  <footer class="pie"><span><b>Resguardo</b> · Prototipo para AseguraTech26 (SUDEASEG) · Noviembre de 2026</span><span>Resguardo es la capa tecnológica: el riesgo lo asume una aseguradora autorizada y la colocación la hace un intermediario autorizado.</span></footer>`;
}

// ---------------------------------------------------------------------------
// App del asegurado
// ---------------------------------------------------------------------------
function persona() {
  return `
  <div class="contenedor"><div class="escena">
    <div class="explica aparecer">
      <span class="eyebrow">Vista del asegurado</span>
      <h2>José vive en Catia La Mar y tiene el plan Hogar.</h2>
      <p>Paga ${usd2(PLANES.hogar.precio)} al mes. No tiene que hacer nada más: Resguardo vigila los datos de su zona día y noche.</p>
      <ol>
        <li><b>Simula un evento</b><span>Con los botones de abajo, provoca un sismo o una lluvia extrema.</span></li>
        <li><b>Mira el teléfono</b><span>El aviso llega solo, con el monto según la intensidad medida en su zona.</span></li>
        <li><b>Sigue el pago</b><span>Evento detectado, verificado con 2 fuentes y pago enviado por Pago Móvil. En la demo pasa en segundos; en la realidad, en 48 horas.</span></li>
        <li><b>Abre el panel de la aseguradora</b><span>El mismo evento aparece en el <a href="#/monitor">monitor</a>, con todas las zonas y el lote de pagos.</span></li>
      </ol>
      <div class="demo-ctrl no-imprimir">
        <button class="btn btn-pri" data-sim="sismo">🌋 Simular sismo M7,5</button>
        <button class="btn btn-osc" data-sim="lluvia">🌧️ Simular lluvia extrema</button>
      </div>
      <div class="nota">Precios y montos referenciales. Las intensidades de la simulación son ilustrativas. <b>Riesgo base:</b> el seguro paga según el dato medido en la zona, no según el daño de cada casa; por eso se explica con claridad antes de contratar.</div>
    </div>
    <div class="telefono"><div class="pantalla">
      <div class="notch"></div>
      <div class="status"><span>${hhmm(Date.now())}</span><span>▮▮▮ 4G ▭</span></div>
      ${pantalla()}
    </div></div>
  </div></div>`;
}

function pantalla() {
  const p = S.pestana;
  const tabs = [["inicio", "🏠", "Inicio"], ["cobertura", "📏", "Cobertura"], ["historial", "🕑", "Pagos"]];
  const nav = `<nav class="app-nav">${tabs.map(([k, i, t]) => `<button class="${p === k ? "on" : ""}" data-tab="${k}"><span>${i}</span>${t}</button>`).join("")}</nav>`;
  const cab = `<div class="app-cab"><div><div class="hola">Resguardo · ${esc(zona(S.zona).n)}</div><div class="nom">Hola, José</div></div><span class="av" style="background:#7c3aed">JH</span></div>`;
  const cuerpo = S.evento && p === "inicio" ? pantallaEvento() : { inicio: tabInicio, cobertura: tabCobertura, historial: tabHistorial }[p]();
  return `${cab}<div class="app-cuerpo">${cuerpo}</div>${nav}`;
}

function tabInicio() {
  const pl = PLANES[S.plan];
  return `
    <div class="estado-turno on aparecer">
      <div class="lbl"><span class="punto vivo"></span> Resguardado · Plan ${pl.n}</div>
      <div class="big">Hasta ${usd(pl.sismo[2])} por evento</div>
      <div class="met"><div><b>${usd2(pl.precio)}</b>al mes</div><div><b>2</b>riesgos</div><div><b>Pago Móvil</b>cobro y pago</div></div>
    </div>
    <div class="banda-alerta verde"><span class="i">🛰️</span><span><b>Vigilando tu zona ahora</b><br>Sismos: sismógrafos y mapa de sacudida. Lluvia: satélite y estaciones. Sin eventos que activen pagos.</span></div>
    <div class="mini"><h4>Lo que recibes, sin reclamar</h4>
      <div class="cob"><span class="ic">🌋</span><div><div class="t">Sismo en tu zona</div><div class="s">Intensidad VI: ${usd(pl.sismo[0])} · VII: ${usd(pl.sismo[1])} · VIII o más: ${usd(pl.sismo[2])}</div></div></div>
      <div class="cob"><span class="ic">🌧️</span><div><div class="t">Lluvia extrema en 24 h</div><div class="s">100 mm o más: ${usd(pl.lluvia[0])} · 150 mm o más: ${usd(pl.lluvia[1])}</div></div></div>
    </div>
    <div class="mini"><div class="cob"><span class="ic">💳</span><div><div class="t">Cuenta de pago</div><div class="s">Pago Móvil · Banco Cumbre · 0414-***-**21</div></div></div></div>`;
}

function pantallaEvento() {
  const e = S.evento, sc = ESCENARIOS[e.esc], z = zona(S.zona);
  const v = medida(sc, z), t = tramo(sc, v), monto = pago(sc, S.plan, t);
  const pasos = [
    ["Evento detectado", `${sc.corto} · ${hhmm(e.hora)}`],
    ["Verificado con 2 fuentes", `${etiqueta(sc, v)} en ${z.n}`],
    ["Pago enviado por Pago Móvil", monto ? `${usd(monto)} a tu cuenta · en la realidad, en 48 h` : "Sin pago: tu zona no pasó el umbral"],
  ];
  if (t < 0) {
    return `<div class="banda-alerta verde aparecer" style="margin-top:6px"><span class="i">ℹ️</span><span><b>${sc.corto} registrado, sin pago en tu zona</b><br>${etiqueta(sc, v)} en ${esc(z.n)}: por debajo del umbral. Esperamos que todo esté bien.</span></div>
      <button class="btn-turno btn-osc" data-acc="cerrar-evento">Entendido</button>`;
  }
  return `
    <div class="estado-turno alerta aparecer" style="margin-top:4px">
      <div class="lbl"><span class="punto vivo"></span> ${sc.ic} Se activó tu Resguardo</div>
      <div class="big">${etiqueta(sc, v)} en tu zona</div>
      <div class="reloj" style="font-size:40px">${usd(monto)}</div>
      <div style="font-size:13px;opacity:.9">No tienes que reclamar ni demostrar daños.</div>
    </div>
    <div class="mini">${pasos.map(([tt, s], i) => `<div class="paso-t ${e.etapa > i ? "ok" : ""}"><span class="c">${e.etapa > i ? "✓" : i + 1}</span><div><div class="t">${tt}</div><div class="s">${esc(s)}</div></div></div>`).join("")}</div>
    ${e.etapa >= 3 ? `<div class="clave"><div class="sub">Pago Móvil recibido</div><div class="cod">${usd(monto)}</div><div class="sub">Ref. RSG-${e.ref} · Banco Cumbre</div></div>` : ""}
    <div class="mini"><div class="cob"><span class="ic">📞</span><div><div class="t">¿Necesitas ayuda ahora?</div><div class="s">Línea de emergencias y refugios cercanos de Protección Civil.</div></div></div></div>
    <button class="btn-turno btn-osc" data-acc="cerrar-evento">Listo</button>`;
}

function tabCobertura() {
  const pl = PLANES[S.plan];
  return `<div class="app-titulo" style="margin-top:6px">Cómo se calcula</div>
    <p class="app-sub">Tu pago depende del dato medido en tu zona, no de un perito. Así puede llegar en 48 horas.</p>
    <div class="mini"><h4>🌋 Sismo · intensidad en tu zona</h4>
      <div class="escala">${UMBRAL_SISMO.map((u, i) => `<div><b>${usd(pl.sismo[i])}</b>${ROMANO[u]}${i === 2 ? "+" : ""}</div>`).join("")}</div>
      <p class="sub" style="margin-top:8px">Fuente: mapa de sacudida del USGS, contrastado con FUNVISIS.</p></div>
    <div class="mini"><h4>🌧️ Lluvia acumulada en 24 h</h4>
      <div class="escala">${UMBRAL_LLUVIA.map((u, i) => `<div><b>${usd(pl.lluvia[i])}</b>${u}+ mm</div>`).join("")}</div>
      <p class="sub" style="margin-top:8px">Fuente: satélite (NASA GPM), contrastado con el INAMEH.</p></div>
    <div class="mini"><h4>Cambiar plan</h4>
      ${Object.entries(PLANES).map(([k, p]) => `<button class="mov ${S.plan === k ? "sel" : ""}" data-plan="${k}"><span><b>${p.n}</b><br><span class="sub">Hasta ${usd(p.sismo[2])} por sismo</span></span><b>${usd2(p.precio)}/mes</b></button>`).join("")}</div>
    <p class="sub" style="margin-top:10px"><b>Importante:</b> si tu casa sufre daños pero el dato de tu zona no pasa el umbral, no hay pago. Y si el dato pasa el umbral, pagamos aunque no haya daños.</p>`;
}

function tabHistorial() {
  return `<div class="app-titulo" style="margin-top:6px">Mis pagos</div>
    <p class="app-sub">Cada pago llegó sin que José tuviera que pedirlo.</p>
    <div class="mini">${S.historial.map((h) => `<div class="hist"><span><b>${esc(h.tipo)}</b><br><span class="sub">${esc(h.fecha)} · ${esc(h.det)}</span></span><span style="text-align:right"><b>${usd(h.monto)}</b><br><span class="badge b-verde">${esc(h.estado)}</span></span></div>`).join("")}</div>
    <div class="mini"><div class="cob"><span class="ic">🧾</span><div><div class="t">Primas pagadas este año</div><div class="s">${usd2(PLANES[S.plan].precio * 10)} en 10 meses</div></div></div></div>`;
}

// ---------------------------------------------------------------------------
// Monitor de la aseguradora
// ---------------------------------------------------------------------------
function mapa(res, sc) {
  const W = 900, H = 330, lon0 = -72, lon1 = -63.4, lat0 = 8.2, lat1 = 11.2;
  const X = (lon) => 30 + ((lon - lon0) / (lon1 - lon0)) * (W - 60), Y = (lat) => H - 30 - ((lat - lat0) / (lat1 - lat0)) * (H - 60);
  const color = (z) => !sc ? "#a78bfa" : z.t === 2 ? "#ef4444" : z.t === 1 ? "#f97316" : z.t === 0 ? "#facc15" : "#64748b";
  let ondas = "";
  if (sc && sc.id === "sismo") ondas = [40, 80, 130, 190].map((r, i) => `<circle cx="${X(sc.lon)}" cy="${Y(sc.lat)}" r="${r}" fill="none" stroke="#ef4444" stroke-opacity="${0.55 - i * 0.12}" stroke-width="2"/>`).join("") + `<text x="${X(sc.lon) + 8}" y="${Y(sc.lat) - 8}" fill="#fecaca" font-size="12" font-family="Geist">Epicentro</text><circle cx="${X(sc.lon)}" cy="${Y(sc.lat)}" r="5" fill="#ef4444"/>`;
  if (sc && sc.id === "lluvia") ondas = `<ellipse cx="${X(-66.9)}" cy="${Y(10.47)}" rx="110" ry="60" fill="#3b82f6" fill-opacity=".18" stroke="#60a5fa" stroke-dasharray="4 4"/>`;
  const pts = res.map((z) => {
    const r = 5 + Math.sqrt(z.aseg) / 9;
    const lab = { libertador: "Caracas y alrededores", valencia: "Valencia", maracay: "Maracay", barquisimeto: "Barquisimeto", cumana: "Cumaná", merida: "Mérida" }[z.id];
    const dy = z.id === "libertador" ? 34 : r + 13;
    return `<circle cx="${X(z.lon)}" cy="${Y(z.lat)}" r="${r}" fill="${color(z)}" fill-opacity=".8" stroke="#0f172a" stroke-width="1.5"/>${lab ? `<text x="${X(z.lon)}" y="${Y(z.lat) + dy}" fill="#cbd5e1" font-size="11" text-anchor="middle" font-family="Geist">${lab}</text>` : ""}`;
  }).join("");
  return `<svg class="mapa-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa esquemático de zonas aseguradas">
    <rect width="${W}" height="${H}" fill="#0f172a"/>
    <path d="M${X(-71.6)} ${Y(10.9)} Q ${X(-70)} ${Y(11.6)} ${X(-68.6)} ${Y(10.55)} T ${X(-67)} ${Y(10.62)} T ${X(-65.2)} ${Y(10.15)} T ${X(-63.6)} ${Y(10.7)}" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="${X(-69.8)}" y="${Y(11.05)}" fill="#475569" font-size="12" font-family="Geist">Mar Caribe</text>
    ${ondas}${pts}
    <text x="${W - 14}" y="${H - 12}" fill="#475569" font-size="11" text-anchor="end" font-family="Geist">Mapa esquemático, no a escala</text>
  </svg>`;
}
function monitor() {
  const sc = S.lote ? ESCENARIOS[S.lote.esc] : null;
  const res = sc ? resultado(sc) : ZONAS.map((z) => ({ ...z, t: -1, monto: 0, activa: false, v: 0 }));
  const totalAseg = ZONAS.reduce((a, z) => a + z.aseg, 0);
  const primaMes = totalAseg * (MIX_HOGAR * PLANES.hogar.precio + (1 - MIX_HOGAR) * PLANES.basico.precio);
  const activas = res.filter((z) => z.activa), pers = activas.reduce((a, z) => a + z.aseg, 0), total = activas.reduce((a, z) => a + z.monto, 0);
  const sumaMax = totalAseg * (MIX_HOGAR * 800 + (1 - MIX_HOGAR) * 400);
  return `
  <div class="contenedor">
    <div class="titulo-pag"><div><span class="eyebrow">Panel de la aseguradora</span><h1>${ASEGURADORA.nombre} · Monitor Resguardo</h1><p>Microseguro paramétrico colectivo · colocado por ${ASEGURADORA.corredor} · respaldado por ${ASEGURADORA.reaseguro}</p></div>
      <div class="demo-ctrl" style="margin:0"><button class="btn btn-pri" data-lote="sismo">🌋 Simular sismo</button><button class="btn btn-osc" data-lote="lluvia">🌧️ Simular lluvia</button>${S.lote ? `<button class="btn btn-borde" data-acc="limpiar">Limpiar</button>` : ""}</div></div>
    <div class="kpis">
      <div class="kpi"><div class="v">${ent(totalAseg)}</div><div class="e">hogares y negocios asegurados</div><div class="d">${ZONAS.length} zonas monitoreadas</div></div>
      <div class="kpi"><div class="v">${usd(primaMes)}</div><div class="e">prima del mes</div></div>
      <div class="kpi"><div class="v">${usd(sumaMax / 1e6)} M</div><div class="e">exposición máxima</div><div class="d">si todas las zonas pagan el tramo más alto</div></div>
      <div class="kpi"><div class="v" style="color:${sc ? "var(--rojo)" : "var(--verde)"}">${sc ? usd(total) : "Sin eventos"}</div><div class="e">${sc ? `a pagar a ${ent(pers)} asegurados` : "eventos que activen pagos"}</div></div>
    </div>
    <div class="rejilla-2">
      <div class="pila">
        <div class="tarjeta"><h2 class="sec">🛰️ ${sc ? esc(sc.n) : "Zonas monitoreadas"}</h2>${mapa(res, sc)}
          <div class="leyenda" style="flex-wrap:wrap">${sc ? `<i style="background:#ef4444"></i> Tramo alto <i style="background:#f97316"></i> Tramo medio <i style="background:#facc15"></i> Tramo bajo <i style="background:#64748b"></i> Sin pago` : `Tamaño del círculo = asegurados en la zona`}</div>
          ${sc ? `<p class="sub" style="margin-top:8px">${esc(sc.fuente)}. Valores de la simulación: ilustrativos.</p>` : ""}</div>
        <div class="tarjeta"><h2 class="sec">📋 Zonas ${sc ? "y pagos del evento" : ""}</h2>
          <div class="tabla-env"><table><thead><tr><th>Zona</th><th>${sc ? (sc.id === "sismo" ? "Intensidad" : "Lluvia 24 h") : "Estado"}</th><th style="text-align:right">Asegurados</th><th style="text-align:right">A pagar</th></tr></thead>
          <tbody>${res.slice().sort((a, b) => b.monto - a.monto || b.aseg - a.aseg).map((z) => `<tr><td><b>${esc(z.n)}</b></td><td>${sc ? `${etiqueta(sc, z.v)} ${z.activa ? `<span class="badge ${z.t === 2 ? "b-rojo" : z.t === 1 ? "b-naranja" : "b-ambar"}">Tramo ${z.t + 1}</span>` : `<span class="badge b-gris">Bajo umbral</span>`}` : `<span class="badge b-verde">Vigilando</span>`}</td><td style="text-align:right">${ent(z.aseg)}</td><td style="text-align:right"><b>${z.monto ? usd(z.monto) : "—"}</b></td></tr>`).join("")}</tbody></table></div></div>
      </div>
      <div class="pila">
        <div class="tarjeta"><h2 class="sec">💸 Lote de pagos</h2>
          ${sc ? `<div style="font-size:30px;font-weight:800;letter-spacing:-.02em">${usd(total)}</div><div class="sub">${ent(pers)} asegurados en ${activas.length} zonas</div>
            <div class="mini" style="margin-top:12px">${[["Evento detectado", hhmm(S.lote.hora)], ["Verificado con 2 fuentes", "+20 min"], ["Lote calculado", "+2 h"], [S.lote.estado === "Pagado" ? "Pagos enviados por Pago Móvil" : "Pagos por enviar", S.lote.estado === "Pagado" ? "completado" : "objetivo: 48 h"]].map(([t, s], i) => `<div class="paso-t ${i < 3 || S.lote.estado === "Pagado" ? "ok" : ""}"><span class="c">${i < 3 || S.lote.estado === "Pagado" ? "✓" : i + 1}</span><div><div class="t">${t}</div><div class="s">${s}</div></div></div>`).join("")}</div>
            <div class="hist" style="margin-top:6px"><span>Retención de ${ASEGURADORA.nombre}</span><b>${usd(Math.min(total, 1500000))}</b></div>
            <div class="hist"><span>Cubierto por el reaseguro</span><b>${usd(Math.max(0, total - 1500000))}</b></div>
            ${S.lote.estado === "Pagado" ? `<div class="banda-alerta verde"><span class="i">✅</span><span><b>Lote pagado</b><br>Cada asegurado recibió su monto por Pago Móvil sin presentar reclamo.</span></div>` : `<button class="btn btn-pri bloque" style="margin-top:12px" data-acc="pagar-lote">Liberar pagos</button>`}`
          : `<p class="sub">No hay eventos sobre el umbral. Usa "Simular sismo" o "Simular lluvia" para ver cómo se activa un lote.</p>`}</div>
        <div class="tarjeta"><h2 class="sec">🧮 Por qué es sostenible</h2>
          <ul class="lista-check">
            <li><span class="ic-check ic-ok">✓</span><div><b>Sin peritos ni reclamos</b><div class="sub">El costo de gestionar cada siniestro cae casi a cero.</div></div></li>
            <li><span class="ic-check ic-ok">✓</span><div><b>Reaseguro paramétrico</b><div class="sub">El riesgo catastrófico se transfiere al mercado internacional con el mismo índice.</div></div></li>
            <li><span class="ic-check ic-ok">✓</span><div><b>Datos públicos y auditables</b><div class="sub">El índice se publica; cualquiera puede verificar por qué se pagó.</div></div></li>
          </ul></div>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Mi zona (consulta)
// ---------------------------------------------------------------------------
function vistaZona() {
  const z = zona(S.consulta);
  const filas = Object.values(ESCENARIOS).map((sc) => {
    const v = medida(sc, z), t = tramo(sc, v);
    return `<div class="hist"><span><b>${sc.ic} ${esc(sc.n)}</b><br><span class="sub">${etiqueta(sc, v)}</span></span><span style="text-align:right">Básico <b>${usd(pago(sc, "basico", t))}</b><br>Hogar <b>${usd(pago(sc, "hogar", t))}</b></span></div>`;
  }).join("");
  return `
  <div class="contenedor"><div class="verif" style="max-width:620px">
    <span class="eyebrow">Mi zona</span>
    <h1 style="font-size:28px;letter-spacing:-0.03em;margin:6px 0 6px">¿Cuánto me pagaría Resguardo?</h1>
    <p class="sub" style="font-size:14.5px">Elige tu municipio y compara cuánto habrías recibido en cada escenario de prueba. Los valores de los escenarios son ilustrativos.</p>
    <div style="margin-top:16px"><select class="sel" id="sel-zona" style="width:100%">${ZONAS.map((x) => `<option value="${x.id}" ${x.id === z.id ? "selected" : ""}>${esc(x.n)}</option>`).join("")}</select></div>
    <div class="tarjeta" style="margin-top:14px">${filas}</div>
    <div class="tarjeta" style="margin-top:14px"><h2 class="sec">📏 Tabla de pagos</h2>
      <div class="tabla-env"><table><thead><tr><th>Evento</th><th>Umbral</th><th style="text-align:right">Básico ${usd2(PLANES.basico.precio)}/mes</th><th style="text-align:right">Hogar ${usd2(PLANES.hogar.precio)}/mes</th></tr></thead><tbody>
      ${UMBRAL_SISMO.map((u, i) => `<tr><td>🌋 Sismo</td><td>Intensidad ${ROMANO[u]}${i === 2 ? " o más" : ""}</td><td style="text-align:right">${usd(PLANES.basico.sismo[i])}</td><td style="text-align:right">${usd(PLANES.hogar.sismo[i])}</td></tr>`).join("")}
      ${UMBRAL_LLUVIA.map((u, i) => `<tr><td>🌧️ Lluvia</td><td>${u} mm o más en 24 h</td><td style="text-align:right">${usd(PLANES.basico.lluvia[i])}</td><td style="text-align:right">${usd(PLANES.hogar.lluvia[i])}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="sub" style="margin-top:10px">Precios y montos referenciales. Un evento paga el tramo más alto alcanzado en tu zona.</p></div>
  </div></div>`;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
function simularPersona(e) {
  limpiarTemp();
  S.pestana = "inicio";
  set({ evento: { esc: e, hora: Date.now(), etapa: 1, ref: Math.floor(100000 + Math.random() * 899999) }, lote: { esc: e, estado: "Detectado", hora: Date.now() } });
  [2, 3].forEach((et, i) => temporizadores.push(setTimeout(() => {
    if (!S.evento) return;
    S.evento.etapa = et;
    if (et === 3) {
      const sc = ESCENARIOS[e], z = zona(S.zona), v = medida(sc, z), t = tramo(sc, v), m = pago(sc, S.plan, t);
      if (m) { const d = new Date(); S.historial = [{ fecha: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`, tipo: sc.id === "sismo" ? "Sismo" : "Lluvia intensa", det: etiqueta(sc, v), monto: m, estado: "Pagado" }, ...S.historial]; }
      S.lote.estado = "Pagado";
    }
    guardar(); if (ruta().path.startsWith("/persona")) render();
  }, 1600 * (i + 1))));
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-acc],[data-tab],[data-sim],[data-lote],[data-plan]");
  if (!el || el.disabled) return;
  const d = el.dataset;
  if (d.tab) return set({ pestana: d.tab });
  if (d.plan) { toast(`Plan ${PLANES[d.plan].n} activo`); return set({ plan: d.plan }); }
  if (d.sim) return simularPersona(d.sim);
  if (d.lote) { limpiarTemp(); return set({ lote: { esc: d.lote, estado: "Detectado", hora: Date.now() }, evento: null }); }
  switch (d.acc) {
    case "cerrar-evento": limpiarTemp(); return set({ evento: null });
    case "pagar-lote": toast("Pagos enviados por Pago Móvil"); return set({ lote: { ...S.lote, estado: "Pagado" } });
    case "limpiar": return set({ lote: null });
  }
});
document.addEventListener("change", (e) => { if (e.target.id === "sel-zona") set({ consulta: e.target.value }); });

render();
