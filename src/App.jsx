import React, { useState, useEffect, useRef } from "react";

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

const HOY = "2026-07-21";

const CITAS_INI = [
  { id: 1, fecha: HOY, h: 9.0, dur: 40, cliente: "Ricardo Muñoz", tel: "4491234567", serv: "Corte", precio: 150, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 2, fecha: HOY, h: 9.75, dur: 60, cliente: "Iván Delgado", tel: "4497654321", serv: "Corte + barba", precio: 290, barbero: 2, estado: "completada", pago: "tarjeta", nota: "Degradado bajo" },
  { id: 3, fecha: HOY, h: 11.0, dur: 15, cliente: "Toño Ramírez", tel: "4491112233", serv: "Contornos", precio: 60, barbero: 1, estado: "completada", pago: "efectivo", nota: "" },
  { id: 4, fecha: HOY, h: 11.5, dur: 40, cliente: "Beto Cardona", tel: "4492223344", serv: "Corte", precio: 150, barbero: 2, estado: "confirmada", pago: "tarjeta", nota: "" },
  { id: 5, fecha: HOY, h: 12.5, dur: 30, cliente: "Diego (niño)", tel: "4493334455", serv: "Corte niño", precio: 120, barbero: 1, estado: "confirmada", pago: "efectivo", nota: "Se mueve mucho" },
  { id: 6, fecha: HOY, h: 13.5, dur: 60, cliente: "Fernando Ruiz", tel: "4494445566", serv: "Corte + barba", precio: 290, barbero: 2, estado: "confirmada", pago: "tarjeta", nota: "" },
  { id: 7, fecha: HOY, h: 17.0, dur: 40, cliente: "Alan Espinoza", tel: "4495556677", serv: "Corte", precio: 150, barbero: 1, estado: "pendiente", pago: "tarjeta", nota: "" },
  { id: 8, fecha: HOY, h: 17.5, dur: 15, cliente: "Óscar Lira", tel: "4496667788", serv: "Contornos", precio: 60, barbero: 2, estado: "pendiente", pago: "efectivo", nota: "" },
  { id: 9, fecha: HOY, h: 18.0, dur: 60, cliente: "Memo Cortés", tel: "4497778899", serv: "Corte + barba", precio: 290, barbero: 1, estado: "pendiente", pago: "efectivo", nota: "" },
  { id: 10, fecha: HOY, h: 19.0, dur: 25, cliente: "Sergio Palos", tel: "4498889900", serv: "Solo barba", precio: 130, barbero: 2, estado: "pendiente", pago: "tarjeta", nota: "" },
  // Historial para el calendario
  { id: 11, fecha: "2026-07-20", h: 10.0, dur: 40, cliente: "Raúl Vega", tel: "", serv: "Corte", precio: 150, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 12, fecha: "2026-07-20", h: 12.0, dur: 60, cliente: "Pablo Sáenz", tel: "", serv: "Corte + barba", precio: 290, barbero: 2, estado: "completada", pago: "efectivo", nota: "" },
  { id: 13, fecha: "2026-07-20", h: 16.0, dur: 30, cliente: "Nico Bermúdez", tel: "", serv: "Corte niño", precio: 120, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 14, fecha: "2026-07-18", h: 11.0, dur: 40, cliente: "Hugo Ledesma", tel: "", serv: "Corte", precio: 150, barbero: 2, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 15, fecha: "2026-07-18", h: 15.0, dur: 75, cliente: "Emilio Sandoval", tel: "", serv: "Tinte", precio: 350, barbero: 1, estado: "completada", pago: "tarjeta", nota: "" },
  { id: 16, fecha: "2026-07-17", h: 10.5, dur: 25, cliente: "Javier Rentería", tel: "", serv: "Solo barba", precio: 130, barbero: 2, estado: "completada", pago: "efectivo", nota: "" },
  { id: 17, fecha: "2026-07-22", h: 10.0, dur: 40, cliente: "Andrés Zermeño", tel: "", serv: "Corte", precio: 150, barbero: 1, estado: "pendiente", pago: "tarjeta", nota: "" },
  { id: 18, fecha: "2026-07-22", h: 13.0, dur: 60, cliente: "Marco Tapia", tel: "", serv: "Corte + barba", precio: 290, barbero: 2, estado: "pendiente", pago: "efectivo", nota: "" },
  { id: 19, fecha: "2026-07-23", h: 16.0, dur: 15, cliente: "Kevin Padilla", tel: "", serv: "Contornos", precio: 60, barbero: 1, estado: "pendiente", pago: "efectivo", nota: "" },
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

// Medidas del carril de la agenda. Sirven para saber cuánto espacio tiene una
// tarjeta sin medir el DOM: así los botones ya salen bien en el primer pintado.
const ANCHO_MAX = 560;
const PAD_AGENDA = 14;
const ANCHO_HORAS = 50;
const GAP_HORAS = 10;
const anchoLienzoDe = (vw) =>
  Math.min(ANCHO_MAX, vw) - PAD_AGENDA * 2 - ANCHO_HORAS - GAP_HORAS;

const yDe = (h) => (h - APERTURA) * PX_POR_HORA;
const altoDe = (dur) => (dur / 60) * PX_POR_HORA - 2;
const finDe = (c) => c.h + c.dur / 60;

const SLOTS = [];
for (let h = APERTURA; h < CIERRE; h += PASO) SLOTS.push(h);

const fmtHora = (h) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const suf = hh >= 12 ? "pm" : "am";
  const h12 = hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")}${suf}`;
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

// ── Reparto en columnas ───────────────────────────────────────
// Agrupa las citas que se traslapan y les asigna una columna. Dentro de un grupo
// cada barbero conserva su carril (Güero izquierda, Chuy derecha) para que una
// cita no cambie de lado según con quién le toque coincidir.
function repartirEnColumnas(citas) {
  const orden = [...citas].sort((a, b) => a.h - b.h || a.dur - b.dur);
  const salida = [];
  let grupo = [];
  let finGrupo = -Infinity;

  const cerrarGrupo = () => {
    if (!grupo.length) return;

    if (grupo.length === 1) {
      salida.push({ cita: grupo[0], izqPct: 0, anchoPct: 100 });
    } else {
      const carriles = BARBEROS.map(b => b.id).filter(id => grupo.some(c => c.barbero === id));
      // finSub[barbero] guarda el fin de la última cita de cada sub-columna.
      // Solo se subdivide un carril si el mismo barbero tiene citas encimadas.
      const finSub = {};
      carriles.forEach(id => { finSub[id] = []; });

      const puestos = grupo.map(c => {
        const fines = finSub[c.barbero];
        let sub = fines.findIndex(f => f <= c.h + 1e-6);
        if (sub === -1) sub = fines.length;
        fines[sub] = finDe(c);
        return { cita: c, carril: carriles.indexOf(c.barbero), sub };
      });

      const anchoCarril = 100 / carriles.length;
      puestos.forEach(p => {
        const subs = Math.max(1, finSub[p.cita.barbero].length);
        const ancho = anchoCarril / subs;
        salida.push({
          cita: p.cita,
          izqPct: p.carril * anchoCarril + p.sub * ancho,
          anchoPct: ancho,
        });
      });
    }
    grupo = [];
    finGrupo = -Infinity;
  };

  orden.forEach(c => {
    if (grupo.length && c.h >= finGrupo - 1e-6) cerrarGrupo();
    grupo.push(c);
    finGrupo = Math.max(finGrupo, finDe(c));
  });
  cerrarGrupo();

  return salida;
}

// Huecos de media hora calculados por traslape real, no por hora de inicio.
function huecosDelDia(citas) {
  const anchoCarril = 100 / BARBEROS.length;
  const huecos = [];
  SLOTS.forEach(h => {
    const libres = BARBEROS.filter(b =>
      !citas.some(c => c.barbero === b.id && c.h < h + PASO && finDe(c) > h)
    );
    if (libres.length === BARBEROS.length) {
      huecos.push({ h, barbero: null, izqPct: 0, anchoPct: 100 });
    } else {
      libres.forEach(b => {
        const i = BARBEROS.findIndex(x => x.id === b.id);
        huecos.push({ h, barbero: b, izqPct: i * anchoCarril, anchoPct: anchoCarril });
      });
    }
  });
  return huecos;
}

// ── CountUp ───────────────────────────────────────────────────
function CountUp({ to, dur = 1100, prefix = "", suffix = "", play }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) { setV(0); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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

// ── Iconos ────────────────────────────────────────────────────
const IcCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IcUndo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 8 3 14 9 14" /><path d="M5.6 16.5a8.5 8.5 0 1 0 1.4-9.9L3 10" /></svg>
);
const IcMove = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
);
const IcTrash = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
);

// ── SwipeCard (React Bits: swipe-to-reveal) ───────────────────
function SwipeCard({
  cita, abierta, top, alto, izqPct, anchoPct, anchoPx,
  onAbrir, onCerrar, onAlternar, onMover, onBorrar, onTocar,
}) {
  const [dx, setDx] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const ref = useRef({ x0: 0, y0: 0, dx0: 0, activo: false, decidido: false, esHoriz: false });

  const completada = cita.estado === "completada";

  // Los botones se ajustan al espacio real de la tarjeta: en una columna angosta
  // (dos barberos a la vez) o en una cita de 15 min se quedan solo con el icono.
  const bw = anchoPx >= 300 ? 62 : anchoPx >= 230 ? 50 : 40;
  const gapBtn = bw >= 50 ? 7 : 5;
  const conTexto = bw >= 50 && alto >= 62;
  const anchoAcciones = bw * 3 + gapBtn * 2 + 4;
  const altoBtn = Math.max(36, Math.min(alto - 4, 92));

  const objetivo = abierta ? -anchoAcciones : 0;
  const x = arrastrando ? dx : objetivo;

  const inicio = (cx, cy) => {
    ref.current = { x0: cx, y0: cy, dx0: abierta ? -anchoAcciones : 0, activo: true, decidido: false, esHoriz: false };
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
      if (r.esHoriz) setArrastrando(true);
    }
    if (!r.esHoriz) return;
    if (e && e.cancelable) e.preventDefault();

    let nx = r.dx0 + ddx;
    if (nx > 0) nx = nx * 0.28;                          // resistencia al abrir a la derecha
    if (nx < -anchoAcciones) nx = -anchoAcciones + (nx + anchoAcciones) * 0.28;
    setDx(nx);
  };

  const fin = () => {
    const r = ref.current;
    if (!r.activo) return;
    const eraHoriz = r.esHoriz;
    const movio = r.decidido;
    r.activo = false;

    if (!eraHoriz) {
      setArrastrando(false);
      if (!movio) onTocar();
      return;
    }
    const umbral = abierta ? -anchoAcciones + 55 : -55;
    if (dx < umbral) onAbrir(); else onCerrar();
    setArrastrando(false);
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
          ? btn(C.gold, C.bg, IcUndo, "Deshacer", onAlternar)
          : btn(C.verde, "#fff", IcCheck, "Completar", onAlternar)}
        {btn(C.morado, "#fff", IcMove, "Mover", onMover)}
        {btn(C.rojo, "#fff", IcTrash, "Eliminar", onBorrar)}
      </div>

      {/* Capa superior: tarjeta */}
      <div
        onTouchStart={(e) => inicio(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => mover_(e.touches[0].clientX, e.touches[0].clientY, e)}
        onTouchEnd={fin}
        onMouseDown={(e) => { e.preventDefault(); inicio(e.clientX, e.clientY); }}
        onMouseMove={(e) => ref.current.activo && mover_(e.clientX, e.clientY, null)}
        onMouseUp={fin}
        onMouseLeave={() => ref.current.activo && fin()}
        style={{
          position: "absolute", inset: 0,
          transform: `translateX(${x}px)`,
          transition: arrastrando ? "none" : "transform .42s cubic-bezier(.22,1.1,.36,1)",
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
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11.5, color: C.mute, gap: 8 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cita.serv} · {cita.dur}min · {b.nombre}
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
}

// ═════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("agenda");
  const [fecha, setFecha] = useState(HOY);
  const [citas, setCitas] = useState(CITAS_INI);
  const [nextId, setNextId] = useState(200);
  const [abierta, setAbierta] = useState(null);
  const [aviso, setAviso] = useState(null);

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

  // Mover
  const [moviendo, setMoviendo] = useState(null);

  // Calendario
  const [mes, setMes] = useState({ a: 2026, m: 7 });
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

  const delDia = citas.filter(c => c.fecha === fecha).sort((a, b) => a.h - b.h);
  const disposicion = repartirEnColumnas(delDia);
  const huecos = huecosDelDia(delDia);

  // ── Disponibilidad ──
  const huecosPara = (min, f = fecha, excluirId = null, barb = null) => {
    const otras = citas.filter(c => c.fecha === f && c.id !== excluirId && (barb ? c.barbero === barb : true));
    return SLOTS.filter(h => {
      const fin = h + min / 60;
      if (fin > CIERRE) return false;
      return !otras.some(c => {
        const cFin = c.h + c.dur / 60;
        return h < cFin && fin > c.h;
      });
    });
  };

  // ── Acciones ──
  // Alternador: guardar el estado previo permite deshacer las veces que haga falta.
  const alternarHecha = (c) => {
    const hecha = c.estado === "completada";
    setCitas(p => p.map(x => x.id !== c.id ? x : (hecha
      ? { ...x, estado: x.estadoPrevio || "confirmada" }
      : { ...x, estado: "completada", estadoPrevio: x.estado })));
    setAbierta(null);
    setAviso(hecha ? `${c.cliente} — vuelve a pendiente` : `${c.cliente} — marcada como completada`);
  };

  const borrar = (c) => {
    setCitas(p => p.filter(x => x.id !== c.id));
    setAbierta(null);
    setAviso(`Cita cancelada · ${fmtHora(c.h)} quedó libre`);
  };

  const confirmarMover = (nuevaH) => {
    setCitas(p => p.map(c => c.id === moviendo.id ? { ...c, h: nuevaH } : c));
    setAviso(`${moviendo.cliente} se movió a ${fmtHora(nuevaH)}`);
    setMoviendo(null);
    setAbierta(null);
  };

  const crear = () => {
    const s = SERVICIOS.find(x => x.id === serv);
    setCitas(p => [...p, {
      id: nextId, fecha, h: hueco, dur: s.min, cliente: nombre || "Cliente nuevo",
      tel, serv: s.nombre, precio: s.precio, barbero, estado: "pendiente", pago, nota,
    }]);
    setNextId(n => n + 1);
    setListo(true);
  };

  const resetAlta = () => {
    setPaso(0); setServ(null); setHueco(null); setBarbero(1);
    setNombre(""); setTel(""); setPago("tarjeta"); setNota(""); setListo(false);
  };

  const nuevaEn = (barb) => {
    resetAlta();
    if (barb) setBarbero(barb);   // el orden importa: resetAlta pone barbero en 1
    setAbierta(null);
    setTab("nueva");
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
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body,#root{margin:0;padding:0;background:${C.bg}}
        .sc::-webkit-scrollbar{display:none}
        .sc{scrollbar-width:none}
        input,textarea,select{font-family:inherit}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* Toast */}
      {aviso && (
        <div style={{
          position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)",
          width: "min(92%,500px)", zIndex: 90,
          background: C.panelAlt, border: `1px solid ${C.gold}`, borderRadius: 11,
          padding: "13px 15px", fontSize: 13.5,
          animation: "toast 2.5s ease forwards", boxShadow: "0 10px 30px rgba(0,0,0,.55)",
        }}>{aviso}</div>
      )}

      {/* Encabezado */}
      <header style={{
        padding: "calc(env(safe-area-inset-top) + 14px) 18px 13px",
        borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0,
        background: "rgba(20,17,14,.97)", backdropFilter: "blur(10px)", zIndex: 30,
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
          <div style={{ padding: "13px 14px 0" }}>
            <div style={{ display: "flex", gap: 15, marginBottom: 13, alignItems: "center" }}>
              {BARBEROS.map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mute }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: b.color }} />{b.nombre}
                </div>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 12, color: C.mute }}>
                {completadas}/{delDia.length} listas
              </div>
            </div>

            {/* Lienzo temporal: la posición vertical es la hora y el alto es la duración */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 50, flexShrink: 0, position: "relative", height: ALTO_LIENZO }}>
                {SLOTS.map(h => {
                  const enMedia = Math.abs(h % 1 - 0.5) < 0.01;
                  return (
                    <div key={h} style={{
                      position: "absolute", top: yDe(h) + 2, left: 0, right: 0,
                      fontSize: 10.5, lineHeight: 1,
                      color: enMedia ? "rgba(138,127,110,.55)" : C.mute,
                      fontVariantNumeric: "tabular-nums",
                    }}>{fmtHora(h)}</div>
                  );
                })}
              </div>

              <div style={{ flex: 1, minWidth: 0, position: "relative", height: ALTO_LIENZO }}>
                {/* Rejilla */}
                {SLOTS.map(h => {
                  const enMedia = Math.abs(h % 1 - 0.5) < 0.01;
                  return (
                    <div key={h} style={{
                      position: "absolute", top: yDe(h), left: 0, right: 0,
                      height: PX_POR_HORA * PASO,
                      borderTop: `1px solid ${enMedia ? "rgba(46,40,32,.45)" : C.line}`,
                      pointerEvents: "none",
                    }} />
                  );
                })}

                {/* Huecos disponibles */}
                {huecos.map(hu => (
                  <div
                    key={`${hu.h}-${hu.barbero ? hu.barbero.id : "todos"}`}
                    onClick={() => nuevaEn(hu.barbero ? hu.barbero.id : null)}
                    style={{
                      position: "absolute",
                      top: yDe(hu.h) + 6, height: PX_POR_HORA * PASO - 12,
                      left: `${hu.izqPct}%`,
                      width: hu.anchoPct >= 100 ? "100%" : `calc(${hu.anchoPct}% - ${GUTTER_COL}px)`,
                      border: `1px dashed ${C.line}`, borderRadius: 9,
                      display: "flex", alignItems: "center", padding: "0 12px",
                      color: "rgba(138,127,110,.62)", fontSize: 11.5, cursor: "pointer",
                      overflow: "hidden", whiteSpace: "nowrap",
                    }}>
                    {hu.barbero ? `Libre · ${hu.barbero.nombre}` : "Libre"}
                  </div>
                ))}

                {/* Citas */}
                {disposicion.map(({ cita: c, izqPct, anchoPct }) => {
                  const anchoPx = anchoLienzo * (anchoPct / 100) - (anchoPct >= 100 ? 0 : GUTTER_COL);
                  return (
                    <SwipeCard
                      key={c.id}
                      cita={c}
                      abierta={abierta === c.id}
                      top={yDe(c.h)}
                      alto={altoDe(c.dur)}
                      izqPct={izqPct}
                      anchoPct={anchoPct}
                      anchoPx={anchoPx}
                      onAbrir={() => setAbierta(c.id)}
                      onCerrar={() => setAbierta(a => a === c.id ? null : a)}
                      onTocar={() => setAbierta(a => a === c.id ? null : c.id)}
                      onAlternar={() => alternarHecha(c)}
                      onMover={() => { setMoviendo(c); setAbierta(null); }}
                      onBorrar={() => borrar(c)}
                    />
                  );
                })}
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
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, color: C.gold, letterSpacing: 1 }}>CITA AGENDADA</div>
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
                        <button key={s.id} onClick={() => { setServ(s.id); setPaso(1); }} style={{
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

                    <button onClick={crear} style={{
                      width: "100%", marginTop: 15, background: C.gold, color: C.bg, border: "none",
                      padding: "16px", borderRadius: 11, fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 54,
                    }}>Agendar</button>
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
                  <button onClick={() => { setFecha(diaSel); setAbierta(null); setTab("agenda"); }} style={{
                    background: "none", border: `1px solid ${C.gold}`, color: C.gold,
                    borderRadius: 9, padding: "8px 13px", fontSize: 12, cursor: "pointer", minHeight: 40,
                  }}>Abrir agenda</button>
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
                  <CountUp to={7} play={vistoDash} />
                </span>
                <span style={{ fontSize: 13, color: "#D98A80" }}>
                  = <CountUp to={1360} prefix="$" play={vistoDash} /> perdidos
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: C.mute, marginTop: 9, lineHeight: 1.5 }}>
                Dato de ejemplo para dimensionar el hueco que dejan las ausencias.
              </div>
            </div>
            <div style={{ height: 24 }} />
          </div>
        )}
      </main>

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
            <p style={{ fontSize: 12.5, color: C.mute, margin: "0 0 15px" }}>
              {moviendo.cliente} · {moviendo.serv} · {moviendo.dur} min
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {huecosPara(moviendo.dur, moviendo.fecha, moviendo.id, moviendo.barbero).map(h => (
                <button key={h} onClick={() => confirmarMover(h)} style={{
                  background: h === moviendo.h ? C.gold : C.panel,
                  color: h === moviendo.h ? C.bg : C.text,
                  border: `1px solid ${h === moviendo.h ? C.gold : C.line}`,
                  borderRadius: 10, padding: "14px 0", fontSize: 13.5,
                  fontWeight: 600, cursor: "pointer", minHeight: 48,
                }}>{fmtHora(h)}</button>
              ))}
            </div>
            {huecosPara(moviendo.dur, moviendo.fecha, moviendo.id, moviendo.barbero).length === 0 && (
              <p style={{ fontSize: 13, color: C.mute, textAlign: "center", padding: "22px 0" }}>
                No hay huecos libres de {moviendo.dur} min este día.
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
        width: "min(100%,560px)", background: "rgba(20,17,14,.97)",
        backdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`,
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
