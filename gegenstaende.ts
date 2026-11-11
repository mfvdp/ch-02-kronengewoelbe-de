// Gegenstände und Dekoration: setzen und beim Wechsel der Ebene wegräumen.

function setze_gegenstand (spalte: number, zeile: number, typ: number) {
    let t: Sprite;
if (typ == 1) {
        t = sprites.create(BILD_SCHLUESSEL, ART_SCHLUESSEL)
    } else if (typ == 2) {
        t = sprites.create(BILD_HERZ, ART_HERZ)
    } else if (typ == 3) {
        t = sprites.create(BILD_FACKEL, ART_FACKEL)
    } else if (typ == 4) {
        t = sprites.create(BILD_TRUHE, ART_TRUHE)
    } else {
        t = sprites.create(BILD_MUENZE, ART_MUENZE)
    }
    // Zusätzlich GhostThroughTiles: Gegenstände brauchen nur die Überlappung mit dem Helden, keine Kachel-Ereignisse.
    // Ohne dieses Flag prüft die Physik für jeden Gegenstand in jedem Bild alle berührten Kacheln und legt dabei
    // kurzlebige Objekte an.
    t.setFlag(SpriteFlag.GhostThroughWalls, true)
    t.setFlag(SpriteFlag.GhostThroughTiles, true)
    tiles.placeOnTile(t, tiles.getTileLocation(spalte, zeile))
}

function setze_deko () {
    let x5: number;
let y5: number;
let d: Sprite;
let fk: Sprite;
for (let index = 0; index < 8 + raum_x.length; index++) {
        x5 = randint(1, RASTER_BREITE - 2)
        y5 = randint(1, RASTER_HOEHE - 2)
        if (raster[y5 * RASTER_BREITE + x5] == 1) {
            if (randint(0, 1) == 0) {
                d = sprites.create(DEKO_FASS, ART_DEKO)
            } else {
                d = sprites.create(DEKO_KNOCHEN, ART_DEKO)
            }
            // Reine Dekoration: Kein einziges Ereignis hängt daran, darum das volle Ghost-Flag. Es nimmt sie komplett
            // aus der Physik.
            d.setFlag(SpriteFlag.Ghost, true)
            d.z = -1
            tiles.placeOnTile(d, tiles.getTileLocation(x5, y5))
        }
    }
    for (let index = 0; index < 10; index++) {
        x5 = randint(1, RASTER_BREITE - 2)
        y5 = randint(1, RASTER_HOEHE - 2)
        if (raster[y5 * RASTER_BREITE + x5] == 0 && ist_boden(x5, y5 + 1)) {
            fk = sprites.create(BILD_FACKEL, ART_DEKO)
            fk.setFlag(SpriteFlag.Ghost, true)
            fk.z = -1
            tiles.placeOnTile(fk, tiles.getTileLocation(x5, y5))
            fk.y = fk.y + 3
        }
    }
}

// Ist die Spalte wx unter der Mauer wy bis hinunter zur Startreihe durchgehend Boden? Dann gehört die
// Mauer zum Startraum.
function boden_bis_start (wx: number, wy: number) {
    for (let y = wy + 1; y <= raum_y[0]; y++) {
        if (!(ist_boden(wx, y))) {
            return false
        }
    }
    return true
}

// Der Calliope Hacker als Bild an der Wand im Startraum von Ebene 1: ein kleiner Auftritt am Rand, reine Dekoration
// ohne Kollision (Ghost) und unter der Dunkelheit. Er ist sichtbar, sobald das Licht des Helden darauf fällt. Gesucht
// wird die nächste Wandkachel mit Boden darunter (eine sichtbare Mauerfläche) oberhalb des Startpunkts, höchstens sechs
// Spalten daneben und fünf Reihen darüber. Durchgang 0: Die Mauer gehört zum Startraum (Boden bis hinunter zur
// Startreihe) und hat links und rechts Wand, weil das Bild zwei Pixel breiter ist als eine Kachel. Durchgang 1: ohne
// die Nachbarn. Durchgang 2: irgendeine Mauer im Suchfeld. Nachgerechnet an 20 000 gebauten Ebenen: rund 94 % im ersten
// Durchgang, rund 99 % insgesamt. Sonst bleibt die Ebene ohne Bild.
function setze_wandbild () {
    let beste_x = -1
    let beste_y = -1
    let bester_abstand = 0
    let abstand = 0
    for (let durchgang = 0; durchgang < 3 && beste_x < 0; durchgang++) {
        for (let wy = raum_y[0] - 5; wy <= raum_y[0] - 1; wy++) {
            for (let wx = raum_x[0] - 6; wx <= raum_x[0] + 6; wx++) {
                if (wy < 1 || wx < 1 || wx > RASTER_BREITE - 2 ||
                    ist_boden(wx, wy) || !(ist_boden(wx, wy + 1))) {
                    continue
                }
                if (durchgang == 0 && (ist_boden(wx - 1, wy) || ist_boden(wx + 1, wy))) {
                    continue
                }
                if (durchgang < 2 && !(boden_bis_start(wx, wy))) {
                    continue
                }
                abstand = (wx - raum_x[0]) * (wx - raum_x[0]) +
                    (wy - raum_y[0]) * (wy - raum_y[0])
                if (beste_x < 0 || abstand < bester_abstand) {
                    beste_x = wx
                    beste_y = wy
                    bester_abstand = abstand
                }
            }
        }
    }
    if (beste_x < 0) {
        return
    }
    // Eine zufällige Wandfackel an derselben Stelle weicht dem Bild.
    for (let f of sprites.allOfKind(ART_DEKO)) {
        if (betrag(f.x - (beste_x * 16 + 8)) < 20 && betrag(f.y - (beste_y * 16 + 8)) < 16) {
            f.destroy()
        }
    }
    let bild = sprites.create(BILD_HACKER_WAND, ART_DEKO)
    bild.setFlag(SpriteFlag.Ghost, true)
    bild.z = -1
    tiles.placeOnTile(bild, tiles.getTileLocation(beste_x, beste_y))
    // Über der Mauerkante, mitten auf der Wandfläche.
    bild.y = bild.y - 2
}

function raeume_auf () {
    for (let a of sprites.allOfKind(SpriteKind.Enemy)) {
        a.destroy()
    }
    for (let c of sprites.allOfKind(ART_SCHLUESSEL)) {
        c.destroy()
    }
    for (let e of sprites.allOfKind(ART_HERZ)) {
        e.destroy()
    }
    for (let f of sprites.allOfKind(ART_MUENZE)) {
        f.destroy()
    }
    for (let g of sprites.allOfKind(ART_TRUHE)) {
        g.destroy()
    }
    for (let h of sprites.allOfKind(ART_FACKEL)) {
        h.destroy()
    }
    for (let m of sprites.allOfKind(ART_DEKO)) {
        m.destroy()
    }
    for (let n of sprites.allOfKind(ART_GEGNERSCHUSS)) {
        n.destroy()
    }
    // Auch die eigenen Feuerbälle: Sonst fliegt ein Schuss aus der alten Ebene noch bis zu 800 ms durch die neue.
    for (let z of sprites.allOfKind(SpriteKind.Projectile)) {
        z.destroy()
    }
    for (let q of woelkchen) {
        q.destroy()
    }
    woelkchen = []
    gegner_liste = []
}
