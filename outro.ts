// Outro: der Sieg. Es läuft, wenn der Kronenräuber fällt (ausgelöst in ereignisse.ts, auf der Ebene ENDBOSS_EBENE).
//
// Der Held tritt an den umgekippten Kronenräuber heran, die Krone schwebt zu ihm hinüber, er setzt sie auf und entkommt
// durch das Lichtportal. Dann folgt game.over(true).
//
// Gemalt wird wie im Intro in ein Vollbild von 160 × 120 Pixeln. Es ist aber kein Hintergrund, denn die Tilemap läge
// vor einem Hintergrundbild. Darum hängt das Bild an einem Anzeige-Sprite mit z = 300, das über allem liegt. Wer das
// Bild ändert, ändert damit sofort die Anzeige, genau wie bei der Dunkelheit.
//
// Vorher räumt abspielen() auf: Gegner, Gegenstände und vor allem die 9,6 KB große Dunkelheit werden entfernt. Dann ist
// sicher Platz für die Leinwand. A überspringt die Szenen wie im Intro.
namespace outro {
    // Wird wahr, sobald A gedrückt wurde.
    let eile = false
    // Bis zu dieser Zeit (game.runtime) verfällt ein Druck. Der Abspann beginnt mitten im Kampf, oft mit gehämmertem A.
    // Ein Schuss, der zu spät kommt, soll nicht gleich den ganzen Sieg überspringen.
    let sperre_bis = 0

    // Wartet in kleinen Häppchen und merkt sich einen Tastendruck.
    function warte(dauer: number) {
        let rest = dauer
        let schritt = 0
        while (rest > 0) {
            if (a_gedrueckt && game.runtime() < sperre_bis) {
                a_gedrueckt = false
            }
            if (a_gedrueckt) {
                eile = true
                return
            }
            schritt = 30
            if (rest < schritt) {
                schritt = rest
            }
            pause(schritt)
            rest = rest - schritt
        }
        if (a_gedrueckt && game.runtime() >= sperre_bis) {
            eile = true
        }
    }

    // Der Thronsaal des Kronenräubers: Wand, Boden, zwei Fackeln. Rechts vorne am Rand steht der Calliope Hacker als
    // Zuschauer, von hinten wie auf der Studio-Karte. Er ist doppelt so groß gemalt wie die Figuren der Krönung, denn
    // in einfacher Größe ging der schwarze Pulli vor den dunklen Steinen unter. Mit jubel = true reißt er im Takt der
    // Fackeln die Arme hoch, sonst steht er still.
    function saal_malen(flacker: number, jubel: boolean = false) {
        mauerwerk_malen(leinwand, 0, 96, 20 - flacker * 2, 140 + flacker * 2, 44)
        boden_malen(leinwand, 96, 20, 140)
        fackel_malen(leinwand, 20, flacker, 44)
        fackel_malen(leinwand, 140, flacker, 44)
        if (jubel && flacker == 1) {
            intro.doppelt_malen(BILD_ZUSCHAUER_JUBEL, 136, 79)
        } else {
            intro.doppelt_malen(BILD_ZUSCHAUER, 136, 79)
        }
    }

    // Eine kleine Krone, wie sie dem Helden passt. ziel_x und ziel_y sind die linke obere Ecke der Zacken. s ist der
    // Maßstab: Bei s = 1 ist der Reif acht Pixel breit, bei s = 2 sechzehn. s = 2 gilt für den Helden in doppelter
    // Größe bei der Krönung.
    function kroenchen_malen(ziel_x: number, ziel_y: number, s: number = 1) {
        leinwand.fillRect(ziel_x, ziel_y + 2 * s, 8 * s, 2 * s, 5)
        leinwand.fillRect(ziel_x, ziel_y, 2 * s, 2 * s, 5)
        leinwand.fillRect(ziel_x + 3 * s, ziel_y, 2 * s, 2 * s, 5)
        leinwand.fillRect(ziel_x + 6 * s, ziel_y, 2 * s, 2 * s, 5)
        leinwand.fillRect(ziel_x + 4 * s, ziel_y + 2 * s, s, s, 2)
    }

    // Sternchen kreisen über dem Kronenräuber am Boden.
    function sterne_malen(cx: number, cy: number, f: number) {
        if (f % 3 == 0) {
            leinwand.setPixel(cx - 8, cy, 5)
            leinwand.setPixel(cx + 6, cy - 3, 1)
        } else if (f % 3 == 1) {
            leinwand.setPixel(cx, cy - 5, 1)
            leinwand.setPixel(cx + 8, cy + 1, 5)
        } else {
            leinwand.setPixel(cx - 5, cy - 4, 5)
            leinwand.setPixel(cx + 2, cy + 2, 1)
        }
    }

    export function abspielen() {
        // Das Spiel anhalten und Platz schaffen. moveSprite(0, 0) friert den Helden ein. Sonst könnte er während des
        // Abspanns noch unsichtbar auf die Treppe laufen und eine neue Ebene bauen.
        spiel_laeuft = false
        klang.musik_stopp()
        // Die Siegesmusik trägt den Abspann bis zur Abspann-Karte: D-Dur als Auflösung der d-Moll-Geschichte.
        klang.musik_sieg()
        controller.moveSprite(held, 0, 0)
        if (dunkel != null) {
            dunkel.destroy()
            dunkel = null
        }
        // Auch die Bildreferenz lösen: Der Sprite ist weg, aber dunkel_bild würde das Bild der Dunkelheit sonst weiter
        // im Speicher festhalten.
        dunkel_bild = null
        raeume_auf()
        a_gedrueckt = false
        eile = false
        sperre_bis = game.runtime() + 1000
        // Die Leinwand: ein Anzeige-Sprite über allem.
        leinwand = image.create(160, 120)
        let leinwand_sprite = sprites.create(leinwand, ART_ANZEIGE)
        leinwand_sprite.setFlag(SpriteFlag.Ghost, true)
        leinwand_sprite.setFlag(SpriteFlag.RelativeToCamera, true)
        leinwand_sprite.z = 300
        leinwand_sprite.setPosition(80, 60)
        // Der Kronenräuber ist umgekippt: flipY stellt ihn auf den Kopf.
        let boss_umgekippt = BILD_BOSS.clone()
        boss_umgekippt.flipY()
        let gross = image.doubledFont(image.font8)
        // 1) Der Held tritt an den Besiegten heran, die Blende öffnet sich.
        for (let f = 0; f < 11; f++) {
            if (eile) {
                break
            }
            saal_malen(f % 2)
            intro.doppelt_malen(boss_umgekippt, 100, 64)
            sterne_malen(116, 58, f)
            intro.krone_malen(116, 56, f % 2 == 0)
            leinwand.drawTransparentImage(BILD_HELD_RECHTS, -16 + f * 10, 78)
            kino.rahmen(0, 0, kino.blende_auf(f))
            warte(130)
        }
        // 2) Die Krönung. Teil A: Die Krone schwebt hinüber, und die Zeit selbst wird langsamer: Jedes Bild steht
        // länger als das davor. Ferne Glocken.
        const KROENUNG_MS = [140, 140, 160, 200, 260, 330, 420]
        klang.glocke()
        for (let f = 0; f < 7; f++) {
            if (eile) {
                break
            }
            let kx = 116 - f * 4
            let ky = 56 + f * 2
            saal_malen(f % 2, true)
            intro.doppelt_malen(boss_umgekippt, 100, 64)
            leinwand.drawTransparentImage(BILD_HELD_RECHTS, 84, 78)
            kino.kranz(kx, ky, 24 + f * 5, f % 2, 4, 5)
            intro.krone_malen(kx, ky, true)
            kino.stern(kx, ky, 5 + (f % 2) * 2, 1)
            kino.rahmen(0, 0, kino.BALKEN)
            warte(KROENUNG_MS[f])
        }
        // Teil B: der Schlag, die Krone berührt den Kopf.
        if (!eile) {
            klang.krone()
            leinwand.fill(1)
            kino.rahmen(0, 0, kino.BALKEN)
            warte(70)
        }
        // Teil C: die Heldeneinstellung. Der Gekrönte in doppelter Größe, Schockwelle, Lichtkränze, Konfetti.
        for (let f = 0; f < 5; f++) {
            if (eile) {
                break
            }
            leinwand.fill(15)
            kino.welle(80, 50, 20 + f * 28, 1, 5, 4)
            kino.kranz(80, 50, 150, f % 2, 5, 14)
            kino.kranz(80, 50, 150, 1 - f % 2, 4, 7)
            intro.doppelt_malen(BILD_HELD_RECHTS, 64, 42)
            kroenchen_malen(72, 36, 2)
            kino.konfetti(f)
            kino.beben(f, kino.BALKEN)
            warte(90)
        }
        // Teil D: Standbild im Goldlicht.
        klang.truhe()
        for (let f = 0; f < 5; f++) {
            if (eile) {
                break
            }
            leinwand.fill(15)
            kino.kranz(80, 50, 150, f % 2, 14, 12)
            leinwand.fillCircle(80, 54, 44, 4)
            leinwand.fillCircle(80, 54, 32, 5)
            intro.doppelt_malen(BILD_HELD_RECHTS, 64, 42)
            kroenchen_malen(72, 36, 2)
            kino.stern(80, 38, 8, 1)
            kino.konfetti(f + 5)
            schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.KOENIG_KEHRT_ZURUECK), 96, 5, 15, image.font8)
            kino.rahmen(0, 0, kino.BALKEN)
            warte(200)
        }
        // 3) Die Flucht als Scherenschnitt: Der Held ist eine Silhouette vor dem gleißenden Portal, nur seine
        // Krone bleibt golden.
        let held_schatten = BILD_HELD_LINKS.clone()
        for (let c = 1; c < 16; c++) {
            held_schatten.replace(c, 15)
        }
        for (let f = 0; f < 8; f++) {
            if (eile) {
                break
            }
            saal_malen(f % 2, true)
            intro.doppelt_malen(boss_umgekippt, 100, 64)
            kino.strahl(6, 70, 0, 180, 26 + f * 5, 13)
            kino.strahl(6, 70, 1, 150, 14, 1)
            kino.strahl(6, 70, 15, 150, 14, 1)
            leinwand.fillCircle(6, 70, 22 + f * 5, 13)
            leinwand.fillCircle(6, 70, 14 + f * 5, 1)
            leinwand.drawTransparentImage(held_schatten, 84 - f * 10, 78)
            kroenchen_malen(88 - f * 10, 75)
            // Der Film schließt sich langsam um die Silhouette.
            kino.rahmen(0, 0, kino.BALKEN + f * 2)
            warte(120)
        }
        // 4) Das Licht flutet den Saal.
        for (let f = 0; f < 6; f++) {
            if (eile) {
                break
            }
            leinwand.fillCircle(6, 70, 20 + f * 32, 1)
            kino.rahmen(0, 0, 22)
            warte(110)
        }
        // 5) Weißer Ausklang: Die Lichtflut kühlt über Gold, Rot, Braun und Grau ins Schwarz ab, derselbe Nachhall wie
        // auf der Studio-Karte (intro.logo). Die Klammer schließt sich.
        leinwand.fill(1)
        for (let f = 0; f < 6; f++) {
            if (eile) {
                break
            }
            kino.abkuehlen()
            kino.rahmen(0, 0, 22)
            warte(130)
        }
        // Ab hier übernimmt der Abspann die Musik.
        klang.musik_stopp()
        // 6) Abspann-Karte 1: ENTKOMMEN. Sie läuft immer, auch nach einem Druck auf A, weil man sie sich mit dem
        // Sieg verdient hat.
        klang.abspann()
        let start = 0
        if (eile) {
            start = 3
        }
        for (let f = start; f < 4; f++) {
            leinwand.fill(15)
            kino.kranz(80, 24, 130, f % 2, 14, 10)
            intro.krone_malen(80, 20, f % 2 == 0)
            schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.ENTKOMMEN), 40, 5, 4, gross)
            if (f >= 1) {
                schrift_mit_rand(leinwand,
                    katalog.text(katalog.TextNr.KRONE_ZURUECK), 62, 13, 15, image.font8)
            }
            if (f >= 2) {
                schrift_mit_rand(leinwand, katalog.formatiere(katalog.TextNr.PUNKTE, info.score()),
                    74, 5, 15, image.font8)
            }
            if (f >= 3) {
                schrift_mit_rand(leinwand, katalog.formatiere(katalog.TextNr.EBENEN,
                    ebene), 86, 4, 15, image.font8)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            if (f < 3) {
                // warte statt pause: Ein Druck auf A beschleunigt nur den Aufbau, das fertige Standbild
                // darunter bleibt stehen.
                warte(220)
            }
        }
        pause(1400)
        // 7) Abspann-Karte 2: CALLIOPE HACKER, genau die Studio-Karte aus dem Vorspann (mit der Figur), samt seinem
        // Akkord von 2 Sekunden. Das Spiel beginnt und endet mit demselben Bild und demselben Klang. Der Akkord trägt
        // außerdem die lange Standzeit, statt sie still zu lassen.
        klang.logo_steht()
        start = 0
        if (eile) {
            start = 5
        }
        for (let f = start; f < 6; f++) {
            leinwand.fill(15)
            kino.kranz(80, 51, 110, f % 2, 14, 8)
            schrift_mit_rand(leinwand, "CALLIOPE", intro.NAME_Y, 5, 4, gross)
            schrift_mit_rand(leinwand, "HACKER", intro.HACKER_Y, 4, 2, gross)
            intro.studio_malen()
            if (f % 2 == 0) {
                kino.stern(26, intro.NAME_Y + 4, 5, 1)
            } else {
                kino.stern(134, intro.HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.DANKE),
                    intro.ZEILE_Y, 13, 15, image.font8)
            }
            kino.rahmen(0, 0, kino.BALKEN)
            if (f < 5) {
                warte(150)
            }
        }
        // Absichtlich länger als die erste Abspann-Karte: Das Schild ist die letzte Einstellung des Spiels und soll in
        // Ruhe gelesen werden.
        pause(2600)
        // Der Vorhang schließt sich.
        for (let f = 0; f < 4; f++) {
            kino.rahmen(0, 0, 8 + f * 17)
            pause(70)
        }
        // Aufräumen, den Bestwert sichern, den Siegesbildschirm zeigen.
        klang.musik_stopp()
        leinwand_sprite.destroy()
        leinwand = null
        info.saveHighScore()
        game.over(true)
    }
}
