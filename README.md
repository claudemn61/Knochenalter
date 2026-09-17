# Knochenalter

Experimentelle Schätzung des Knochenalters aus einem Hand-Röntgenbild (linke
Hand, PA), inklusive Standardabweichung über das Modell-Ensemble. Läuft
komplett lokal im Browser (ONNX Runtime Web / WebAssembly) — keine Bilder
oder Untersuchungsdaten verlassen das Gerät.

**Experimentell — kein Medizinprodukt.** Das Ergebnis ersetzt keine
ärztliche Beurteilung und darf keine medizinischen Entscheidungen leiten.
Details siehe Hinweis in der App bzw. `web/public/model-notice.txt`.

## Herkunft

Dies ist eine deutschsprachige, angepasste Version von
[feliperun/bone-age](https://github.com/feliperun/bone-age) (App-Code unter
MIT-Lizenz). Das eigentliche KI-Modell (`ianpan/bone-age`, ConvNeXtV2-tiny,
3er-Ensemble, trainiert auf 14'036 Röntgenbildern des RSNA Pediatric Bone
Age Challenge 2017, MAE 4,16 Monate) stammt von
[Ian Pan](https://huggingface.co/ianpan/bone-age) und ist unter
Apache-2.0 lizenziert. Details und Lizenztexte: `web/public/model-license.txt`,
`web/public/model-notice.txt`.

Änderungen gegenüber dem Original:

- Oberfläche vollständig auf Deutsch (Schweiz) umgestellt, keine
  Sprachumschaltung mehr (war zuvor Portugiesisch/Englisch).
- Zusätzliche Anzeige der **Standardabweichung** über die drei
  Ensemble-Netzwerke (Kopfbereich des Ergebnisses und im PDF-Bericht),
  neben dem bereits vorhandenen Ensemble-Mittelwert.
- PWA-Manifest ergänzt (im Original fehlend), App ist damit auf dem
  Homescreen installierbar.
- Deployment auf einen einzigen GitHub-Pages-Host vereinfacht statt
  Vercel + GitHub Pages; die Modellgewichte werden weiterhin **nicht**
  selbst gehostet, sondern beim ersten Gebrauch direkt vom Original-Repo
  (`feliperun.github.io/bone-age/models/`) geladen (siehe `web/.env`,
  `VITE_WEIGHTS_BASE`) — das ist derselbe Cross-Origin-Aufbau, den
  bone-age.app in Produktion bereits verwendet.
- Die Playwright-E2E-Tests des Originals (Portugiesisch/Englisch-Texte)
  wurden nicht auf Deutsch übertragen und entfernt — Aufwand/Nutzen für
  dieses persönliche Projekt stand in keinem Verhältnis. Die Unit-Tests
  (`web/tests/*.test.ts`, u. a. Bildverarbeitung, PDF-Erzeugung, QR-Code,
  i18n-Vollständigkeit) sind unverändert vorhanden und laufen mit `npm test`.

## Entwicklung

```sh
cd web
npm ci
npm test
npm run dev       # lokale Vorschau
npm run build     # Produktionsbuild nach web/dist
```

Node.js 22 wird vorausgesetzt (siehe `package.json`).

## Deployment

GitHub Actions (`.github/workflows/pages.yml`) baut bei jedem Push auf
`main` die App und deployt `web/dist` nach GitHub Pages. Dafür muss unter
**Settings → Pages → Build and deployment → Source** einmalig
**„GitHub Actions"** ausgewählt werden.

## Lizenz

App-Code: MIT (siehe `LICENSE`). Modellgewichte: Apache-2.0, siehe
`web/public/model-license.txt` und `web/public/model-notice.txt`.
