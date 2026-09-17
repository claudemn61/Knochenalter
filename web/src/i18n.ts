// Alle sichtbaren Texte der App. Deutschsprachige (Schweiz) Einzelsprach-Version,
// abgeleitet von der zweisprachigen (pt/en) Vorlage aus feliperun/bone-age.
// Werte mit "html" behalten das exakte Markup des Elements, das sie ersetzen.
export type Lang = "de";
export const LANGUAGES: Lang[] = ["de"];
export const LANG_STORAGE = "knochenalter-lang";

const de = {
  "app.title": "Knochenalter — lokal im Browser bestimmt",
  "app.description":
    "Experimentelle Schätzung des Knochenalters, komplett lokal im Browser berechnet. Deine Röntgenbilder verlassen dein Gerät nicht.",
  "app.htmlLang": "de-CH",
  "app.locale": "de-CH",

  "nav.brand": "Knochenalter, Startseite",
  "nav.label": "Navigation",
  "nav.how": "So funktioniert's",
  "nav.source": 'Quellcode <span aria-hidden="true">↗</span>',

  "hero.eyebrow": "KÜNSTLICHE INTELLIGENZ · LOKALE VERARBEITUNG",
  "hero.title": "Knochenalter. <br /><span>In deinem Browser.</span>",
  "hero.description":
    "Von der Röntgenaufnahme zur Schätzung der Skelettreife. <br />Deine Dateien bleiben von Anfang bis Ende bei dir.",
  "hero.localTitle": "Dein Gerät. Deine Daten.",
  "hero.localText":
    "Kein Upload auf einen Server. <br />Keine Registrierung. Kein Tracking.",

  "workspace.title": "Neue Analyse",
  "workspace.badge": "EXPERIMENTELLE NUTZUNG",
  "workspace.label": "Röntgenbild und Untersuchungsdaten",
  "steps.label": "Schritte der Analyse",
  "steps.one": "<span>01</span> Röntgenbild öffnen",
  "steps.two": "<span>02</span> Bild vorbereiten",
  "steps.three": "<span>03</span> Knochenalter berechnen",

  "image.title": "Röntgenbild der linken Hand",
  "image.localFile": "LOKALE DATEI",
  "image.select": "Röntgenbild auswählen",
  "image.dropzone": "Röntgenbild auswählen oder hierher ziehen",
  "image.canvas":
    "Röntgenbild. Ziehen, um die linke Hand auszuwählen, oder die Zuschnitt-Felder unten verwenden.",
  "image.footer":
    '<span class="tiny-lock" aria-hidden="true">◈</span> Das Bild wird lokal geöffnet und verlässt diesen Browser nie.',

  "dropzone.title": "Röntgenbild hierher ziehen",
  "dropzone.subtitle": "oder <u>eine Datei auswählen</u>",
  "dropzone.others": "+ weitere",
  "dropzone.limit": "Originaldatei empfohlen · bis 100 MB",

  "viewer.rotate": "Bild um 90 Grad drehen",
  "viewer.rotateLabel": "Drehen",
  "viewer.fullCrop": "Ganzes Bild",
  "viewer.replace": "Ersetzen",
  "viewer.instruction":
    "Über das Bild ziehen, um <strong>nur die linke Hand</strong> auszuschneiden. Alle fünf Finger und das Handgelenk einschliessen; überschüssigen Unterarm weglassen.",
  "viewer.cropDetails": "Zuschnitt über Koordinaten anpassen",
  "viewer.x0": "Start X",
  "viewer.y0": "Start Y",
  "viewer.x1": "Ende X",
  "viewer.y1": "Ende Y",

  "form.title": "Untersuchungsdaten",
  "form.sex": "Biologisches Geschlecht <span>Pflichtfeld</span>",
  "form.sexPlaceholder": "Auswählen",
  "form.male": "Männlich",
  "form.female": "Weiblich",
  "form.sexHelp": "Wird vom Modell zur Schätzung der Skelettreife verwendet.",
  "form.dob": "Geburtsdatum <span>optional</span>",
  "form.examDate": "Untersuchungsdatum",
  "form.chrono": "Alter am Untersuchungsdatum",
  "form.confirm":
    "Ich bestätige, dass der Ausschnitt die <strong>linke Hand in PA-Projektion</strong> zeigt, alle fünf Finger vollständig nach oben zeigend und das Handgelenk sichtbar.",
  "form.submit": 'Knochenalter berechnen <span aria-hidden="true">→</span>',
  "form.cancel": "Verarbeitung abbrechen",
  "form.clinicalNote":
    "Experimentelle Schätzung. Dies ist kein ärztlicher Befund und darf ohne fachliche Beurteilung keine medizinischen Entscheidungen leiten.",

  "progress.preparing": "Wird vorbereitet…",
  "progress.local": "Die Verarbeitung erfolgt auf diesem Gerät.",
  "progress.opening": "Röntgenbild wird lokal geöffnet…",
  "progress.model": "Lokales Modell wird vorbereitet…",
  "progress.infer":
    "Drei Netzwerke laufen nacheinander. Das kann einige Minuten dauern.",
  "progress.prepare": "Es werden nur öffentliche Modelldateien heruntergeladen.",
  "progress.cache": "Cache wird gelesen",
  "progress.download": "Gewichte werden heruntergeladen",
  "progress.compute": "Berechnung läuft",
  "progress.done": "Netzwerk fertig",
  "progress.fold": "{stage} · Netzwerk {fold}/3",

  "model.label": "Lokales Modell",
  "model.networks": "3 Netzwerke · WebAssembly",
  "model.initial":
    "Beim ersten Gebrauch werden ca. 340 MB heruntergeladen. Danach werden die zwischengespeicherten Gewichte wiederverwendet.",
  "model.download": "Modell herunterladen",
  "model.clearCache": "Cache leeren",
  "model.clearCacheTitle":
    "Löscht nur die im Browser gespeicherten öffentlichen Modellgewichte",
  "model.ready":
    "Download abgeschlossen. Die Gewichte stehen für die lokale Berechnung bereit; die Zwischenspeicherung hängt vom Browser-Speicherplatz ab.",
  "model.executed":
    "Modell in diesem Browser ausgeführt. Heruntergeladene Gewichte werden wiederverwendet, sofern der Cache verfügbar ist.",
  "model.cleared":
    "Cache der Modellgewichte gelöscht. Beim nächsten Durchlauf müssen wieder ca. 340 MB heruntergeladen werden.",

  "result.eyebrow": "VERARBEITUNG AUF DIESEM GERÄT ABGESCHLOSSEN",
  "result.title": "Ergebnis der Schätzung",
  "result.save": "Bericht speichern ↓",
  "result.estimated": "Geschätztes Knochenalter",
  "result.chrono": "Chronologisches Alter",
  "result.difference": "Geschätzte Differenz",
  "result.differenceNote":
    "Beschreibender Vergleich, keine diagnostische Einordnung.",
  "result.note":
    "Das Ergebnis hängt von Bildqualität, Ausrichtung und Zuschnitt ab. Die Differenz zwischen den Altersangaben allein belegt keine abnorm verzögerte oder vorauseilende Reifung.",
  "result.details": "Details der lokalen Ausführung",
  "result.stddevLabel": "Standardabweichung (Ensemble)",
  "result.stddevValueTemplate": "± {months} Monate",
  "result.stddevNote":
    "Streuung der drei Einzelnetzwerke — ein Mass für die Uneinigkeit des Ensembles, kein klinisches Konfidenzintervall.",
  "review.open": "Vergrössern und prüfen",
  "review.title": "Bild prüfen",
  "review.close": "Schliessen",
  "review.help":
    "Linke Hand in PA-Projektion, alle fünf vollständigen Finger und das Handgelenk prüfen. Kontrollieren, dass die Finger nach oben zeigen und der Zuschnitt keine Strukturen abschneidet. Diese Kontrolle liegt bei dir; die App überprüft die Anatomie nicht.",
  "review.crop": "Ausgewählter Ausschnitt",
  "review.full": "Ganzes Bild",
  "review.zoom": "Zoom",
  "review.fit": "An Bildschirm anpassen",
  "review.pan": "Vergrössertes Bild. Zum Erkunden scrollen.",
  "review.footnote":
    "Um zu drehen oder den Zuschnitt anzupassen, dieses Fenster schliessen und die Bildsteuerung verwenden. Das Zoomen verändert die Analysedaten nicht.",
  "professional.entry":
    "Fachärztliche Beurteilung hinzufügen oder bearbeiten · optional",
  "professional.heading":
    "Vergleich mit eingetragener fachärztlicher Beurteilung",
  "professional.help":
    "Falls bereits eine Beurteilung dieses Röntgenbilds vorliegt, hier das Knochenalter eintragen und die Quelle angeben. Diese Angaben bleiben nur in dieser Sitzung und werden nach dem Speichern ins PDF übernommen.",
  "professional.ageLabel": "Eingetragenes Knochenalter",
  "professional.differenceLabel": "Differenz: KI − eingetragene Beurteilung",
  "professional.years": "Ganze Jahre",
  "professional.months": "Zusätzliche Monate",
  "professional.method": "Angegebene Methode",
  "professional.methodHelp":
    "Z. B. Greulich-Pyle, TW3 oder der Name des Systems. Falls unbekannt, „nicht angegeben“ eintragen.",
  "professional.source": "Ärztin/Arzt oder Dienst (Quelle)",
  "professional.date": "Datum der Beurteilung",
  "professional.sameExam":
    "Ich bestätige, dass sich diese Beurteilung auf dasselbe oben gezeigte Röntgenbild und Untersuchungsdatum bezieht.",
  "professional.save": "Vergleich speichern",
  "professional.remove": "Vergleich entfernen",
  "professional.notice":
    "Von dir eingetragene Werte zur selben Untersuchung, von der App nicht überprüft. Die Differenz sagt nicht aus, welche Beurteilung zutrifft, und verändert die KI-Schätzung nicht.",
  "professional.sameExamError":
    "Bitte bestätigen, dass sich die Beurteilung auf dasselbe Röntgenbild und Untersuchungsdatum bezieht.",
  "professional.ageError":
    "Ganze Jahre von 0 bis 20 und zusätzliche Monate von 0 bis 11 eintragen, insgesamt höchstens 20 Jahre. Wo nötig Null eintragen.",
  "professional.fieldsError":
    "Methode (max. 80 Zeichen) und Ärztin/Arzt bzw. Dienst (max. 120 Zeichen) eintragen.",
  "professional.dateError":
    "Bitte ein gültiges Beurteilungsdatum zwischen Untersuchungsdatum und heute eintragen.",
  "result.scaleNote": "Beschreibende Altersskala, ohne Normbereich.",
  "result.networkNote":
    "Die Übereinstimmung zwischen den Netzwerken ist kein Mass für die individuelle Genauigkeit.",
  "result.months": "{months} Monate · Mittelwert der drei Netzwerke",
  "result.noChrono": "Nicht angegeben",
  "result.examOn": "Untersucht am {date}",
  "result.differenceMonths": "{sign}{months} Monate",
  "result.execution":
    "{model} · Revision {revision} · ONNX FP32 · WebAssembly/CPU · {seconds} s · Netzwerke: {folds} Monate · Zuschnitt: {crop} · Geschlecht: {sex}.",

  "about.eyebrow": "TRANSPARENZ ALS PRINZIP",
  "about.title": "Was passiert <br />mit deinem Bild?",
  "about.text":
    "Es bleibt im Arbeitsspeicher dieser Seite. <br />Beim Neuladen oder Schliessen des Tabs werden die Analysedaten verworfen.",
  "about.reset": "Aktuelle Analyse verwerfen ↗",
  "faq.q1": "Wie wird die Schätzung berechnet?",
  "faq.a1":
    'Drei ConvNeXtV2-Netzwerke des Modells <a href="https://huggingface.co/ianpan/bone-age" target="_blank" rel="noreferrer">ianpan/bone-age</a> analysieren die linke Hand und das angegebene Geschlecht. Das Ergebnis ist der Mittelwert der drei Vorhersagen in Monaten. Die App wendet einen Histogrammabgleich an und skaliert das Bild auf 512 × 512 Pixel.',
  "faq.q2": "Welche Bilder kann ich öffnen?",
  "faq.a2":
    "DICOM Part 10, mit oder ohne Dateiendung, monochrom 8/16-Bit unkomprimiert oder JPEG-Baseline; JPEG, PNG, einseitiges TIFF, WebP, BMP und AVIF. DICOM JPEG Lossless, JPEG-LS, JPEG 2000 und Multiframe müssen zuerst in ein unterstütztes Format exportiert werden. Am besten das Original-Röntgenbild der linken Hand in PA-Projektion verwenden.",
  "faq.q3": "Funktioniert es ohne Internet?",
  "faq.a3":
    "Ja, sobald die Seite geöffnet ist und der Modell-Download mit verfügbarem Cache abgeschlossen wurde. Das Internet wird nur zum Laden der Seite und der Modellgewichte aus dem öffentlichen GitHub-Repository benötigt. Es wird nie ein Bild, Datum oder Ergebnis versendet. Der Browser kann den Cache bei Speicherplatzmangel löschen. Der erste Durchlauf kann langsam sein; ein aktueller Desktop-Browser mit freiem Arbeitsspeicher eignet sich am besten.",
  "faq.q4": "Wo liegt die klinische Grenze?",
  "faq.a4":
    "Dieses Werkzeug ist experimentell, und das Modell ist nicht für den klinischen Einsatz zugelassen. Der veröffentlichte mittlere Fehler auf dem Testdatensatz ist nicht die Fehlerspanne für eine einzelne Person. Die technische Validierung der ONNX-Konvertierung ist keine klinische Validierung.",

  "credits.eyebrow": "MODELL-NACHWEIS",
  "credits.title": "Das KI-Modell stammt von Ian Pan.",
  "credits.text":
    'Die Schätzung stammt vom Modell <a href="https://huggingface.co/ianpan/bone-age" target="_blank" rel="noreferrer">ianpan/bone-age</a>, erstellt und trainiert von <a href="https://huggingface.co/ianpan" target="_blank" rel="noreferrer">Ian Pan</a> anhand von 14’036 Röntgenbildern der <a href="https://www.rsna.org/rsnai/ai-image-challenge/rsna-pediatric-bone-age-challenge-2017" target="_blank" rel="noreferrer">RSNA Pediatric Bone Age Challenge 2017</a>, mit ConvNeXtV2-Architektur und Apache-2.0-Lizenz.',
  "credits.role":
    'Diese App hat nichts trainiert oder angepasst: Sie konvertiert die öffentlichen Gewichte nach ONNX und führt sie in deinem Browser aus. Die eigentliche Leistung stammt vom Autor des Modells. Die Browser-Anwendung basiert auf <a href="https://github.com/feliperun/bone-age" target="_blank" rel="noreferrer">feliperun/bone-age</a> (MIT-Lizenz) und wurde für diese deutschsprachige Version angepasst.',

  "footer.tagline": "/ ein offenes Forschungswerkzeug",
  "footer.by": "Basierend auf der App von",
  "footer.license": "Modell Apache-2.0 · Code MIT",
  "date.format": "{day}.{month}.{year}",

  "age.years": "{years} {yearWord} und {months} {monthWord}",
  "age.year": "Jahr",
  "age.yearPlural": "Jahre",
  "age.month": "Monat",
  "age.monthPlural": "Monate",
  "sex.male": "männlich",
  "sex.female": "weiblich",

  "demo.hint": "Gerade kein Röntgenbild zur Hand?",
  "demo.button": "Beispiel analysieren",
  "msg.demoLoaded":
    "Beispiel aus dem Repository: linke Hand, weiblich, geboren am {dob}, untersucht am {exam}. Die drei Netzwerke laufen in diesem Browser; beim ersten Mal inklusive Download von ca. 340 MB Gewichten.",
  "msg.demoFailed":
    "Das Beispielbild konnte nicht geladen werden. Verbindung prüfen und erneut versuchen.",
  "msg.checkDates": "Daten prüfen",
  "msg.dicomFilled":
    "Die verfügbaren Felder wurden aus dem DICOM übernommen. Angaben prüfen und vor der Berechnung die linke Hand auswählen.",
  "msg.fieldsCleared":
    "Die Untersuchungsdaten wurden für das neue Bild geleert. Geschlecht und Geburtsdatum erneut eingeben.",
  "msg.openFailed": "Diese Datei konnte nicht geöffnet werden.",
  "msg.oneFile": "Bitte jeweils nur ein Röntgenbild auswählen.",
  "msg.workerStopped":
    "Der Hintergrundprozess wurde gestoppt. Andere Tabs schliessen, um Arbeitsspeicher freizugeben, und erneut versuchen.",
  "msg.readyNotice":
    "Download abgeschlossen. Du kannst jetzt ein Röntgenbild öffnen und das Modell ausführen.",
  "msg.cancelled":
    "Verarbeitung abgebrochen. Es wurde kein Teilergebnis angezeigt.",
  "msg.cacheCleared":
    "Die Modellgewichte wurden aus dem Cache dieses Browsers entfernt.",
  "msg.cacheBlocked": "Der Browser erlaubt in diesem Modus keinen Cache-Zugriff.",
  "msg.updateAvailable": "Eine neue Version der App ist verfügbar.",
  "msg.updateNow": "Jetzt aktualisieren",
  "msg.noOffline":
    "Der Browser hat den Offline-Modus nicht aktiviert. Die lokale Ausführung funktioniert weiterhin online.",

  "worker.noCache":
    "Cache in diesem Browser nicht verfügbar. Die Berechnung läuft trotzdem lokal weiter, die Offline-Nutzung ist aber nicht verfügbar.",
  "worker.noSpace":
    "Kein Platz für den Cache. Die Berechnung läuft weiter; die Gewichte müssen beim nächsten Mal erneut heruntergeladen werden.",
  "worker.downloadFailed":
    "Download von Netzwerk {fold} fehlgeschlagen ({status}). Verbindung prüfen und erneut versuchen.",
  "worker.badSize": "Die Modelldatei hat eine unerwartete Grösse.",
  "worker.unavailable": "Das Modell ist in dieser Installation nicht verfügbar.",
  "worker.badManifest": "Ungültiges Modell-Manifest.",
  "worker.noReference": "Referenz für die Bildvorverarbeitung nicht verfügbar.",
  "worker.noContrast":
    "Der Ausschnitt hat keinen Kontrast. Bitte die Hand im Röntgenbild auswählen.",

  "worker.integrity":
    "Die Integritätsprüfung des Modells ist fehlgeschlagen. Bitte erneut herunterladen.",
  "worker.badOutput": "Das Netzwerk hat ein ungültiges Ergebnis geliefert.",
  "worker.failed":
    "Das Modell konnte nicht ausgeführt werden. Möglicherweise ist der Arbeitsspeicher des Browsers voll. Andere Tabs schliessen und erneut versuchen.",
  "decode.noPixels": "DICOM ohne Bilddaten.",
  "decode.truncated": "Unvollständige DICOM-Daten.",
  "decode.tiffEmpty": "TIFF ohne Bild.",
  "processing.emptyHistogram": "Leeres Histogramm.",
  "decode.badSize": "Ungültige Abmessungen oder Bild grösser als 24 Megapixel.",
  "decode.dicomUnreadable":
    "Das DICOM konnte nicht gelesen werden. Bitte eine Original-DICOM-Part-10-Datei, PNG oder TIFF verwenden.",
  "decode.dicomMultiframe":
    "Multiframe-DICOM: Bitte ein einzelnes Röntgenbild zur Analyse exportieren.",
  "decode.dicomMonochrome":
    "Bitte ein monochromes DICOM eines Hand-Röntgenbilds verwenden.",
  "decode.dicomChannels": "Mehrkanal-DICOM wird nicht unterstützt.",
  "decode.dicomJpegSize": "DICOM- und JPEG-Abmessungen stimmen nicht überein.",
  "decode.dicomBits":
    "DICOM muss 8- oder 16-Bit-Ganzzahl-Pixel mit Standard-Ausrichtung haben.",
  "decode.dicomCompression":
    "Nicht unterstützte DICOM-Kompression ({transfer}). Bitte unkomprimiert exportieren oder PNG/TIFF verwenden. JPEG Lossless, JPEG-LS und JPEG 2000 werden noch nicht unterstützt.",
  "decode.unknownTransfer": "unbekannt",
  "decode.dicomLut": "VOI-LUT mit nicht unterstützter Tiefe.",
  "decode.dicomWindow": "Ungültiges DICOM-Fenster.",
  "decode.empty": "Das Röntgenbild ist leer oder hat konstanten Kontrast.",
  "decode.tooLarge": "Das Limit liegt bei 100 MB pro Bild.",
  "decode.emptyFile": "Die Datei ist leer.",
  "decode.tiffPages":
    "Mehrseitiges TIFF: Bitte nur das gewünschte Röntgenbild exportieren.",
  "decode.unknownFormat":
    "Format nicht erkannt. Bitte DICOM, PNG, JPEG, TIFF, WebP, BMP oder AVIF verwenden.",
  "decode.failed":
    "Das Bild konnte nicht dekodiert werden. Format und Grösse prüfen.",

  "processing.cropTooSmall":
    "Bitte einen Bereich von mindestens 32 × 32 Pixel innerhalb des Bilds auswählen.",
  "processing.badReference": "Ungültige Histogramm-Referenz.",
  "processing.badDates": "Bitte gültige Daten eingeben.",
  "processing.birthAfterExam": "Die Geburt kann nicht nach der Untersuchung liegen.",
  "processing.tooOld":
    "Das Modell ist für Kinder und Jugendliche ausgelegt. Bitte die Daten prüfen (Alter bis 20 Jahre).",

  "pdf.productName": "Knochenalter",
  "pdf.title": "Bericht zum Knochenalter",
  "pdf.subtitle":
    "Lokal im Browser erstellte Schätzung, ausgehend von einem Röntgenbild der linken Hand.",
  "pdf.generatedOn": "Erstellt am {datetime}",
  "pdf.ensembleCaption": "Mittelwert der drei Netzwerke",
  "pdf.sexLabel": "Biologisches Geschlecht",
  "pdf.dobLabel": "Geburtsdatum",
  "pdf.fileLabel": "Quelldatei",
  "pdf.imageSizeLabel": "Analysiertes Bild",
  "pdf.radiograph": "Analysiertes Röntgenbild",
  "pdf.radiographCaption":
    "Ausgerichteter Ausschnitt, vor Histogrammabgleich und Skalierung. Das Bild wurde nie an einen Server gesendet.",
  "pdf.technical": "Ausführung",
  "pdf.ensembleMean": "Ensemble-Mittelwert",
  "pdf.networkOutput": "Netzwerk {index}",
  "pdf.runtime": "Gesamtzeit",
  "pdf.cropLabel": "Ausschnitt [x0, y0, x1, y1]",
  "pdf.modelLabel": "Modell",
  "pdf.revisionLabel": "Revision",
  "pdf.environmentLabel": "Umgebung",
  "pdf.environmentValue": "ONNX FP32 · WebAssembly/CPU · Browser",
  "pdf.preprocessingLabel": "Vorverarbeitung",
  "pdf.preprocessingValue":
    "Lokale Dekodierung, manueller Zuschnitt, Histogrammabgleich, bilineare Interpolation, 512×512-Padding.",
  "pdf.references": "Quellen und Nachweise",
  "pdf.refModel":
    "Modell ianpan/bone-age von Ian Pan — huggingface.co/ianpan/bone-age. KI-Schätzung aus Bild und angegebenem Geschlecht; keine manuelle Beurteilung nach Greulich-Pyle oder Tanner-Whitehouse.",
  "pdf.refArchitecture":
    "ConvNeXtV2-tiny-Architektur, Ensemble aus drei Netzwerken, 84,1 Mio. Parameter.",
  "pdf.refDataset":
    "Trainiert auf 14’036 Hand-Röntgenbildern der RSNA Pediatric Bone Age Challenge 2017; veröffentlichter mittlerer absoluter Fehler von 4,16 Monaten auf dem Testdatensatz.",
  "pdf.refLicense":
    "Gewichte weitergegeben unter der Apache License 2.0, mit Änderungshinweis: nach ONNX konvertiert, nicht neu trainiert.",
  "pdf.refApplication":
    "Ursprüngliche Anwendung bone-age.app von @feliperun, Code unter MIT-Lizenz — github.com/feliperun/bone-age. Diese deutschsprachige Version: github.com/claudemn61/Knochenalter",
  "pdf.disclaimerHeading": "Hinweis",
  "pdf.pageNumber": "{page}/{total}",
  "pdf.secondsValue": "{seconds} s",
  "pdf.cropValue": "{x0}, {y0}, {x1}, {y1}",
  "pdf.imageSizeValue": "{width} × {height} px",
  "pdf.siteName": "claudemn61.github.io/Knochenalter",
  "pdf.siteUrl": "https://claudemn61.github.io/Knochenalter/",
  "pdf.promoEyebrow": "KOSTENLOS · KEINE REGISTRIERUNG · LOKALE VERARBEITUNG",
  "pdf.promoHeading": "Knochenalter aus einem weiteren Röntgenbild schätzen",
  "pdf.promoText":
    "Bild im Browser öffnen, linke Hand zuschneiden und die Schätzung in wenigen Minuten erhalten. Es verlässt nie eine Datei dein Gerät.",
  "pdf.promoQr": "Kamera darauf richten",
  "msg.reportFailed":
    "Das PDF konnte nicht erstellt werden. Bitte erneut versuchen oder einen anderen Browser-Tab verwenden.",

  "report.filename": "knochenalter",
  "report.notComputed": "nicht berechnet",
  "report.monthsValue": "{months} Monate",
  "report.disclaimer":
    "Experimentelles Ergebnis. Dies ist kein ärztlicher Befund und stellt keine Diagnose dar. Der veröffentlichte mittlere Fehler und die Übereinstimmung zwischen den Netzwerken sind kein individuelles Konfidenzintervall. Die klinische Beurteilung hängt von geschlechts- und altersspezifischen Referenzwerten, Wachstum, Pubertät und der Krankengeschichte ab; dieser klinische Kontext wird vom Modell nicht berücksichtigt.",
  "report.privacy": "Es wurden kein Bild und keine Untersuchungsdaten an einen Server gesendet.",
} as const;

export type Key = keyof typeof de;

export const dictionaries: Record<Lang, Record<Key, string>> = { de };

/** Single-language build: always German. */
export function detectLang(): Lang {
  return "de";
}

let current: Lang = "de";
export const lang = () => current;
export function setLang(value: Lang) {
  current = value;
}
export function t(key: Key, vars?: Record<string, string | number>): string {
  const text = dictionaries[current][key];
  return vars
    ? text.replace(/\{(\w+)\}/g, (match, name) =>
        name in vars ? String(vars[name]) : match,
      )
    : text;
}
