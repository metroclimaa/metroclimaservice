# Integración futura con ARCA

La aplicación no emite comprobantes fiscales hasta completar una configuración
real y controlada. El panel sólo presenta la interfaz y conserva los campos que
necesitará la integración.

## Situación prevista

MetroClima indicó que sus responsables son monotributistas. Para operaciones
locales, ARCA establece que los monotributistas emiten comprobantes electrónicos
tipo C. Por eso el presupuesto trabaja con precio final e IVA no discriminado.

Referencias oficiales:

- https://www.arca.gob.ar/monotributo/ayuda/facturacion.asp
- https://www.arca.gob.ar/fe/
- https://www.arca.gob.ar/facturacion/regimen-general/

## Requisitos técnicos por responsable

- CUIT y condición fiscal vigentes;
- punto de venta habilitado para servicios web;
- certificado digital;
- clave privada protegida;
- autorización del servicio de factura electrónica;
- definición de quién emite cada comprobante;
- datos fiscales que deben aparecer en el PDF;
- ambiente de homologación para pruebas antes de producción.

## Diseño recomendado

1. El panel crea el comprobante en estado `borrador`.
2. Un endpoint exclusivo del Worker valida cliente, importes y emisor.
3. El Worker obtiene autorización sin exponer certificados al navegador.
4. Se solicita CAE a ARCA.
5. Se guarda la respuesta completa, CAE, vencimiento y numeración.
6. Se genera el PDF definitivo con QR y datos fiscales.
7. Si ARCA rechaza la operación, el documento permanece sin emitir y se muestra
   el motivo; nunca se inventa una numeración o CAE.

## Seguridad

Los certificados, claves privadas y cualquier secreto fiscal deben almacenarse
como secretos cifrados del servidor. No deben incluirse en GitHub, Supabase del
lado público, variables `NEXT_PUBLIC_*` ni archivos descargables.
