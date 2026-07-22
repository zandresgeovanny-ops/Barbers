import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// ElweroBarbero — Demo de venta (v2)
// Datos ficticios. Precios estimados para Aguascalientes.
// ─────────────────────────────────────────────────────────────

const BARBEROS = [
  { id: 1, nombre: "Güero", color: "#D4A03C", inicial: "G" },
  { id: 2, nombre: "Chuy", color: "#4A8FA8", inicial: "C" },
];

const SERVICIOS = [
  { id: 1, nombre: "Corte", precio: 150, min: 40 },
  { id: 2, nombre: "Corte + barba", precio: 290, min: 60 },
  { id: 3, nombre: "Solo barba", precio: 130, min: 25 },
  { id: 4, nombre: "Diseño de ceja", precio: 60, min: 15 },
  { id: 5, nombre: "Corte niño", precio: 120, min: 30 },
  { id: 6, nombre: "Mascarilla", precio: 180, min: 30 },
];

const CITAS_INI = [
  { id: 1, h: 9.0, dur: 40, cliente: "Ricardo Muñoz", serv: "Corte", precio: 150, barbero: 1, estado: "completada", pago: "tarjeta" },
  { id: 2, h: 9.5, dur: 60, cliente: "Iván Delgado", serv: "Corte + barba", precio: 290, barbero: 2, estado: "completada", pago: "tarjeta" },
  { id: 3, h: 10.0, dur: 25, cliente: "Toño Ramírez", serv: "Solo barba", precio: 130, barbero: 1, estado: "completada", pago: "efectivo" },
  { id: 4, h: 11.0, dur: 40, cliente: "Beto Cardona", serv: "Corte", precio: 150, barbero: 2, estado: "confirmada", pago: "tarjeta" },
  { id: 5, h: 12.0, dur: 30, cliente: "Diego (niño)", serv: "Corte niño", precio: 120, barbero: 1, estado: "confirmada", pago: "efectivo" },
  { id: 6, h: 13.0, dur: 60, cliente: "Fernando Ruiz", serv: "Corte + barba", precio: 290, barbero: 2, estado: "confirmada", pago: "tarjeta" },
  { id: 7, h: 17.0, dur: 40, cliente: "Alan Espinoza", serv: "Corte", precio: 150, barbero: 1, estado: "pendiente", pago: "tarjeta" },
  { id: 8, h: 17.5, dur: 60, cliente: "Memo Cortés", serv: "Corte + barba", precio: 290, barbero: 2, estado: "pendiente", pago: "efectivo" },
  { id: 9, h: 18.5, dur: 25, cliente: "Sergio Palos", serv: "Solo barba", precio: 130, barbero: 1, estado: "pendiente", pago: "tarjeta" },
  { id: 10, h: 19.0, dur: 40, cliente: "Luis Arellano", serv: "Corte", precio: 150, barbero: 2, estado: "pendiente", pago: "tarjeta" },
];

const HORAS = Array.from({ length: 12 }, (_, i) => 9 + i);
const TODOS_HUECOS = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20];

const fmtHora = (h) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const suf = hh >= 12 ? "pm" : "am";
  const h12 = hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")}${suf}`;
};

// ── CountUp (React Bits) ──────────────────────────────────────
function CountUp({ to, dur = 1200, prefix = "", suffix = "", play }) {
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

// ── ShinyText (React Bits) ────────────────────────────────────
function ShinyText({ children, className = "" }) {
  return (
    <span className={className} style={{
      background: "linear-gradient(110deg,#8A7A5C 20%,#F5E6C8 45%,#8A7A5C 70%)",
      backgroundSize: "220% 100%",
      WebkitBackgroundClip: "text", backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animation: "shine 3.5s linear infinite",
    }}>{children}</span>
  );
}

// ── AnimatedList (React Bits) ─────────────────────────────────
function AnimatedItem({ children, i, play }) {
  return (
    <div style={{
      opacity: play ? 1 : 0,
      transform: play ? "translateY(0)" : "translateY(10px)",
      transition: `opacity .38s ease ${i * 55}ms, transform .38s ease ${i * 55}ms`,
    }}>{children}</div>
  );
}

// ── ClickSpark (React Bits) ───────────────────────────────────
function Spark({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "grid", placeItems: "center", zIndex: 60 }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <span key={i} style={{
          position: "absolute", width: 5, height: 5, borderRadius: 99, background: "#D4A03C",
          animation: `spark 620ms ease-out forwards`,
          ["--dx"]: `${Math.cos(a) * 78}px`, ["--dy"]: `${Math.sin(a) * 78}px`,
        }} />;
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("agenda");
  const [paso, setPaso] = useState(0);
  const [serv, setServ] = useState(null);
  const [hueco, setHueco] = useState(null);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [pago, setPago] = useState("tarjeta");
  const [spark, setSpark] = useState(false);
  const [listo, setListo] = useState(false);
  const [citas, setCitas] = useState(CITAS_INI);
  const [nextId, setNextId] = useState(100);

  // Hoja modal de cita
  const [sel, setSel] = useState(null);        // cita seleccionada
  const [modo, setModo] = useState("menu");    // menu | reagendar | confirmarBorrar
  const [aviso, setAviso] = useState(null);    // toast

  const [vistoAgenda, setVistoAgenda] = useState(false);
  const [vistoDash, setVistoDash] = useState(false);
  useEffect(() => {
    if (tab === "agenda") { const t = setTimeout(() => setVistoAgenda(true), 80); return () => clearTimeout(t); }
    if (tab === "metricas") { const t = setTimeout(() => setVistoDash(true), 80); return () => clearTimeout(t); }
  }, [tab]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const C = {
    bg: "#14110E", panel: "#1D1915", line: "#2E2820",
    text: "#F0EAE0", mute: "#8A7F6E", gold: "#D4A03C", teal: "#4A8FA8",
    rojo: "#C8564A",
  };

  // ── Métricas ──
  const cobradas = citas.filter(c => c.estado === "completada");
  const ingresos = cobradas.reduce((s, c) => s + c.precio, 0);
  const proyectado = citas.reduce((s, c) => s + c.precio, 0);
  const minOcupados = citas.reduce((s, c) => s + c.dur, 0);
  const ocupacion = Math.round((minOcupados / (11 * 60 * 2)) * 100);

  const conTarjeta = citas.filter(c => c.pago === "tarjeta");
  const montoTarjeta = conTarjeta.reduce((s, c) => s + c.precio, 0);
  const montoEfectivo = proyectado - montoTarjeta;
  const pctTarjeta = Math.round((montoTarjeta / proyectado) * 100);
  const comision = Math.round(montoTarjeta * 0.036);

  // ── Huecos libres reales ──
  const ocupado = (h, dur) => {
    const fin = h + dur / 60;
    return citas.some(c => {
      const cFin = c.h + c.dur / 60;
      return h < cFin && fin > c.h;
    });
  };
  const huecosPara = (min, excluirId = null) => {
    const otras = citas.filter(c => c.id !== excluirId);
    return TODOS_HUECOS.filter(h => {
      const fin = h + min / 60;
      if (fin > 20.5) return false;
      return !otras.some(c => {
        const cFin = c.h + c.dur / 60;
        return h < cFin && fin > c.h;
      });
    });
  };

  const crear = () => {
    const s = SERVICIOS.find(x => x.id === serv);
    setCitas(p => [...p, {
      id: nextId, h: hueco, dur: s.min, cliente: nombre || "Cliente nuevo", serv: s.nombre,
      precio: s.precio, barbero: 1, estado: "pendiente", pago, nueva: true,
    }].sort((a, b) => a.h - b.h));
    setNextId(n => n + 1);
    setSpark(true); setListo(true);
    setTimeout(() => setSpark(false), 700);
  };

  const reset = () => {
    setPaso(0); setServ(null); setHueco(null); setNombre(""); setTel(""); setPago("tarjeta"); setListo(false);
  };

  const abrirCita = (c) => { setSel(c); setModo("menu"); };
  const cerrarHoja = () => { setSel(null); setModo("menu"); };

  const mover = (nuevaH) => {
    setCitas(p => p.map(c => c.id === sel.id ? { ...c, h: nuevaH, movida: true } : c).sort((a, b) => a.h - b.h));
    setAviso(`${sel.cliente} se movió a ${fmtHora(nuevaH)}`);
    cerrarHoja();
  };

  const borrar = () => {
    const libre = fmtHora(sel.h);
    setCitas(p => p.filter(c => c.id !== sel.id));
    setAviso(`Cita cancelada · ${libre} quedó libre`);
    cerrarHoja();
  };

  const huecosReagendar = sel ? huecosPara(sel.dur, sel.id) : [];

  return (
    <div style={{
      minHeight: "100vh", background: "#0B0908", display: "grid", placeItems: "center",
      padding: "24px 12px", fontFamily: "'DM Sans',system-ui,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Bebas+Neue&display=swap');
        @keyframes shine{to{background-position:-220% 0}}
        @keyframes spark{to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
        @keyframes pop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes subir{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateY(14px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(14px)}}
        @keyframes libre{0%{background:rgba(212,160,60,.22);border-color:#D4A03C}100%{background:transparent}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        .sc::-webkit-scrollbar{display:none}
        .sc{scrollbar-width:none}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      <div style={{
        width: 390, maxWidth: "100%", height: 780, background: C.bg, borderRadius: 40,
        border: "9px solid #000", boxShadow: "0 0 0 2px #35302A, 0 30px 80px rgba(0,0,0,.7)",
        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
      }}>
        <Spark show={spark} />

        {/* Toast */}
        {aviso && (
          <div style={{
            position: "absolute", bottom: 96, left: 18, right: 18, zIndex: 55,
            background: "#2A241C", border: `1px solid ${C.gold}`, borderRadius: 11,
            padding: "13px 15px", fontSize: 13, color: C.text,
            animation: "toast 2.6s ease forwards", boxShadow: "0 8px 26px rgba(0,0,0,.5)",
          }}>{aviso}</div>
        )}

        {/* Barra de estado */}
        <div style={{ position: "relative", height: 34, flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 118, height: 26, background: "#000", borderRadius: "0 0 16px 16px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 22px", fontSize: 12, color: C.text, fontWeight: 600 }}>
            <span>9:41</span><span>5G ▪ 82%</span>
          </div>
        </div>

        {/* Encabezado */}
        <div style={{ padding: "6px 20px 14px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, letterSpacing: 1.4, lineHeight: 1 }}>
            <ShinyText>ELWERO BARBERO</ShinyText>
          </div>
          <div style={{ color: C.mute, fontSize: 12, marginTop: 4 }}>
            {tab === "agenda" && "Martes 21 de julio · toca una cita para moverla"}
            {tab === "nueva" && "Nueva cita"}
            {tab === "metricas" && "Este mes"}
          </div>
        </div>

        {/* ── AGENDA ── */}
        {tab === "agenda" && (
          <div className="sc" style={{ flex: 1, overflowY: "auto", padding: "14px 16px 90px" }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              {BARBEROS.map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mute }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: b.color }} />{b.nombre}
                </div>
              ))}
            </div>

            {HORAS.map((h, hi) => {
              const enHora = citas.filter(c => Math.floor(c.h) === h);
              return (
                <div key={h} style={{ display: "flex", gap: 10, minHeight: 54, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
                  <div style={{ width: 46, flexShrink: 0, fontSize: 11, color: C.mute, fontVariantNumeric: "tabular-nums", paddingTop: 2 }}>
                    {fmtHora(h)}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingBottom: 8 }}>
                    {enHora.length === 0 && (
                      <div onClick={() => { reset(); setTab("nueva"); }} style={{
                        border: `1px dashed ${C.line}`, borderRadius: 9, padding: "11px 12px",
                        color: C.mute, fontSize: 12, cursor: "pointer", minHeight: 44,
                        display: "flex", alignItems: "center",
                        animation: "libre 1.6s ease",
                      }}>Libre · toca para agendar</div>
                    )}
                    {enHora.map((c) => {
                      const b = BARBEROS.find(x => x.id === c.barbero);
                      return (
                        <AnimatedItem key={c.id} i={hi} play={vistoAgenda}>
                          <div onClick={() => abrirCita(c)} style={{
                            background: C.panel, borderLeft: `3px solid ${b.color}`, borderRadius: 9,
                            padding: "10px 12px", opacity: c.estado === "completada" ? 0.5 : 1,
                            animation: (c.nueva || c.movida) ? "pop .4s ease" : "none",
                            outline: (c.nueva || c.movida) ? `1px solid ${C.gold}` : "none",
                            cursor: "pointer", minHeight: 44,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.cliente}</span>
                              <span style={{ fontSize: 12, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{fmtHora(c.h)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 12, color: C.mute }}>
                              <span>{c.serv} · {c.dur} min</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 10, opacity: .8 }}>{c.pago === "tarjeta" ? "▭" : "$"}</span>
                                <span style={{ color: b.color }}>${c.precio}</span>
                              </span>
                            </div>
                          </div>
                        </AnimatedItem>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── NUEVA CITA ── */}
        {tab === "nueva" && (
          <div className="sc" style={{ flex: 1, overflowY: "auto", padding: "16px 18px 90px" }}>
            {!listo && (
              <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= paso ? C.gold : C.line, transition: "background .3s" }} />
                ))}
              </div>
            )}

            {listo ? (
              <div style={{ textAlign: "center", paddingTop: 60, animation: "pop .4s ease" }}>
                <div style={{ fontSize: 46, marginBottom: 12 }}>✂️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: C.gold, letterSpacing: 1 }}>CITA AGENDADA</div>
                <div style={{ color: C.mute, fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
                  {nombre || "Cliente nuevo"}<br />
                  {SERVICIOS.find(s => s.id === serv)?.nombre} · {fmtHora(hueco)}<br />
                  Pago: {pago === "tarjeta" ? "tarjeta" : "efectivo"}<br />
                  <span style={{ color: C.gold }}>Recordatorio por WhatsApp 2h antes</span>
                </div>
                <button onClick={() => { reset(); setTab("agenda"); }} style={{
                  marginTop: 26, background: C.gold, color: "#14110E", border: "none",
                  padding: "13px 30px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>Ver en la agenda</button>
              </div>
            ) : (
              <>
                {paso === 0 && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: C.text }}>¿Qué servicio?</div>
                    <div style={{ fontSize: 12, color: C.mute, marginBottom: 14 }}>Paso 1 de 3</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {SERVICIOS.map(s => (
                        <button key={s.id} onClick={() => { setServ(s.id); setPaso(1); }} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                          padding: "15px", cursor: "pointer", textAlign: "left", minHeight: 56, width: "100%",
                        }}>
                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{s.nombre}</div>
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
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: C.text }}>¿A qué hora?</div>
                    <div style={{ fontSize: 12, color: C.mute, marginBottom: 14 }}>
                      Paso 2 de 3 · huecos libres para {SERVICIOS.find(s => s.id === serv)?.min} min
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      {huecosPara(SERVICIOS.find(s => s.id === serv).min).slice(0, 8).map(h => (
                        <button key={h} onClick={() => { setHueco(h); setPaso(2); }} style={{
                          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                          padding: "20px 0", fontSize: 17, fontWeight: 700, color: C.text, cursor: "pointer", minHeight: 62,
                        }}>{fmtHora(h)}</button>
                      ))}
                    </div>
                    <button onClick={() => setPaso(0)} style={{ marginTop: 18, background: "none", border: "none", color: C.mute, fontSize: 13, cursor: "pointer" }}>← Cambiar servicio</button>
                  </>
                )}

                {paso === 2 && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: C.text }}>¿Quién viene?</div>
                    <div style={{ fontSize: 12, color: C.mute, marginBottom: 16 }}>Paso 3 de 3</div>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del cliente" style={{
                      width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                      padding: "15px 14px", color: C.text, fontSize: 15, marginBottom: 10, outline: "none", minHeight: 52,
                    }} />
                    <input value={tel} onChange={e => setTel(e.target.value)} placeholder="WhatsApp (449...)" inputMode="tel" style={{
                      width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 11,
                      padding: "15px 14px", color: C.text, fontSize: 15, outline: "none", minHeight: 52,
                    }} />

                    <div style={{ fontSize: 12, color: C.mute, margin: "16px 0 8px" }}>¿Cómo va a pagar?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      {[{ v: "tarjeta", t: "Tarjeta" }, { v: "efectivo", t: "Efectivo" }].map(o => (
                        <button key={o.v} onClick={() => setPago(o.v)} style={{
                          background: pago === o.v ? C.gold : C.panel,
                          color: pago === o.v ? "#14110E" : C.text,
                          border: `1px solid ${pago === o.v ? C.gold : C.line}`,
                          borderRadius: 11, padding: "14px 0", fontSize: 14,
                          fontWeight: pago === o.v ? 700 : 500, cursor: "pointer", minHeight: 50,
                        }}>{o.t}</button>
                      ))}
                    </div>

                    <div style={{
                      marginTop: 16, background: C.panel, borderRadius: 11, padding: 14,
                      border: `1px solid ${C.line}`, fontSize: 13, color: C.mute, lineHeight: 1.7,
                    }}>
                      {SERVICIOS.find(s => s.id === serv)?.nombre} · {fmtHora(hueco)}<br />
                      Termina {fmtHora(hueco + SERVICIOS.find(s => s.id === serv).min / 60)} ·
                      <span style={{ color: C.gold }}> ${SERVICIOS.find(s => s.id === serv)?.precio}</span>
                    </div>
                    <button onClick={crear} style={{
                      width: "100%", marginTop: 16, background: C.gold, color: "#14110E", border: "none",
                      padding: "16px", borderRadius: 11, fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 54,
                    }}>Agendar</button>
                    <button onClick={() => setPaso(1)} style={{ marginTop: 12, background: "none", border: "none", color: C.mute, fontSize: 13, cursor: "pointer" }}>← Cambiar hora</button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── MÉTRICAS ── */}
        {tab === "metricas" && (
          <div className="sc" style={{ flex: 1, overflowY: "auto", padding: "16px 18px 90px" }}>
            <div style={{ background: C.panel, borderRadius: 13, padding: 18, border: `1px solid ${C.line}`, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: C.mute, marginBottom: 6 }}>Cobrado hoy</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: C.gold, lineHeight: 1 }}>
                <CountUp to={ingresos} prefix="$" play={vistoDash} />
              </div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 6 }}>
                Proyectado al cierre: ${proyectado.toLocaleString("es-MX")}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ background: C.panel, borderRadius: 13, padding: 15, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 11, color: C.mute, marginBottom: 5 }}>Ocupación</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: C.text, lineHeight: 1 }}>
                  <CountUp to={ocupacion} suffix="%" play={vistoDash} />
                </div>
              </div>
              <div style={{ background: C.panel, borderRadius: 13, padding: 15, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 11, color: C.mute, marginBottom: 5 }}>Citas hoy</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: C.text, lineHeight: 1 }}>
                  <CountUp to={citas.length} play={vistoDash} />
                </div>
              </div>
            </div>

            {/* ── COBROS CON TARJETA ── */}
            <div style={{ background: C.panel, borderRadius: 13, padding: 16, border: `1px solid ${C.line}`, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <span style={{ fontSize: 12, color: C.mute }}>Cómo te pagan</span>
                <span style={{ fontSize: 11, color: C.teal }}>{conTarjeta.length} de {citas.length} con tarjeta</span>
              </div>

              <div style={{ display: "flex", height: 9, borderRadius: 5, overflow: "hidden", background: C.line, marginBottom: 13 }}>
                <div style={{
                  width: vistoDash ? `${pctTarjeta}%` : 0, background: C.teal,
                  transition: "width .8s cubic-bezier(.2,.8,.3,1) .2s",
                }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: C.teal }} />
                    <span style={{ fontSize: 11, color: C.mute }}>Tarjeta</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 25, color: C.text, lineHeight: 1 }}>
                    <CountUp to={montoTarjeta} prefix="$" play={vistoDash} />
                  </div>
                  <div style={{ fontSize: 11, color: C.mute, marginTop: 3 }}>{pctTarjeta}% del día</div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: C.line }} />
                    <span style={{ fontSize: 11, color: C.mute }}>Efectivo</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 25, color: C.text, lineHeight: 1 }}>
                    <CountUp to={montoEfectivo} prefix="$" play={vistoDash} />
                  </div>
                  <div style={{ fontSize: 11, color: C.mute, marginTop: 3 }}>{100 - pctTarjeta}% del día</div>
                </div>
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
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 74 }}>
                {[30, 45, 60, 55, 25, 20, 35, 70, 95, 90, 65, 40].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: "100%", borderRadius: "3px 3px 0 0",
                      background: v > 80 ? C.gold : C.line,
                      height: vistoDash ? `${v * 0.62}px` : 0,
                      transition: `height .6s cubic-bezier(.2,.8,.3,1) ${i * 45}ms`,
                    }} />
                    <span style={{ fontSize: 8, color: C.mute }}>{9 + i > 12 ? 9 + i - 12 : 9 + i}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.gold, marginTop: 10 }}>Tu hora pico es de 5 a 7pm</div>
            </div>

            <div style={{ background: "rgba(200,70,60,.09)", borderRadius: 13, padding: 16, border: "1px solid rgba(200,70,60,.28)" }}>
              <div style={{ fontSize: 12, color: "#D98A80", marginBottom: 6 }}>Clientes que no llegaron</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#E8A398" }}>
                  <CountUp to={7} play={vistoDash} />
                </span>
                <span style={{ fontSize: 13, color: "#D98A80" }}>
                  = <CountUp to={1360} prefix="$" play={vistoDash} /> perdidos este mes
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 9, lineHeight: 1.5 }}>
                Con recordatorio automático por WhatsApp, la mayoría de estos avisan o confirman.
              </div>
            </div>
          </div>
        )}

        {/* ── HOJA MODAL DE CITA ── */}
        {sel && (
          <>
            <div onClick={cerrarHoja} style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,.62)",
              zIndex: 50, animation: "fade .2s ease",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 51,
              background: "#221D18", borderRadius: "22px 22px 0 0",
              borderTop: `1px solid ${C.line}`, padding: "10px 18px 28px",
              animation: "subir .28s cubic-bezier(.2,.9,.3,1)",
              maxHeight: 560, overflowY: "auto",
            }} className="sc">
              <div style={{ width: 38, height: 4, borderRadius: 3, background: C.line, margin: "0 auto 16px" }} />

              {modo === "menu" && (
                <>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{sel.cliente}</div>
                  <div style={{ fontSize: 13, color: C.mute, marginTop: 5, lineHeight: 1.6 }}>
                    {sel.serv} · {sel.dur} min · ${sel.precio}<br />
                    {fmtHora(sel.h)} a {fmtHora(sel.h + sel.dur / 60)} · con {BARBEROS.find(b => b.id === sel.barbero)?.nombre}<br />
                    Pago: {sel.pago === "tarjeta" ? "tarjeta" : "efectivo"}
                  </div>

                  <button onClick={() => setModo("reagendar")} style={{
                    width: "100%", marginTop: 20, background: C.gold, color: "#14110E", border: "none",
                    padding: "15px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 52,
                  }}>Cambiar de hora</button>

                  <button onClick={() => setModo("confirmarBorrar")} style={{
                    width: "100%", marginTop: 9, background: "transparent", color: C.rojo,
                    border: `1px solid ${C.rojo}`, padding: "15px", borderRadius: 11,
                    fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 52,
                  }}>Cancelar cita</button>

                  <button onClick={cerrarHoja} style={{
                    width: "100%", marginTop: 9, background: "transparent", color: C.mute,
                    border: "none", padding: "13px", fontSize: 14, cursor: "pointer",
                  }}>Cerrar</button>
                </>
              )}

              {modo === "reagendar" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Mover a otra hora</div>
                  <div style={{ fontSize: 12, color: C.mute, marginTop: 5, marginBottom: 15 }}>
                    {sel.cliente} · huecos libres para {sel.dur} min
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {huecosReagendar.slice(0, 12).map(h => (
                      <button key={h} onClick={() => mover(h)} style={{
                        background: h === sel.h ? C.gold : C.panel,
                        color: h === sel.h ? "#14110E" : C.text,
                        border: `1px solid ${h === sel.h ? C.gold : C.line}`,
                        borderRadius: 10, padding: "15px 0", fontSize: 14,
                        fontWeight: 600, cursor: "pointer", minHeight: 50,
                      }}>{fmtHora(h)}</button>
                    ))}
                  </div>
                  {huecosReagendar.length === 0 && (
                    <div style={{ fontSize: 13, color: C.mute, padding: "20px 0", textAlign: "center" }}>
                      No hay huecos libres hoy para {sel.dur} min. Cancela otra cita o pásalo a mañana.
                    </div>
                  )}
                  <button onClick={() => setModo("menu")} style={{
                    width: "100%", marginTop: 14, background: "transparent", color: C.mute,
                    border: "none", padding: "13px", fontSize: 14, cursor: "pointer",
                  }}>← Regresar</button>
                </>
              )}

              {modo === "confirmarBorrar" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>¿Cancelar esta cita?</div>
                  <div style={{ fontSize: 13, color: C.mute, marginTop: 8, lineHeight: 1.6 }}>
                    {sel.cliente} · {sel.serv} · {fmtHora(sel.h)}<br />
                    El horario de <span style={{ color: C.gold }}>{fmtHora(sel.h)}</span> queda libre
                    y cualquier otro cliente lo puede tomar.
                  </div>
                  <button onClick={borrar} style={{
                    width: "100%", marginTop: 20, background: C.rojo, color: "#fff", border: "none",
                    padding: "15px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 52,
                  }}>Sí, cancelar y liberar</button>
                  <button onClick={() => setModo("menu")} style={{
                    width: "100%", marginTop: 9, background: "transparent", color: C.mute,
                    border: `1px solid ${C.line}`, padding: "15px", borderRadius: 11,
                    fontSize: 15, cursor: "pointer", minHeight: 52,
                  }}>No, dejarla así</button>
                </>
              )}
            </div>
          </>
        )}

        {/* Navegación inferior (PillNav) */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(20,17,14,.96)",
          backdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`,
          padding: "9px 14px 22px", display: "flex", gap: 6, zIndex: 20,
        }}>
          {[
            { id: "agenda", t: "Agenda" },
            { id: "nueva", t: "Nueva cita" },
            { id: "metricas", t: "Números" },
          ].map(x => (
            <button key={x.id} onClick={() => { if (x.id === "nueva") reset(); setTab(x.id); }} style={{
              flex: 1, background: tab === x.id ? C.gold : "transparent",
              color: tab === x.id ? "#14110E" : C.mute, border: "none",
              padding: "12px 0", borderRadius: 11, fontSize: 13,
              fontWeight: tab === x.id ? 700 : 500, cursor: "pointer",
              transition: "background .22s, color .22s", minHeight: 46,
            }}>{x.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
