// Intro: die Geschichte und die Studio-Karte vor dem Titelbild. titelschirm() in titelbild.ts ruft es auf. Es läuft
// nach jedem Einschalten, aber nicht beim Neustart nach dem Spielende (siehe katalog.direkt_zum_titel).
//
// Der Vorspann läuft in dieser Reihenfolge: Geschichte, Studio-Karte, Titelkarte, Lehrtafeln.
//   abspielen()         die Geschichte des Helden:
//     1. Gewitternacht: Blitze reißen die Burg aus dem Dunkel.
//     2. Die Schatzkammer: Der Dieb stiehlt die Krone im Mondlicht.
//     3. Kamerafahrt durch den Gang: seine Augen, seine Goldspur.
//     4. Eine Fackel geht an: „Seine Spur endet hier.“
//     5. Das Fallgitter kracht herunter, Splitter fliegen.
//     6. Der Schwur: Die Krone schwebt im Strahlenkranz.
//   zeige_karten()      die Studio-Karte „Calliope Hacker präsentiert“ (logo(), mit der Figur am Schreibtisch),
//                       dann die Titelkarte und die Abblende
//   lehre.abspielen()   die Lehrtafeln (eigene Datei lehre.ts)
//
// Das Vollbild leinwand legt leinwand_an() einmal für alle Teile an, leinwand_aus() blendet ab und gibt es wieder frei.
// Beide ruft titelschirm() auf, dazwischen darf leinwand nie freigegeben werden.
//
// Überspringen mit A, Station für Station: Ein Druck während der Geschichte springt zur Studio-Karte, ein Druck auf der
// Studio-Karte zur Titelkarte, ein Druck auf der Titelkarte zu den Lehrtafeln, ein Druck während der Lehrtafeln zum
// Titelbild. Jede Station beginnt mit station(): Ein alter Druck verfällt, und Drücke in den ersten SPERRE_MS
// Millisekunden zählen nicht. Auf der Studio-Karte gilt die längere Sperre SPERRE_STUDIOKARTE_MS. Der Calliope Hacker
// steht dort ab dem ersten Bild, wer weiterdrückt, hat ihn also gesehen. Der Handler in ereignisse.ts setzt a_gedrueckt
// nur beim Drücken, nie beim Halten: Wer A hält, muss erst loslassen. So überspringt weder Halten noch Hämmern zwei
// Stationen auf einmal.
//
// Gemalt wird immer in dasselbe Vollbild leinwand, damit der Arbeitsspeicher nicht mit mehreren Bildern von 160 × 120
// Pixeln zugestellt wird. Das einzige Bild im Flash ist der Calliope Hacker (BILD_HACKER in grafik.ts).
namespace intro {
    // Fluchtpunkt der Kamerafahrt.
    const GANG_X = 80
    const GANG_Y = 54

    // Wird wahr, sobald A die laufende Station abbricht.
    let abbruch = false
    // Darf die laufende Station mit A abgebrochen werden?
    let frei = true
    // Bis zu dieser Zeit (game.runtime) verfällt jeder Druck.
    let sperre_bis = 0
    // So lange nach einem Wechsel der Station zählt kein Druck.
    const SPERRE_MS = 500
    // Auf der Studio-Karte „Calliope Hacker präsentiert“ zählt A erst nach 1,5 s. Die Figur steht dort ab dem
    // ersten Bild (logo()).
    const SPERRE_STUDIOKARTE_MS = 1500

    // Beginnt eine neue Station: Ein alter Druck verfällt, und in den nächsten SPERRE_MS Millisekunden zählen keine
    // Drücke. Mit ueberspringbar = false läuft eine Station immer durch (zurzeit gibt es keine).
    export function station(ueberspringbar: boolean) {
        a_gedrueckt = false
        abbruch = false
        frei = ueberspringbar
        sperre_bis = game.runtime() + SPERRE_MS
    }

    // Wertet einen Druck aus: In der Sperrzeit oder auf einer Station, die durchläuft, verfällt er. Sonst bricht er
    // die Station ab.
    function druck_pruefen() {
        if (a_gedrueckt) {
            if (frei && game.runtime() >= sperre_bis) {
                abbruch = true
            } else {
                a_gedrueckt = false
            }
        }
    }

    // Für das Titelbild: Wurde seit station() ein gültiger Druck gemacht?
    export function gedrueckt() {
        druck_pruefen()
        return abbruch
    }

    // ---- Kleine Helfer ----

    // Wartet in kleinen Häppchen und merkt sich einen Tastendruck.
    export function warte(dauer: number) {
        let rest = dauer
        let schritt = 0
        while (rest > 0) {
            druck_pruefen()
            if (abbruch) {
                return
            }
            schritt = 30
            if (rest < schritt) {
                schritt = rest
            }
            pause(schritt)
            rest = rest - schritt
        }
        druck_pruefen()
    }

    // Zeigt den aktuellen Stand von leinwand auf dem Bildschirm.
    export function zeigen() {
        scene.setBackgroundImage(leinwand)
    }

    // Die Kinoblende schließt sich über dem stehenden Bild. Neu zeichnen ist nicht nötig: Die Balken fressen das letzte
    // Bild der Szene einfach auf. Das Gegenstück zu kino.blende_auf().
    export function zublende() {
        for (let f = 0; f < 4; f++) {
            if (abbruch) {
                return
            }
            kino.rahmen(0, 0, 8 + f * 17)
            zeigen()
            warte(60)
        }
    }

    // Der Schlag: ein einziges gleißend weißes Bild. Nie zwei, aus zwei würde ein Flackern wie beim Stroboskop.
    export function schlag() {
        if (abbruch) {
            return
        }
        leinwand.fill(1)
        kino.rahmen(0, 0, kino.BALKEN)
        zeigen()
        warte(60)
    }

    // Hat A die laufende Station abgebrochen? Die Lehrtafeln in lehre.ts fragen das ab, können aber nicht direkt auf
    // abbruch zugreifen: Die Variable ist in diesem Namensraum privat.
    export function abgebrochen() {
        return abbruch
    }

    // Legt das Vollbild an, in das der ganze Vorspann gemalt wird, und beginnt die erste Station (die Geschichte).
    export function leinwand_an() {
        station(true)
        leinwand = image.create(160, 120)
        leinwand.fill(15)
        scene.setBackgroundImage(leinwand)
    }

    // Blendet ab und gibt das Vollbild frei. Läuft immer, auch wenn mit A abgebrochen wurde, dann wird nur die Abblende
    // übersprungen (break statt return). Ohne das Freigeben blieben 9,6 KB liegen, und die beiden Titelbilder würden
    // den Speicher sprengen.
    export function leinwand_aus() {
        for (let f = 0; f < 6; f++) {
            if (abbruch) {
                break
            }
            abdunkeln()
            zeigen()
            warte(70)
        }
        klang.musik_stopp()
        scene.setBackgroundImage(image.create(16, 16))
        leinwand = null
    }

    // Malt ein vorhandenes Sprite-Bild in doppelter Größe in die leinwand. So brauchen die Lehrtafeln kein einziges
    // zusätzliches Bild im Flash. Die Farbe 0 ist durchsichtig und bleibt frei. qx und qy zählen die Pixel im Quellbild
    // q, ziel_x und ziel_y sind die linke obere Ecke auf der Leinwand.
    export function doppelt_malen(q: Image, ziel_x: number, ziel_y: number) {
        let farbe = 0
        for (let qy = 0; qy < q.height; qy++) {
            for (let qx = 0; qx < q.width; qx++) {
                farbe = q.getPixel(qx, qy)
                if (farbe != 0) {
                    leinwand.fillRect(ziel_x + qx * 2, ziel_y + qy * 2, 2, 2, farbe)
                }
            }
        }
    }

    // Dunkelt das ganze Bild um eine Stufe ab. Die Reihenfolge geht von dunkel nach hell, sonst würde eine Farbe in
    // einem Rutsch durch die ganze Leiter bis ins Schwarz fallen. Die Farben 8 und 9 sind die Blautöne des Helden: Er
    // steht auf der letzten Lehrtafel, darum muss auch er mit ins Schwarz sinken, sonst bliebe sein Rumpf in der
    // Abblende hell stehen.
    export function abdunkeln() {
        leinwand.replace(12, 15)
        leinwand.replace(14, 12)
        leinwand.replace(2, 12)
        leinwand.replace(8, 12)
        leinwand.replace(11, 14)
        leinwand.replace(4, 14)
        leinwand.replace(13, 11)
        leinwand.replace(5, 4)
        leinwand.replace(1, 13)
        leinwand.replace(9, 8)
    }

    // Die Karte „Calliope Hacker präsentiert“ (die Studio-Karte): CALLIOPE HACKER, nach der Geschichte

    // Ein Wort unter einem wandernden Lichtschein: Was nah dran ist, glüht. Es ist nach dem Abstand abgestuft wie das
    // Fackellicht (stein_farbe in titelbild.ts), aber in den Glutfarben 5, 4, 14 und 12.
    function logo_wort(wort: string, wy: number, gross: image.Font, licht: number) {
        let wx = Math.idiv(160 - wort.length * 12, 2)
        let d = 0
        let farbe = 0
        for (let i = 0; i < wort.length; i++) {
            d = betrag(wx + i * 12 + 6 - licht)
            farbe = 12
            if (d < 46) {
                farbe = 14
            }
            if (d < 26) {
                farbe = 4
            }
            if (d < 12) {
                farbe = 5
            }
            leinwand.print(wort.charAt(i), wx + i * 12, wy, farbe, gross)
        }
    }

    // Höhen auf der Studio-Karte: der Name oben, darunter der Calliope Hacker am Schreibtisch, ganz unten
    // „präsentiert“. Auch die Abspann-Karte in outro.ts benutzt sie.
    export const NAME_Y = 14
    export const HACKER_Y = 32
    export const ZEILE_Y = 99
    const MITTE_Y = 31

    // Der Calliope Hacker auf seiner Tafel: Goldrahmen (wie das Bild an der Wand im Spiel), Wand im Monitorschein
    // (Farbe c) und davor die Figur aus grafik.ts. Ohne die Tafel würde der schwarze Pulli im schwarzen Grund
    // verschwinden. Die Funktion malt in jedem Bild der Studio-Karte neu, nach den Effekten und vor dem Rahmen. So
    // steht die Figur vom ersten Bild an still da, und abkuehlen() kann sie nicht anfressen.
    export function studio_malen() {
        leinwand.fillRect(45, 52, 70, 43, 4)
        leinwand.fillRect(46, 53, 68, 41, 12)
        leinwand.setPixel(45, 52, 5)
        leinwand.setPixel(114, 52, 5)
        leinwand.drawTransparentImage(BILD_HACKER, 48, 54)
    }

    // Die Studio-Karte als kleiner Film von rund fünf Sekunden. Es kommt nach der Geschichte als Karte „Calliope Hacker
    // präsentiert“. Der Calliope Hacker sitzt vom ersten Bild an auf seiner Tafel am Schreibtisch (darum gibt es keine
    // aufgehende Blende). Über ihm baut sich der Schriftzug auf: Sternennacht, ein Punkt rast heran, EINSCHLAG,
    // CALLIOPE HACKER steht weißglühend im Krater, kühlt zu Gold aus, ein Lichtschein fährt darüber, dann
    // steht „präsentiert“ da.
    export function logo() {
        if (abbruch) {
            return
        }
        let gross = image.doubledFont(image.font8)
        // Akt 1: Sternennacht, ein Punkt am Himmel wird größer.
        klang.anflug()
        for (let f = 0; f < 2; f++) {
            if (abbruch) {
                return
            }
            leinwand.fill(15)
            for (let k = 0; k < 30; k++) {
                leinwand.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            for (let k = 0; k < 5; k++) {
                leinwand.setPixel(randint(0, 159), randint(8, 111), 13)
            }
            leinwand.fillCircle(20, 12 + f * 3, 1 + f, 13)
            studio_malen()
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(320)
        }
        // Akt 2: der Anflug, der Meteor zieht seinen Schweif.
        for (let f = 0; f < 7; f++) {
            if (abbruch) {
                return
            }
            let mx = 20 + Math.idiv(60 * f, 6)
            let my = 12 + Math.idiv((MITTE_Y - 12) * f, 6)
            leinwand.fill(15)
            for (let k = 0; k < 20; k++) {
                leinwand.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            leinwand.drawLine(20, 12, mx, my, 14)
            leinwand.drawLine(21, 13, mx, my, 4)
            leinwand.fillCircle(mx, my, f + 3, 4)
            leinwand.fillCircle(mx, my, f + 1, 5)
            leinwand.fillCircle(mx, my, Math.idiv(f + 1, 2), 1)
            kino.funken(mx, my, 2, 6, 5)
            studio_malen()
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(55)
        }
        // Akt 3: der Schlag, ein einziges gleißendes Bild (wie schlag(), aber mit der Figur auf ihrer Tafel).
        klang.einschlag()
        if (abbruch) {
            return
        }
        leinwand.fill(1)
        studio_malen()
        kino.rahmen(0, 0, kino.BALKEN)
        zeigen()
        warte(60)
        // Akt 4: Die Schockwelle rast nach außen, der Name steht weißglühend im Krater. welle() muss als Erstes kommen,
        // denn sie räumt ihre Mitte aus. Der Rahmen kommt als Letztes.
        const KRATER = [1, 1, 5, 5, 4]
        const KERN = [1, 1, 1, 5, 5]
        const RAND = [1, 1, 5, 5, 4]
        for (let f = 0; f < 5; f++) {
            if (abbruch) {
                return
            }
            leinwand.fill(15)
            kino.welle(80, MITTE_Y, 20 + f * 28, 1, 5, 4)
            kino.welle(80, MITTE_Y, 4 + f * 22, 4, 14, 12)
            kino.kranz(80, MITTE_Y, 40 + f * 26, f % 2, 5, 6)
            leinwand.fillCircle(80, MITTE_Y, 16 - f * 3, KRATER[f])
            schrift_mit_rand(leinwand, "CALLIOPE",
                NAME_Y, KERN[f], RAND[f], gross)
            schrift_mit_rand(leinwand, "HACKER",
                HACKER_Y, KERN[f], RAND[f], gross)
            kino.funken(80, MITTE_Y, f + 1, 12, 1)
            studio_malen()
            kino.beben(f, kino.BALKEN)
            zeigen()
            warte(70)
        }
        // Akt 5: Die Glut kühlt aus. Kein fill(): Die Leinwand aus Akt 4 bleibt stehen, abkuehlen() lässt Wellen, Keile
        // und liegen gebliebene Funken von selbst verglimmen, während die Buchstaben in jedem Bild frisch
        // heiß nachgemalt werden.
        const GLUT = [1, 1, 5, 5, 5, 5, 5]
        for (let f = 0; f < 7; f++) {
            if (abbruch) {
                return
            }
            kino.abkuehlen()
            kino.funken(80, MITTE_Y, f + 6, 12, 1)
            schrift_mit_rand(leinwand, "CALLIOPE", NAME_Y, GLUT[f], 4, gross)
            schrift_mit_rand(leinwand, "HACKER", HACKER_Y, GLUT[f], 2, gross)
            if (f >= 3) {
                // Über den Worten brennen neun kleine Flammen (vier über CALLIOPE, fünf über HACKER).
                for (let lx = 62; lx <= 98; lx += 12) {
                    leinwand.drawLine(lx, NAME_Y - 1, lx + randint(0 - 1, 1), NAME_Y - 5, 4)
                    leinwand.setPixel(lx, NAME_Y - 6, 5)
                }
                for (let lx = 56; lx <= 104; lx += 12) {
                    leinwand.drawLine(lx, HACKER_Y - 1, lx + randint(0 - 1, 1), HACKER_Y - 5, 4)
                    leinwand.setPixel(lx, HACKER_Y - 6, 5)
                }
            }
            studio_malen()
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(120)
        }
        // Akt 6: Der Lichtschein fährt über die Worte, die Glut im Hintergrund glimmt weiter aus.
        klang.studiokarte()
        for (let licht = 0 - 20; licht <= 190; licht += 22) {
            if (abbruch) {
                return
            }
            kino.abkuehlen()
            logo_wort("CALLIOPE", NAME_Y, gross, licht)
            logo_wort("HACKER", HACKER_Y, gross, licht)
            studio_malen()
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(55)
        }
        // Akt 7: Standbild im Gegenlicht, dazu der Logo-Akkord. 16 Bilder zu 130 ms ergeben gut zwei Sekunden, der
        // Akkord (2,0 s) trägt fast bis zum Schluss. So kann man „präsentiert“ auch wirklich lesen.
        klang.logo_steht()
        for (let f = 0; f < 16; f++) {
            if (abbruch) {
                return
            }
            kino.abkuehlen()
            kino.kranz(80, MITTE_Y + 20, 100, f % 2, 14, 8)
            schrift_mit_rand(leinwand, "CALLIOPE", NAME_Y, 5, 4, gross)
            schrift_mit_rand(leinwand, "HACKER", HACKER_Y, 4, 2, gross)
            studio_malen()
            if (f % 2 == 0) {
                kino.stern(26, NAME_Y + 4, 5, 1)
            } else {
                kino.stern(134, HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.PRAESENTIERT),
                    ZEILE_Y, 13, 15, image.font8)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(130)
        }
        zublende()
    }

    // Erzähltext: Zwei Zeilen tippen sich Bild für Bild ein, während dahinter die Szene weiterläuft.

    // Malt den Textstand zum Bild f: Zeile 1 wächst ab dem ersten Bild. Zeile 2 beginnt erst, wenn Zeile 1 fertig ist
    // (nach acht weiteren Bildern).
    function erzaehl_text(satz1: string, satz2: string, f: number, y1: number, y2: number) {
        let z1 = Math.min(f + 1, satz1.length)
        let z2 = f + 1 - satz1.length - 8
        if (z2 > satz2.length) {
            z2 = satz2.length
        }
        leinwand.print(satz1.substr(0, z1), Math.idiv(160 - satz1.length * 6, 2), y1, 13, image.font8)
        if (z2 > 0) {
            leinwand.print(satz2.substr(0, z2),
                Math.idiv(160 - satz2.length * 6, 2), y2, 13, image.font8)
        }
    }

    // Wie viele Bilder die Doppelzeile samt Lesezeit braucht.
    function erzaehl_laenge(satz1: string, satz2: string) {
        return satz1.length + 8 + satz2.length + 16
    }

    // ---- 1. Gewitternacht über der Burg ----

    // Burg-Silhouette auf dem Hügel, Sterne, Regen. hell = ein Blitz erhellt den Himmel, und die Burg steht als
    // schwarzer Scherenschnitt vor der grellen Wand.
    function burg_malen(hell: boolean) {
        leinwand.fill(15)
        if (hell) {
            leinwand.fillRect(0, 0, 160, 90, 13)
        } else {
            for (let k = 0; k < 14; k++) {
                leinwand.setPixel(randint(0, 159), randint(0, 58), 1)
            }
        }
        // Der Hügel. Im Blitzlicht wird auch er zur Silhouette.
        let huegel = 12
        if (hell) {
            huegel = 15
        }
        leinwand.fillCircle(80, 152, 76, huegel)
        // Bergfried, zwei Türme, Zinnen: alles schwarze Umrisse.
        leinwand.fillRect(64, 46, 32, 34, 15)
        leinwand.fillRect(52, 38, 12, 42, 15)
        leinwand.fillRect(96, 38, 12, 42, 15)
        for (let zx = 52; zx < 64; zx += 5) {
            leinwand.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 96; zx < 108; zx += 5) {
            leinwand.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 64; zx < 96; zx += 6) {
            leinwand.fillRect(zx, 41, 3, 6, 15)
        }
        // Fahne auf dem Bergfried.
        leinwand.drawLine(80, 46, 80, 34, 15)
        leinwand.fillRect(81, 34, 6, 3, 2)
        // Erleuchtete Fenster: nachts das Einzige, was man sieht.
        leinwand.fillRect(70, 56, 3, 4, 5)
        leinwand.fillRect(84, 52, 3, 4, 5)
        leinwand.fillRect(56, 46, 2, 3, 5)
        leinwand.fillRect(100, 50, 2, 3, 5)
        // Regen, im Blitzlicht heller.
        let regen = 12
        if (hell) {
            regen = 11
        }
        for (let k = 0; k < 26; k++) {
            let rx = randint(0, 159)
            let ry = randint(0, 104)
            leinwand.drawLine(rx, ry, rx - 2, ry + 6, regen)
        }
        // Nebelbank unten: Auf ihr bleibt die Schrift gut lesbar.
        leinwand.fillRect(0, 92, 160, 28, 15)
        for (let k = 0; k < 20; k++) {
            leinwand.setPixel(randint(0, 159), 92 + randint(0, 3), 12)
        }
    }

    // Ein Blitz: eine gezackte Bahn vom Himmel auf einen der Türme.
    function blitz_malen() {
        let bx = 58
        if (randint(0, 1) == 1) {
            bx = 102
        }
        let alt_zx = bx + randint(0 - 30, 30)
        let alt_zy = 0
        let neu_zx = 0
        let neu_zy = 0
        for (let k = 1; k <= 4; k++) {
            neu_zx = bx + randint(0 - 14, 14)
            neu_zy = Math.idiv(34 * k, 4)
            if (k == 4) {
                neu_zx = bx
            }
            leinwand.drawLine(alt_zx, alt_zy, neu_zx, neu_zy, 1)
            leinwand.drawLine(alt_zx + 1, alt_zy, neu_zx + 1, neu_zy, 13)
            alt_zx = neu_zx
            alt_zy = neu_zy
        }
    }

    function szene_burg() {
        if (abbruch) {
            return
        }
        let satz1 = katalog.text(katalog.TextNr.INTRO_1)
        let satz2 = katalog.text(katalog.TextNr.INTRO_2)
        let blitz = 0
        let nah = false
        let gesamt = erzaehl_laenge(satz1, satz2)
        for (let f = 0; f < gesamt; f++) {
            if (abbruch) {
                return
            }
            // Drei Blitze, jeder steht zwei Bilder lang. Der dritte schlägt nah ein: Ein gleißendes Weißbild, die
            // Kamera schlägt aus.
            if (blitz == 0 && (f == 5 || f == 30 || f == gesamt - 8)) {
                blitz = 2
                nah = f == gesamt - 8
                klang.donner()
                if (nah) {
                    klang.einschlag()
                }
            }
            burg_malen(blitz > 0)
            if (blitz > 0) {
                blitz_malen()
                blitz -= 1
            }
            erzaehl_text(satz1, satz2, f, 94, 103)
            if (nah && blitz == 1) {
                leinwand.fill(1)
            }
            kino.beben(8 - blitz * 3, kino.blende_auf(f))
            zeigen()
            warte(70)
        }
        zublende()
        warte(900)
    }

    // ---- 2. Die Schatzkammer: Der Dieb stiehlt die Krone ----

    // Die Krone, gemalt und nicht als Bild im Flash. cx ist die Mitte, cy die Höhe der Zackenspitzen. funkel setzt
    // Glanzpunkte. Auch der Abspann malt mit ihr die Beute des Kronenräubers.
    export function krone_malen(cx: number, cy: number, funkel: boolean) {
        leinwand.fillRect(cx - 10, cy + 4, 20, 5, 5)
        leinwand.fillRect(cx - 10, cy + 8, 20, 1, 4)
        leinwand.fillRect(cx - 10, cy, 4, 4, 5)
        leinwand.fillRect(cx - 2, cy - 3, 4, 7, 5)
        leinwand.fillRect(cx + 6, cy, 4, 4, 5)
        leinwand.fillRect(cx - 1, cy + 5, 2, 2, 2)
        if (funkel) {
            leinwand.setPixel(cx + 3, cy - 2, 1)
            leinwand.setPixel(cx - 7, cy + 2, 1)
        }
    }

    // Die Schatzkammer: Ein Mondstrahl fällt auf den Sockel. Der Strahl wird zum Boden hin breiter, das ergibt
    // Perspektive: zwei Trapeze statt zweier Rechtecke.
    function schatzkammer_malen() {
        leinwand.fill(15)
        leinwand.fillPolygon4(70, 0, 94, 0, 104, 94, 60, 94, 14)
        leinwand.fillPolygon4(75, 0, 89, 0, 96, 94, 68, 94, 11)
        // Staub tanzt im Licht.
        for (let k = 0; k < 8; k++) {
            leinwand.setPixel(randint(69, 94), randint(4, 88), 13)
        }
        // Boden und Sockel.
        leinwand.fillRect(0, 94, 160, 3, 12)
        leinwand.fillRect(74, 78, 16, 4, 11)
        leinwand.fillRect(77, 82, 10, 12, 12)
        leinwand.fillRect(72, 92, 20, 2, 11)
    }

    // Der Dieb: ein schwarzer Schemen mit Kapuze und roten Augen. mitte_x und mitte_y sind die Mitte seines Körpers.
    function dieb_malen(mitte_x: number, mitte_y: number) {
        // Erst der graue Saum, dann das Schwarz darin.
        leinwand.fillCircle(mitte_x, mitte_y - 10, 6, 12)
        leinwand.fillCircle(mitte_x, mitte_y, 9, 12)
        leinwand.fillRect(mitte_x - 9, mitte_y, 18, 12, 12)
        leinwand.fillCircle(mitte_x, mitte_y - 10, 5, 15)
        leinwand.fillCircle(mitte_x, mitte_y, 8, 15)
        leinwand.fillRect(mitte_x - 8, mitte_y, 16, 11, 15)
        // Die Augen glühen.
        leinwand.fillRect(mitte_x - 3, mitte_y - 11, 2, 2, 2)
        leinwand.fillRect(mitte_x + 1, mitte_y - 11, 2, 2, 2)
    }

    function szene_dieb() {
        if (abbruch) {
            return
        }
        let satz1 = katalog.text(katalog.TextNr.INTRO_3)
        let satz2 = katalog.text(katalog.TextNr.INTRO_4)
        // Die Krone glänzt allein im Mondlicht.
        for (let f = 0; f < 7; f++) {
            if (abbruch) {
                return
            }
            schatzkammer_malen()
            krone_malen(82, 69, f % 2 == 0)
            kino.rahmen(0, 0, kino.blende_auf(f))
            zeigen()
            warte(200)
        }
        // Der Dieb schleicht von rechts heran.
        for (let f = 0; f < 9; f++) {
            if (abbruch) {
                return
            }
            schatzkammer_malen()
            krone_malen(82, 69, f % 3 == 0)
            dieb_malen(146 - f * 6, 82)
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(100)
        }
        if (abbruch) {
            return
        }
        // Zugriff! Der Strahl gleißt auf, Gottesstrahlen fächern nach unten, die Krone sitzt auf der Kapuze.
        klang.husch()
        schatzkammer_malen()
        leinwand.fillPolygon4(64, 0, 100, 0, 116, 94, 48, 94, 13)
        kino.strahl(82, 0, 3, 120, 20, 1)
        kino.strahl(82, 0, 4, 120, 24, 1)
        kino.strahl(82, 0, 5, 120, 20, 1)
        dieb_malen(94, 82)
        krone_malen(94, 55, true)
        kino.stern(94, 52, 8, 1)
        kino.rahmen(0, 0, kino.BALKEN)
        zeigen()
        warte(280)
        // Flucht nach links, Goldfunken stieben hinterher.
        for (let f = 0; f < 6; f++) {
            if (abbruch) {
                return
            }
            schatzkammer_malen()
            let dieb_x = 94 - (f + 1) * 22
            dieb_malen(dieb_x, 82)
            krone_malen(dieb_x, 55, true)
            kino.stern(dieb_x, 55, 5, 1)
            leinwand.drawLine(dieb_x + 12, 74, dieb_x + 30, 74, 12)
            leinwand.drawLine(dieb_x + 14, 84, dieb_x + 32, 84, 12)
            for (let k = 0; k < 5; k++) {
                leinwand.setPixel(dieb_x + 12 + randint(0, 40), 60 + randint(0, 30), 5)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(80)
        }
        // Der leere Sockel bleibt zurück, die Zeilen tippen sich ein.
        let gesamt = erzaehl_laenge(satz1, satz2)
        for (let f = 0; f < gesamt; f++) {
            if (abbruch) {
                return
            }
            schatzkammer_malen()
            erzaehl_text(satz1, satz2, f, 96, 104)
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(70)
        }
        zublende()
        warte(900)
    }

    // ---- 6. Der Schwur: die Krone im Strahlenkranz ----

    // Die gestohlene Krone schwebt im Lichtdom: 16 Lichtkeile in zwei Kränzen, die sich gegeneinander
    // zu drehen scheinen.
    function schwur_malen(f: number) {
        leinwand.fill(15)
        kino.kranz(80, 36, 62, f % 2, 4, 6)
        kino.kranz(80, 36, 40, 1 - f % 2, 5, 3)
        let r = 16 + (f % 2) * 2
        leinwand.fillCircle(80, 36, r, 4)
        leinwand.fillCircle(80, 36, r - 2, 15)
        krone_malen(80, 30, f % 2 == 0)
        if (f % 2 == 0) {
            kino.stern(80, 30, 7, 1)
        }
        // Goldfunken tanzen um die Krone.
        for (let k = 0; k < 6; k++) {
            leinwand.setPixel(80 + randint(0 - 26, 26), 36 + randint(0 - 20, 20), 5)
        }
    }

    function szene_schwur() {
        if (abbruch) {
            return
        }
        let satz1 = katalog.text(katalog.TextNr.INTRO_5)
        let satz2 = katalog.text(katalog.TextNr.INTRO_6)
        klang.studiokarte()
        let gesamt = erzaehl_laenge(satz1, satz2)
        for (let f = 0; f < gesamt; f++) {
            if (abbruch) {
                return
            }
            schwur_malen(f)
            erzaehl_text(satz1, satz2, f, 78, 94)
            kino.rahmen(0, 0, kino.blende_auf(f))
            zeigen()
            warte(70)
        }
        zublende()
        warte(400)
    }

    // ---- 7. Die Titelkarte mit dem Spielnamen ----
    // Dieselbe Folge wie bei der Studio-Karte (logo): Schlag, Welle, Glut. Sie schließt die Geschichte ab.
    function szene_titel() {
        if (abbruch) {
            return
        }
        let gross = image.doubledFont(image.font8)
        // a) Der Lichtdom baut sich aus dem Schwarz auf.
        for (let f = 0; f < 3; f++) {
            if (abbruch) {
                return
            }
            leinwand.fill(15)
            kino.kranz(80, 46, 60 + f * 30, f % 2, 14, 8 + f * 4)
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(100)
        }
        // b) Der Schlag.
        klang.einschlag()
        schlag()
        // c) Schockwelle, der Titel steht weißglühend da.
        const KERN = [1, 1, 5, 5]
        const RAND = [1, 5, 5, 4]
        for (let f = 0; f < 4; f++) {
            if (abbruch) {
                return
            }
            leinwand.fill(15)
            kino.welle(80, 46, 22 + f * 30, 1, 5, 4)
            kino.kranz(80, 46, 60 + f * 22, f % 2, 4, 8)
            schrift_mit_rand(leinwand,
                spiel.TITELZEILEN[0], 30, KERN[f], RAND[f], gross)
            schrift_mit_rand(leinwand,
                spiel.TITELZEILEN[1], 50, KERN[f], RAND[f], gross)
            kino.funken(80, 46, f + 1, 12, 1)
            kino.beben(f, kino.BALKEN)
            zeigen()
            warte(80)
        }
        // d) Abkühlen und Standbild mit Fanfare.
        klang.fanfare()
        for (let f = 0; f < 6; f++) {
            if (abbruch) {
                return
            }
            kino.abkuehlen()
            schrift_mit_rand(leinwand, spiel.TITELZEILEN[0], 30, 5, 4, gross)
            schrift_mit_rand(leinwand, spiel.TITELZEILEN[1], 50, 4, 2, gross)
            if (f % 2 == 0) {
                kino.stern(40, 34, 6, 1)
            } else {
                kino.stern(120, 58, 6, 1)
            }
            if (f >= 2) {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.VON_HACKER), 78, 13, 15, image.font8)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(160)
        }
        // Kein zublende(): ausklang() fährt Abblende und Vorhang.
    }

    // ---- 3. Die Kamerafahrt durch den Gang ----

    // Ein Wandring: je größer, desto näher und heller. takt sorgt für die abwechselnd dunklen Ringe und
    // für die Fackeln.
    function gang_ring(cx: number, cy: number, s: number, takt: number) {
        let h = Math.idiv(s * 3, 4)
        let farbe = 15
        let tx = 0
        let ty = 0
        let r = 0
        if (s > 95) {
            farbe = 11
        } else if (s > 46) {
            farbe = 14
        } else if (s > 20) {
            farbe = 12
        }
        if (takt % 2 == 1) {
            farbe = stein_dunkler(farbe)
        }
        leinwand.fillRect(cx - s, cy - h, s * 2, h * 2, farbe)
        // An jedem dritten Ring hängt links und rechts eine Fackel.
        if (s > 22 && takt % 3 == 1) {
            tx = Math.idiv(s * 8, 10)
            ty = cy - Math.idiv(h, 3)
            r = Math.idiv(s, 14)
            if (r < 1) {
                r = 1
            }
            leinwand.fillCircle(cx - tx, ty, r + 2, 4)
            leinwand.fillCircle(cx - tx, ty, r, 5)
            leinwand.fillCircle(cx + tx, ty, r + 2, 4)
            leinwand.fillCircle(cx + tx, ty, r, 5)
        }
    }

    function szene_gang() {
        if (abbruch) {
            return
        }
        // dehnung läuft von 100 auf 130 und fängt dann von vorn an. Weil die Ringe genau um den Faktor 1,3
        // auseinanderliegen, ist der Sprung unsichtbar. Man zählt nur zyklus hoch.
        let dehnung = 100
        let tempo = 4
        let zyklus = 0
        let wanken = 0
        let heben = 0
        let cx = 0
        let cy = 0
        let s = 0
        let ring = 0
        for (let f = 0; f < 32; f++) {
            if (abbruch) {
                return
            }
            leinwand.fill(15)
            // Leichtes Schwanken, als ginge da wirklich jemand.
            wanken = f % 8
            if (wanken > 4) {
                wanken = 8 - wanken
            }
            cx = GANG_X - 2 + wanken
            heben = f % 6
            if (heben > 3) {
                heben = 6 - heben
            }
            cy = GANG_Y - 1 + heben
            s = Math.idiv(300 * dehnung, 100)
            ring = 0
            while (s > 7) {
                gang_ring(cx, cy, s, ring + zyklus)
                s = Math.idiv(s * 10, 13)
                ring = ring + 1
            }
            // Die Kanten des Gangs laufen in die vier Ecken.
            leinwand.drawLine(0, 0, cx, cy, 15)
            leinwand.drawLine(159, 0, cx, cy, 15)
            leinwand.drawLine(0, 119, cx, cy, 15)
            leinwand.drawLine(159, 119, cx, cy, 15)
            // Weit vorne huscht der Dieb durchs Dunkel: Seine roten Augen flackern am Fluchtpunkt ...
            if (f >= 12 && f <= 26 && f % 3 != 0) {
                leinwand.fillRect(cx - 3, cy - 2, 2, 2, 2)
                leinwand.fillRect(cx + 2, cy - 2, 2, 2, 2)
            }
            // ... und seine Beute verliert Goldfunken.
            if (f >= 6) {
                for (let k = 0; k < 3; k++) {
                    leinwand.setPixel(cx + randint(0 - 12, 12), cy + randint(0 - 8, 8), 5)
                }
            }
            // Die Geschichte läuft als Untertitel unter der Fahrt mit. Es ist eine Zeile für die ganze Fahrt, zwei
            // nacheinander wären zu schnell zum Lesen.
            if (f >= 8) {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.INTRO_7), 96, 5, 15, image.font8)
            }
            // Das Schwanken wird zur Handkamera: Der Rahmen ruckt seitlich mit, keine Koordinate der Szene ändert sich.
            kino.rahmen(wanken - 2, 0, kino.blende_auf(f))
            zeigen()
            warte(55)
            dehnung = dehnung + tempo
            if (dehnung >= 130) {
                dehnung = dehnung - 30
                zyklus = zyklus + 1
            }
            // Es geht immer schneller nach unten.
            if (f % 11 == 10) {
                tempo = tempo + 2
            }
        }
        if (abbruch) {
            return
        }
        // Das letzte Bild kurz stehen lassen, damit der Satz ankommt.
        warte(800)
        zublende()
    }

    // ---- 4. Die Kammer hinter dem Gang ----

    // Mauer, Boden, Torbogen und zwei Fackeln.
    function kammer_malen(flacker: number) {
        mauerwerk_malen(leinwand, 0, 96, 28 - flacker * 2, 132 + flacker * 2, 42)
        boden_malen(leinwand, 96, 28, 132)
        // Torbogen: erst der Steinrahmen, dann die Schwärze darin.
        leinwand.fillRect(62, 38, 36, 58, 12)
        leinwand.fillCircle(80, 40, 18, 12)
        leinwand.fillRect(65, 41, 30, 55, 15)
        leinwand.fillCircle(80, 42, 15, 15)
        // Zwei Stufen vor dem Bogen.
        leinwand.fillRect(66, 92, 28, 2, 12)
        leinwand.fillRect(62, 94, 36, 2, 11)
        fackel_malen(leinwand, 28, flacker, 42)
        fackel_malen(leinwand, 132, flacker, 42)
        // Lichtpfützen auf dem Boden.
        leinwand.fillRect(19, 96, 19, 2, 5)
        leinwand.fillRect(123, 96, 19, 2, 5)
        // Lose Knochen im Staub.
        leinwand.fillRect(40, 104, 11, 2, 1)
        leinwand.fillRect(44, 100, 2, 6, 1)
        leinwand.fillCircle(112, 107, 4, 13)
        leinwand.setPixel(110, 106, 15)
        leinwand.setPixel(114, 106, 15)
    }

    // Eine Bildzeile links und rechts des Lichtkreises schwarz übermalen.
    function iris_zeile(yy: number, cx: number, hw: number) {
        let links = cx - hw
        if (links > 0) {
            leinwand.fillRect(0, yy, links, 1, 15)
        }
        let rechts = cx + hw
        if (rechts < 160) {
            leinwand.fillRect(rechts, yy, 160 - rechts, 1, 15)
        }
    }

    // Alles außerhalb des Kreises wird schwarz übermalt. So wirkt es, als reiche das Fackellicht nur so weit. Auch die
    // Lehrtafel „Das Verlies“ in lehre.ts benutzt diesen Lichtkreis. Gerechnet wird nur mit ganzen Zahlen und ohne
    // Math.sqrt: Die halbe Breite hw sinkt nur, während der Abstand dy zur Mitte wächst, sie steigt nie. Darum genügen
    // über das ganze Bild zusammen r Schritte abwärts statt 120 Wurzeln.
    export function iris(cx: number, cy: number, r: number) {
        let rr = r * r
        let hw = r
        let zeile = 0
        for (let dy = 0; dy < 120; dy++) {
            while (hw > 0 && hw * hw + dy * dy > rr) {
                hw = hw - 1
            }
            zeile = cy - dy
            if (zeile >= 0 && zeile < 120) {
                iris_zeile(zeile, cx, hw)
            }
            zeile = cy + dy
            if (dy > 0 && zeile >= 0 && zeile < 120) {
                iris_zeile(zeile, cx, hw)
            }
        }
    }

    function szene_kammer() {
        if (abbruch) {
            return
        }
        let r = 0
        klang.fackel()
        for (let f = 0; f < 18; f++) {
            if (abbruch) {
                return
            }
            kammer_malen(f % 2)
            // Staubiges Fackellicht: Zwei Keile fallen in den Raum, die Iris beschneidet sie gleich auf den Lichtkreis.
            kino.strahl(28, 44, 3, 80, 12, 14)
            kino.strahl(132, 44, 5, 80, 12, 14)
            // Der Funke fängt langsam Feuer und wird dann schnell hell.
            r = Math.idiv(f * f, 2) + randint(0, 3)
            if (r > 135) {
                r = 135
            }
            // Der Lichtkreis wandert von der linken Fackel zur Mitte.
            iris(28 + Math.idiv(f * 52, 17), 44, r)
            kino.rahmen(0, 0, kino.blende_auf(f))
            zeigen()
            warte(60)
        }
        if (abbruch) {
            return
        }
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.INTRO_8), 100, 5, 15, image.font8)
        kino.rahmen(0, 0, kino.BALKEN)
        zeigen()
        warte(700)
        if (abbruch) {
            return
        }
        // Im schwarzen Torbogen blitzen kurz zwei rote Augen auf, die Kamera zuckt zurück ...
        leinwand.fillRect(76, 58, 2, 2, 2)
        leinwand.fillRect(82, 58, 2, 2, 2)
        kino.beben(3, kino.BALKEN)
        zeigen()
        warte(400)
        // ... und sie sind wieder fort.
        leinwand.fillRect(76, 58, 2, 2, 15)
        leinwand.fillRect(82, 58, 2, 2, 15)
        kino.rahmen(0, 0, kino.BALKEN)
        zeigen()
        warte(600)
        zublende()
        warte(400)
    }

    // ---- 5. Das Fallgitter ----

    // Das Gitter. h ist die Höhe der Stangenspitzen.
    function gitter_malen(h: number) {
        // Die waagerechten Streben fallen mit nach unten.
        for (let by = h - 118; by < h - 8; by += 30) {
            if (by > 0 - 5) {
                leinwand.fillRect(0, by, 160, 5, 11)
                leinwand.fillRect(0, by, 160, 1, 13)
                leinwand.fillRect(0, by + 4, 160, 1, 12)
            }
        }
        // Die senkrechten Stangen mit ihren Spitzen.
        for (let bx = 5; bx < 158; bx += 14) {
            leinwand.fillRect(bx, 0, 5, h - 5, 11)
            leinwand.fillRect(bx, 0, 1, h - 5, 13)
            leinwand.fillRect(bx + 4, 0, 1, h - 5, 12)
            leinwand.drawLine(bx, h - 5, bx + 2, h, 11)
            leinwand.drawLine(bx + 4, h - 5, bx + 2, h, 12)
            leinwand.drawLine(bx + 1, h - 5, bx + 2, h - 1, 13)
        }
    }

    // Staub, der beim Aufprall hochspritzt.
    function staub_malen(f: number) {
        let hoehe = 6 + f * 4
        for (let k = 0; k < 20; k++) {
            leinwand.fillRect(randint(0, 155), 112 - randint(0, hoehe), 3, 2, 11)
        }
    }

    function szene_tor() {
        if (abbruch) {
            return
        }
        let h = 0
        let fz = 0
        // Das Gitter rauscht herunter, Fahrtstreifen ziehen hinterher.
        for (h = 10; h < 118; h += 13) {
            if (abbruch) {
                return
            }
            kammer_malen(h % 2)
            gitter_malen(h)
            for (let bx = 7; bx < 158; bx += 14) {
                leinwand.drawLine(bx, h - 26, bx, h - 10, 13)
            }
            kino.rahmen(0, 0, kino.blende_auf(fz))
            fz += 1
            zeigen()
            warte(30)
        }
        klang.tuer_zu()
        klang.einschlag()
        // Der Schlag: ein gleißendes Weißbild.
        schlag()
        // Aufprall: Das Gitter federt einmal zurück, Staub fliegt hoch, Steinsplitter regnen, eine Druckwelle aus Stein
        // rollt vom Boden weg, die Kamera schlägt aus und beruhigt sich.
        for (let f = 0; f < 6; f++) {
            if (abbruch) {
                return
            }
            h = 118
            if (f == 1) {
                h = 112
            }
            kammer_malen(f % 2)
            gitter_malen(h)
            staub_malen(f)
            for (let k = 0; k < 8; k++) {
                leinwand.fillRect(randint(0, 157), randint(0, 24) + f * 14, 2, 2, 12)
            }
            // Steinfunken sind grau, nicht golden.
            kino.ring(80, 118, 24 + f * 22, 11)
            kino.funken(80, 114, f + 1, 12, 11)
            kino.beben(f, kino.BALKEN)
            zeigen()
            warte(70)
        }
        // Schlussworte hinter den Gitterstäben: erst die Drohung, dann die trotzige Antwort des Helden. Je vier Bilder
        // zu 300 ms geben genug Zeit, beide Sätze wirklich zu lesen.
        for (let f = 0; f < 8; f++) {
            if (abbruch) {
                return
            }
            kammer_malen(f % 2)
            gitter_malen(118)
            if (f < 4) {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.INTRO_9), 100, 2, 15, image.font8)
            } else {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.INTRO_10), 100, 5, 15, image.font8)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            zeigen()
            warte(300)
        }
        zublende()
    }

    // ---- 8. Ausklang ----
    function ausklang() {
        if (abbruch) {
            return
        }
        for (let f = 0; f < 6; f++) {
            abdunkeln()
            // Die Kinobalken schließen sich mit der Abblende.
            kino.rahmen(0, 0, 8 + f * 10)
            zeigen()
            warte(70)
            if (abbruch) {
                return
            }
        }
    }

    // Spielt die Geschichte. Ein Druck auf A springt zur Studio-Karte. leinwand_an() legt die Leinwand und die
    // erste Station an.
    export function abspielen() {
        klang.musik_intro()
        szene_burg()
        szene_dieb()
        szene_gang()
        szene_kammer()
        szene_tor()
        szene_schwur()
    }

    // Die Studio-Karte „Calliope Hacker präsentiert“ mit der Figur, danach die Titelkarte und die Abblende. Es gibt
    // zwei Stationen: Ein Druck auf der Studio-Karte (ab SPERRE_STUDIOKARTE_MS) springt zur Titelkarte, ein Druck auf
    // der Titelkarte (ab SPERRE_MS) zu den Lehrtafeln. Die Studio-Karte hat ihren eigenen Klang, darum schweigt die
    // Intro-Musik darunter. Sie setzt mit der Titelkarte neu ein und trägt die Lehrtafeln, leinwand_aus() hält sie an.
    export function zeige_karten() {
        station(true)
        sperre_bis = game.runtime() + SPERRE_STUDIOKARTE_MS
        klang.musik_stopp()
        logo()
        station(true)
        klang.musik_intro()
        szene_titel()
        ausklang()
    }
}
