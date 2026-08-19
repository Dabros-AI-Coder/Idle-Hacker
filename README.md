HACKER TYCOON - Modular Mobile Idle
0€ Setup, läuft direkt auf GitHub Pages.

Struktur
index.html -> Einstieg, nur HTML Struktur
css/style.css -> Alles Design (mobile-first)
js/state.js -> Alle Daten, Balancing (hier Preise ändern!)
js/game.js -> Game Logik (hack, kaufen, raid)
js/ui.js -> Rendering, Matrix, UI
js/save.js -> localStorage + Offline Earnings
js/events.js -> Vulnerability Events
manifest.json -> Damit man es "Zum Home-Bildschirm" als App installieren kann
Auf GitHub pushen (iPhone)
In GitHub App neues Repo hacker-tycoon erstellen
In Safari auf github.com/deinname/hacker-tycoon gehen, Punkt . drücken -> öffnet VS Code im Browser
Alle Dateien aus diesem Ordner hochladen (Drag & Drop)
Settings -> Pages -> Deploy from branch main / root -> Save
Dein Spiel ist dann live unter deinname.github.io/hacker-tycoon

Vibe Coding Workflow
Balancing? -> js/state.js -> baseCost, prod ändern
Neue Rigs? -> In state.js neues Objekt zu rigs pushen
Neues Design? -> css/style.css
Neue Mechanik? -> Neues Modul in js/ erstellen und in game.js importieren
Mobile optimiert: touch, kein Zoom, 60fps loop, standalone PWA
