// Gegner: Datenklasse, Erzeugung, Suche, Schüsse und die Steuerung des Bosses.

class Gegner {
    sprite: Sprite
    art: number
    leben: number
    // Die Leben beim Start, sie ändern sich nicht. Daraus rechnet boss_ki die Schwelle für die Wut als Bruchteil.
    leben_max: number
    tempo: number
    blick_x: number
    blick_y: number
    alt_x: number
    alt_y: number
    schuss_zeit: number
    wuetend: boolean
    constructor(s: Sprite, art: number, leben: number, tempo: number) {
        this.sprite = s
        this.art = art
        this.leben = leben
        this.leben_max = leben
        this.tempo = tempo
        this.blick_x = 1
        this.blick_y = 0
        this.alt_x = 0
        this.alt_y = 0
        this.schuss_zeit = 0
        this.wuetend = false
    }
    
}

// versatz rückt den zweiten (1) und dritten (2) Gegner eines Raumes aus der Raummitte. Ohne Versatz stünden sie genau
// übereinander: Man sähe nur einen, und die Physik würde beide ständig auseinanderschieben.
function setze_gegner (spalte: number, zeile: number, art: number, versatz: number = 0) {
    // Eine Stufe je STUFE_TAKT Ebenen, aufgerundet, so bleibt Ebene 1 bei Stufe 1. Ab STUFE_MAX werden die Gegner nicht
    // schneller, sonst würden sie irgendwann den Helden überholen, dessen Tempo bei TEMPO_HELD_MAX endet.
    let stufe = Math.min(Math.idiv(ebene + STUFE_TAKT - 1, STUFE_TAKT), STUFE_MAX)
    bild = BILD_SKELETT
    leben = 2
    tempo = 20 + stufe * 2
    if (art == 1) {
        bild = BILD_SCHLEIM
        leben = 3
        tempo = 16 + stufe * 2
    } else if (art == 2) {
        bild = BILD_FLEDERMAUS
        leben = 1
        tempo = 34 + stufe * 2
    } else if (art == 3) {
        bild = BILD_MAGIER
        leben = 2
        tempo = 20 + stufe
    } else if (art == 4) {
        // Der Blick startet nach rechts (siehe Konstruktor von Gegner), also muss auch der Schild rechts starten. Bild
        // und Prüfung „von hinten“ dürfen nie auseinanderlaufen.
        bild = BILD_WAECHTER_RECHTS
        leben = 4
        tempo = 18 + stufe * 2
    } else if (art == 5) {
        // Das Leben des Bosses wächst mit der Ebene, aber nur bis BOSS_LEBEN_MAX. Sonst würde der Kampf in tiefen
        // Ebenen endlos dauern.
        bild = BILD_BOSS
        leben = Math.min(BOSS_LEBEN_BASIS + ebene, BOSS_LEBEN_MAX)
        tempo = 16 + stufe
        if (ebene >= ENDBOSS_EBENE) {
            // Der Kronenräuber: Die gestohlene Krone wird auf eine Kopie des Bossbildes gemalt (Reihe 0 ist dort frei,
            // in Reihe 1 ersetzt der Reif die Kopfkante). Das Original in grafik.ts bleibt unverändert. Er tritt
            // außerdem mit allen Leben an, denn das ist der Endkampf.
            bild = BILD_BOSS.clone()
            for (let zx = 5; zx <= 10; zx++) {
                bild.setPixel(zx, 1, 5)
            }
            bild.setPixel(7, 1, 2)
            bild.setPixel(8, 1, 2)
            bild.setPixel(5, 0, 5)
            bild.setPixel(7, 0, 5)
            bild.setPixel(8, 0, 5)
            bild.setPixel(10, 0, 5)
            leben = BOSS_LEBEN_MAX
        }
    }
    s = sprites.create(bild, SpriteKind.Enemy)
    if (art == 2) {
        s.setFlag(SpriteFlag.GhostThroughWalls, true)
    }
    if (art == 5) {
        s.setScale(2, ScaleAnchor.Middle)
    }
    tiles.placeOnTile(s, tiles.getTileLocation(spalte, zeile))
    // Die Raummitte hat in jeder Richtung mindestens eine freie Kachel (erzeuge_raeume: der kleinste Raum ist 3 × 3).
    // Darum bleiben 12 und 8 Pixel Versatz immer auf dem Boden.
    if (versatz == 1) {
        s.x = s.x + 12
        s.y = s.y - 8
    } else if (versatz == 2) {
        s.x = s.x - 12
        s.y = s.y + 8
    }
    gegner_liste.push(new Gegner(s, art, leben, tempo))
}

// Würfelt, ob noch ein Gegner in den Raum kommt. Die Chance beginnt in der Ebene ab_ebene bei einem Zehntel und wächst
// mit jeder Ebene um ein Zehntel, bis zur Obergrenze deckel (ebenfalls in Zehnteln).
function noch_ein_gegner (ab_ebene: number, deckel: number) {
    if (gegner_liste.length >= GEGNER_MAX) {
        return false
    }
    let z = ebene - ab_ebene + 1
    if (z < 1) {
        return false
    }
    if (z > deckel) {
        z = deckel
    }
    return randint(1, 10) <= z
}

// Dreht den Schild des Wächters sichtbar in Blickrichtung. Nur so sieht der Spieler, wo „hinten“ ist, denn nur Treffer
// genau in den Rücken zählen. Alle vier Bilder sind gleich groß und entstehen beim Start. setImage steigt selbst aus,
// wenn das Bild schon das richtige ist.
function setze_waechter_bild (w: Gegner) {
    if (w.blick_y > 0) {
        w.sprite.setImage(BILD_WAECHTER_RUNTER)
    } else if (w.blick_y < 0) {
        w.sprite.setImage(BILD_WAECHTER_HOCH)
    } else if (w.blick_x < 0) {
        w.sprite.setImage(BILD_WAECHTER)
    } else {
        w.sprite.setImage(BILD_WAECHTER_RECHTS)
    }
}

function finde_gegner (s: Sprite) {
    for (let q of gegner_liste) {
        if (q.sprite == s) {
            return q
        }
    }
    return null
}

function gegner_schuss (schuetze: Sprite, vx: number, vy: number) {
    r = sprites.createProjectileFromSprite(BILD_MAGIEKUGEL, schuetze, vx, vy)
    r.setKind(ART_GEGNERSCHUSS)
    r.lifespan = 2500
    r.setFlag(SpriteFlag.DestroyOnWall, true)
}
function zufalls_art () {
    // Die Schwellen stehen in einstellungen.ts. Die Lehrtafeln im Vorspann lesen dieselben Konstanten, damit ihre
    // Zeilen „Ab Ebene N.“ immer stimmen.
    hoechste_art = 1
    if (ebene >= EBENE_FLEDERMAUS) {
        hoechste_art = 2
    }
    if (ebene >= EBENE_MAGIER) {
        hoechste_art = 3
    }
    if (ebene >= EBENE_WAECHTER) {
        hoechste_art = 4
    }
    return randint(0, hoechste_art)
}

function boss_ki(m: Gegner, dx: number, dy: number) {
    let u = m.sprite
    // Wütend im letzten Drittel des Kampfes: Die Grenze ist ein Bruchteil der Leben, damit die wilde Phase auch bei
    // starken Bossen nicht zur Nebensache schrumpft.
    if (m.leben <= Math.idiv(m.leben_max, BOSS_WUT_TEIL) && !m.wuetend) {
        m.wuetend = true
        m.tempo = m.tempo + 16
        u.startEffect(effects.fire, 500)
        scene.cameraShake(4, 400)
    }
    
    if (betrag(dx) > betrag(dy)) {
        u.vy = 0
        u.vx = vorzeichen(dx) * m.tempo
    } else {
        u.vx = 0
        u.vy = vorzeichen(dy) * m.tempo
    }
    
    if (game.runtime() > m.schuss_zeit) {
        m.schuss_zeit = game.runtime() + 2200
        gegner_schuss(u, 60, 0)
        gegner_schuss(u, 0 - 60, 0)
        gegner_schuss(u, 0, 60)
        gegner_schuss(u, 0, 0 - 60)
        if (m.wuetend) {
            gegner_schuss(u, 45, 45)
            gegner_schuss(u, 45, 0 - 45)
            gegner_schuss(u, 0 - 45, 45)
            gegner_schuss(u, 0 - 45, 0 - 45)
        }
        
    }
    
}
