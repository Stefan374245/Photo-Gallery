# Assets Ordner

Dieser Ordner enthält statische Ressourcen für die Photo-Gallery Anwendung.

## Struktur

### `/icons`
- App Icons (favicon, app-icon, etc.)
- SVG Icons für die UI
- PNG/WebP Icons

**Verwendung:**
```typescript
<img src="assets/icons/logo.svg" alt="Logo">
```

### `/images`
- Hintergrundbilder
- Platzhalter-Bilder
- Statische Grafiken

**Verwendung:**
```typescript
<img src="assets/images/placeholder.jpg" alt="Placeholder">
```

## Best Practices

1. **Dateinamen:** Verwende kebab-case (z.B. `app-logo.svg`)
2. **Optimierung:** Komprimiere Bilder vor dem Upload
3. **Format:** 
   - Icons: SVG (bevorzugt) oder PNG
   - Bilder: WebP, JPEG, oder PNG
4. **Größe:** Halte Dateien so klein wie möglich

## Zugriff in Angular

In Templates:
```html
<img src="assets/icons/camera.svg" alt="Camera">
```

In TypeScript:
```typescript
const iconPath = 'assets/icons/camera.svg';
```

In SCSS:
```scss
background-image: url('/assets/images/hero-bg.jpg');
```
