// Das Titelbild und seine Bausteine: Steinmauer, Fackeln, Titelbild und Titelschirm.
//
// Alles wird zur Laufzeit aus Rechtecken, Kreisen und Linien gemalt. Es liegt kein einziges zusätzliches Bild im Flash,
// nur die schon vorhandenen Sprites aus grafik.ts werden als Dekoration in das Titelbild kopiert.
//
// Die Helfer mauerwerk_malen(), boden_malen(), fackel_malen(), schrift_mit_rand() und die beiden Farbleitern benutzt
// auch das Intro in intro.ts.

// Die Helligkeitsleiter des Fackellichts:
//   13 (d) heller Rand, 11 (b) heller Stein, 14 (e) warmes Braun, 12 (c) Schatten, 15 (f) schwarz

// Welche Steinfarbe gehört zu diesem Abstand von der Fackel?
function stein_farbe (abstand: number) {
    if (abstand < 30) {
        return 11
    }
    if (abstand < 56) {
        return 14
    }
    if (abstand < 86) {
        return 12
    }
    return 15
}

// Eine Stufe dunkler auf derselben Leiter.
function stein_dunkler (farbe: number) {
    if (farbe == 13) {
        return 11
    }
    if (farbe == 11) {
        return 14
    }
    if (farbe == 14) {
        return 12
    }
    return 15
}

// Grobe Entfernung zweier Punkte. Für das Licht genau genug und viel billiger als eine Wurzel.
function licht_abstand (px: number, py: number, lx: number, ly: number) {
    let dx = betrag(px - lx)
    let dy = betrag(py - ly)
    if (dx > dy) {
        return dx + Math.idiv(dy, 2)
    }
    return dy + Math.idiv(dx, 2)
}

// Schrift mit dunklem Rand, sonst verschwindet der Text im Mauerwerk. Der Text wird waagerecht zentriert.
function schrift_mit_rand (b: Image, txt: string, y: number, farbe: number, rand: number,
    schrift: image.Font) {
    let x = Math.idiv(b.width - txt.length * schrift.charWidth, 2)
    b.print(txt, x - 1, y, rand, schrift)
    b.print(txt, x + 1, y, rand, schrift)
    b.print(txt, x, y - 1, rand, schrift)
    b.print(txt, x, y + 1, rand, schrift)
    b.print(txt, x, y, farbe, schrift)
}

// Eine Steinmauer von y = oben bis y = unten. lx1 und lx2 sind die beiden Fackeln in der Höhe ly: Steine in ihrer Nähe
// werden hell, weiter weg versinkt die Mauer im Schwarz.
function mauerwerk_malen (b: Image, oben: number,
    unten: number, lx1: number, lx2: number, ly: number) {
    let reihe = 0
    let versatz = 0
    let abstand = 0
    let zweiter = 0
    let farbe = 0
    // Die Fugen bleiben schwarz, darum erst alles schwarz füllen.
    b.fillRect(0, oben, b.width, unten - oben, 15)
    for (let zy = oben; zy < unten; zy += 12) {
        versatz = 0
        if (reihe % 2 == 1) {
            versatz = 11
        }
        for (let zx = versatz - 22; zx < b.width; zx += 22) {
            abstand = licht_abstand(zx + 10, zy + 5, lx1, ly)
            zweiter = licht_abstand(zx + 10, zy + 5, lx2, ly)
            if (zweiter < abstand) {
                abstand = zweiter
            }
            farbe = stein_farbe(abstand)
            // Jeder dritte Stein ist etwas dunkler, das gibt Struktur.
            if ((reihe + Math.idiv(zx + 44, 22)) % 3 == 0) {
                farbe = stein_dunkler(farbe)
            }
            b.fillRect(zx, zy, 20, 10, farbe)
            if (farbe == 11) {
                b.fillRect(zx, zy, 20, 1, 13)
                b.fillRect(zx, zy + 9, 20, 1, 12)
            } else if (farbe == 14) {
                b.fillRect(zx, zy, 20, 1, 4)
            }
            // Hier und da ein Riss.
            if ((reihe * 2 + Math.idiv(zx + 44, 22)) % 7 == 3 && farbe != 15) {
                b.drawLine(zx + 5, zy + 1, zx + 8, zy + 8, 15)
            }
        }
        reihe += 1
    }
}

// Der Steinboden unter der Mauer, ebenfalls vom Fackellicht abgestuft. Er ist eine Spur dunkler als die Wand.
function boden_malen (b: Image, oben: number, lx1: number, lx2: number) {
    let reihe = 0
    let versatz = 0
    let abstand = 0
    let zweiter = 0
    b.fillRect(0, oben, b.width, b.height - oben, 15)
    b.fillRect(0, oben, b.width, 2, 12)
    for (let zy = oben + 3; zy < b.height; zy += 9) {
        versatz = 0
        if (reihe % 2 == 1) {
            versatz = 12
        }
        for (let zx = versatz - 24; zx < b.width; zx += 24) {
            abstand = licht_abstand(zx + 11, zy + 4, lx1, oben + 10)
            zweiter = licht_abstand(zx + 11, zy + 4, lx2, oben + 10)
            if (zweiter < abstand) {
                abstand = zweiter
            }
            b.fillRect(zx, zy, 22, 7, stein_dunkler(stein_farbe(abstand)))
        }
        reihe += 1
    }
}

// Eine Wandfackel. fx ist die Mitte, fy die Höhe der Flamme. flacker (0 oder 1) lässt die Spitze zappeln. So werden aus
// zwei Standbildern zwei Zustände einer brennenden Fackel.
function fackel_malen (b: Image, fx: number, flacker: number = 0, fy: number = 42) {
    let spitze = fy - 9 - flacker * 4
    // Stiel und Eisenring an der Wand.
    b.fillRect(fx - 1, fy + 6, 3, 20, 14)
    b.fillRect(fx - 3, fy + 7, 7, 3, 11)
    b.fillRect(fx - 3, fy + 7, 7, 1, 13)
    // Flamme: außen orange, innen gelb, im Kern weiß.
    b.fillCircle(fx, fy + 3, 5, 4)
    b.drawLine(fx, spitze, fx - 4, fy + 3, 4)
    b.drawLine(fx, spitze, fx + 4, fy + 3, 4)
    b.drawLine(fx - 1 + flacker * 2, spitze + 2, fx - 3, fy + 3, 4)
    b.fillCircle(fx, fy + 2, 3, 5)
    b.drawLine(fx, spitze + 4, fx, fy + 2, 5)
    b.fillCircle(fx, fy + 1, 1, 1)
}

// Spinnweben in den beiden oberen Ecken.
function spinnweben_malen (b: Image) {
    for (let seite = 0; seite < 2; seite++) {
        let ex = 0
        let ri = 1
        if (seite == 1) {
            ex = b.width - 1
            ri = -1
        }
        b.drawLine(ex, 0, ex + ri * 19, 8, 11)
        b.drawLine(ex, 0, ex + ri * 13, 14, 11)
        b.drawLine(ex, 0, ex + ri * 7, 19, 11)
        b.drawLine(ex + ri * 9, 4, ex + ri * 4, 9, 11)
        b.drawLine(ex + ri * 15, 7, ex + ri * 7, 15, 11)
    }
}

// Das Titelbild. hinweis blendet „DRÜCKE A“ ein, flacker macht den zweiten Zustand der Fackeln. So blinkt der Hinweis
// zusammen mit dem Feuer.
function titelbild (hinweis: boolean, flacker: number = 0) {
    let gross = image.doubledFont(image.font8)
    leinwand = image.create(160, 120)
    leinwand.fill(15)
    // Wand, Boden und die beiden Fackeln ganz außen.
    mauerwerk_malen(leinwand, 0, 100, 14 - flacker * 2, 146 + flacker * 2, 46)
    boden_malen(leinwand, 100, 14, 146)
    fackel_malen(leinwand, 14, flacker, 46)
    fackel_malen(leinwand, 146, flacker, 46)
    // Lichtpfützen auf dem Boden unter den Fackeln.
    leinwand.fillRect(4 - flacker, 100, 21, 2, 4)
    leinwand.fillRect(9 - flacker, 100, 11, 1, 5)
    leinwand.fillRect(136 + flacker, 100, 21, 2, 4)
    leinwand.fillRect(141 + flacker, 100, 11, 1, 5)
    spinnweben_malen(leinwand)
    // Zwei Ketten halten das Schild an der Decke.
    for (let ky = 0; ky < 12; ky += 3) {
        leinwand.fillRect(45, ky, 3, 2, 11)
        leinwand.fillRect(112, ky, 3, 2, 11)
        leinwand.setPixel(45, ky, 13)
        leinwand.setPixel(112, ky, 13)
    }
    // Holzschild mit vertiefter Mitte.
    leinwand.fillRect(22, 11, 116, 50, 14)
    leinwand.fillRect(22, 22, 116, 1, 12)
    leinwand.fillRect(22, 44, 116, 1, 12)
    leinwand.drawRect(22, 11, 116, 50, 15)
    leinwand.drawRect(23, 12, 114, 48, 4)
    leinwand.fillRect(28, 17, 104, 38, 15)
    leinwand.drawRect(28, 17, 104, 38, 12)
    leinwand.setPixel(25, 14, 5)
    leinwand.setPixel(134, 14, 5)
    leinwand.setPixel(25, 57, 5)
    leinwand.setPixel(134, 57, 5)
    // Der Schriftzug glüht: oben gelbe Schrift mit orangem Rand, darunter orange Schrift mit rotem Rand.
    schrift_mit_rand(leinwand, spiel.TITELZEILEN[0], 19, 5, 4, gross)
    schrift_mit_rand(leinwand, spiel.TITELZEILEN[1], 37, 4, 2, gross)
    // Steuerung und Bestpunkte. Es sind zwei Zeilen, weil font8 sechs Pixel breit ist: Bei 160 Pixeln Bildbreite passen
    // nur 26 Zeichen nebeneinander. Der Rahmen des Holzschilds reicht bis y = 60, darum beginnt die erste Zeile erst
    // bei 63 (ihr Rand bei 62), sonst laufen die Rahmenlinien quer durch die Schrift. Die Bestpunkte in font8 belegen
    // mit Rand die Zeilen 82 bis 91, direkt darunter bei 92 steht der Held.
    schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.TITEL_STEUERUNG), 63, 13, 15, image.font8)
    schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.TITEL_KARTE), 73, 13, 15, image.font8)
    schrift_mit_rand(leinwand, katalog.formatiere(katalog.TextNr.BESTPUNKTE,
        info.highScore()), 83, 5, 15, image.font8)
    // Dekoration auf dem Boden: Der Held wartet vor der Truhe.
    leinwand.drawTransparentImage(BILD_TRUHE, 14, 88)
    leinwand.drawTransparentImage(BILD_SCHLUESSEL, 112, 92)
    leinwand.drawTransparentImage(DEKO_KNOCHEN, 130, 106)
    leinwand.drawTransparentImage(BILD_HELD, 72, 92)
    if (hinweis) {
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.DRUECKE_A), 105, 1, 15, image.font8)
    }
    return leinwand
}

// Der Titelschirm: erst der Vorspann (Geschichte, Karte „Calliope Hacker präsentiert“ mit Titelkarte, Lehrtafeln), dann
// das Warten auf A.
//
// Die Leinwand lebt über alle Teile des Vorspanns hinweg: leinwand_an() legt sie an, leinwand_aus() gibt sie frei. Das
// Freigeben muss auf jedem Weg laufen, auch nach einem Abbruch mit A, sonst fehlen den beiden Titelbildern 9,6 KB
// Speicher. Jede Station beginnt mit intro.station(): Ein Druck auf A überspringt immer nur die laufende
// Station (siehe intro.ts).
function titelschirm () {
    a_gedrueckt = false
    // Nach dem Spielende (Neustart mit Merkzeichen) geht es direkt zum Titelbild.
    if (VORSPANN && !(katalog.direkt_zum_titel)) {
        intro.leinwand_an()
        intro.abspielen()
        intro.zeige_karten()
        intro.station(true)
        lehre.abspielen()
        intro.leinwand_aus()
    }
    bild_an = titelbild(true, 0)
    bild_aus = titelbild(false, 1)
    // Auch das Titelbild ist eine Station: Der Druck, der eben die Lehrtafeln übersprungen hat, zählt nicht mehr, und
    // in der Sperrzeit danach startet auch ein gehämmertes A das Spiel nicht.
    intro.station(true)
    scene.setBackgroundImage(bild_an)
    klang.musik_titel()
    while (!(intro.gedrueckt())) {
        pause(120)
        blink_zaehler += 1
        if (blink_zaehler % 6 == 0) {
            scene.setBackgroundImage(bild_aus)
        } else if (blink_zaehler % 6 == 3) {
            scene.setBackgroundImage(bild_an)
        }
    }
    klang.musik_stopp()
    scene.setBackgroundImage(image.create(16, 16))
    // Die beiden Titelbilder sind je 160 × 120 Pixel groß, zusammen gut 19 KB, und werden nie wieder gebraucht. Ohne
    // das Lösen der Verweise würden sie die ganze Spielzeit über Speicher belegen, bei 128 KB auf dem Calliope ein
    // spürbarer Anteil. leinwand zeigt auf dasselbe Bild wie bild_aus.
    bild_an = null
    bild_aus = null
    leinwand = null
}
