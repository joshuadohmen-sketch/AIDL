# AI-DTL – AI Disclosure & Transparency Label

Editor und Erklärseite für das AI-DTL, eine Selbstauskunft zur KI-Nutzung an einem Werk.
Ein Label besteht aus einem **Klartextsatz** und einem **Code**, z. B.:

```
Enthält mit KI erzeugte Inhalte. KI-Ausgaben von einem Menschen inhaltlich geprüft. Eine Person übernimmt die Verantwortung. Werkzeug: GitHub Copilot (10/2026).
AI-DTL 0.5: G/H:C;R:H;Acc:I (GitHub Copilot, 10/2026)
```

- Live (Version 0.4.1): <https://joshuadohmen-sketch.github.io/AIDL/>
- Release-Kandidat 0.5 (Vorschau, Studie): <https://joshuadohmen-sketch.github.io/AIDL/rc/>
- Lizenz: CC BY 4.0 · Kontakt: Joshua Dohmen, KI-Beauftragter Universität Koblenz

Die Seite ist bewusst **statisch**: kein Build-Schritt, keine Abhängigkeiten, keine Telemetrie,
keine Speicherung, keine externen Requests außer Google Fonts (nur 0.4.1).

## Struktur

```
index.html            Editor 0.4.1 (live)
label/index.html      Erklärseite 0.4.1 – zeigt alle 0.4-Links (ohne Parameter v)
changelog/            Versionsgeschichte (gilt für beide Stände)
css/style.css         Gestaltung 0.4.1
js/
  spec.js             SITE_BASE, ENABLE_M und SPEC-Registry: Codes, Regeln, alle Texte DE/EN
  label-core.js       reine Logik ohne DOM (Editor, Erklärseite, Node-Tests)
  examples.js         Beispielkatalog (Anhang D)
  icons.js            Piktogramme und Badge
  tools.js            Autocomplete-Liste 0.4.1
  app.js              Editor 0.4.1
tests/                Node-Tests für die Wurzel
rc/                   Release-Kandidat 0.5 – eigene Kopie, Wurzel bleibt 0.4.1
  index.html          Editor 0.5 (Formularelemente, Studienmodus)
  label/index.html    Erklärseite 0.5 (zeigt auch 0.4-Links mit Hinweis; ohne Parameter:
                      Übersicht aller Stufen mit Grenzfällen, Ziel von „Mehr zu den Stufen“)
  css/style.css       Gestaltung 0.5 (keine Webfonts: Open Sans, falls installiert, sonst Arial)
  js/services.js      Dienste und Modelle mit Host-Vorschlägen (ersetzt tools.js)
  js/editor.js        Editor 0.5
  tests/              Node-Tests für den Kandidaten inkl. Export-Snapshots
```

## Tests ausführen

Node.js ≥ 20, keine Installation von Paketen nötig:

```bash
npm test
```

`node --test` findet alle `*.test.js` in `tests/` und `rc/tests/`.

Die Export-Snapshots (`rc/tests/snapshots/exports.json`) halten die erwarteten Ausgaben für die
sechs Referenzzustände fest. Nach einer gewollten Textänderung neu erzeugen und prüfen:

```bash
UPDATE_SNAPSHOTS=1 node --test rc/tests/exports.test.js
```

Die Seiten selbst lassen sich mit jedem statischen Server ansehen, z. B. `py -m http.server 3456`
im Repo-Ordner und dann `http://localhost:3456/rc/`. Lokal erzeugte Links zeigen auf den lokalen
Server, auf GitHub Pages auf `SITE_BASE`.

## Texte und Regeln pflegen (`js/spec.js`)

- Alle sichtbaren Texte stehen nur in `spec.js` (`SPEC[version].i18n.de/en`). Editor, Erklärseite,
  Satz, Sprechtext, Badge-Wörter, Hinweise und die Liste „Wann gibt der Editor Hinweise?“ lesen von dort.
- `SPEC['0.4']` ist eingefroren (Altlinks). Änderungen nur in `SPEC['0.5']`.
- `ENABLE_M` schaltet die vorläufige Stufe M „Bestehendes verändert“. Bei `false` greifen die
  Texte „ohne M“, M verschwindet aus Grammatik, Editor und Entscheidungshilfe; Beispiel D.12 wird G.
- Hinweisregeln stehen in `SPEC[v].warnings` (Bedingung + Auslöser), die Texte in `i18n.*.warn`.
- Nach Änderungen: `npm test`. Bei Textänderungen, die Exporte betreffen, Snapshots neu erzeugen.

## Dienste-Liste pflegen (`rc/js/services.js`)

- Ins Label kommt nur `name`. `hint` erscheint nur in der Vorschlagsliste.
- `host` ist ein **Vorschlag** für den Hosting-Schritt. Jeden Eintrag mit `host` vor dem Livegang
  gegen die Verträge der Universität Koblenz prüfen. Einträge ohne `host` bekommen keinen Vorschlag.
- `generic: true` setzt `Name/` ein und fragt nach dem Modell.
- Die Modellnamen veralten schnell und werden von Hand gepflegt; es wird nichts nachgeladen.

## Studienmodus

`…/AIDL/rc/?modus=studie` (optional `&fall=V07`, nur Format `V` + zwei Ziffern):

- Banner „Studienmodus – Ihre Eingaben werden nicht gespeichert“ (mit Fallnummer)
- „Beispiel laden“ ausgeblendet, Host-Vorschlag aus Werkzeugen abgeschaltet
- großer Button „Ergebnis für den Fragebogen kopieren“: Code und Link in einer Zeile, durch ein Leerzeichen getrennt
- „Neu beginnen“ hervorgehoben
- keine Speicherung, kein Logging, kein `localStorage`

## Label laden und aktualisieren

Der Editor 0.5 nimmt dieselben Parameter wie die Erklärseite: `…/rc/?s=G&h=H%3AC&…` füllt das
Formular. 0.4-Links (ohne `v`) werden übernommen, mit dem Hinweis, die Angaben nach 0.5 zu prüfen.

## Prüfliste Barrierefreiheit (manuell, Anhang E.6)

Mit NVDA (Firefox/Chrome) oder VoiceOver (Safari) auf `rc/`:

1. **Nur Tastatur**: Tab, Umschalt+Tab, Leertaste, Pfeiltasten. Für jedes Beispiel aus „Beispiel laden“
   das Label einmal von Hand nachbauen. Fokus ist immer sichtbar (roter Rahmen).
2. **Schritte**: Die Legende jedes Schritts wird mit Nummer vorgelesen („Schritt 2 Welche KI-Werkzeuge …“).
   Bei „Keine KI“ springen die Nummern lückenlos von 1 auf 2.
3. **Optionen**: Name (z. B. „Neu erzeugt G“), Beschreibung und Zustand (aktiviert/nicht aktiviert,
   Kontrollkästchen vs. Optionsfeld) werden angesagt.
4. **Werkzeug**: Das Feld wird als Kombinationsfeld angesagt; Pfeil runter öffnet die Vorschläge,
   der aktive Vorschlag wird vorgelesen, Enter übernimmt. Blockierte Zeichen ; ( ) , | lösen einen
   gesprochenen Hinweis aus. Monat und Jahr sind als „Monat der letzten Nutzung“ gruppiert.
5. **Rückmeldungen**: „Im Label: …“ unter Schritt 1 und 3, Host-Vorschlag, Hinweise und
   „Es fehlt noch: …“ werden ohne Fokuswechsel angesagt (Live-Regionen).
6. **Ergebnis**: Satz, Code-Link und Badge-Beschreibung (Bild mit Titel = Code, Beschreibung = Satz)
   werden vorgelesen. Kopieren sagt „Kopiert: …“ an.
7. **Zoom 200 %** und Fensterbreite 320 px: kein waagerechtes Scrollen der Seite.
8. **Kontrast**: alle Textfarben ≥ 4,5:1 (Grau `#6e6e6e` auf `#f5f5f5` = 4,68:1).
9. **Sprache**: Nach Umschalten auf EN trägt `<html>` `lang="en"`; die Ansage wechselt die Aussprache.
