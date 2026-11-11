// Ein Zufalls-Verlies-Spiel für MakeCode Arcade.
//
// Steuerkreuz = laufen, A = Feuerball. Finde den Schlüssel, suche die Treppe, immer tiefer. Alle 5 Ebenen wartet ein
// Boss. Truhen geben Verbesserungen.
//
// Diese Datei enthält nur den Spielstart und die Update-Schleifen. Alles andere liegt in eigenen Dateien. Die
// Reihenfolge in pxt.json ist die Reihenfolge, in der sie ausgeführt werden.

// Zeigt bei eingeschalteter DIAGNOSE eine Farbe und hält kurz an, damit der Bildaufbau sie überhaupt zeichnen kann.
// Ohne DIAGNOSE kostet der Aufruf nichts.
function zeige_diagnose(farbe: number) {
    if (!DIAGNOSE) {
        return
    }
    scene.setBackgroundColor(farbe)
    pause(700)
}

katalog.richte_ein()
zeige_diagnose(8)
titelschirm()
zeige_diagnose(6)
scene.setBackgroundColor(15)
info.setLife(START_LEBEN)
info.setScore(0)
held = sprites.create(BILD_HELD, SpriteKind.Player)
held.z = 5
controller.moveSprite(held, tempo_held, tempo_held)
zeige_diagnose(7)
if (DUNKELHEIT) {
    // Die Dunkelheit hängt fest vor der Kamera (160 × 120 Pixel). Das Lichtloch wandert im Bild zur Bildschirmposition
    // des Helden (licht_malen, unten in game.onUpdate).
    dunkel_bild = image.create(160, 120)
    dunkel = sprites.create(dunkel_bild, ART_ANZEIGE)
    dunkel.setFlag(SpriteFlag.Ghost, true)
    dunkel.setFlag(SpriteFlag.RelativeToCamera, true)
    dunkel.z = 90
    dunkel.setPosition(80, 60)
}
anzeige_schluessel = sprites.create(BILD_SCHLUESSEL, ART_ANZEIGE)
anzeige_schluessel.setFlag(SpriteFlag.Ghost, true)
anzeige_schluessel.setFlag(SpriteFlag.RelativeToCamera, true)
anzeige_schluessel.setPosition(80, 10)
anzeige_schluessel.z = 100
// Übersichtskarte und Ebenen-Schild jetzt anlegen, solange der Speicher noch am Stück ist, und nie wieder
// mitten im Spiel.
anzeige_anlegen()
zeige_diagnose(5)
setze_licht(LICHT_NORMAL)
// Einmal sofort malen: game.onUpdate läuft erst nach baue_ebene(), bis dahin wäre die Fläche sonst ganz durchsichtig.
if (dunkel != null) {
    licht_malen()
}
zeige_diagnose(4)
baue_ebene()
zeige_diagnose(2)
game.onUpdate(function () {
    if (!(spiel_laeuft)) {
        return
    }
    if (held.vx != 0 || held.vy != 0) {
        if (betrag(held.vx) > betrag(held.vy)) {
            blick_y = 0
            blick_x = vorzeichen(held.vx)
        } else {
            blick_x = 0
            blick_y = vorzeichen(held.vy)
        }
        setze_held_bild()
    }
    if (controller.A.isPressed()) {
        feuere_ab()
    }
    if (woelkchen.length > 0) {
        schalte_woelkchen_weiter()
    }
    if (dunkel != null) {
        licht_malen()
    }
})
game.onUpdateInterval(280, function () {
    let v: Sprite;
let dx: number;
let dy: number;
let entfernung: any;
let steckt: any;
let dreht: boolean;
let quer: boolean;
if (!(spiel_laeuft)) {
        return
    }
    for (let w of gegner_liste) {
        if (w.leben > 0) {
            v = w.sprite
dx = held.x - v.x
            dy = held.y - v.y
            entfernung = betrag(dx) + betrag(dy)
            if (entfernung > 100 && w.art != 5) {
                v.vx = 0
                v.vy = 0
            } else {
                steckt = betrag(v.x - w.alt_x) < 1 &&
                    betrag(v.y - w.alt_y) < 1
                w.alt_x = v.x
w.alt_y = v.y
dreht = true
                if (w.art == 4 && game.runtime() < w.schuss_zeit) {
                    dreht = false
                }
                if (dreht) {
                    // Wenn dx == 0 und dy == 0 ist, bleibt die alte Blickrichtung erhalten. vorzeichen(0) wäre 0, und
                    // mit der Blickrichtung (0, 0) wäre der Wächter aus jeder Richtung unverwundbar (die Prüfung „von
                    // hinten“ in ereignisse.ts würde nie wahr). Er stünde still und zeigte das falsche Schildbild.
                    if (betrag(dx) > betrag(dy)) {
                        w.blick_x = vorzeichen(dx)
w.blick_y = 0
                    } else if (dy != 0) {
                        w.blick_x = 0
w.blick_y = vorzeichen(dy)
                    }
                    if (w.art == 4) {
                        w.schuss_zeit = game.runtime() + 1400
                        setze_waechter_bild(w)
                    }
                }
                if (w.art == 2) {
                    v.vx = vorzeichen(dx) * w.tempo
                    v.vy = vorzeichen(dy) * w.tempo + randint(0 - 25, 25)
                } else if (w.art == 3) {
                    if (entfernung < 70) {
                        v.vx = 0 - vorzeichen(dx) * w.tempo
                        v.vy = 0 - vorzeichen(dy) * w.tempo
                    } else if (entfernung > 115) {
                        v.vx = vorzeichen(dx) * w.tempo
                        v.vy = vorzeichen(dy) * w.tempo
                    } else {
                        v.vx = 0
                        v.vy = 0
                    }
                    if (game.runtime() > w.schuss_zeit) {
                        w.schuss_zeit = game.runtime() + 1700
gegner_schuss(v, vorzeichen(dx) * 70, vorzeichen(dy) * 70)
                    }
                } else if (w.art == 4) {
                    v.vx = w.blick_x * w.tempo
                    v.vy = w.blick_y * w.tempo
                } else if (w.art == 5) {
                    boss_ki(w, dx, dy)
                } else {
                    quer = betrag(dx) > betrag(dy)
                    if (steckt) {
                        quer = !(quer)
                    }
                    if (randint(0, 6) == 0) {
                        quer = !(quer)
                    }
                    if (quer) {
                        v.vy = 0
                        v.vx = vorzeichen(dx) * w.tempo
                    } else {
                        v.vx = 0
                        v.vy = vorzeichen(dy) * w.tempo
                    }
                }
            }
        }
    }
})
game.onUpdateInterval(120, function () {
    if (!(spiel_laeuft)) {
        return
    }
    if (game.runtime() < schutz_bis) {
        held.setFlag(SpriteFlag.Invisible, Math.idiv(game.runtime(), 120) % 2 == 0)
    } else {
        held.setFlag(SpriteFlag.Invisible, false)
    }
    if (licht_bis > 0 && game.runtime() > licht_bis) {
        licht_bis = 0
        setze_licht(LICHT_NORMAL)
    }
})
