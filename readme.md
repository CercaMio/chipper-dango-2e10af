# CercaMío — versión conectada a Supabase

Esta versión consulta los comercios activos desde Supabase y permite enviar nuevas fichas que quedan pendientes de aprobación (`is_active = false`).

## Configuración incluida
- URL del proyecto: configurada en `app.js`.
- Clave `sb_publishable_`: clave pública diseñada para uso en navegador. No es una clave secreta.
- Tabla: `public.businesses`.

## Requisitos de Supabase
La tabla debe tener las columnas `id`, `name`, `category`, `description`, `phone`, `address`, `offer`, `icon`, `is_active`, `created_at`. RLS debe estar habilitado. Las políticas necesarias son: lectura pública sólo para filas activas e inserción pública sólo de filas con `is_active = false`.

## Publicar desde Android
1. Descargá el ZIP.
2. En Netlify, abrí el proyecto y buscá la opción para desplegar archivos o arrastrá/cargá el ZIP actualizado en Netlify Drop.
3. Esperá el despliegue y abrí la URL `netlify.app`. Si el navegador muestra la versión anterior, recargá la página o abrila en una pestaña de incógnito.

## Importante
- Los nuevos comercios quedan pendientes; no hay panel administrativo en esta versión para aprobarlos. La aprobación puede hacerse manualmente desde Table Editor en Supabase cambiando `is_active` a `true` después de verificar los datos.
- No incluyas contraseñas ni claves `secret` o `service_role` en el sitio.
- La clave publishable puede estar en el frontend; la seguridad depende de RLS y las políticas de la tabla.
- Esta versión no incluye cuentas de comerciantes, pagos ni subida de imágenes.
