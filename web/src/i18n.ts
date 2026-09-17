// Alle sichtbaren Texte der App. Einsprachig (Deutsch, Schweiz), persönliches
// Werkzeug ohne Sprachumschaltung.
// Werte mit "html" behalten das exakte Markup des Elements, das sie ersetzen.

const de = {
  "app.title": "Knochenalter — lokal im Browser bestimmt",
  "app.description":
    "Experimentelle Schätzung des Knochenalters, komplett lokal im Browser berechnet. Deine Röntgenbilder verlassen dein Gerät nicht.",
  "app.htmlLang": "de-CH",
  "app.locale": "de-CH",

  "nav.brand": "Knochenalter",
  "workspace.label": "Röntgenbild und Untersuchungsdaten",

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

  "result.title": "Ergebnis",
  "result.estimated": "Geschätztes Knochenalter",
  "result.ensembleCaption": "Mittelwert der drei Netzwerke",
  "result.chrono": "Chronologisches Alter",
  "result.stddev": "Standardabweichung (Greulich-Pyle)",
  "result.noChrono": "Nicht angegeben",
  "result.notComputed": "nicht berechnet",
  "result.monthsValue": "{months} Monate",

  "befund.heading": "Befund",
  "befund.boneAgeLabel": "Biologisches Knochenalter:",
  "befund.chronoLabel": "Chronologisches Alter:",
  "befund.stddevLabel": "Standardabweichung (Greulich-Pyle):",
  "befund.upperLabel": "Obere Grenze (+2 SD):",
  "befund.lowerLabel": "Untere Grenze (-2 SD):",
  "befund.ageValueTemplate": "{years} Jahre {months} Monate",
  "befund.intro": "Somit handelt es sich um ein Knochenalter",
  "befund.retardation":
    "mit mehr als 2-facher Standardabweichung unterhalb des chronologischen Alters, einer Retardierung entsprechend.",
  "befund.acceleration":
    "mit mehr als 2-facher Standardabweichung oberhalb des chronologischen Alters, einer Beschleunigung entsprechend.",
  "befund.normal":
    "innerhalb der 2-fachen Standardabweichung zum chronologischen Alter, einem Normbefund entsprechend.",
  "befund.outOfRange":
    "Für dieses chronologische Alter liegt keine Greulich-Pyle-Referenz-Standardabweichung vor (Tabelle deckt bei Jungen 1–17 Jahre, bei Mädchen 1–15 Jahre ab). Kein Standard-Befund möglich.",
  "befund.citation":
    "Referenz-Standardabweichung nach Greulich WW, Pyle SI. Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2. Auflage, Stanford University Press, 1959 (Tabelle V/VI).",
  "befund.copy": "Befund-Text kopieren",
  "befund.copied": "Befund-Text in die Zwischenablage kopiert.",
  "befund.copyFailed":
    "Kopieren nicht möglich. Bitte den Text manuell auswählen und kopieren.",

  "form.heightCm": "Aktuelle Körpergrösse <span>optional, cm</span>",
  "form.heightCmHelp": "Für eine Endgrössen-Prognose nach Bayley-Pinneau.",

  "height.heading": "Endgrössen-Prognose (Bayley-Pinneau)",
  "height.currentLabel": "Aktuelle Körpergrösse:",
  "height.categoryLabel": "Reifungstyp:",
  "height.categoryAverage": "durchschnittlich reifend",
  "height.categoryAccelerated": "vorauseilend reifend",
  "height.categoryRetarded": "retardiert reifend",
  "height.pmhLabel": "Erreichter Anteil der Erwachsenengrösse:",
  "height.predictedLabel": "Voraussichtliche Endgrösse:",
  "height.cmValueTemplate": "{cm} cm",
  "height.percentValueTemplate": "{percent} %",
  "height.outOfRange":
    "Für dieses Skelettalter liegt keine passende Bayley-Pinneau-Referenztabelle vor (die Tabellen decken je nach Reifungstyp und Geschlecht ungefähr 6 bis 17–18 Jahre Skelettalter ab). Bei retardierten Jungen deckt die verfügbare Tabelle zusätzlich nur bis 13 Jahre Skelettalter ab (Fortsetzungstabelle im Original nicht verfügbar) — keine Prognose möglich.",
  "height.citation":
    "Nach Bayley N, Pinneau SR. Tables for Predicting Adult Height from Skeletal Age. J Pediatr. 1952;40(4):423–441 (Tables IIA–IIE Jungen, IIIA–IIIF Mädchen). Experimentelle Schätzung, keine individuelle Zusicherung — abhängig u. a. von Ernährung, Erkrankungen und familiärer Grösse.",

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

  "about.reset": "Aktuelle Analyse verwerfen",

  "footer.license": "Modell Apache-2.0 · Code MIT",

  "age.years": "{years} {yearWord} und {months} {monthWord}",
  "age.year": "Jahr",
  "age.yearPlural": "Jahre",
  "age.month": "Monat",
  "age.monthPlural": "Monate",
  "sex.male": "männlich",
  "sex.female": "weiblich",

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
} as const;

export { de };
export type Key = keyof typeof de;

export function t(key: Key, vars?: Record<string, string | number>): string {
  const text = de[key];
  return vars
    ? text.replace(/\{(\w+)\}/g, (match, name) =>
        name in vars ? String(vars[name]) : match,
      )
    : text;
}
