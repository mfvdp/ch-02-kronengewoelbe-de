// Der Held: Feuerbälle schießen, das Bild zur Blickrichtung wählen und Treffer einstecken.

function schiesse (rx: number, ry: number) {
    p = sprites.createProjectileFromSprite(BILD_FEUER,
        held, rx * FEUER_TEMPO, ry * FEUER_TEMPO)
    p.lifespan = 800
    p.setFlag(SpriteFlag.DestroyOnWall, true)
}

function feuere_ab () {
    if (game.runtime() < schuss_frei_ab) {
        return
    }
    schuss_frei_ab = game.runtime() + nachladen
    schiesse(blick_x, blick_y)
    if (dreifach) {
        schiesse(blick_x + blick_y, blick_y + blick_x)
        schiesse(blick_x - blick_y, blick_y - blick_x)
    }
    klang.schuss()
}

// Wählt das Bild passend zur Blickrichtung. Alle vier Bilder sind gleich groß, die Trefferfläche ändert sich also
// nicht. setImage steigt selbst aus, wenn das Bild schon das richtige ist.
function setze_held_bild() {
    if (blick_y > 0) {
        held.setImage(BILD_HELD_RUNTER)
    } else if (blick_y < 0) {
        held.setImage(BILD_HELD_HOCH)
    } else if (blick_x < 0) {
        held.setImage(BILD_HELD_LINKS)
    } else if (blick_x > 0) {
        held.setImage(BILD_HELD_RECHTS)
    }
}

function bekomme_treffer (menge: number) {
    if (game.runtime() < schutz_bis) {
        return
    }
    schutz_bis = game.runtime() + SCHUTZ_ZEIT
    info.changeLifeBy(0 - menge)
    klang.held_getroffen()
    scene.cameraShake(4, 250)
}
