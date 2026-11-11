// Alle Ereignis-Handler. Diese Datei läuft nach arten.ts und grafik.ts, weil ART_* und KACHEL_* schon bei der
// Anmeldung gelesen werden.

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    a_gedrueckt = true
})
sprites.onOverlap(SpriteKind.Player, ART_HERZ, function (spieler, ding) {
    ding.destroy(effects.hearts, 200)
    info.changeLifeBy(1)
    klang.herz()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (feuer, gegner_sprite) {
    let von_hinten: any;
let boss_schluessel: Sprite;
treffer_gegner = finde_gegner(gegner_sprite)
    // Kein Feuer-Effekt am Geschoss: Jeder Effekt legt eine Partikelquelle mit 750 ms Laufzeit und zwei Bildkopien an.
    // Bei Dreifach-Schnellfeuer wären das 15 je Sekunde. Der Treffer ist am Gegner (spray und
    // verpuffen) sichtbar genug.
    feuer.destroy()
    if (treffer_gegner == null) {
        return
    }
    if (treffer_gegner.art == 4) {
        von_hinten = feuer.vx * treffer_gegner.blick_x > 0 || feuer.vy * treffer_gegner.blick_y > 0
        if (!(von_hinten)) {
            gegner_sprite.startEffect(effects.spray, 100)
            klang.block()
            return
        }
    }
    treffer_gegner.leben = treffer_gegner.leben - 1
gegner_x = gegner_sprite.x
    gegner_y = gegner_sprite.y
    if (treffer_gegner.leben <= 0) {
        // Kein Zerfall in die eigenen Farben: Der Gegner verschwindet sofort und verpufft in hellen Sternen, der Boss
        // etwas größer. Vorher gehen alle Partikel am Gegner aus, auch die schon fliegenden. Sonst treiben die roten
        // Funken des Wut-Feuers (boss_ki) noch rund 0,7 s über den Sternen und dem Schlüssel. (particleSources gibt es
        // erst nach der ersten Partikelquelle. Es geht rückwärts, weil destroy() die Quelle aus der Liste nimmt.)
        let quellen = game.currentScene().particleSources
        if (quellen) {
            for (let i = quellen.length - 1; i >= 0; i--) {
                if (quellen[i].anchor == gegner_sprite) {
                    quellen[i].clear()
                    quellen[i].destroy()
                }
            }
        }
        gegner_sprite.destroy()
        verpuffen(gegner_x, gegner_y, treffer_gegner.art == 5)
        if (treffer_gegner.art == 5) {
            boss_aktiv = false
            info.changeScoreBy(100)
            scene.cameraShake(6, 700)
            klang.boss_verpufft()
            if (ebene >= ENDBOSS_EBENE) {
                // Das war der Kronenräuber: Die Krone ist frei, das Spiel ist gewonnen. Es gibt noch einen Bonus, dann
                // übernimmt der Abspann (er blockiert hier, wie der Kasten am Spielende).
                info.changeScoreBy(400)
                outro.abspielen()
                return
            }
            boss_schluessel = sprites.create(BILD_SCHLUESSEL, ART_SCHLUESSEL)
            // Nicht SpriteFlag.Ghost! Ghost schließt GhostThroughSprites ein, damit hätte der Schlüssel keine
            // Überlappungen mehr und wäre nicht aufsammelbar. Alle anderen Gegenstände nutzen ebenfalls
            // GhostThroughWalls (siehe setze_gegenstand in gegenstaende.ts).
            boss_schluessel.setFlag(SpriteFlag.GhostThroughWalls, true)
            boss_schluessel.setPosition(gegner_x, gegner_y)
        } else {
            info.changeScoreBy(10)
            klang.gegner_verpufft()
        }
    } else {
        // Der Trefferblitz kommt vom startEffect. Eine Kopie des Bildes bräuchte es dafür nicht: Sie sähe genauso aus
        // und würde bei jedem Treffer nur Speicher kosten.
        gegner_sprite.startEffect(effects.spray, 100)
        klang.treffer()
    }
})

sprites.onOverlap(SpriteKind.Player, ART_FACKEL, function (spieler, ding) {
    ding.destroy(effects.fire, 200)
    licht_bis = game.runtime() + FACKEL_DAUER
    setze_licht(LICHT_FACKEL)
    held.sayText(katalog.text(katalog.TextNr.FUND_FACKEL), 700, false)
    klang.fackel()
})

sprites.onOverlap(SpriteKind.Player, ART_MUENZE, function (spieler, ding) {
    ding.destroy()
    info.changeScoreBy(5)
    klang.muenze()
})
sprites.onOverlap(SpriteKind.Player, ART_SCHLUESSEL, function (spieler, ding) {
    schluessel_anzahl += 1
    ding.destroy(effects.confetti, 200)
    anzeige_schluessel.setFlag(SpriteFlag.Invisible, false)
    held.sayText(katalog.text(katalog.TextNr.FUND_SCHLUESSEL), 800, false)
    klang.schluessel()
})

sprites.onOverlap(SpriteKind.Player, ART_TRUHE, function (spieler, truhe) {
    truhe.destroy(effects.confetti, 300)
    klang.truhe()
    truhen_wahl = randint(0, 3)
    if (truhen_wahl == 0 && !(dreifach)) {
        dreifach = true
        held.sayText(katalog.text(katalog.TextNr.FUND_DREIFACH), 1200, false)
    } else if (truhen_wahl == 1 && nachladen > NACHLADEN_SCHNELL) {
        nachladen = NACHLADEN_SCHNELL
        held.sayText(katalog.text(katalog.TextNr.FUND_SCHNELLFEUER), 1200, false)
    } else if (truhen_wahl == 2 && tempo_held < TEMPO_HELD_MAX) {
        // Ohne Obergrenze würden sich die Stiefel unbegrenzt stapeln, und der Held wäre irgendwann unsteuerbar schnell.
        // Ist das Maximum erreicht, fällt die Truhe auf das Extra-Herz zurück.
        tempo_held = Math.min(tempo_held + TEMPO_STIEFEL, TEMPO_HELD_MAX)
        controller.moveSprite(held, tempo_held, tempo_held)
        held.sayText(katalog.text(katalog.TextNr.FUND_STIEFEL), 1200, false)
    } else {
        info.changeLifeBy(1)
        held.sayText(katalog.text(katalog.TextNr.FUND_EXTRA_HERZ), 1200, false)
    }
})

scene.onOverlapTile(SpriteKind.Player, KACHEL_STACHEL, function (spieler, ort) {
    if (game.runtime() < schutz_bis) {
        return
    }
    bekomme_treffer(1)
    spieler.startEffect(effects.spray, 200)
})
scene.onOverlapTile(SpriteKind.Player, KACHEL_TREPPE, function (spieler, ort) {
    if (boss_aktiv || schluessel_anzahl == 0) {
        // Dieser Handler feuert in jedem Bild, solange der Held auf der Kachel steht. Ohne die Sperre baut sayText in
        // jedem Bild einen neuen Textkasten und zeichnet ihn Zeichen für Zeichen: rund 40 KB Kleinmüll je Sekunde, der
        // den Speicher zerstückelt, während der Spieler ratlos dort steht.
        if (game.runtime() < hinweis_bis) {
            return
        }
        hinweis_bis = game.runtime() + 1200
        if (boss_aktiv) {
            held.sayText(katalog.text(katalog.TextNr.BOSS_ZUERST), 900, false)
        } else {
            held.sayText(katalog.text(katalog.TextNr.SCHLUESSEL_ZUERST), 900, false)
        }
        return
    }
    // Die Tiefe zählt: Je weiter unten, desto mehr Punkte gibt die geschaffte Ebene. Das gleicht aus, dass tiefer
    // seltener Münzen liegen (Gewichtung der Herzen in baue_ebene).
    info.changeScoreBy(ebene * 5)
    ebene += 1
    klang.ebene_geschafft()
    baue_ebene()
})

sprites.onOverlap(ART_GEGNERSCHUSS, SpriteKind.Player, function (kugel, spieler) {
    kugel.destroy(effects.spray, 100)
    bekomme_treffer(1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (spieler, gegner_sprite) {
    if (game.runtime() < schutz_bis) {
        return
    }
    bekomme_treffer(1)
    if (gegner_sprite.x > spieler.x) {
        gegner_sprite.x = gegner_sprite.x + 22
    } else {
        gegner_sprite.x = gegner_sprite.x - 22
    }
    if (gegner_sprite.y > spieler.y) {
        gegner_sprite.y = gegner_sprite.y + 22
    } else {
        gegner_sprite.y = gegner_sprite.y - 22
    }
})

info.onLifeZero(function () {
    // Erst stoppen, dann den Text zeigen: zeige_abschied blockiert, und ohne dieses Flag laufen Gegner-KI und Feuern
    // während des Dialogs weiter.
    spiel_laeuft = false
    // Platz schaffen, bevor der Abschiedstext und game.over noch einmal 9,6 KB am Stück anfordern: Die Dunkelheit wird
    // nicht mehr gebraucht, ihr Bild darf der Müllsammler holen.
    if (dunkel != null) {
        dunkel.destroy()
        dunkel = null
    }
    dunkel_bild = null
    klang.spiel_vorbei()
    // Ein eigener Kasten statt game.showLongText: A zählt erst nach einer Sekunde (siehe
    // katalog.zeige_abschied in menues.ts).
    katalog.zeige_abschied(katalog.formatiere(katalog.TextNr.ENDE, ebene, info.score()))
    // game.over(false) sichert den Bestwert nicht. Ohne diesen Aufruf zeigt das Titelbild für immer „Bestpunkte: 0“.
    info.saveHighScore()
    game.over(false)
})

// Verpuffen: Ein besiegter Gegner wird zu einem kurzen Sternenwölkchen in Gelb und Weiß. Das ist absichtlich kein
// Partikeleffekt (jede Partikelquelle legt Bildkopien an, siehe oben), sondern ein einziges Geist-Sprite mit drei
// festen Bildern aus dem Flash und begrenzter Lebensdauer. Auch viele Besiegte kurz nacheinander kosten
// so kaum Speicher.
function verpuffen (x: number, y: number, gross: boolean) {
    let p = sprites.create(BILD_WOELKCHEN_1, ART_WOELKCHEN)
    p.setFlag(SpriteFlag.Ghost, true)
    p.setPosition(x, y)
    p.z = 6
    p.lifespan = WOELKCHEN_DAUER
    if (gross) {
        p.setScale(2)
    }
    woelkchen.push(p)
}

// Schaltet die Bilder der laufenden Wölkchen nach ihrer Restlaufzeit weiter und vergisst die verschwundenen.
// Läuft aus game.onUpdate.
function schalte_woelkchen_weiter () {
    let p: Sprite
    for (let i = woelkchen.length - 1; i >= 0; i--) {
        p = woelkchen[i]
        if (p.flags & sprites.Flag.Destroyed) {
            woelkchen.removeAt(i)
        } else if (p.lifespan < Math.idiv(WOELKCHEN_DAUER, 3)) {
            if (p.image != BILD_WOELKCHEN_3) {
                p.setImage(BILD_WOELKCHEN_3)
            }
        } else if (p.lifespan < Math.idiv(WOELKCHEN_DAUER * 2, 3)) {
            if (p.image != BILD_WOELKCHEN_2) {
                p.setImage(BILD_WOELKCHEN_2)
            }
        }
    }
}
