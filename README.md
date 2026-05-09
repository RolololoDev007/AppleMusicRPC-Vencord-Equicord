# AppleMusicWindowsRpc

UserPlugin para Equicord que detecta la canción actual de Apple Music en Windows usando SMTC (GlobalSystemMediaTransportControlsSessionManager) y la publica como actividad local en Discord.

## Instalación

1. Copia esta carpeta a `src/userplugins/appleMusicWindowsRpc` dentro de tu repo de Equicord.
2. Ejecuta `pnpm build` en la raíz de Equicord.
3. Reinicia Discord.
4. Activa `AppleMusicWindowsRpc` en Plugins.

## Notas

- Requiere Windows y la app de Apple Music/iTunes emitiendo sesión multimedia.
- Si Apple Music está pausado, el plugin limpia la actividad.
- Puedes cambiar formato y refresco desde los ajustes del plugin.
