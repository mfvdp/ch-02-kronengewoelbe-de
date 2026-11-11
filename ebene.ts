// Eine ganze Ebene aufbauen.

function baue_ebene () {
    let schluessel_raum: number;
let wurf: number;
let herz_grenze: number;
raeume_auf()
    let versuche = 0
    while (true) {
        leeres_raster()
        erzeuge_raeume()
        versuche += 1
        // Notausgang: erzeuge_raeume schafft normalerweise 6 bis 10 Räume, 4 sind praktisch sicher. Ohne diese Grenze
        // würde eine Pechsträhne den Speicher mit neu gebauten Rastern fluten.
        if (raum_x.length >= 4 || versuche >= 8) {
            break;
        }
    }
    letzter_raum = raum_x.length - 1
    raster[raum_y[letzter_raum] * RASTER_BREITE + raum_x[letzter_raum]] = 2
    setze_fallen()
    zeichne_raster()
    setze_deko()
    if (ebene == 1) {
        setze_wandbild()
    }
    schluessel_anzahl = 0
    anzeige_schluessel.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(held, tiles.getTileLocation(raum_x[0], raum_y[0]))
    scene.cameraFollowSprite(held)
    // Ein Boss alle BOSS_JEDE Ebenen, und auf der Endboss-Ebene immer, auch wenn sie kein Vielfaches davon ist.
    boss_aktiv = ebene % BOSS_JEDE == 0 || ebene == ENDBOSS_EBENE
    if (boss_aktiv) {
        setze_gegner(raum_x[letzter_raum], raum_y[letzter_raum], 5)
    } else {
        // letzter_raum ist der Raum mit der Treppe. Läge der Schlüssel dort, stünde er auf der Treppenkachel, und die
        // Ebene wäre beim Aufsammeln sofort vorbei. letzter_raum ist praktisch immer mindestens 3 (die Schleife oben
        // verlangt vier Räume und gibt erst nach acht Versuchen auf), der Bereich bleibt also gültig.
        schluessel_raum = randint(1, letzter_raum - 1)
        setze_gegenstand(raum_x[schluessel_raum], raum_y[schluessel_raum], 1)
    }
    for (let o = 1; o < letzter_raum + 1; o++) {
        // Auch der Grundgegner zählt gegen GEGNER_MAX. noch_ein_gegner prüft die Grenze nur für Zweit- und Drittgegner.
        // Ohne diese Abfrage kämen bei vielen Räumen weitere Grundgegner dazu, wenn die Liste längst voll ist. Der Boss
        // steht schon in der Liste, er wird oben vor dieser Schleife gesetzt.
        if (gegner_liste.length < GEGNER_MAX) {
            setze_gegner(raum_x[o], raum_y[o], zufalls_art())
        }
        // Zweiter und dritter Gegner kommen als sanfte Steigerung dazu (siehe noch_ein_gegner in gegner.ts), mit
        // Versatz, sonst stünden sie genau übereinander.
        if (noch_ein_gegner(ZWEITER_AB, ZWEITER_MAX)) {
            setze_gegner(raum_x[o], raum_y[o], zufalls_art(), 1)
        }
        if (noch_ein_gegner(DRITTER_AB, DRITTER_MAX)) {
            setze_gegner(raum_x[o], raum_y[o], zufalls_art(), 2)
        }
        // Je tiefer, desto öfter liegt ein Herz statt einer Münze im Raum. Das ist ein kleiner Ausgleich dafür, dass
        // unten mehr Gegner und mehr Fallen warten.
        herz_grenze = 2 + Math.min(Math.idiv(ebene, HERZ_BONUS_JE), HERZ_BONUS_MAX)
        wurf = randint(0, 9)
        if (wurf < herz_grenze) {
            setze_gegenstand(raum_x[o], raum_y[o], 2)
        } else if (wurf < herz_grenze + 2) {
            setze_gegenstand(raum_x[o], raum_y[o], 3)
        } else if (wurf < herz_grenze + 4) {
            setze_gegenstand(raum_x[o], raum_y[o], 4)
        } else {
            setze_gegenstand(raum_x[o], raum_y[o], 5)
        }

    }
    // Eine laufende Fackel endet mit der Ebene. Ohne das Zurücksetzen bliebe licht_bis in der Zukunft stehen, der
    // spätere Ablauf fände den Radius dann schon auf LICHT_NORMAL vor und bliebe wirkungslos.
    licht_bis = 0
    setze_licht(LICHT_NORMAL)
    zeige_ebene()
    klang.musik_verlies(ebene)
    if (boss_aktiv) {
        if (ebene == ENDBOSS_EBENE) {
            held.sayText(katalog.text(katalog.TextNr.KRONENRAEUBER), 2000, false)
        } else {
            held.sayText(katalog.formatiere(katalog.TextNr.EBENE_BOSS, ebene), 1800, false)
        }
        klang.boss_erscheint()
    } else {
        held.sayText(katalog.formatiere(katalog.TextNr.EBENE_SPRECHBLASE, ebene), 1300, false)
    }
}
