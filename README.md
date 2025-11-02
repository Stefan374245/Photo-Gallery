# 📷 Fotogalerie - Angular + Firebase App

Eine einfache Fotogalerie-Webanwendung mit Angular 17+ und Firebase.

## 🚀 Features

- ✅ **Authentifizierung**
  - Registrierung und Anmeldung mit E-Mail/Passwort
  - Google-Authentifizierung
  - Automatische Weiterleitung basierend auf Auth-Status

- ✅ **Foto-Upload**
  - Drag & Drop Funktionalität
  - Upload über Dateiauswahl
  - Upload-Fortschrittsanzeige
  - Optionale Beschreibung für jedes Foto

- ✅ **Galerie-Ansicht**
  - Grid-Layout für alle hochgeladenen Fotos
  - Responsive Design
  - Foto-Details beim Klick
  - Fotos löschen

- ✅ **Foto-Dialog**
  - Große Foto-Ansicht
  - Beschreibung bearbeiten
  - Foto-Metadaten anzeigen

## 🛠️ Technologien

- **Angular 17+**
- **Angular Material** (UI-Komponenten)
- **AngularFire** (Firebase SDK für Angular)
- **Firebase**
  - Authentication
  - Firestore (Datenbank)
  - Storage (Datei-Upload)

## 📦 Installation

1. **Dependencies installieren:**
```bash
cd photo-gallery
npm install
```

2. **Firebase konfigurieren:**
   - Erstellen Sie ein Firebase-Projekt unter [Firebase Console](https://console.firebase.google.com/)
   - Aktivieren Sie Authentication (E-Mail/Passwort und Google)
   - Erstellen Sie eine Firestore-Datenbank
   - Aktivieren Sie Storage
   - Kopieren Sie Ihre Firebase-Konfiguration

3. **Environment-Datei konfigurieren:**
   - Öffnen Sie `src/environments/environment.ts`
   - Tragen Sie Ihre Firebase-Konfiguration ein:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'Ihre_API_Key',
    authDomain: 'Ihr_Auth_Domain',
    projectId: 'Ihr_Project_ID',
    storageBucket: 'Ihr_Storage_Bucket',
    messagingSenderId: 'Ihre_Messaging_Sender_ID',
    appId: 'Ihre_App_ID'
  }
};
```

4. **Firestore Security Rules:**
   Stellen Sie sicher, dass Ihre Firestore-Regeln die Benutzer-Authentifizierung erfordern:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/photos/{photoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. **Storage Security Rules:**
   Konfigurieren Sie die Storage-Regeln:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/photos/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Verwendung

1. **Entwicklungsserver starten:**
```bash
ng serve
```

2. **App öffnen:**
   - Navigieren Sie zu `http://localhost:4200`
   - Die App leitet Sie automatisch zur Login-Seite weiter

3. **Erste Schritte:**
   - Erstellen Sie ein neues Konto oder melden Sie sich an
   - Laden Sie Ihr erstes Foto hoch
   - Klicken Sie auf ein Foto, um es in größerer Ansicht zu sehen
   - Bearbeiten Sie die Beschreibung eines Fotos

## 📁 Projektstruktur

```
src/app/
├── components/
│   ├── auth/
│   │   ├── login/          # Login-Komponente
│   │   └── register/       # Registrierungs-Komponente
│   └── gallery/
│       ├── upload/         # Upload-Komponente
│       ├── list/           # Galerie-Liste
│       ├── photo-dialog/   # Foto-Dialog
│       └── gallery.component.ts  # Container-Komponente
├── services/
│   ├── auth.service.ts     # Authentifizierungs-Service
│   └── photo.service.ts    # Foto-Management-Service
├── models/
│   └── photo.model.ts      # Photo-Interface
└── app.routes.ts           # Routing-Konfiguration
```

## 🔐 Routen

- `/login` - Anmeldung
- `/register` - Registrierung
- `/gallery` - Hauptgalerie (Upload + Liste)
- `/` - Weiterleitung zu `/login`

## 📝 Wichtige Hinweise

- Die App verwendet keine Route Guards - die Authentifizierung wird in den Komponenten geprüft
- Alle Fotos werden benutzerspezifisch in Firestore gespeichert: `users/{uid}/photos/{photoId}`
- Dateien werden in Firebase Storage gespeichert: `users/{uid}/photos/{filename}`

## 🎨 Anpassungen

Die App verwendet Angular Material für die UI. Sie können die Themes und Styles in `src/styles.scss` anpassen.

Viel Erfolg mit Ihrer Fotogalerie! 📸