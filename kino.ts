// Kino: der Werkzeugkasten für Vorspann und Abspann.
//
// Vier Gesten, überall dieselben:
//   rahmen()      Balken, runde Ecken, Kamerabeben, in jedem Bild
//   welle()       die Schockwelle eines Einschlags
//   strahl, kranz Lichtkeile (Gottesstrahlen)
//   abkuehlen()   alles Glühende sinkt eine Stufe ins Schwarz
//
// Gemalt wird immer in das Vollbild leinwand. Hier wird nie ein Bild angelegt und nie gewartet. Das Warten und die
// Prüfung der A-Taste bleiben in intro.warte() und outro.warte().
//
// Dieser Namensraum hat keinen eigenen Zustand: Alles geht durch die Parameter. Sonst bekäme irgendwann
// das Titelbild Kinobalken.
//
// Keine Kommazahlen und keine Winkelfunktionen: Alle Richtungen kommen aus den Tabellen RICHTUNG_X und RICHTUNG_Y.
namespace kino {
    // Die Balkenhöhe im Normalfall: 8 oben und 8 unten von 120 Pixeln. Das wirkt wie ein Breitbild, ohne das Bild zu
    // quetschen. Sichtbar bleibt y = 8 bis 111.
    export const BALKEN = 8

    // 16 Richtungen auf einem Kreis mit Radius 64, ganzzahlig gerundet (64 × cos und 64 × sin in Schritten
    // von 22,5 Grad). Ein Punkt in Richtung k im Abstand r liegt bei x = cx + Math.idiv(RICHTUNG_X[k] * r, 64). Die
    // Richtung k plus 4 ist immer die um 90 Grad gedrehte, so steht die Endkante eines Lichtkeils quer zu seiner Achse.
    const RICHTUNG_X = [64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24, 0, 24, 45, 59]
    const RICHTUNG_Y = [0, 24, 45, 59, 64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24]

    // Wie viele Pixel in Zeile j (vom Balkenrand gezählt) links und rechts schwarz bleiben: die abgerundete
    // Ecke des Kinorahmens.
    const ECKE = [10, 6, 4, 3, 2, 2, 1, 1]

    // Kamerabeben, das nach und nach abklingt. Stufe 0 ist der Schlag selbst.
    const RUCK_X = [4, -3, 3, -2, 2, -1, 1, 0]
    const RUCK_Y = [-3, 3, -2, 2, -1, 1, 0, 0]

    // Startgeschwindigkeiten der Funken, reine Pixelwerte.
    const FUNKEN_X = [-9, -7, -5, -2, 0, 2, 5, 7, 9, -4, 4, 0]
    const FUNKEN_Y = [-3, -6, -8, -9, -10, -9, -8, -6, -3, -7, -7, -11]

    // Konfetti-Farben. Nur im Abspann benutzen (siehe konfetti()).
    const KONFETTI_FARBEN = [5, 4, 1, 5, 2, 4, 3, 7, 10]

    // Der Kinorahmen: Balken oben und unten, feine Lichtkante, abgerundete Ecken. Er ist immer der letzte
    // Malbefehl eines Bildes.
    //
    // dx und dy verschieben nicht das Bild, sondern die Blende: Bei dy = 3 wächst der obere Balken und der untere
    // schrumpft. Das Auge sieht darin einen Kameraruck. Der Trick kostet nichts, und keine Szene muss dafür ihre
    // Koordinaten ändern. (leinwand.scroll() wäre der naheliegende Weg, legt aber bei dy ungleich 0 innen eine 9,6 KB
    // große Kopie des Bildes an. Nicht benutzen.)
    export function rahmen(dx: number, dy: number, h: number) {
        let balken_oben = h + dy
        let balken_unten = h - dy
        if (balken_oben < 0) {
            balken_oben = 0
        }
        if (balken_unten < 0) {
            balken_unten = 0
        }
        leinwand.fillRect(0, 0, 160, balken_oben, 15)
        leinwand.fillRect(0, 120 - balken_unten, 160, balken_unten, 15)
        if (dx > 0) {
            leinwand.fillRect(0, balken_oben, dx, 120 - balken_oben - balken_unten, 15)
        }
        if (dx < 0) {
            leinwand.fillRect(160 + dx, balken_oben, 0 - dx, 120 - balken_oben - balken_unten, 15)
        }
        // Die Lichtkante: Ohne sie verschwimmt der Balken mit einem schwarzen Bild, und man sähe den Rahmen gar nicht.
        if (balken_oben > 0) {
            leinwand.fillRect(0, balken_oben - 1, 160, 1, 12)
        }
        if (balken_unten > 0) {
            leinwand.fillRect(0, 120 - balken_unten, 160, 1, 12)
        }
        for (let j = 0; j < 8; j++) {
            leinwand.fillRect(0, balken_oben + j, ECKE[j], 1, 15)
            leinwand.fillRect(160 - ECKE[j], balken_oben + j, ECKE[j], 1, 15)
            leinwand.fillRect(0, 119 - balken_unten - j, ECKE[j], 1, 15)
            leinwand.fillRect(160 - ECKE[j], 119 - balken_unten - j, ECKE[j], 1, 15)
        }
    }

    // Rahmen mit Kamerabeben der Stufe st: 0 ist der Schlag selbst, je höher, desto ruhiger. Ab 8 steht
    // die Kamera still.
    export function beben(st: number, h: number) {
        if (st < 0 || st > 7) {
            rahmen(0, 0, h)
        } else {
            rahmen(RUCK_X[st], RUCK_Y[st], h)
        }
    }

    // Balkenhöhe für das f-te Bild einer Szene: Die ersten vier Bilder fahren die Blende auf (59, 42, 25, dann 8).
    export function blende_auf(f: number) {
        if (f >= 3) {
            return BALKEN
        }
        return BALKEN + (3 - f) * 17
    }

    // Eine Schockwelle: drei Farbringe von außen nach innen, die Mitte wird wieder ausgeräumt. Darum nur auf schwarzem
    // Grund und immer als Erstes im Bild. Mit vier eingebauten fillCircle-Aufrufen ist sie sehr billig. drawCircle wäre
    // hier falsch: Das ist eine TypeScript-Schleife, die je Kreis rund 6 × r Mal setPixel aufruft.
    export function welle(cx: number, cy: number,
        r: number, f1: number, f2: number, f3: number) {
        if (r < 4) {
            return
        }
        leinwand.fillCircle(cx, cy, r, f1)
        leinwand.fillCircle(cx, cy, r - 3, f2)
        leinwand.fillCircle(cx, cy, r - 6, f3)
        leinwand.fillCircle(cx, cy, r - 10, 15)
    }

    // Ein einzelner Ring als Umriss. Er ist der einzige Weg, eine Welle über ein fertiges Bild zu legen. Er ist teuer
    // (siehe oben), darum höchstens ein Aufruf je Bild und r höchstens 120.
    export function ring(cx: number, cy: number, r: number, farbe: number) {
        if (r < 1 || r > 120) {
            return
        }
        leinwand.drawCircle(cx, cy, r, farbe)
    }

    // Funken auf einer Wurfbahn zum Zeitpunkt t, mit ganzen Zahlen gerechnet:
    //   x = cx + vx * t / 2
    //   y = cy + vy * t / 2 + t * t / 2   (das letzte Stück ist die Schwerkraft)
    //
    // Sie müssen nicht verblassen: abkuehlen() macht aus den liegen gebliebenen Funken von selbst eine Leuchtspur.
    // n ist höchstens 12.
    export function funken(cx: number, cy: number, t: number, n: number, farbe: number) {
        for (let k = 0; k < n; k++) {
            leinwand.setPixel(cx + Math.idiv(FUNKEN_X[k] * t, 2),
                cy + Math.idiv(FUNKEN_Y[k] * t, 2) + Math.idiv(t * t, 2), farbe)
        }
    }

    // Ein Lichtkeil: ein Dreieck von der Quelle in Richtung i. Die Endkante steht quer dazu, darum die Richtung i + 4.
    // fillTriangle ist eingebaut und beschneidet selbst, laenge darf also über den Bildrand hinausgehen.
    export function strahl(qx: number, qy: number, i: number,
        laenge: number, breite: number, farbe: number) {
        let ex = qx + Math.idiv(RICHTUNG_X[i % 16] * laenge, 64)
        let ey = qy + Math.idiv(RICHTUNG_Y[i % 16] * laenge, 64)
        let bx = Math.idiv(RICHTUNG_X[(i + 4) % 16] * breite, 64)
        let by = Math.idiv(RICHTUNG_Y[(i + 4) % 16] * breite, 64)
        leinwand.fillTriangle(qx, qy, ex +
            bx, ey + by, ex - bx, ey - by, farbe)
    }

    // Acht Lichtkeile im Kranz. phase 0 oder 1 dreht ihn um eine halbe Teilung weiter. Wechselt man beide ab, sieht das
    // wie eine langsame Drehung aus, und es muss nichts gerechnet werden.
    export function kranz(cx: number, cy: number, r: number, phase: number,
        farbe: number, breite: number) {
        for (let i = phase; i < 16; i += 2) {
            strahl(cx, cy, i, r, breite, farbe)
        }
    }

    // Achtzackiges Funkeln: ein Kreuz plus halb lange Diagonalen. Mit nur vier Linien ist das der
    // billigste Glanzpunkt überhaupt.
    export function stern(sx: number, sy: number, gr: number, farbe: number) {
        let h = Math.idiv(gr, 2)
        leinwand.drawLine(sx - gr, sy, sx + gr, sy, farbe)
        leinwand.drawLine(sx, sy - gr, sx, sy + gr, farbe)
        leinwand.drawLine(sx - h, sy - h, sx + h, sy + h, farbe)
        leinwand.drawLine(sx - h, sy + h, sx + h, sy - h, farbe)
    }

    // Glühendes Metall kühlt ab: weiß, gelb, orange, rot, braun, grau, schwarz. Wie bei intro.abdunkeln() geht die
    // Reihenfolge von dunkel nach hell, sonst fiele eine Farbe in einem Rutsch durch die ganze Leiter.
    //
    // Der wichtigste Effekt des ganzen Werkzeugkastens: Man malt Ringe, Strahlen und Funken einmal, lässt die Leinwand
    // stehen und ruft pro Bild nur noch abkuehlen() auf. Alles glimmt von selbst aus, ein Partikelsystem ohne
    // eine einzige Zustandsvariable.
    //
    // Achtung: Die Farben 12 und 14 fallen mit, das Mauerwerk zerfällt also. Nur auf einer Leinwand benutzen, die
    // ohnehin ins Schwarz soll. Die Farben 11 und 13 überleben: Was stehen bleiben soll, malt man in 13. Nie zweimal im
    // selben Bild aufrufen.
    export function abkuehlen() {
        leinwand.replace(12, 15)
        leinwand.replace(14, 12)
        leinwand.replace(2, 14)
        leinwand.replace(4, 2)
        leinwand.replace(5, 4)
        leinwand.replace(1, 5)
    }

    // Fallendes Konfetti. Ohne randint, damit es wirklich fällt und nicht nur flimmert.
    //
    // Nur im Abspann benutzen: Hier kommen die Farben 3, 7 und 10 vor, und die kennt intro.abdunkeln() nicht. Im
    // Vorspann bliebe so ein Tupfer in der Abblende hell stehen. Der Abspann läuft nie durch abdunkeln(), darum ist
    // es hier erlaubt.
    export function konfetti(f: number) {
        for (let k = 0; k < 18; k++) {
            leinwand.fillRect(k * 9 + 4, (k * 27 +
                f * 11) % 104 + 10, 2, 3, KONFETTI_FARBEN[k % 9])
        }
    }
}
