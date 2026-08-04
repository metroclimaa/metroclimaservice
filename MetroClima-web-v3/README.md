# MetroClima

Sitio comercial y panel de gestión para el emprendimiento de climatización de
Cristian y Nicolás.

## Qué incluye

- portada comercial cálida y responsive;
- servicios para viviendas, countries, consorcios y empresas;
- foro público de consultas con respuestas oficiales de MetroClima;
- datos de contacto separados de la publicación pública;
- acceso privado para dos administradores mediante Supabase Auth;
- panel de consultas y seguimiento comercial;
- clientes e historial;
- presupuestos membretados con mano de obra y materiales separados;
- tratamiento fiscal configurable;
- comprobantes preparados para una futura integración con ARCA;
- catálogo de materiales preparado para activar stock más adelante.

## Tecnologías

- Next.js + React + TypeScript;
- Vinext para ejecución como Cloudflare Worker;
- Supabase Auth, PostgreSQL y Row Level Security;
- CSS responsive sin dependencia de un kit visual externo.

## Desarrollo local

Requisitos: Node.js 22.13 o superior.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

La aplicación puede abrirse sin variables de entorno en modo demostración. En
ese modo los formularios y el panel no guardan datos reales.

## Conectar Supabase

1. Crear un proyecto nuevo en Supabase.
2. Ejecutar `supabase/schema.sql` desde el SQL Editor.
3. Crear exactamente dos usuarios en Authentication: Cristian y Nicolás.
4. Copiar los UUID de esos usuarios en el `insert` comentado al final del
   esquema para crear sus perfiles administradores.
5. Copiar `.env.example` como `.env.local` y completar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON
```

La clave pública `anon` puede usarse en el navegador porque la protección real
la aplican las políticas RLS. Nunca publicar la `service_role`.

### Privacidad del foro

La tabla `consultas` contiene teléfono, correo y localidad. La vista
`consultas_publicas` omite esas columnas. El visitante sólo puede crear una
consulta y leer la vista segura; únicamente los dos perfiles administradores
pueden consultar la tabla completa.

## Presupuestos y comprobantes

El documento muestra:

- número, fecha y validez;
- cliente y ubicación;
- descripción del trabajo;
- mano de obra;
- materiales;
- subtotal, tratamiento fiscal y total;
- responsables Cristian y Nicolás;
- condiciones de pago y garantía.

Para un emisor monotributista se presenta "IVA no discriminado" y se prevé
Factura C. La opción IVA 21% queda desactivada como configuración futura para un
eventual cambio de régimen.

La conexión real con ARCA requiere punto de venta, certificado, clave privada y
credenciales propias. Ver `docs/ARCA-INTEGRACION.md`.

## Publicación

El proyecto genera un Worker ESM compatible con Cloudflare:

```bash
npm run build
```

El resultado validado queda en `dist/`. Para el flujo GitHub + Cloudflare se
recomienda mantener las variables de Supabase como secretos del entorno y no
guardarlas en el repositorio.

## Datos que faltan completar antes de salir al público

- CUIT y domicilio fiscal de cada emisor;
- enlace real de LinkedIn;
- correos privados para las dos cuentas administradoras;
- datos de Supabase;
- configuración fiscal para ARCA.
