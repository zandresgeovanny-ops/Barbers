# ElweroBarbero v3

## Estructura — TODO PLANO, sin carpeta src/

    index.html
    package.json
    vite.config.js
    main.jsx
    App.jsx

Sube estos 5 archivos a la raiz de tu repo. Sin carpetas.
Si tu repo ya tiene una carpeta src/ con archivos viejos, borrala.

## Que cambio en v3

- Sin marco de telefono: la web ocupa toda la pantalla, responsiva de verdad
- Rejilla de 30 minutos; un servicio de 15 min ocupa media franja, no una hora
- Swipe: desliza una cita a la izquierda y salen 3 botones
  Verde Completar / Morado Mover / Rojo Eliminar
- Completada se queda en verde con el nombre tachado
- Nueva pestana Registro: calendario mensual navegable, puntos por dia
  (verde = completadas, dorado = pendientes), tocar un dia para ver sus citas
- Alta ampliada: barbero asignado, nota, telefono, metodo de pago
- Servicio nuevo de Contornos, 15 min, para demostrar la granularidad

## Pendientes antes de vender

- Comision de terminal al 3.6% es de ejemplo
- Los 7 no-shows y los $1,360 son inventados: decirlo al presentar
- Validar precios con una barberia real de Aguascalientes
