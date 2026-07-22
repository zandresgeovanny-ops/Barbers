# ElweroBarbero — Demo

Demo de venta. Agenda de citas para barbería, mobile-first.
Datos ficticios. Precios estimados para Aguascalientes — validar antes de presentar.

## Correr en local

    npm install
    npm run dev

## Subir a Vercel

Opción A — desde la terminal:

    npm i -g vercel
    vercel --prod

Opción B — desde vercel.com:
New Project → Import → arrastra esta carpeta. Vercel detecta Vite solo.

## Conectar el subdominio

1. Vercel → proyecto → Settings → Domains → agregar
   `barberiawero.andresweb.online`
2. Vercel te muestra un CNAME (tipo `cname.vercel-dns.com`)
3. Hostinger → hPanel → Dominios → andresweb.online → Zona DNS
   Tipo: CNAME · Nombre: barberiawero · Apunta a: (lo que dio Vercel)
4. Esperar 10-30 min. El SSL se emite solo.

## Qué contiene

- Agenda del día con citas por barbero
- Tocar una cita → reagendar o cancelar (libera el horario)
- Alta de cita en 3 pasos con detección de empalmes
- Números: ingresos, ocupación, hora pico, tarjeta vs efectivo, no-shows

## Pendientes antes de vender

- Ajustar comisión de terminal (3.6% es de ejemplo)
- Los no-shows y la ocupación son datos inventados: decirlo al presentar
- Validar precios reales con la barbería
