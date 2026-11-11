// Anzeige: die Ebenen-Nummer unten links und die Übersichtskarte auf Taste B.
//
// Wichtig: Beide Bilder werden einmal beim Start angelegt (anzeige_anlegen, aufgerufen aus main.ts) und danach nur noch
// neu bemalt. Würde das Kartenbild bei jedem Druck auf B neu entstehen (rund 5,5 KB) und das Ebenen-Schild bei jedem
// Wechsel der Ebene, zerstückelte das den knappen Speicher des Calliope, bis mitten im Spiel eine Anlage fehlschlägt:
// Das Spiel stürzt ab, das Bild friert ein.

let anzeige_ebene: Sprite = null
let karte_sprite: Sprite = null

// Kantenlänge einer Kachel des Verlieses auf der Übersichtskarte.
const KARTE_FELD = 4
// Oberer Rand der Karte, darüber steht die Beschriftung.
const KARTE_RAND_OBEN = 12

// Legt die beiden Anzeige-Bilder an, einmal beim Start, solange der Speicher noch am Stück ist.
function anzeige_anlegen() {
    karte_puffer = image.create(RASTER_BREITE * KARTE_FELD +
        4, RASTER_HOEHE * KARTE_FELD + KARTE_RAND_OBEN + 2)
    ebene_puffer = image.create(60, 10)
}

// Schreibt die aktuelle Ebene unten links in die Anzeige.
function zeige_ebene() {
    // image.font8 ist sechs Pixel breit (charWidth: 6 in screen/text.ts), nicht fünf. „EBENE 12“ sind 8 Zeichen und
    // brauchen damit 48 Pixel. Bei nur 30 Pixeln würde alles ab Spalte 30 stillschweigend abgeschnitten, und sichtbar
    // bliebe nur „EBENE“ ohne Zahl.
    ebene_puffer.fill(0)
    ebene_puffer.print(katalog.formatiere(katalog.TextNr.EBENE_SCHILD, ebene), 0, 1, 5, image.font8)
    if (anzeige_ebene == null) {
        anzeige_ebene = sprites.create(ebene_puffer, ART_ANZEIGE)
        anzeige_ebene.setFlag(SpriteFlag.Ghost, true)
        anzeige_ebene.setFlag(SpriteFlag.RelativeToCamera, true)
        anzeige_ebene.z = 100
        anzeige_ebene.setPosition(32, 112)
    }
    // Ein setImage ist nicht nötig: Der Sprite zeigt dasselbe Bild, und wer in das Bild malt, ändert damit
    // sofort die Anzeige.
}

// Malt das Übersichtsbild der aktuellen Ebene in den festen Puffer.
function karte_bild() {
    let m = karte_puffer
    m.fill(15)
    m.drawRect(0, 0, m.width, m.height, 12)
    m.print(katalog.formatiere(katalog.TextNr.KARTE_EBENE, ebene), 3, 2, 5, image.font8)
    for (let ky = 0; ky < RASTER_HOEHE; ky++) {
        for (let kx = 0; kx < RASTER_BREITE; kx++) {
            let feld = raster[ky * RASTER_BREITE + kx]
            let farbe = -1
            if (feld == 1) {
                farbe = 12
            } else if (feld == 2) {
                farbe = 5
            } else if (feld == 3) {
                farbe = 2
            }
            if (farbe >= 0) {
                m.fillRect(2 + kx * KARTE_FELD, KARTE_RAND_OBEN + ky * KARTE_FELD,
                    KARTE_FELD, KARTE_FELD, farbe)
            }
        }
    }
    // Der Held als heller Punkt. Eine Kachel ist im Verlies 16 Pixel breit.
    let hx = Math.idiv(held.x, 16)
    let hy = Math.idiv(held.y, 16)
    if (hx >= 0 && hx < RASTER_BREITE && hy >= 0 && hy < RASTER_HOEHE) {
        m.fillRect(2 + hx * KARTE_FELD, KARTE_RAND_OBEN + hy * KARTE_FELD,
            KARTE_FELD, KARTE_FELD, 7)
    }
    return m
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // held und raster entstehen erst in main.ts und in baue_ebene(), also nach titelschirm(). Dieser Handler ist aber
    // schon während Intro und Titelbild angemeldet, und das Titelbild wirbt sogar mit „B zeigt die Karte“. Ohne diese
    // Prüfung greift karte_bild() dort auf held == null zu (held.x ist ein Getter, also ein Aufruf auf einer
    // Null-Referenz), und das Spiel stürzt ab, bevor es begonnen hat.
    if (held == null || raster.length == 0 || !spiel_laeuft || karte_sprite != null) {
        return
    }
    karte_sprite = sprites.create(karte_bild(), ART_ANZEIGE)
    karte_sprite.setFlag(SpriteFlag.Ghost, true)
    karte_sprite.setFlag(SpriteFlag.RelativeToCamera, true)
    karte_sprite.z = 200
    karte_sprite.setPosition(80, 60)
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (karte_sprite != null) {
        karte_sprite.destroy()
        karte_sprite = null
    }
})
