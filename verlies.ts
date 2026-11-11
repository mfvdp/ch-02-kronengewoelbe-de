// Das Verlies erzeugen: Raster, Räume, Gänge, Fallen und Tilemap.

function leeres_raster () {
    // Nur beim allerersten Mal anlegen. Ein neues Feld für jede Ebene müsste beim Füllen mehrfach umkopiert werden, und
    // das bei jedem Versuch der Wiederholschleife in baue_ebene, an wechselnden Stellen im Speicher. Jeder Aufruf
    // kostete dann rund 4 KB Daten und 8 KB Kopiermüll.
    if (raster.length != RASTER_BREITE * RASTER_HOEHE) {
        raster = []
        for (let index = 0; index < RASTER_BREITE * RASTER_HOEHE; index++) {
            raster.push(0)
        }
        return
    }
    for (let index = 0; index < RASTER_BREITE * RASTER_HOEHE; index++) {
        raster[index] = 0
    }
}

function grabe (x: number, y: number) {
    if (x > 0 && x < RASTER_BREITE - 1 && y > 0 && y < RASTER_HOEHE - 1) {
        raster[y * RASTER_BREITE + x] = 1
    }
}

// Gänge sind zwei Kacheln breit. Bei nur einer Kachel wäre ein Gang genau 16 Pixel breit, und der Held ist 16 Pixel
// hoch. Er passte dann zwar hindurch, aber nur bei pixelgenauer Ausrichtung, und jedes Abbiegen würde klemmen. Weil die
// Wände wirklich fest sind (siehe zeichne_raster), ist das entscheidend. Zwei Kacheln geben 16 Pixel Spielraum.
function grabe_gang (x1: number, y1: number, x2: number, y2: number) {
    x = x1
    y = y1
    while (x != x2) {
        grabe(x, y)
        grabe(x, y + 1)
        if (x < x2) {
            x += 1
        } else {
            x += -1
        }
    }
    while (y != y2) {
        grabe(x, y)
        grabe(x + 1, y)
        if (y < y2) {
            y += 1
        } else {
            y += -1
        }
    }
    grabe(x, y)
    grabe(x + 1, y)
    grabe(x, y + 1)
    grabe(x + 1, y + 1)
}

function erzeuge_raeume () {
    let rw: number;
let rh: number;
let rx: number;
let ry: number;
let mx: number;
let my: number;
let frei: boolean;
raum_x = []
    raum_y = []
    for (let index = 0; index < 50; index++) {
        rw = randint(3, 7)
        rh = randint(3, 5)
        rx = randint(1, RASTER_BREITE - rw - 2)
        ry = randint(1, RASTER_HOEHE - rh - 2)
        mx = rx + Math.idiv(rw, 2)
        my = ry + Math.idiv(rh, 2)
        frei = true
        for (let j = 0; j <= raum_x.length - 1; j++) {
            if (betrag(raum_x[j] - mx) < 6 && betrag(raum_y[j] - my) < 5) {
                frei = false
            }
        }
        if (frei) {
            for (let y2 = 0; y2 <= rh - 1; y2++) {
                for (let x2 = 0; x2 <= rw - 1; x2++) {
                    grabe(rx + x2, ry + y2)
                }
            }
            if (raum_x.length > 0) {
                grabe_gang(raum_x[raum_x.length - 1],
                    raum_y[raum_y.length - 1], mx, my)
            }
            raum_x.push(mx)
            raum_y.push(my)
        }
    }
}

function setze_fallen () {
    let x3: number;
    let y3: number;
    let weit_weg: any;
    // gesetzt, versuche und anzahl sind lokale Variablen dieser Funktion und beginnen bei jedem Aufruf neu. Wären sie
    // global, würden sie nie zurückgesetzt, und ab Ebene 2 kämen fast keine Fallen mehr dazu.
    let gesetzt = 0
    let versuche = 0
    // Eine Falle mehr je FALLEN_TAKT Ebenen.
    let anzahl = 1 + Math.idiv(ebene, FALLEN_TAKT)
    if (anzahl > FALLEN_MAX) {
        anzahl = FALLEN_MAX
    }
    while (gesetzt < anzahl && versuche < 300) {
        versuche += 1
        x3 = randint(1, RASTER_BREITE - 2)
        y3 = randint(1, RASTER_HOEHE - 2)
        weit_weg = betrag(x3 - raum_x[0]) > 2 || betrag(y3 - raum_y[0]) > 2
        if (raster[y3 * RASTER_BREITE + x3] == 1 && weit_weg) {
            raster[y3 * RASTER_BREITE + x3] = 3
            gesetzt += 1
        }
    }
}

function zeichne_raster () {
    let feld: number;
let nummer: number;
let puffer = Buffer.create(4 + RASTER_BREITE * RASTER_HOEHE)
puffer[0] = RASTER_BREITE
    puffer[2] = RASTER_HOEHE
    waende = image.create(RASTER_BREITE, RASTER_HOEHE)
    for (let y4 = 0; y4 <= RASTER_HOEHE - 1; y4++) {
        for (let x4 = 0; x4 <= RASTER_BREITE - 1; x4++) {
            feld = raster[y4 * RASTER_BREITE + x4]
            nummer = 0
            if (feld == 0) {
                // Der Wert muss genau 2 sein. tilemap.ts prüft mit „layers.getPixel(col, row) === TM_WALL“, und TM_WALL
                // steht für die Zahl 2. Der Vergleich ist genau, es ist kein Test auf „ungleich null“. Mit einer
                // anderen Zahl wäre keine einzige Wand fest: Geschosse flögen hindurch, Gegner liefen durch Mauern, und
                // die Erkennung „stecken geblieben“ in der Gegner-KI liefe ins Leere.
                waende.setPixel(x4, y4, 2)
                if (ist_boden(x4, y4 + 1)) {
                    nummer = 6
                } else if (ist_boden(x4 - 1, y4) || ist_boden(x4 + 1, y4) || ist_boden(x4, y4 - 1)) {
                    nummer = 5
                } else {
                    nummer = 0
                }
            } else if (feld == 2) {
                nummer = 7
            } else if (feld == 3) {
                nummer = 8
            } else {
                nummer = randint(1, 3)
            }
            puffer[4 + y4 * RASTER_BREITE + x4] = nummer
        }
    }
    tiles.setCurrentTilemap(tiles.createTilemap(puffer, waende,
        [KACHEL_FELS, KACHEL_BODEN, KACHEL_BODEN_2, KACHEL_BODEN_3, KACHEL_BODEN,
            KACHEL_WAND, KACHEL_WAND_KANTE, KACHEL_TREPPE, KACHEL_STACHEL],
        TileScale.Sixteen))
}
