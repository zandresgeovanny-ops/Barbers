import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// ElweroBarbero — v3
// Demo de agenda para barberías. Datos ficticios.
// ─────────────────────────────────────────────────────────────

const BARBEROS = [
  { id: 1, nombre: "Güero", color: "#D4A03C" },
  { id: 2, nombre: "Chuy", color: "#4A8FA8" },
];

const SERVICIOS = [
  { id: 1, nombre: "Corte", precio: 150, min: 40 },
  { id: 2, nombre: "Corte + barba", precio: 290, min: 60 },
  { id: 3, nombre: "Solo barba", precio: 130, min: 25 },
  { id: 4, nombre: "Contornos", precio: 60, min: 15 },
  { id: 5, nombre: "Diseño de ceja", precio: 60, min: 15 },
  { id: 6, nombre: "Corte niño", precio: 120, min: 30 },
  { id: 7, nombre: "Mascarilla", precio: 180, min: 30 },
  { id: 8, nombre: "Tinte", precio: 350, min: 75 },
];

// La demo tiene que abrir en el día en que se presenta. Las fechas semilla se
// calculan como desplazamientos respecto a hoy, no como cadenas fijas: con una
// fecha escrita a mano la agenda envejece y el cliente ve un día pasado.
const diaISO = (desp = 0) => {
  const f = new Date();
  f.setHours(12, 0, 0, 0);            // mediodía: inmune a los cambios de horario
  f.setDate(f.getDate() + desp);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
};

const HOY = diaISO(0);
const AYER = diaISO(-1);
const HACE3 = diaISO(-3);
const HACE4 = diaISO(-4);
const MANANA = diaISO(1);
const EN2 = diaISO(2);

// Datos base de la demo. El estado de las citas de HOY no se fija aquí: se
// deriva de la hora real de apertura en semilla(), para que a media mañana las
// de la tarde sigan pendientes y por la noche aparezcan ya cobradas.
// Algunos clientes repiten a lo largo del historial: eso alimenta la ficha de
// cliente (visitas, gasto acumulado). Hay dos ausencias reales (no_llego) que
// nutren la tarjeta de "no llegaron" con un conteo verdadero, no inventado.
const CITAS_BASE = [
  { id: 1, fecha: HOY, h: 9.0, dur: 40, cliente: "Ricardo Muñoz", tel: "4491234567", serv: "Corte", precio: 150, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 2, fecha: HOY, h: 9.75, dur: 60, cliente: "Iván Delgado", tel: "4497654321", serv: "Corte + barba", precio: 290, barbero: 2, estado: "completada", pago: "tarjeta", nota: "Degradado bajo, sin máquina arriba" },
  { id: 3, fecha: HOY, h: 11.0, dur: 15, cliente: "Toño Ramírez", tel: "4491112233", serv: "Contornos", precio: 60, barbero: 1, estado: "completada", pago: "efectivo", nota: "" },
  { id: 4, fecha: HOY, h: 11.5, dur: 40, cliente: "Beto Cardona", tel: "4492223344", serv: "Corte", precio: 150, barbero: 2, estado: "confirmada", pago: "tarjeta", nota: "" },
  { id: 5, fecha: HOY, h: 12.5, dur: 30, cliente: "Diego Salcedo", tel: "4493334455", serv: "Corte niño", precio: 120, barbero: 1, estado: "confirmada", pago: "efectivo", nota: "Es niño, se mueve mucho" },
  { id: 6, fecha: HOY, h: 13.5, dur: 60, cliente: "Fernando Ruiz", tel: "4494445566", serv: "Corte + barba", precio: 290, barbero: 2, estado: "confirmada", pago: "tarjeta", nota: "" },
  { id: 7, fecha: HOY, h: 17.0, dur: 40, cliente: "Alan Espinoza", tel: "4495556677", serv: "Corte", precio: 150, barbero: 1, estado: "pendiente", pago: "tarjeta", nota: "" },
  { id: 8, fecha: HOY, h: 17.5, dur: 15, cliente: "Óscar Lira", tel: "4496667788", serv: "Contornos", precio: 60, barbero: 2, estado: "pendiente", pago: "efectivo", nota: "" },
  { id: 9, fecha: HOY, h: 18.0, dur: 60, cliente: "Memo Cortés", tel: "4497778899", serv: "Corte + barba", precio: 290, barbero: 1, estado: "pendiente", pago: "efectivo", nota: "Quiere probar la línea del contorno más marcada" },
  { id: 10, fecha: HOY, h: 19.0, dur: 25, cliente: "Sergio Palos", tel: "4498889900", serv: "Solo barba", precio: 130, barbero: 2, estado: "pendiente", pago: "tarjeta", nota: "" },
  // Historial para el calendario y la ficha de cliente
  { id: 11, fecha: AYER, h: 10.0, dur: 40, cliente: "Ricardo Muñoz", tel: "4491234567", serv: "Corte", precio: 150, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 12, fecha: AYER, h: 12.0, dur: 60, cliente: "Pablo Sáenz", tel: "4491002003", serv: "Corte + barba", precio: 290, barbero: 2, estado: "completada", pago: "efectivo", nota: "" },
  { id: 13, fecha: AYER, h: 16.0, dur: 30, cliente: "Diego Salcedo", tel: "4493334455", serv: "Corte niño", precio: 120, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 14, fecha: HACE3, h: 11.0, dur: 40, cliente: "Beto Cardona", tel: "4492223344", serv: "Corte", precio: 150, barbero: 2, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 15, fecha: HACE3, h: 15.0, dur: 75, cliente: "Emilio Sandoval", tel: "4491005006", serv: "Tinte", precio: 350, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 16, fecha: HACE4, h: 10.5, dur: 25, cliente: "Sergio Palos", tel: "4498889900", serv: "Solo barba", precio: 130, barbero: 2, estado: "completada", pago: "efectivo", nota: "" },
  // Ausencias reales del mes: alimentan la tarjeta de "no llegaron"
  { id: 20, fecha: HACE3, h: 17.5, dur: 40, cliente: "Lalo Márquez", tel: "4491234000", serv: "Corte", precio: 150, barbero: 2, estado: "no_llego", pago: "efectivo", nota: "" },
  { id: 21, fecha: HACE4, h: 18.0, dur: 60, cliente: "Chava Ortiz", tel: "4491234111", serv: "Corte + barba", precio: 290, barbero: 1, estado: "no_llego", pago: "tarjeta", nota: "" },
  { id: 17, fecha: MANANA, h: 10.0, dur: 40, cliente: "Andrés Zermeño", tel: "4491234222", serv: "Corte", precio: 150, barbero: 1, estado: "pendiente", pago: "tarjeta", nota: "" },
  { id: 18, fecha: MANANA, h: 13.0, dur: 60, cliente: "Marco Tapia", tel: "4491234333", serv: "Corte + barba", precio: 290, barbero: 2, estado: "pendiente", pago: "efectivo", nota: "" },
  { id: 19, fecha: EN2, h: 16.0, dur: 15, cliente: "Kevin Padilla", tel: "4491234444", serv: "Contornos", precio: 60, barbero: 1, estado: "pendiente", pago: "efectivo", nota: "" },
];

// Rejilla de media hora, 9am a 8:30pm
const APERTURA = 9;
const CIERRE = 20.5;
const PASO = 0.5;

// Escala del lienzo: una cita de 15 min mide 40px reales (42 − 2 de separación),
// que es el mínimo táctil cómodo. De ahí sale el resto de la escala.
const PX_POR_HORA = 168;
const ALTO_LIENZO = (CIERRE - APERTURA) * PX_POR_HORA;
const GUTTER_COL = 4;

// Medidas del lienzo. Sirven para saber cuánto espacio tiene una tarjeta sin
// medir el DOM: así los botones ya salen bien en el primer pintado.
const ANCHO_MAX = 560;
const PAD_AGENDA = 12;
const ANCHO_HORAS = 44;
const GAP_HORAS = 8;
const anchoLienzoDe = (vw) =>
  Math.min(ANCHO_MAX, vw) - PAD_AGENDA * 2 - ANCHO_HORAS - GAP_HORAS;

// Un carril por barbero, siempre. La columna es propiedad del empleado, no del
// conflicto de horarios: así la carga de cada uno se lee de un vistazo vertical.
const ANCHO_CARRIL = 100 / BARBEROS.length;

const yDe = (h) => (h - APERTURA) * PX_POR_HORA;
const altoDe = (dur) => (dur / 60) * PX_POR_HORA - 2;
const finDe = (c) => c.h + c.dur / 60;

// Hora actual como decimal (14:30 -> 14.5). La demo se ancla a este valor.
const horaActual = () => {
  const f = new Date();
  return f.getHours() + f.getMinutes() / 60;
};

// La semilla adapta el estado de las citas de HOY al reloj real: lo que ya
// terminó aparece cobrado, lo próximo confirmado y lo lejano pendiente. Así la
// agenda nunca se ve "toda hecha" a las 9am ni "toda pendiente" a las 8pm.
function semilla() {
  const ahora = horaActual();
  return CITAS_BASE.map((c) => {
    if (c.fecha !== HOY) return { ...c };
    let estado;
    if (finDe(c) <= ahora) estado = "completada";
    else if (c.h <= ahora + 2) estado = "confirmada";
    else estado = "pendiente";
    return { ...c, estado };
  });
}

// Persistencia: un F5 o que el teléfono descargue la pestaña no debe borrar lo
// capturado frente al cliente. Pero los datos se guardan con el día en que se
// crearon; si la demo se abre otro día, se vuelve a sembrar para que la agenda
// siga siendo "la de hoy" y no reviva citas con fecha vieja.
const LS_KEY = "elwero_estado_v3";
function cargarEstado() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.dia === HOY && Array.isArray(p.citas) && p.citas.length) return p;
    }
  } catch { /* localStorage bloqueado (modo privado): seguimos con la semilla */ }
  return { dia: HOY, citas: semilla(), nextId: 200 };
}

// Nombre normalizado para agrupar al mismo cliente aunque teclees distinto.
const claveCliente = (nombre = "") =>
  nombre.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const SLOTS = [];
for (let h = APERTURA; h < CIERRE; h += PASO) SLOTS.push(h);

// Paso fino para proponer horas de inicio: la agenda promete servicios de 15 min,
// así que el alta tiene que poder empezar en :15 y :45, no solo en la media hora.
const PASO_FINO = 0.25;

const fmtHora = (h) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const suf = hh >= 12 ? "pm" : "am";
  const h12 = hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")}${suf}`;
};

// Minutos a lenguaje de barbería: "45min", "1h", "2h 30".
const fmtDur = (min) => {
  const m = Math.round(min);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${String(r).padStart(2, "0")}` : `${h}h`;
};

const fmtFechaLarga = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const f = new Date(a, m - 1, d);
  return `${dias[f.getDay()]} ${d} de ${meses[m - 1]}`;
};

const C = {
  bg: "#14110E", panel: "#1D1915", panelAlt: "#221D18", line: "#2E2820",
  text: "#F0EAE0", mute: "#8A7F6E", gold: "#D4A03C", teal: "#4A8FA8",
  verde: "#3E9E6A", morado: "#7B5EA7", rojo: "#C8564A",
  // Verde de completada ya compuesto sobre el panel: opaco, para que la tarjeta
  // no deje ver los botones de acción que viven debajo en el swipe.
  panelHecho: "#233124",
};

// Rejilla horaria pintada con gradientes en vez de 23 divs absolutos: el mismo
// dibujo con cero nodos extra que componer al scrollear. Pesa en gama media.
const REJILLA =
  `repeating-linear-gradient(to bottom, ${C.line} 0 1px, transparent 1px ${PX_POR_HORA}px),` +
  `repeating-linear-gradient(to bottom, rgba(46,40,32,.45) 0 1px, transparent 1px ${PX_POR_HORA * PASO}px)`;

// ── Reparto en carriles ───────────────────────────────────────
// Cada barbero ocupa siempre su columna. Un carril solo se subdivide cuando ese
// mismo barbero tiene dos citas encimadas; lo que haga el otro nunca lo estrecha.
function repartirEnCarriles(citas) {
  return BARBEROS.flatMap((b, iCarril) => {
    const suyas = citas.filter(c => c.barbero === b.id).sort((x, z) => x.h - z.h || x.dur - z.dur);
    const salida = [];
    let grupo = [];
    let finGrupo = -Infinity;

    const cerrar = () => {
      if (!grupo.length) return;
      // fines[i] = hora en que se libera la sub-columna i. Empaque voraz.
      const fines = [];
      const puestos = grupo.map(c => {
        let sub = fines.findIndex(f => f <= c.h + 1e-6);
        if (sub === -1) sub = fines.length;
        fines[sub] = finDe(c);
        return { cita: c, sub };
      });
      const n = Math.max(1, fines.length);
      const ancho = ANCHO_CARRIL / n;
      puestos.forEach(p => salida.push({
        cita: p.cita,
        izqPct: iCarril * ANCHO_CARRIL + p.sub * ancho,
        anchoPct: ancho,
      }));
      grupo = [];
      finGrupo = -Infinity;
    };

    suyas.forEach(c => {
      if (grupo.length && c.h >= finGrupo - 1e-6) cerrar();
      grupo.push(c);
      finGrupo = Math.max(finGrupo, finDe(c));
    });
    cerrar();
    return salida;
  });
}

// Huecos por carril, uniendo las medias horas libres consecutivas en un solo
// bloque: 4 recuadros en vez de 46, menos ruido visual y menos nodos que pintar.
function huecosDelDia(citas) {
  const huecos = [];
  BARBEROS.forEach((b, i) => {
    let ini = null;
    const cerrar = (fin) => {
      if (ini === null) return;
      huecos.push({ ini, fin, barbero: b, izqPct: i * ANCHO_CARRIL, anchoPct: ANCHO_CARRIL });
      ini = null;
    };
    SLOTS.forEach(h => {
      const ocupado = citas.some(c => c.barbero === b.id && c.h < h + PASO && finDe(c) > h);
      if (ocupado) cerrar(h);
      else if (ini === null) ini = h;
    });
    cerrar(CIERRE);
  });
  return huecos;
}

// ── CountUp ───────────────────────────────────────────────────
function CountUp({ to, dur = 1100, prefix = "", suffix = "", play }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) { setV(0); return; }
    // Sin animación cuando el sistema la pide apagada o la pestaña está en segundo
    // plano: ahí requestAnimationFrame no corre y la cifra se quedaría clavada en 0.
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden;
    if (quieto) { setV(to); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Red de seguridad: si el navegador nunca entrega un fotograma, la cifra
    // aparece igual. Vale más un número correcto sin cuenta que un cero.
    const red = setTimeout(() => setV(to), dur + 320);
    return () => { cancelAnimationFrame(raf); clearTimeout(red); };
  }, [to, dur, play]);
  return <span>{prefix}{v.toLocaleString("es-MX")}{suffix}</span>;
}

// ── ShinyText ─────────────────────────────────────────────────
function ShinyText({ children }) {
  return (
    <span style={{
      background: "linear-gradient(110deg,#8A7A5C 20%,#F5E6C8 45%,#8A7A5C 70%)",
      backgroundSize: "220% 100%",
      WebkitBackgroundClip: "text", backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animation: "shine 3.5s linear infinite",
    }}>{children}</span>
  );
}

// ── SpotlightCard (ReactBits, adaptado sin dependencias) ──────
// Un foco radial suave sigue al cursor sobre la ficha del cliente. La posición
// se escribe en variables CSS, no en estado de React: así no re-renderizamos el
// árbol en cada pixel del movimiento. En táctil no hay hover y simplemente no se
// enciende, sin coste.
function SpotlightCard({ children, style, spot = "rgba(212,160,60,.20)" }) {
  const ref = useRef(null);
  const seguir = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} className="spot" onMouseMove={seguir} style={{ "--spot": spot, ...style }}>
      {children}
    </div>
  );
}

// ── Iconos ────────────────────────────────────────────────────
const IcCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
// Flecha de retorno, como la tecla Enter: baja por la derecha, gira a la
// izquierda y remata en punta. Se lee como "regresar", no como "recargar".
const IcUndo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5v6a3 3 0 0 1-3 3H5" /><polyline points="9 10 5 14 9 18" /></svg>
);
const IcMove = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
);
const IcTrash = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
);

// ── SwipeCard (swipe-to-reveal) ───────────────────────────────
const SwipeCard = React.memo(function SwipeCard({
  cita, abierta, top, alto, izqPct, anchoPct, anchoPx,
  onAbrir, onCerrar, onAlternar, onMover, onBorrar, onTocar,
}) {
  const capaRef = useRef(null);
  const ref = useRef({ x0: 0, y0: 0, dx0: 0, dx: 0, activo: false, decidido: false, esHoriz: false });

  const completada = cita.estado === "completada";

  // Los botones se ajustan al espacio real de la tarjeta: en un carril angosto
  // o en una cita de 15 min se quedan solo con el icono.
  const bw = anchoPx >= 300 ? 62 : anchoPx >= 236 ? 50 : anchoPx >= 172 ? 44 : 38;
  const gapBtn = bw >= 50 ? 7 : 5;
  const conTexto = bw >= 50 && alto >= 62;
  const anchoAcciones = bw * 3 + gapBtn * 2 + 4;
  const altoBtn = Math.max(36, Math.min(alto - 4, 92));

  const objetivo = abierta ? -anchoAcciones : 0;

  // El arrastre escribe la transformación directo en el nodo. Un setState por
  // fotograma re-renderizaría el árbol 60 veces por segundo y en un teléfono de
  // gama media eso es justo lo que hace que el gesto se sienta pegajoso.
  const pintar = (x, conTransicion) => {
    const el = capaRef.current;
    if (!el) return;
    el.style.transition = conTransicion ? "transform .42s cubic-bezier(.22,1.1,.36,1)" : "none";
    el.style.transform = `translate3d(${x}px,0,0)`;
  };

  // Si la tarjeta cambia de estado desde fuera (otra se abre, se completa esta),
  // hay que devolverla a su posición: React no reescribe lo que mutamos a mano.
  useEffect(() => { pintar(objetivo, true); }, [objetivo]);

  const inicio = (cx, cy) => {
    ref.current = {
      x0: cx, y0: cy, dx0: objetivo, dx: objetivo,
      activo: true, decidido: false, esHoriz: false,
    };
  };

  const mover_ = (cx, cy, e) => {
    const r = ref.current;
    if (!r.activo) return;
    const ddx = cx - r.x0;
    const ddy = cy - r.y0;

    if (!r.decidido) {
      if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
      r.decidido = true;
      r.esHoriz = Math.abs(ddx) > Math.abs(ddy);
      if (r.esHoriz && capaRef.current) capaRef.current.style.willChange = "transform";
    }
    if (!r.esHoriz) return;
    if (e && e.cancelable) e.preventDefault();

    let nx = r.dx0 + ddx;
    if (nx > 0) nx = nx * 0.28;                          // resistencia al abrir a la derecha
    if (nx < -anchoAcciones) nx = -anchoAcciones + (nx + anchoAcciones) * 0.28;
    r.dx = nx;
    pintar(nx, false);
  };

  const fin = () => {
    const r = ref.current;
    if (!r.activo) return;
    const eraHoriz = r.esHoriz;
    const movio = r.decidido;
    r.activo = false;
    if (capaRef.current) capaRef.current.style.willChange = "auto";

    if (!eraHoriz) {
      if (!movio) onTocar(cita);
      return;
    }
    const umbral = abierta ? -anchoAcciones + 55 : -55;
    const abre = r.dx < umbral;
    pintar(abre ? -anchoAcciones : 0, true);
    if (abre) onAbrir(cita); else onCerrar(cita);
  };

  const b = BARBEROS.find(x => x.id === cita.barbero);
  const compacta = alto < 56;
  const conNota = alto >= 104 && !!cita.nota;

  const btn = (color, colorTexto, Icon, txt, fn) => (
    <button onClick={(e) => { e.stopPropagation(); fn(); }} aria-label={txt} style={{
      width: bw, height: altoBtn,
      background: color, border: "none", borderRadius: 999,
      color: colorTexto, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: conTexto ? 4 : 0,
      cursor: "pointer", padding: 0, flexShrink: 0,
    }}>
      <Icon />
      {conTexto && <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: .2 }}>{txt}</span>}
    </button>
  );

  return (
    <div style={{
      position: "absolute", top, height: alto,
      left: `${izqPct}%`,
      width: anchoPct >= 100 ? "100%" : `calc(${anchoPct}% - ${GUTTER_COL}px)`,
      overflow: "hidden", borderRadius: 11,
    }}>
      {/* Capa inferior: acciones */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: anchoAcciones, display: "flex", alignItems: "center",
        justifyContent: "flex-end", gap: gapBtn, paddingRight: 4,
      }}>
        {completada
          ? btn(C.gold, C.bg, IcUndo, "Deshacer", () => onAlternar(cita))
          : btn(C.verde, "#fff", IcCheck, "Completar", () => onAlternar(cita))}
        {btn(C.morado, "#fff", IcMove, "Mover", () => onMover(cita))}
        {btn(C.rojo, "#fff", IcTrash, "Eliminar", () => onBorrar(cita))}
      </div>

      {/* Capa superior: tarjeta */}
      <div
        ref={capaRef}
        onTouchStart={(e) => inicio(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => mover_(e.touches[0].clientX, e.touches[0].clientY, e)}
        onTouchEnd={fin}
        onMouseDown={(e) => { e.preventDefault(); inicio(e.clientX, e.clientY); }}
        onMouseMove={(e) => ref.current.activo && mover_(e.clientX, e.clientY, null)}
        onMouseUp={fin}
        onMouseLeave={() => ref.current.activo && fin()}
        style={{
          position: "absolute", inset: 0,
          transform: `translate3d(${objetivo}px,0,0)`,
          transition: "transform .42s cubic-bezier(.22,1.1,.36,1)",
          background: completada ? C.panelHecho : C.panel,
          borderLeft: `3px solid ${completada ? C.verde : b.color}`,
          borderRadius: 11, padding: compacta ? "0 11px" : "9px 13px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          cursor: "grab", touchAction: "pan-y", userSelect: "none",
        }}>

        {compacta ? (
          // Una sola línea: no cabe la fila de servicio, el barbero se lee por el borde.
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: completada ? C.verde : C.text,
              // Color dentro de la shorthand: mezclarla con textDecorationColor
              // hace que React avise de estilos en conflicto al re-renderizar.
              textDecoration: completada ? "line-through rgba(62,158,106,.5)" : "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{cita.cliente}</span>
            <span style={{ fontSize: 11, color: C.mute, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
              {fmtHora(cita.h)} · <span style={{ color: completada ? C.verde : b.color }}>${cita.precio}</span>
            </span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontSize: 14.5, fontWeight: 600,
                color: completada ? C.verde : C.text,
                textDecoration: completada ? "line-through rgba(62,158,106,.5)" : "none",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{cita.cliente}</span>
              <span style={{ fontSize: 12, color: C.mute, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                {fmtHora(cita.h)}
              </span>
            </div>
            {/* El nombre del barbero no se repite aquí: ya lo dice la columna. */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11, color: C.mute, gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cita.serv} · {cita.dur}min
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <span style={{ fontSize: 9.5, opacity: .75 }}>{cita.pago === "tarjeta" ? "▭" : "$"}</span>
                <span style={{ color: completada ? C.verde : b.color }}>${cita.precio}</span>
              </span>
            </div>
            {conNota && (
              <div style={{ fontSize: 11, color: C.mute, marginTop: 4, fontStyle: "italic", opacity: .8 }}>
                {cita.nota}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

// ═════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("agenda");
  const [fecha, setFecha] = useState(HOY);
  // Estado inicial hidratado desde localStorage (o la semilla del día).
  const estadoIni = useMemo(() => cargarEstado(), []);
  const [citas, setCitas] = useState(estadoIni.citas);
  const [nextId, setNextId] = useState(estadoIni.nextId);
  const [abierta, setAbierta] = useState(null);
  const [detalle, setDetalle] = useState(null);   // cita mostrada en la ficha de cliente
  const [aviso, setAviso] = useState(null);
  const contadorAviso = useRef(0);
  const ultimoBorrado = useRef(null);              // para deshacer una cancelación

  // Cada cambio se persiste sellado con el día: mañana la demo re-siembra sola.
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ dia: HOY, citas, nextId })); }
    catch { /* modo privado: la demo sigue en memoria */ }
  }, [citas, nextId]);

  // Alta
  const [paso, setPaso] = useState(0);
  const [serv, setServ] = useState(null);
  const [hueco, setHueco] = useState(null);
  const [barbero, setBarbero] = useState(1);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [pago, setPago] = useState("tarjeta");
  const [nota, setNota] = useState("");
  const [listo, setListo] = useState(false);
  const [sugerida, setSugerida] = useState(null);   // hora heredada del hueco tocado
  const [editId, setEditId] = useState(null);       // id en edición (null = alta nueva)

  // Mover
  const [moviendo, setMoviendo] = useState(null);
  const [movBarbero, setMovBarbero] = useState(null);  // barbero destino al mover

  // Calendario: arranca en el mes en curso, no en uno escrito a mano
  const [mes, setMes] = useState(() => {
    const [a, m] = HOY.split("-").map(Number);
    return { a, m };
  });
  const [diaSel, setDiaSel] = useState(null);

  // Ancho del lienzo: define el tamaño de los botones del swipe.
  const [vw, setVw] = useState(() => document.documentElement.clientWidth);
  useEffect(() => {
    const f = () => setVw(document.documentElement.clientWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const anchoLienzo = anchoLienzoDe(vw);

  const [vistoDash, setVistoDash] = useState(false);
  useEffect(() => {
    if (tab === "numeros") { const t = setTimeout(() => setVistoDash(true), 60); return () => clearTimeout(t); }
    else setVistoDash(false);
  }, [tab]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2500);
    return () => clearTimeout(t);
  }, [aviso]);

  // El lienzo se recalcula solo cuando cambian las citas del día, no en cada
  // render: en gama media esto se nota al abrir el teclado o girar el teléfono.
  const delDia = useMemo(
    () => citas.filter(c => c.fecha === fecha).sort((a, b) => a.h - b.h),
    [citas, fecha]
  );
  const disposicion = useMemo(() => repartirEnCarriles(delDia), [delDia]);
  const huecos = useMemo(() => huecosDelDia(delDia), [delDia]);

  // ── Disponibilidad ──
  // Horas ofrecidas: la rejilla de media hora más el momento exacto en que
  // termina cada cita, que es cuando de verdad se abre un hueco de 15 min.
  const huecosPara = (min, f = fecha, excluirId = null, barb = null) => {
    const otras = citas.filter(c => c.fecha === f && c.id !== excluirId && (barb ? c.barbero === barb : true));
    const inicios = new Set(SLOTS);
    otras.forEach(c => {
      const fin = Math.round(finDe(c) / PASO_FINO) * PASO_FINO;
      if (fin >= APERTURA && fin < CIERRE) inicios.add(fin);
    });
    return [...inicios].sort((a, b) => a - b).filter(h => {
      const fin = h + min / 60;
      if (fin > CIERRE) return false;
      return !otras.some(c => h < finDe(c) && fin > c.h);
    });
  };

  // ── Acciones ──
  // El contador hace que dos avisos seguidos vuelvan a animarse: sin él, React
  // reutiliza el mismo nodo y el segundo toast aparece ya desvanecido.
  // `accion` es un botón opcional dentro del toast, p.ej. deshacer.
  const notificar = useCallback((texto, accion = null) =>
    setAviso({ texto, accion, n: contadorAviso.current++ }), []);

  // Alternador: guardar el estado previo permite deshacer las veces que haga falta.
  const alternarHecha = useCallback((c) => {
    const hecha = c.estado === "completada";
    setCitas(p => p.map(x => x.id !== c.id ? x : (hecha
      ? { ...x, estado: x.estadoPrevio || "confirmada" }
      : { ...x, estado: "completada", estadoPrevio: x.estado })));
    setAbierta(null); setDetalle(null);
    notificar(hecha ? `${c.cliente} — vuelve a pendiente` : `${c.cliente} — marcada como completada`);
  }, [notificar]);

  // Marca (o desmarca) que el cliente no se presentó. Alimenta la tarjeta de
  // "no llegaron" con un conteo real, no con un número fijo.
  const marcarNoLlego = useCallback((c) => {
    const ausente = c.estado === "no_llego";
    setCitas(p => p.map(x => x.id !== c.id ? x : (ausente
      ? { ...x, estado: x.estadoPrevio || "confirmada" }
      : { ...x, estado: "no_llego", estadoPrevio: x.estado === "no_llego" ? "confirmada" : x.estado })));
    setAbierta(null); setDetalle(null);
    notificar(ausente ? `${c.cliente} — vuelve a la agenda` : `${c.cliente} — marcado como no llegó`);
  }, [notificar]);

  const borrar = useCallback((c) => {
    ultimoBorrado.current = c;
    setCitas(p => p.filter(x => x.id !== c.id));
    setAbierta(null); setDetalle(null);
    const b = BARBEROS.find(x => x.id === c.barbero);
    // El toast trae su propio deshacer: un swipe sin querer no borra para siempre.
    notificar(`Cita cancelada · ${b.nombre} libre a las ${fmtHora(c.h)}`, {
      label: "Deshacer",
      fn: () => {
        if (ultimoBorrado.current) {
          setCitas(p => [...p, ultimoBorrado.current]);
          notificar(`${ultimoBorrado.current.cliente} — restaurada`);
          ultimoBorrado.current = null;
        }
      },
    });
  }, [notificar]);

  const abrirCita = useCallback((c) => setAbierta(c.id), []);
  const cerrarCita = useCallback((c) => setAbierta(a => (a === c.id ? null : a)), []);
  // Tocar una cita abre su ficha de cliente; el swipe horizontal sigue revelando
  // las acciones rápidas. Cerramos el swipe para que no queden ambos abiertos.
  const tocarCita = useCallback((c) => { setAbierta(null); setDetalle(c); }, []);
  const iniciarMover = useCallback((c) => {
    setMoviendo(c); setMovBarbero(c.barbero); setAbierta(null); setDetalle(null);
  }, []);

  const confirmarMover = (nuevaH) => {
    setCitas(p => p.map(c => c.id === moviendo.id ? { ...c, h: nuevaH, barbero: movBarbero } : c));
    const cambioBarbero = movBarbero !== moviendo.barbero;
    const bn = BARBEROS.find(b => b.id === movBarbero)?.nombre;
    notificar(cambioBarbero
      ? `${moviendo.cliente} → ${fmtHora(nuevaH)} con ${bn}`
      : `${moviendo.cliente} se movió a ${fmtHora(nuevaH)}`);
    setMoviendo(null);
    setAbierta(null);
  };

  // Alta y edición comparten el asistente. Con editId reemplazamos la cita en su
  // sitio (conservando id); sin él, insertamos una nueva.
  const guardar = () => {
    const s = SERVICIOS.find(x => x.id === serv);
    if (editId != null) {
      setCitas(p => p.map(c => c.id === editId
        ? { ...c, fecha, h: hueco, dur: s.min, cliente: nombre || c.cliente, tel, serv: s.nombre, precio: s.precio, barbero, pago, nota }
        : c));
    } else {
      setCitas(p => [...p, {
        id: nextId, fecha, h: hueco, dur: s.min, cliente: nombre || "Cliente nuevo",
        tel, serv: s.nombre, precio: s.precio, barbero, estado: "pendiente", pago, nota,
      }]);
      setNextId(n => n + 1);
    }
    setListo(true);
  };

  const resetAlta = () => {
    setPaso(0); setServ(null); setHueco(null); setBarbero(1);
    setNombre(""); setTel(""); setPago("tarjeta"); setNota(""); setListo(false);
    setSugerida(null); setEditId(null);
  };

  // Editar: precarga el asistente con la cita y salta directo a los datos.
  const editarCita = (c) => {
    const s = SERVICIOS.find(x => x.nombre === c.serv) || SERVICIOS[0];
    resetAlta();
    setEditId(c.id); setServ(s.id); setHueco(c.h); setBarbero(c.barbero);
    setNombre(c.cliente); setTel(c.tel || ""); setPago(c.pago); setNota(c.nota || "");
    setFecha(c.fecha); setPaso(2);
    setDetalle(null); setAbierta(null);
    setTab("nueva");
  };

  // Agendar en una fecha concreta desde el calendario.
  const agendarEn = (iso) => {
    resetAlta(); setFecha(iso); setDetalle(null); setAbierta(null); setTab("nueva");
  };

  // Vuelve a la semilla del día y limpia lo guardado. Deja la demo lista para
  // el siguiente cliente sin arrastrar lo que se tecleó en la visita anterior.
  const reiniciarDemo = () => {
    try { localStorage.removeItem(LS_KEY); } catch { /* nada que limpiar */ }
    const s = semilla();
    setCitas(s); setNextId(200);
    setFecha(HOY); setAbierta(null); setDetalle(null); setMoviendo(null);
    resetAlta(); setTab("agenda");
    notificar("Demo reiniciada");
  };

  // Al tocar un hueco se hereda el barbero de esa columna y la hora exacta del
  // punto tocado, para que el alta continúe donde el dedo señaló.
  const nuevaEn = (barb, h) => {
    resetAlta();
    if (barb) setBarbero(barb);   // el orden importa: resetAlta pone barbero en 1
    if (h != null) setSugerida(h);
    setAbierta(null);
    setTab("nueva");
  };

  // Si el punto que se tocó en la agenda admite este servicio, saltamos el paso 2.
  // Se acepta el inicio ofrecido más cercano dentro de media hora: el dedo señala
  // una zona, no un minuto, y obligar a la coincidencia exacta anularía el atajo.
  const elegirServicio = (s) => {
    setServ(s.id);
    if (sugerida == null) { setPaso(1); return; }
    const cerca = huecosPara(s.min, fecha, null, barbero)
      .reduce((mejor, h) => (mejor === null || Math.abs(h - sugerida) < Math.abs(mejor - sugerida) ? h : mejor), null);
    if (cerca !== null && Math.abs(cerca - sugerida) <= 0.5 + 1e-6) {
      setHueco(cerca);
      setPaso(2);
    } else {
      setPaso(1);
    }
  };

  // ── Métricas ──
  const cobrado = delDia.filter(c => c.estado === "completada").reduce((s, c) => s + c.precio, 0);
  const proyectado = delDia.reduce((s, c) => s + c.precio, 0);
  const minOcup = delDia.reduce((s, c) => s + c.dur, 0);
  const ocupacion = Math.round((minOcup / ((CIERRE - APERTURA) * 60 * BARBEROS.length)) * 100);
  const conTarjeta = delDia.filter(c => c.pago === "tarjeta");
  const mTarjeta = conTarjeta.reduce((s, c) => s + c.precio, 0);
  const mEfectivo = proyectado - mTarjeta;
  const pctTarjeta = proyectado ? Math.round((mTarjeta / proyectado) * 100) : 0;
  const comision = Math.round(mTarjeta * 0.036);
  const completadas = delDia.filter(c => c.estado === "completada").length;

  // Ausencias del mes en curso: conteo real que alimenta la tarjeta de "no
  // llegaron". Marcar una cita como "no llegó" en la agenda la mueve aquí.
  const prefijoMes = HOY.slice(0, 7);
  const noShows = citas.filter(c => c.estado === "no_llego" && c.fecha.startsWith(prefijoMes));
  const perdido = noShows.reduce((s, c) => s + c.precio, 0);

  // ── Calendario ──
  const diasEnMes = new Date(mes.a, mes.m, 0).getDate();
  const primerDia = new Date(mes.a, mes.m - 1, 1).getDay();
  const isoDe = (d) => `${mes.a}-${String(mes.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const cargaDe = (d) => citas.filter(c => c.fecha === isoDe(d));
  const nombreMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes.m - 1];

  const cambiarMes = (n) => {
    setDiaSel(null);
    setMes(p => {
      let m = p.m + n, a = p.a;
      if (m > 12) { m = 1; a++; } if (m < 1) { m = 12; a--; }
      return { a, m };
    });
  };

  const S = SERVICIOS.find(x => x.id === serv);

  return (
    <div style={{
      minHeight: "100dvh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans',system-ui,-apple-system,sans-serif",
      display: "flex", flexDirection: "column",
      maxWidth: 560, margin: "0 auto", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        @keyframes shine{to{background-position:-220% 0}}
        @keyframes pop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes subir{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateY(12px)}10%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(12px)}}
        @keyframes blurin{from{opacity:0;filter:blur(9px)}to{opacity:1;filter:blur(0)}}
        .spot{position:relative}
        .spot::before{content:"";position:absolute;inset:0;border-radius:inherit;opacity:0;transition:opacity .4s;pointer-events:none;background:radial-gradient(340px circle at var(--mx,50%) var(--my,0), var(--spot,rgba(212,160,60,.2)), transparent 62%)}
        .spot:hover::before,.spot:focus-within::before{opacity:1}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body,#root{margin:0;padding:0;background:${C.bg}}
        .sc::-webkit-scrollbar{display:none}
        .sc{scrollbar-width:none}
        input,textarea,select{font-family:inherit}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* Toast */}
      {aviso && (
        <div key={aviso.n} style={{
          position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)",
          width: "min(92%,500px)", zIndex: 90,
          background: C.panelAlt, border: `1px solid ${C.gold}`, borderRadius: 11,
          padding: "13px 15px", fontSize: 13.5,
          animation: "toast 2.5s ease forwards", boxShadow: "0 10px 30px rgba(0,0,0,.55)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <span>{aviso.texto}</span>
          {aviso.accion && (
            <button onClick={() => { aviso.accion.fn(); }} style={{
              flexShrink: 0, background: C.gold, color: C.bg, border: "none",
              borderRadius: 8, padding: "8px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            }}>{aviso.accion.label}</button>
          )}
        </div>
      )}

      {/* Encabezado — fondo opaco a propósito: un backdrop-filter sobre un
          lienzo que scrollea obliga al teléfono a recomponer toda la barra en
          cada fotograma, y en gama media eso se traduce en tirones. */}
      <header style={{
        padding: "calc(env(safe-area-inset-top) + 14px) 18px 13px",
        borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0,
        background: C.bg, zIndex: 30,
      }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 1.5, lineHeight: 1 }}>
          <ShinyText>ELWERO BARBERO</ShinyText>
        </div>
        <div style={{ color: C.mute, fontSize: 12.5, marginTop: 4 }}>
          {tab === "agenda" && `${fmtFechaLarga(fecha)} · desliza una cita`}
          {tab === "nueva" && "Nueva cita"}
          {tab === "registro" && "Calendario de registro"}
          {tab === "numeros" && fmtFechaLarga(fecha)}
        </div>
      </header>

      <main className="sc" style={{ flex: 1, overflowY: "auto", paddingBottom: 92 }}>

        {/* ══ AGENDA ══ */}
        {tab === "agenda" && (
          <div style={{ padding: `11px ${PAD_AGENDA}px 0` }}>

            {/* Cabecera de carriles. Va pegajosa porque el día mide casi 2000px:
                al llegar a las 7 de la tarde hay que seguir sabiendo de quién es
                cada columna. Las fichas se posicionan con los mismos porcentajes
                que los carriles del lienzo para que queden alineadas al pixel. */}
            <div style={{
              position: "sticky", top: 0, zIndex: 12, background: C.bg,
              paddingBottom: 9, marginBottom: 1,
              display: "flex", gap: GAP_HORAS, alignItems: "stretch",
            }}>
              <div style={{
                width: ANCHO_HORAS, flexShrink: 0, display: "flex",
                flexDirection: "column", justifyContent: "center",
                fontSize: 10.5, lineHeight: 1.25, color: C.mute,
              }}>
                <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{completadas}/{delDia.length}</span>
                listas
              </div>
              <div style={{ flex: 1, minWidth: 0, position: "relative", height: 46 }}>
                {BARBEROS.map((b, i) => {
                  const suyas = delDia.filter(c => c.barbero === b.id);
                  const min = suyas.reduce((s, c) => s + c.dur, 0);
                  return (
                    <div key={b.id} style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: `${i * ANCHO_CARRIL}%`,
                      width: `calc(${ANCHO_CARRIL}% - ${GUTTER_COL}px)`,
                      background: C.panel, borderTop: `2px solid ${b.color}`,
                      borderRadius: "3px 3px 10px 10px", padding: "6px 9px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: b.color, lineHeight: 1.2,
                        whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",
                      }}>{b.nombre}</div>
                      <div style={{ fontSize: 10.5, color: C.mute, marginTop: 3, whiteSpace: "nowrap" }}>
                        {suyas.length} {suyas.length === 1 ? "cita" : "citas"} · {fmtDur(min)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lienzo temporal: la posición vertical es la hora y el alto es la duración */}
            <div style={{ display: "flex", gap: GAP_HORAS }}>
              <div style={{ width: ANCHO_HORAS, flexShrink: 0, position: "relative", height: ALTO_LIENZO }}>
                {SLOTS.map(h => {
                  const enMedia = Math.abs(h % 1 - 0.5) < 0.01;
                  return (
                    <div key={h} style={{
                      position: "absolute", top: yDe(h) - 5, left: 0, right: 0,
                      fontSize: 10.5, lineHeight: 1,
                      color: enMedia ? "rgba(138,127,110,.5)" : C.mute,
                      fontVariantNumeric: "tabular-nums",
                    }}>{fmtHora(h)}</div>
                  );
                })}
              </div>

              <div style={{
                flex: 1, minWidth: 0, position: "relative", height: ALTO_LIENZO,
                backgroundImage: REJILLA,
              }}>
                {/* Separador vertical entre carriles: hace evidente que la columna
                    pertenece al barbero y no al hueco que quedó libre. */}
                {BARBEROS.slice(1).map((b, i) => (
                  <div key={b.id} style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `calc(${(i + 1) * ANCHO_CARRIL}% - ${GUTTER_COL / 2}px)`,
                    width: 1, background: C.line, pointerEvents: "none",
                  }} />
                ))}

                {/* Huecos: un solo recuadro por tramo libre, no uno por media hora */}
                {huecos.map(hu => {
                  const altoHueco = (hu.fin - hu.ini) * PX_POR_HORA - 6;
                  return (
                    <div
                      key={`${hu.barbero.id}-${hu.ini}`}
                      onClick={(e) => {
                        // La hora sale de dónde tocaste dentro del bloque, redondeada
                        // a 15 min: tocar las 5 de la tarde no debe abrir a las 9.
                        const r = e.currentTarget.getBoundingClientRect();
                        const bruta = hu.ini + (e.clientY - r.top) / PX_POR_HORA;
                        const h = Math.min(hu.fin - PASO_FINO, Math.max(hu.ini,
                          Math.round(bruta / PASO_FINO) * PASO_FINO));
                        nuevaEn(hu.barbero.id, h);
                      }}
                      style={{
                        position: "absolute",
                        top: yDe(hu.ini) + 3, height: altoHueco,
                        left: `${hu.izqPct}%`,
                        width: `calc(${hu.anchoPct}% - ${GUTTER_COL}px)`,
                        border: `1px dashed ${C.line}`, borderRadius: 10,
                        display: "flex", justifyContent: "center",
                        alignItems: altoHueco > 120 ? "center" : "flex-start",
                        padding: "7px 6px", cursor: "pointer",
                        color: "rgba(138,127,110,.55)", fontSize: 11,
                        overflow: "hidden", whiteSpace: "nowrap",
                      }}>
                      {altoHueco >= 26 && `Libre · ${fmtDur((hu.fin - hu.ini) * 60)}`}
                    </div>
                  );
                })}

                {/* Citas */}
                {disposicion.map(({ cita: c, izqPct, anchoPct }) => (
                  <SwipeCard
                    key={c.id}
                    cita={c}
                    abierta={abierta === c.id}
                    top={yDe(c.h)}
                    alto={altoDe(c.dur)}
                    izqPct={izqPct}
                    anchoPct={anchoPct}
                    anchoPx={anchoLienzo * (anchoPct / 100) - GUTTER_COL}
                    onAbrir={abrirCita}
                    onCerrar={cerrarCita}
                    onTocar={tocarCita}
                    onAlternar={alternarHecha}
                    onMover={iniciarMover}
                    onBorrar={borrar}
                  />
                ))}
              </div>
            </div>
            <div style={{ height: 20 }} />
          </div>
        )}

        {/* ══ NUEVA CITA ══ */}
        {tab === "nueva" && (
          <div style={{ padding: "16px 18px 0" }}>
            {!listo && (
              <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= paso ? C.gold : C.line, transition: "background .3s" }} />
                ))}
              </div>
            )}

            {listo ? (
              <div style={{ textAlign: "center", paddingTop: 50, animation: "pop .35s ease" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>✂️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, color: C.gold, letterSpacing: 1 }}>{editId != null ? "CITA ACTUALIZADA" : "CITA AGENDADA"}</div>
                <div style={{ color: C.mute, fontSize: 13.5, marginTop: 10, lineHeight: 1.65 }}>
                  {nombre || "Cliente nuevo"}<br />
                  {S?.nombre} · {fmtHora(hueco)} · {BARBEROS.find(b => b.id === barbero)?.nombre}<br />
                  Pago: {pago}<br />
                  <span style={{ color: C.gold }}>Anotada en la agenda del día</span>
                </div>
                <button onClick={() => { resetAlta(); setTab("agenda"); }} style={{
                  marginTop: 24, background: C.gold, color: C.bg, border: "none",
                  padding: "14px 30px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>Ver en la agenda</button>
              </div>
            ) : (
              <>
                {paso === 0 && (
                  <>
                    <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 3px" }}>¿Qué servicio?</h2>
                    <p style={{ fontSize: 12, color: C.mute, margin: "0 0 14px" }}>Paso 1 de 3</p>
                    <div style={{ display: "grid", gap: 8 }}>
                      {SERVICIOS.map(s => (
                        <button key={s.id} onClick={() => elegirServicio(s)} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                          padding: "14px 15px", cursor: "pointer", textAlign: "left", minHeight: 56, width: "100%", color: C.text,
                        }}>
                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.nombre}</div>
                            <div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{s.min} min</div>
                          </div>
                          <div style={{ fontSize: 16, color: C.gold, fontWeight: 700 }}>${s.precio}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {paso === 1 && (
                  <>
                    <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 3px" }}>¿Con quién y a qué hora?</h2>
                    <p style={{ fontSize: 12, color: C.mute, margin: "0 0 14px" }}>
                      Paso 2 de 3 · {S?.nombre}, {S?.min} min
                    </p>

                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      {BARBEROS.map(b => (
                        <button key={b.id} onClick={() => setBarbero(b.id)} style={{
                          flex: 1, background: barbero === b.id ? b.color : C.panel,
                          color: barbero === b.id ? C.bg : C.text,
                          border: `1px solid ${barbero === b.id ? b.color : C.line}`,
                          borderRadius: 11, padding: "13px 0", fontSize: 14,
                          fontWeight: barbero === b.id ? 700 : 500, cursor: "pointer", minHeight: 48,
                        }}>{b.nombre}</button>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                      {huecosPara(S.min, fecha, null, barbero).map(h => (
                        <button key={h} onClick={() => { setHueco(h); setPaso(2); }} style={{
                          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
                          padding: "15px 0", fontSize: 14, fontWeight: 600, color: C.text,
                          cursor: "pointer", minHeight: 50,
                        }}>{fmtHora(h)}</button>
                      ))}
                    </div>
                    {huecosPara(S.min, fecha, null, barbero).length === 0 && (
                      <p style={{ fontSize: 13, color: C.mute, textAlign: "center", padding: "24px 0" }}>
                        {BARBEROS.find(b => b.id === barbero)?.nombre} no tiene huecos de {S.min} min este día.
                      </p>
                    )}
                    <button onClick={() => setPaso(0)} style={{
                      marginTop: 16, background: "none", border: "none", color: C.mute, fontSize: 13, cursor: "pointer", padding: "10px 0",
                    }}>← Cambiar servicio</button>
                  </>
                )}

                {paso === 2 && (
                  <>
                    <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 3px" }}>Datos del cliente</h2>
                    <p style={{ fontSize: 12, color: C.mute, margin: "0 0 15px" }}>Paso 3 de 3</p>

                    <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{
                      width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                      padding: "14px", color: C.text, fontSize: 15.5, marginBottom: 9, outline: "none", minHeight: 52,
                    }} />
                    <input value={tel} onChange={e => setTel(e.target.value)} placeholder="Teléfono (449...)" inputMode="tel" style={{
                      width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                      padding: "14px", color: C.text, fontSize: 15.5, marginBottom: 9, outline: "none", minHeight: 52,
                    }} />
                    <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (opcional): tipo de corte, preferencias…" rows={2} style={{
                      width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                      padding: "14px", color: C.text, fontSize: 14.5, outline: "none", resize: "none",
                    }} />

                    <p style={{ fontSize: 12, color: C.mute, margin: "15px 0 8px" }}>¿Cómo va a pagar?</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      {["tarjeta", "efectivo"].map(o => (
                        <button key={o} onClick={() => setPago(o)} style={{
                          background: pago === o ? C.gold : C.panel,
                          color: pago === o ? C.bg : C.text,
                          border: `1px solid ${pago === o ? C.gold : C.line}`,
                          borderRadius: 11, padding: "13px 0", fontSize: 14,
                          fontWeight: pago === o ? 700 : 500, cursor: "pointer",
                          minHeight: 50, textTransform: "capitalize",
                        }}>{o}</button>
                      ))}
                    </div>

                    <div style={{
                      marginTop: 15, background: C.panel, borderRadius: 11, padding: 14,
                      border: `1px solid ${C.line}`, fontSize: 13, color: C.mute, lineHeight: 1.7,
                    }}>
                      {S?.nombre} · {fmtHora(hueco)} a {fmtHora(hueco + S.min / 60)}<br />
                      Con {BARBEROS.find(b => b.id === barbero)?.nombre} ·
                      <span style={{ color: C.gold }}> ${S?.precio}</span>
                    </div>

                    <button onClick={guardar} style={{
                      width: "100%", marginTop: 15, background: C.gold, color: C.bg, border: "none",
                      padding: "16px", borderRadius: 11, fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 54,
                    }}>{editId != null ? "Guardar cambios" : "Agendar"}</button>
                    <button onClick={() => setPaso(1)} style={{
                      width: "100%", marginTop: 10, background: "none", border: "none",
                      color: C.mute, fontSize: 13, cursor: "pointer", padding: "10px 0",
                    }}>← Cambiar hora</button>
                  </>
                )}
              </>
            )}
            <div style={{ height: 24 }} />
          </div>
        )}

        {/* ══ REGISTRO / CALENDARIO ══ */}
        {tab === "registro" && (
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={() => cambiarMes(-1)} style={{
                background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
                width: 44, height: 44, color: C.text, fontSize: 18, cursor: "pointer",
              }}>‹</button>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1 }}>
                {nombreMes} {mes.a}
              </div>
              <button onClick={() => cambiarMes(1)} style={{
                background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
                width: 44, height: 44, color: C.text, fontSize: 18, cursor: "pointer",
              }}>›</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 7 }}>
              {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 11, color: C.mute, padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
              {Array.from({ length: primerDia }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(d => {
                const iso = isoDe(d);
                const cs = cargaDe(d);
                const hechas = cs.filter(c => c.estado === "completada").length;
                const esHoy = iso === HOY;
                const sel = diaSel === iso;
                return (
                  <button key={d} onClick={() => setDiaSel(sel ? null : iso)} style={{
                    aspectRatio: "1", background: sel ? C.gold : cs.length ? C.panel : "transparent",
                    border: `1px solid ${esHoy ? C.gold : sel ? C.gold : C.line}`,
                    borderRadius: 9, color: sel ? C.bg : C.text, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 3, padding: 2, minHeight: 44,
                    fontWeight: esHoy ? 700 : 500,
                  }}>
                    <span style={{ fontSize: 13.5 }}>{d}</span>
                    {cs.length > 0 && (
                      <span style={{ display: "flex", gap: 2 }}>
                        {hechas > 0 && <span style={{ width: 5, height: 5, borderRadius: 99, background: sel ? C.bg : C.verde }} />}
                        {cs.length - hechas > 0 && <span style={{ width: 5, height: 5, borderRadius: 99, background: sel ? C.bg : C.gold }} />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11.5, color: C.mute }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.verde }} />completadas
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.gold }} />pendientes
              </span>
            </div>

            {diaSel && (
              <div style={{ marginTop: 18, animation: "pop .3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{fmtFechaLarga(diaSel)}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => agendarEn(diaSel)} style={{
                      background: C.gold, border: `1px solid ${C.gold}`, color: C.bg,
                      borderRadius: 9, padding: "8px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", minHeight: 40,
                    }}>Agendar</button>
                    <button onClick={() => { setFecha(diaSel); setAbierta(null); setTab("agenda"); }} style={{
                      background: "none", border: `1px solid ${C.gold}`, color: C.gold,
                      borderRadius: 9, padding: "8px 13px", fontSize: 12, cursor: "pointer", minHeight: 40,
                    }}>Abrir agenda</button>
                  </div>
                </div>
                {citas.filter(c => c.fecha === diaSel).sort((a, b) => a.h - b.h).map(c => {
                  const b = BARBEROS.find(x => x.id === c.barbero);
                  const hecha = c.estado === "completada";
                  return (
                    <div key={c.id} style={{
                      background: hecha ? C.panelHecho : C.panel,
                      borderLeft: `3px solid ${hecha ? C.verde : b.color}`,
                      borderRadius: 9, padding: "11px 13px", marginBottom: 7,
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600,
                          color: hecha ? C.verde : C.text,
                          textDecoration: hecha ? "line-through rgba(62,158,106,.45)" : "none",
                        }}>{c.cliente}</div>
                        <div style={{ fontSize: 11.5, color: C.mute, marginTop: 2 }}>
                          {fmtHora(c.h)} · {c.serv} · {b.nombre}
                        </div>
                      </div>
                      <span style={{ fontSize: 14, color: hecha ? C.verde : b.color, fontWeight: 600, flexShrink: 0 }}>
                        ${c.precio}
                      </span>
                    </div>
                  );
                })}
                {citas.filter(c => c.fecha === diaSel).length === 0 && (
                  <p style={{ fontSize: 13, color: C.mute, textAlign: "center", padding: "20px 0" }}>
                    Sin citas ese día.
                  </p>
                )}
              </div>
            )}
            <div style={{ height: 24 }} />
          </div>
        )}

        {/* ══ NÚMEROS ══ */}
        {tab === "numeros" && (
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ background: C.panel, borderRadius: 13, padding: 18, border: `1px solid ${C.line}`, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: C.mute, marginBottom: 6 }}>Cobrado</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, color: C.gold, lineHeight: 1 }}>
                <CountUp to={cobrado} prefix="$" play={vistoDash} />
              </div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 6 }}>
                Proyectado al cierre: ${proyectado.toLocaleString("es-MX")}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 10 }}>
              {[
                { l: "Ocupación", v: ocupacion, sf: "%" },
                { l: "Citas", v: delDia.length, sf: "" },
                { l: "Hechas", v: completadas, sf: "" },
              ].map(x => (
                <div key={x.l} style={{ background: C.panel, borderRadius: 13, padding: 14, border: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 10.5, color: C.mute, marginBottom: 5 }}>{x.l}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, lineHeight: 1 }}>
                    <CountUp to={x.v} suffix={x.sf} play={vistoDash} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: C.panel, borderRadius: 13, padding: 16, border: `1px solid ${C.line}`, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <span style={{ fontSize: 12, color: C.mute }}>Cómo te pagan</span>
                <span style={{ fontSize: 11, color: C.teal }}>{conTarjeta.length} de {delDia.length} con tarjeta</span>
              </div>
              <div style={{ display: "flex", height: 9, borderRadius: 5, overflow: "hidden", background: C.line, marginBottom: 13 }}>
                <div style={{ width: vistoDash ? `${pctTarjeta}%` : 0, background: C.teal, transition: "width .8s cubic-bezier(.2,.8,.3,1) .15s" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { l: "Tarjeta", v: mTarjeta, c: C.teal, p: pctTarjeta },
                  { l: "Efectivo", v: mEfectivo, c: C.line, p: 100 - pctTarjeta },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                      <span style={{ fontSize: 11, color: C.mute }}>{x.l}</span>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 25, lineHeight: 1 }}>
                      <CountUp to={x.v} prefix="$" play={vistoDash} />
                    </div>
                    <div style={{ fontSize: 11, color: C.mute, marginTop: 3 }}>{x.p}% del día</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.mute }}>Comisión terminal (3.6%)</span>
                <span style={{ fontSize: 14, color: "#D98A80", fontWeight: 600 }}>
                  −<CountUp to={comision} prefix="$" play={vistoDash} />
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>
                Porcentaje de ejemplo. Ajústalo a la terminal que use la barbería.
              </div>
            </div>

            <div style={{ background: C.panel, borderRadius: 13, padding: 16, border: `1px solid ${C.line}`, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: C.mute, marginBottom: 12 }}>Cuándo se llena</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 72 }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const hh = 9 + i;
                  const n = delDia.filter(c => Math.floor(c.h) === hh).length;
                  const alto = Math.min(n * 34, 68);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{
                        width: "100%", borderRadius: "3px 3px 0 0",
                        background: n >= 2 ? C.gold : C.line,
                        height: vistoDash ? `${Math.max(alto, 3)}px` : 0,
                        transition: `height .55s cubic-bezier(.2,.8,.3,1) ${i * 40}ms`,
                      }} />
                      <span style={{ fontSize: 8, color: C.mute }}>{hh > 12 ? hh - 12 : hh}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "rgba(200,70,60,.09)", borderRadius: 13, padding: 16, border: "1px solid rgba(200,70,60,.28)" }}>
              <div style={{ fontSize: 12, color: "#D98A80", marginBottom: 6 }}>Clientes que no llegaron (mes)</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#E8A398" }}>
                  <CountUp to={noShows.length} play={vistoDash} />
                </span>
                <span style={{ fontSize: 13, color: "#D98A80" }}>
                  = <CountUp to={perdido} prefix="$" play={vistoDash} /> perdidos
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: C.mute, marginTop: 9, lineHeight: 1.5 }}>
                {noShows.length === 0
                  ? "Sin ausencias registradas este mes. Marca una cita como “no llegó” desde su ficha."
                  : "Se cuentan las citas marcadas como “no llegó” en la agenda."}
              </div>
            </div>

            {/* Reiniciar deja la demo como recién abierta: útil entre una presentación
                y la siguiente para no arrastrar lo que se tecleó de prueba. */}
            <button onClick={reiniciarDemo} style={{
              width: "100%", marginTop: 12, background: "transparent", color: C.mute,
              border: `1px solid ${C.line}`, borderRadius: 11, padding: "13px",
              fontSize: 13, cursor: "pointer", minHeight: 48,
            }}>Reiniciar demo</button>
            <div style={{ height: 24 }} />
          </div>
        )}
      </main>

      {/* ══ HOJA: FICHA DEL CLIENTE ══ */}
      {detalle && (() => {
        const b = BARBEROS.find(x => x.id === detalle.barbero);
        const completada = detalle.estado === "completada";
        const ausente = detalle.estado === "no_llego";
        // Historial del mismo cliente en toda la agenda, no solo en el día.
        const hist = citas.filter(c => claveCliente(c.cliente) === claveCliente(detalle.cliente));
        const visitas = hist.filter(c => c.estado === "completada").length;
        const gasto = hist.filter(c => c.estado === "completada").reduce((s, c) => s + c.precio, 0);
        const faltas = hist.filter(c => c.estado === "no_llego").length;
        const tel10 = (detalle.tel || "").replace(/\D/g, "");

        const pill = (bg, col, borde, txt, fn) => (
          <button onClick={fn} style={{
            background: bg, color: col, border: `1px solid ${borde}`,
            borderRadius: 11, padding: "13px 0", fontSize: 13.5, fontWeight: 600,
            cursor: "pointer", minHeight: 48,
          }}>{txt}</button>
        );

        return (
          <>
            <div onClick={() => setDetalle(null)} style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 80, animation: "fade .2s ease",
            }} />
            <div className="sc" style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "min(100%,560px)", zIndex: 81,
              background: C.panelAlt, borderRadius: "22px 22px 0 0",
              borderTop: `1px solid ${C.line}`, padding: "10px 18px calc(env(safe-area-inset-bottom) + 26px)",
              animation: "subir .3s cubic-bezier(.2,.9,.3,1)", maxHeight: "82dvh", overflowY: "auto",
            }}>
              <div style={{ width: 38, height: 4, borderRadius: 3, background: C.line, margin: "0 auto 14px" }} />

              {/* Cabecera con el foco radial de ReactBits siguiendo al cursor */}
              <SpotlightCard
                spot={`${b.color}33`}
                style={{
                  background: C.panel, border: `1px solid ${C.line}`,
                  borderLeft: `3px solid ${b.color}`, borderRadius: 14,
                  padding: "15px 16px", marginBottom: 13, animation: "blurin .4s ease",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>{detalle.cliente}</div>
                    <div style={{ fontSize: 12.5, color: C.mute, marginTop: 4 }}>
                      {detalle.serv} · {fmtHora(detalle.h)} · {b.nombre}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: C.gold, lineHeight: 1 }}>${detalle.precio}</div>
                    <div style={{
                      fontSize: 10.5, marginTop: 5, fontWeight: 600, letterSpacing: .3,
                      color: completada ? C.verde : ausente ? "#E8A398" : C.mute,
                    }}>
                      {completada ? "Completada" : ausente ? "No llegó" : detalle.estado === "confirmada" ? "Confirmada" : "Pendiente"}
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Teléfono: si lo hay, es enlace para marcar directo. Sin dato, se omite. */}
              {tel10 && (
                <a href={`tel:${tel10}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                  padding: "13px 15px", marginBottom: 9, textDecoration: "none", color: C.text, minHeight: 50,
                }}>
                  <span style={{ fontSize: 11.5, color: C.mute }}>Teléfono</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{detalle.tel}</span>
                </a>
              )}

              {/* La nota solo aparece si el cliente dejó algo escrito. */}
              {detalle.nota && detalle.nota.trim() && (
                <div style={{
                  background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                  padding: "13px 15px", marginBottom: 9,
                }}>
                  <div style={{ fontSize: 11.5, color: C.mute, marginBottom: 5 }}>Nota</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, fontStyle: "italic" }}>{detalle.nota}</div>
                </div>
              )}

              {/* Historial: da contexto de qué tan asiduo es el cliente. */}
              <div style={{
                display: "grid", gridTemplateColumns: faltas > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 9, marginBottom: 14,
              }}>
                <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 13px" }}>
                  <div style={{ fontSize: 10.5, color: C.mute }}>Visitas</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, lineHeight: 1.1 }}>{visitas}</div>
                </div>
                <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 13px" }}>
                  <div style={{ fontSize: 10.5, color: C.mute }}>Gastado</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: C.gold, lineHeight: 1.1 }}>${gasto.toLocaleString("es-MX")}</div>
                </div>
                {faltas > 0 && (
                  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 13px" }}>
                    <div style={{ fontSize: 10.5, color: C.mute }}>Faltas</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#E8A398", lineHeight: 1.1 }}>{faltas}</div>
                  </div>
                )}
              </div>

              {/* Acciones sobre la cita */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {completada
                  ? pill(C.gold, C.bg, C.gold, "↩  Reabrir", () => alternarHecha(detalle))
                  : pill(C.verde, "#fff", C.verde, "✓  Completar", () => alternarHecha(detalle))}
                {pill(C.panel, C.text, C.line, "✎  Editar", () => editarCita(detalle))}
                {pill(C.panel, C.text, C.line, "⇄  Mover", () => iniciarMover(detalle))}
                {ausente
                  ? pill(C.panel, C.text, C.line, "↩  Vuelve a agenda", () => marcarNoLlego(detalle))
                  : pill(C.panel, "#E8A398", "rgba(200,70,60,.4)", "✕  No llegó", () => marcarNoLlego(detalle))}
              </div>
              <button onClick={() => borrar(detalle)} style={{
                width: "100%", marginTop: 9, background: "transparent", color: "#D98A80",
                border: "1px solid rgba(200,70,60,.35)", borderRadius: 11, padding: "13px",
                fontSize: 13.5, cursor: "pointer", minHeight: 48,
              }}>Cancelar cita</button>
              <button onClick={() => setDetalle(null)} style={{
                width: "100%", marginTop: 9, background: "transparent", color: C.mute,
                border: "none", borderRadius: 11, padding: "11px", fontSize: 13.5, cursor: "pointer", minHeight: 44,
              }}>Cerrar</button>
            </div>
          </>
        );
      })()}

      {/* ══ HOJA: MOVER ══ */}
      {moviendo && (
        <>
          <div onClick={() => setMoviendo(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 80, animation: "fade .2s ease",
          }} />
          <div className="sc" style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(100%,560px)", zIndex: 81,
            background: C.panelAlt, borderRadius: "22px 22px 0 0",
            borderTop: `1px solid ${C.line}`, padding: "10px 18px calc(env(safe-area-inset-bottom) + 26px)",
            animation: "subir .3s cubic-bezier(.2,.9,.3,1)", maxHeight: "72dvh", overflowY: "auto",
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 3, background: C.line, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: "0 0 4px" }}>Mover cita</h3>
            <p style={{ fontSize: 12.5, color: C.mute, margin: "0 0 13px" }}>
              {moviendo.cliente} · {moviendo.serv} · {moviendo.dur} min
            </p>

            {/* Cambiar de barbero además de hora: la agenda no siempre la libra el
                mismo empleado. Al cambiar de barbero, los huecos se recalculan. */}
            <p style={{ fontSize: 11.5, color: C.mute, margin: "0 0 7px" }}>¿Con quién?</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
              {BARBEROS.map(b => (
                <button key={b.id} onClick={() => setMovBarbero(b.id)} style={{
                  flex: 1, background: movBarbero === b.id ? b.color : C.panel,
                  color: movBarbero === b.id ? C.bg : C.text,
                  border: `1px solid ${movBarbero === b.id ? b.color : C.line}`,
                  borderRadius: 11, padding: "12px 0", fontSize: 13.5,
                  fontWeight: movBarbero === b.id ? 700 : 500, cursor: "pointer", minHeight: 46,
                }}>{b.nombre}</button>
              ))}
            </div>

            <p style={{ fontSize: 11.5, color: C.mute, margin: "0 0 7px" }}>¿A qué hora?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {huecosPara(moviendo.dur, moviendo.fecha, moviendo.id, movBarbero).map(h => {
                const actual = h === moviendo.h && movBarbero === moviendo.barbero;
                return (
                  <button key={h} onClick={() => confirmarMover(h)} style={{
                    background: actual ? C.gold : C.panel,
                    color: actual ? C.bg : C.text,
                    border: `1px solid ${actual ? C.gold : C.line}`,
                    borderRadius: 10, padding: "14px 0", fontSize: 13.5,
                    fontWeight: 600, cursor: "pointer", minHeight: 48,
                  }}>{fmtHora(h)}</button>
                );
              })}
            </div>
            {huecosPara(moviendo.dur, moviendo.fecha, moviendo.id, movBarbero).length === 0 && (
              <p style={{ fontSize: 13, color: C.mute, textAlign: "center", padding: "22px 0" }}>
                {BARBEROS.find(b => b.id === movBarbero)?.nombre} no tiene huecos de {moviendo.dur} min este día.
              </p>
            )}
            <button onClick={() => setMoviendo(null)} style={{
              width: "100%", marginTop: 14, background: "transparent", color: C.mute,
              border: `1px solid ${C.line}`, borderRadius: 11, padding: "14px",
              fontSize: 14.5, cursor: "pointer", minHeight: 50,
            }}>Cancelar</button>
          </div>
        </>
      )}

      {/* ══ NAVEGACIÓN ══ */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%,560px)", background: C.bg,
        borderTop: `1px solid ${C.line}`,
        padding: "8px 12px calc(env(safe-area-inset-bottom) + 14px)",
        display: "flex", gap: 5, zIndex: 40,
      }}>
        {[
          { id: "agenda", t: "Agenda" },
          { id: "nueva", t: "Nueva" },
          { id: "registro", t: "Registro" },
          { id: "numeros", t: "Números" },
        ].map(x => (
          <button key={x.id} onClick={() => { if (x.id === "nueva") resetAlta(); setAbierta(null); setTab(x.id); }} style={{
            flex: 1, background: tab === x.id ? C.gold : "transparent",
            color: tab === x.id ? C.bg : C.mute, border: "none",
            padding: "11px 0", borderRadius: 11, fontSize: 12.5,
            fontWeight: tab === x.id ? 700 : 500, cursor: "pointer",
            transition: "background .2s, color .2s", minHeight: 46,
          }}>{x.t}</button>
        ))}
      </nav>
    </div>
  );
}
