// Lehrtafeln: das Tutorial im Vorspann. Es läuft nach der Geschichte (intro.abspielen) und vor dem Titelbild. Sechs
// Tafeln erklären die Steuerung, das Ziel, die Schätze, die Gegner und das Verlies selbst.
//
// Alles ist zeitgesteuert, und A überspringt (wie im Intro): Jede Schleife fragt intro.abgebrochen() ab und fällt
// dann sofort durch.
//
// Gemalt wird in dasselbe Vollbild leinwand wie im Intro, also kein neues Bild im Flash und kein zusätzlicher
// Arbeitsspeicher. Die Sprites kommen in doppelter Größe aus grafik.ts (intro.doppelt_malen). Die Symbole (Steuerkreuz,
// Tasten, Karte, Pfeil) sind reine Rechteck- und Kreismalereien.
//
// Schriftbreite: font5 und font8 sind 6 Pixel je Zeichen breit. Eine Zeile auf der Tafel hat höchstens 22 Zeichen (x 14
// bis 145), so bleiben links und rechts 4 Pixel Luft bis zum inneren Rahmen (x 9 und 150); ab 24 Zeichen liegt die
// Schrift auf dem Rahmen. Über die volle Breite passen 26. Die unterste Zeile steht bei y 103: Unterlängen (g, p) enden
// bei 110, der schwarze Rand der Schrift bei 111, der innere Rahmen liegt bei 112. Die Texte kommen aus dem Katalog
// (texte.ts). Wer einen Text ändert, achtet auf diese Zeichenzahl, sonst ragt er über den Rand. Umlaute und Akzente
// sind erlaubt, font8 kann sie zeichnen.
//
// Wichtig: Diese Datei muss in pxt.json in der Liste „files“ stehen (nach intro.ts), sonst wird sie gar nicht
// mit übersetzt (compiliert).
namespace lehre {
    // Die Stellschrauben fürs Tempo: TAKT ist der Bildwechsel in Millisekunden, BILDER die Zahl der Bilder einer
    // normalen Tafel. 9 × 550 ms sind rund 5 s je Tafel. Lieber zu langsam als zu schnell: Wer fertig ist, drückt A.
    const TAKT = 550
    const BILDER = 9
    // Jeder Auftritt eines Gegners dauert GEGNER_BILDER × GEGNER_TAKT, also gut zwei Sekunden. Name plus drei Zeilen
    // wollen gelesen sein.
    const GEGNER_TAKT = 420
    const GEGNER_BILDER = 5

    // Die Tafel: Steinwand mit einem schwarzen Feld in der Mitte. Der innere Rahmen glimmt im Fackeltakt, so lebt die
    // Seite, ohne dass die Schrift zappelt.
    function tafel_malen(flacker: number) {
        mauerwerk_malen(leinwand, 0, 120, 6 - flacker * 2, 154 + flacker * 2, 58)
        leinwand.fillRect(8, 6, 144, 108, 15)
        leinwand.drawRect(8, 6, 144, 108, 12)
        leinwand.drawRect(9, 7, 142, 106, 11 + flacker * 2)
    }

    // ---- Kleine Maler für Symbole ----

    // Das Steuerkreuz, 16 × 16 Pixel.
    function kreuz_malen(ziel_x: number, ziel_y: number) {
        leinwand.fillRect(ziel_x + 5, ziel_y, 6, 16, 11)
        leinwand.fillRect(ziel_x, ziel_y + 5, 16, 6, 11)
        leinwand.fillRect(ziel_x + 6, ziel_y + 1, 4, 14, 12)
        leinwand.fillRect(ziel_x + 1, ziel_y + 6, 14, 4, 12)
    }

    // Eine runde Taste mit Buchstabe, 16 × 16 Pixel.
    function taste_malen(ziel_x: number, ziel_y: number, beschriftung: string) {
        leinwand.fillCircle(ziel_x + 8, ziel_y + 8, 8, 12)
        leinwand.fillCircle(ziel_x + 8, ziel_y + 8, 7, 2)
        leinwand.print(beschriftung, ziel_x + 5, ziel_y + 4, 1, image.font8)
    }

    // Eine Mini-Übersichtskarte in den Farben der echten Karte auf Taste B: Boden grau, Treppe gelb, der Held als
    // grüner Punkt (Farbe 7).
    function karte_symbol(ziel_x: number, ziel_y: number) {
        leinwand.fillRect(ziel_x, ziel_y, 18, 14, 15)
        leinwand.drawRect(ziel_x, ziel_y, 18, 14, 12)
        leinwand.fillRect(ziel_x + 2, ziel_y + 2, 5, 4, 12)
        leinwand.fillRect(ziel_x + 6, ziel_y + 4, 4, 2, 12)
        leinwand.fillRect(ziel_x + 9, ziel_y + 6, 6, 5, 12)
        leinwand.setPixel(ziel_x + 3, ziel_y + 3, 7)
        leinwand.fillRect(ziel_x + 12, ziel_y + 8, 2, 2, 5)
    }

    // Ein Pfeil nach rechts, er zeigt vom Schlüssel zur Treppe.
    function pfeil_malen(ziel_x: number, ziel_y: number, laenge: number) {
        leinwand.fillRect(ziel_x, ziel_y - 1, laenge, 3, 5)
        leinwand.drawLine(ziel_x + laenge, ziel_y, ziel_x + laenge - 5, ziel_y - 5, 5)
        leinwand.drawLine(ziel_x + laenge, ziel_y, ziel_x + laenge - 5, ziel_y + 5, 5)
    }

    // ---- Tafel 1: Steuerung ----
    function seite_steuerung(flacker: number) {
        tafel_malen(flacker)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.STEUERUNG), 12, 5, 15, image.font8)
        kreuz_malen(14, 26)
        leinwand.drawTransparentImage(BILD_HELD, 34, 26)
        leinwand.print(katalog.text(katalog.TextNr.LAUFEN_ZIELEN), 56, 31, 13, image.font8)
        taste_malen(14, 50, "A")
        leinwand.drawTransparentImage(BILD_FEUER, 34, 50)
        leinwand.print(katalog.text(katalog.TextNr.FEUERBALL), 56, 55, 13, image.font8)
        taste_malen(14, 74, "B")
        karte_symbol(34, 75)
        leinwand.print(katalog.text(katalog.TextNr.KARTE_HALTEN), 56, 79, 13, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.BLICK_1), 94, 11, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.BLICK_2), 104, 11, 15, image.font8)
    }

    // ---- Tafel 2: das Ziel ----
    function seite_ziel(flacker: number) {
        tafel_malen(flacker)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.ZIEL), 12, 5, 15, image.font8)
        intro.doppelt_malen(BILD_SCHLUESSEL, 26, 26)
        pfeil_malen(64, 42, 26)
        intro.doppelt_malen(KACHEL_TREPPE, 96, 26)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.SCHLUESSEL_FINDEN), 62, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.TREPPE_NUTZEN), 72, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.formatiere(katalog.TextNr.ALLE_EBENEN,
            BOSS_JEDE), 84, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.BOSS_TREPPE), 94, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.formatiere(katalog.TextNr.KRONE_EBENE, ENDBOSS_EBENE),
            103, 5, 15, image.font8)
    }

    // ---- Tafel 3: Schätze ----
    function seite_schaetze(flacker: number) {
        tafel_malen(flacker)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.SCHAETZE), 12, 5, 15, image.font8)
        leinwand.drawTransparentImage(BILD_HERZ, 16, 26)
        leinwand.print(katalog.text(katalog.TextNr.HERZ_INFO), 40, 31, 13, image.font8)
        leinwand.drawTransparentImage(BILD_FACKEL, 16, 46)
        leinwand.print(katalog.text(katalog.TextNr.FACKEL_INFO), 40, 51, 13, image.font8)
        leinwand.drawTransparentImage(BILD_TRUHE, 16, 66)
        leinwand.print(katalog.text(katalog.TextNr.TRUHE_INFO), 40, 71, 13, image.font8)
        leinwand.drawTransparentImage(BILD_MUENZE, 16, 86)
        leinwand.print(katalog.text(katalog.TextNr.MUENZE_INFO), 40, 91, 13, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.ALLES_NEHMEN), 103, 5, 15, image.font8)
    }

    // Tafel 4: die Parade der Gegner. Bild, Name und Hinweise je Gegner stehen in if-Ketten. Felder wären hier teurer,
    // sie lägen die ganze Spielzeit im Arbeitsspeicher.
    function gegner_bild(art: number) {
        if (art == 1) {
            return BILD_SCHLEIM
        }
        if (art == 2) {
            return BILD_FLEDERMAUS
        }
        if (art == 3) {
            return BILD_MAGIER
        }
        if (art == 4) {
            return BILD_WAECHTER
        }
        if (art == 5) {
            return BILD_BOSS
        }
        return BILD_SKELETT
    }

    function gegner_name(art: number) {
        if (art == 1) {
            return katalog.text(katalog.TextNr.SCHLEIM)
        }
        if (art == 2) {
            return katalog.text(katalog.TextNr.FLEDERMAUS)
        }
        if (art == 3) {
            return katalog.text(katalog.TextNr.MAGIER)
        }
        if (art == 4) {
            return katalog.text(katalog.TextNr.WAECHTER)
        }
        if (art == 5) {
            return katalog.text(katalog.TextNr.BOSS)
        }
        return katalog.text(katalog.TextNr.SKELETT)
    }

    // Die Zeilen „Ab Ebene N.“ entstehen aus den Konstanten in einstellungen.ts. Tutorial und Spiel können also nie
    // auseinanderlaufen, auch wenn man die Werte ändert.
    function gegner_zeile(art: number, welche: number) {
        if (art == 0) {
            if (welche == 0) {
                return katalog.text(katalog.TextNr.FOLGT)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.ZWEI_TREFFER)
            }
        } else if (art == 1) {
            if (welche == 0) {
                return katalog.text(katalog.TextNr.ZAEH)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.DREI_TREFFER)
            }
        } else if (art == 2) {
            if (welche == 0) {
                return katalog.text(katalog.TextNr.FLIEGT)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.EIN_TREFFER)
            }
            if (welche == 2) {
                return katalog.formatiere(katalog.TextNr.AB_EBENE, EBENE_FLEDERMAUS)
            }
        } else if (art == 3) {
            if (welche == 0) {
                return katalog.text(katalog.TextNr.ABSTAND)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.SCHIESST)
            }
            if (welche == 2) {
                return katalog.formatiere(katalog.TextNr.AB_EBENE, EBENE_MAGIER)
            }
        } else if (art == 4) {
            if (welche == 0) {
                return katalog.text(katalog.TextNr.VON_HINTEN)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.NUR_RUECKEN)
            }
            if (welche == 2) {
                return katalog.formatiere(katalog.TextNr.AB_EBENE, EBENE_WAECHTER)
            }
        } else if (art == 5) {
            if (welche == 0) {
                return katalog.formatiere(katalog.TextNr.BOSS_ALLE, BOSS_JEDE)
            }
            if (welche == 1) {
                return katalog.text(katalog.TextNr.BOSS_SCHLUESSEL)
            }
            if (welche == 2) {
                return katalog.text(katalog.TextNr.WIRD_WUETEND)
            }
        }
        return ""
    }

    function seite_gegner(art: number, flacker: number) {
        tafel_malen(flacker)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.GEGNER_TITEL), 12, 5, 15, image.font8)
        intro.doppelt_malen(gegner_bild(art), 64, 26)
        schrift_mit_rand(leinwand, gegner_name(art), 62, 1, 15, image.font8)
        for (let welche = 0; welche < 3; welche++) {
            if (gegner_zeile(art, welche).length > 0) {
                schrift_mit_rand(leinwand, gegner_zeile(art,
                    welche), 76 + welche * 10, 13, 15, image.font8)
            }
        }
    }

    // Tafel 5: das Verlies selbst. Neben dem Schlussgruß ist es die einzige Seite ohne Tafel und Rahmen, sie zeigt den
    // echten Blick ins Spiel samt Lichtkreis.
    function seite_verlies(flacker: number) {
        leinwand.fill(15)
        boden_malen(leinwand, 30, 64, 64)
        leinwand.drawTransparentImage(KACHEL_STACHEL, 76, 40)
        leinwand.drawTransparentImage(BILD_HELD, 48, 40)
        // Der Lichtkreis atmet leicht im Fackeltakt.
        intro.iris(64, 48, 32 + flacker * 2)
        // Die Schrift kommt erst nach der Iris, sonst wird sie schwarz übermalt.
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.VERLIES_TITEL), 8, 5, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.DUNKEL_HINWEIS), 76, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.STACHELN), 86, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.FACKEL_HILFE), 96, 13, 15, image.font8)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.KARTE_HILFE), 106, 13, 15, image.font8)
    }

    // ---- Tafel 6: Schlussgruß, ein Standbild ----
    function seite_schluss() {
        leinwand.fill(15)
        schrift_mit_rand(leinwand, katalog.text(katalog.TextNr.VIEL_GLUECK), 44, 5, 4, image.font8)
        intro.doppelt_malen(BILD_HELD, 64, 68)
    }

    // ---- Spielt alle Tafeln. A überspringt den Rest sofort. ----
    export function abspielen() {
        for (let f = 0; f < BILDER; f++) {
            if (intro.abgebrochen()) {
                return
            }
            seite_steuerung(f % 2)
            intro.zeigen()
            intro.warte(TAKT)
        }
        for (let f = 0; f < 8; f++) {
            if (intro.abgebrochen()) {
                return
            }
            seite_ziel(f % 2)
            intro.zeigen()
            intro.warte(TAKT)
        }
        for (let f = 0; f < BILDER; f++) {
            if (intro.abgebrochen()) {
                return
            }
            seite_schaetze(f % 2)
            intro.zeigen()
            intro.warte(TAKT)
        }
        for (let art = 0; art <= 5; art++) {
            for (let f = 0; f < GEGNER_BILDER; f++) {
                if (intro.abgebrochen()) {
                    return
                }
                seite_gegner(art, f % 2)
                intro.zeigen()
                intro.warte(GEGNER_TAKT)
            }
        }
        for (let f = 0; f < BILDER; f++) {
            if (intro.abgebrochen()) {
                return
            }
            seite_verlies(f % 2)
            intro.zeigen()
            intro.warte(TAKT)
        }
        if (intro.abgebrochen()) {
            return
        }
        seite_schluss()
        intro.zeigen()
        intro.warte(1500)
    }
}
