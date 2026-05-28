# Flujo Git del equipo MagdalenaTrace

## Ramas
- `main` → solo código probado (Mauricio hace el merge final)
- `develop` → integración
- `feat/api-mauricio` → Mauricio
- `feat/web-damian` → Damián
- `feat/qr-operador-camila` → Camila
- `feat/demo-datos-nicolle` → Nicolle

## Comandos del día a día

```bash
# Ver en qué rama estás
git branch

# Guardar tu trabajo
git add .
git commit -m "feat: descripción corta de lo que hiciste"
git push

# Traer los últimos cambios de Mauricio
git pull origin develop

# Aviso en WhatsApp cuando terminas un endpoint:
# "✅ LISTO: GET /lotes/publico/{id} — Camila ya puede conectar /lote/:id"
```

## Convención de commits
- feat: nueva funcionalidad
- fix: corrección de bug
- chore: configuración
- docs: documentación
