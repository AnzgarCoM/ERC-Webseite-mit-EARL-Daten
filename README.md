# EARL Website – GitHub Pages + Supabase

Dieses Paket enthält die vollständige statische EARL-Website, alle Teamchef- und Fahrerkarten, eine dreisekündige Teamlogo-Animation und ein Supabase-geschütztes Admin Panel.

## Ordnerstruktur

```text
earl-website/
├── index.html
├── admin.html
├── 404.html
├── README.md
├── assets/
│   ├── earl-logo.png
│   └── team-cards/
│       ├── driver/
│       └── team-chief/
├── css/
│   ├── styles.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── config.js
│   ├── config.example.js
│   ├── data.js
│   └── supabase-client.js
└── supabase/
    └── schema.sql
```

## 1. Lokal testen

Öffne den Projektordner in VS Code. Starte nicht einfach die HTML-Datei per Doppelklick, sondern einen kleinen lokalen Webserver:

```bash
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen. Das Admin Panel liegt unter `http://localhost:8080/admin.html`.

## 2. Supabase-Projekt erstellen

1. Öffne [supabase.com](https://supabase.com), melde dich an und erstelle ein neues Projekt.
2. Öffne im Projekt den **SQL Editor**.
3. Kopiere den vollständigen Inhalt von `supabase/schema.sql` hinein und führe ihn aus.
4. Öffne **Authentication → Users → Add user**.
5. Lege den Admin mit `s.barbosa.galaxy@gmail.com` und einem starken Passwort an.
6. Öffne den SQL Editor erneut und führe aus:

```sql
update public.profiles
set is_admin = true
where email = 's.barbosa.galaxy@gmail.com';
```

7. Öffne **Project Settings → API** und kopiere:
   - Project URL
   - den öffentlichen `anon`/`publishable` Key
8. Öffne `js/config.js` und ersetze die beiden Platzhalter:

```js
window.EARL_CONFIG = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "DEIN_PUBLIC_ANON_KEY",
  adminEmail: "s.barbosa.galaxy@gmail.com"
};
```

Der öffentliche Anon Key darf im Browser verwendet werden. Den Supabase `service_role` Key niemals in diese Datei, in GitHub oder in irgendeine Browserdatei eintragen. Die Sicherheit wird über die Row Level Security Policies aus `schema.sql` erzwungen.

## 3. GitHub-Repository anlegen

1. Bei [github.com](https://github.com) rechts oben auf **+ → New repository** klicken.
2. Repository zum Beispiel `earl-website` nennen.
3. **Public** auswählen, wenn du GitHub Pages kostenlos nutzen möchtest.
4. Keine zusätzliche README oder `.gitignore` erzeugen, weil beide schon im Paket vorhanden sind.
5. **Create repository** anklicken.

## 4A. Upload direkt im Browser

1. Im leeren Repository auf **uploading an existing file** klicken.
2. Den Inhalt dieses Projektordners hineinziehen. Wichtig: `index.html` muss direkt auf der obersten Ebene liegen, nicht in einem zusätzlichen Unterordner.
3. Als Commit-Nachricht `EARL Website installieren` eintragen.
4. **Commit changes** anklicken.

## 4B. Alternativ mit Git hochladen

Im Projektordner:

```bash
git init
git add .
git commit -m "EARL Website installieren"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/earl-website.git
git push -u origin main
```

## 5. GitHub Pages aktivieren

1. Im Repository **Settings → Pages** öffnen.
2. Unter **Build and deployment** bei Source **Deploy from a branch** wählen.
3. Branch **main** und Ordner **/ (root)** auswählen.
4. **Save** anklicken.
5. Nach einigen Minuten erscheint die Adresse, normalerweise:
   `https://DEIN-NAME.github.io/earl-website/`

## 6. Supabase für die veröffentlichte Adresse erlauben

In Supabase **Authentication → URL Configuration**:

- Site URL: `https://DEIN-NAME.github.io/earl-website/`
- Redirect URL hinzufügen: `https://DEIN-NAME.github.io/earl-website/**`

Für den aktuellen E-Mail/Passwort-Login ist kein OAuth-Provider nötig.

## Bedienung

- Öffentliche Inhalte werden aus Supabase geladen; bis zur Verbindung erscheinen Beispieldaten.
- Bei einer Rennanmeldung muss der Fahrer das Qualifying-Pflicht-Popup aktiv mit **Ja** bestätigen.
- Beim Öffnen eines Teams läuft drei Sekunden lang die Logoanimation. Danach öffnen sich Teamchef- und Fahrerkarten.
- Im Admin Panel können Registrierungen, Fahrer, Teams, Rennen, Anmeldungen, Regelwerk und Seitentexte bearbeitet werden.
- Nicht verfügbare Teams sind im Registrierungsformular deaktiviert.

## Änderungen veröffentlichen

Nach späteren Änderungen:

```bash
git add .
git commit -m "EARL Website aktualisieren"
git push
```

GitHub Pages veröffentlicht den neuen Stand automatisch.
