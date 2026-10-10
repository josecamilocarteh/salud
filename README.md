# Plan de 12 semanas

App para registrar el avance diario del plan: pasos, sueño, cigarros, tragos, cumplimiento y control semanal de peso y cintura.

- `index.html`: la app (sin build).
- `api/datos.js`: función de Vercel que lee y guarda los registros en un archivo JSON **privado** de Vercel Blob. Cada petición exige el PIN.

## Puesta en marcha en Vercel

1. **Importar el repositorio**: en Vercel, *Add New → Project*, elegir este repo. Framework: *Other*. Sin comando de build.
2. **Crear el almacenamiento**: en el proyecto, pestaña *Storage → Create → Blob*, acceso **Private**, y conectarlo al proyecto. Esto agrega `BLOB_READ_WRITE_TOKEN` automáticamente.
3. **Definir el PIN**: en *Settings → Environment Variables*, agregar `APP_PIN` con el PIN que quieras usar (para Production).
4. **Redeploy**: *Deployments → ⋯ → Redeploy*, para que tome el almacenamiento y el PIN.

Para cambiar el PIN, edita `APP_PIN` y vuelve a desplegar.
