// Grafiken: alle Kacheln, Sprites und abgeleiteten Bilder.
//
// Farben im Verlies (Buchstaben wie in den Bildern):
//   f schwarz = Umrisse, Fugen, Tiefe
//   c dunkelviolett = Grundton von Boden und Fels
//   b graumauve = Mauerstein, Metall, Stein im Licht
//   d hellbeige = Glanzkante, Haut
//   4, 5, e = warme Töne (Fackel, Gold, Holz)
//
// Sparsam sein: Jedes neue Bild kostet Platz im Flash. Darum entstehen Varianten erst beim Start aus clone() plus
// fillRect, drawLine und setPixel.
let KACHEL_TREPPE: Image = null
let KACHEL_STACHEL: Image = null
let BILD_SKELETT: Image = null
let BILD_SCHLEIM: Image = null
let BILD_FLEDERMAUS: Image = null
let BILD_MAGIER: Image = null
let BILD_WAECHTER: Image = null
// Blickrichtungen des Wächters. Er blockt alles außer Treffern genau in den Rücken (ereignisse.ts). Darum muss der
// Schild sichtbar dorthin zeigen, wo vorne ist, sonst kann niemand erkennen, wo hinten wäre.
let BILD_WAECHTER_RECHTS: Image = null
let BILD_WAECHTER_HOCH: Image = null
let BILD_WAECHTER_RUNTER: Image = null
let BILD_BOSS: Image = null
let BILD_HERZ: Image = null
let BILD_SCHLUESSEL: Image = null
let BILD_MUENZE: Image = null
let BILD_FEUER: Image = null
let BILD_TRUHE: Image = null
let BILD_FACKEL: Image = null
let BILD_MAGIEKUGEL: Image = null
let DEKO_FASS: Image = null
let DEKO_KNOCHEN: Image = null
// Blickrichtungen des Helden. BILD_HELD bleibt das Standardbild.
let BILD_HELD_RUNTER: Image = null
let BILD_HELD_HOCH: Image = null
let BILD_HELD_LINKS: Image = null
let BILD_HELD_RECHTS: Image = null


// Mauerwerk im Läuferverband: Die Fugen liegen auf y = 0, 4, 8 und 12, die Stoßfugen der Reihen sind um einen halben
// Stein versetzt. So passen die Kacheln nahtlos aneinander, auch über den Rand.
let KACHEL_WAND = img`
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b c b b b f b b b b b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b b b f b b b c b b b f b b b b
    c c c f c c c c c c c f c c c c
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b b b b b f b b b c b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b c b f b b b b b b b f b b c b
    c c c f c c c c c c c f c c c c
    `
// Abgetretene Steinplatten: vier Platten je Kachel, die Fugen laufen über den Kachelrand hinweg weiter.
let KACHEL_BODEN = img`
    b b c c c c c f b b b c c c c f
    c c c c c c c f c c c c c c c f
    c c c f c c c f c c c c c c c f
    c c c c c c c f c c c c f c c f
    c c c c c c c f c c c c c c c f
    c f c c c c c f c c c c c c c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b c c c c f b b c c c c c f
    c c c c c c c f c c c c c c c f
    c c c c c f c f c c c f c c c f
    c c c c c c c f c c c c c c c f
    c c f c c c c f c c c c c c c f
    c c c c c c c f c c c c c f c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    `
// Treppe: fünf Stufen mit Tiefenwirkung, oben schmal und dunkel, nach vorne breiter und heller. So sieht man sofort,
// dass es hinabgeht, und nicht nur ein gestreiftes Muster.
KACHEL_TREPPE = img`
    f f f f f f f f f f f f f f f f
    f f f f f f b b b b f f f f f f
    f f f f f f c c c c f f f f f f
    f f f f f b b b b b b f f f f f
    f f f f f c c c c c c f f f f f
    f f f f f c c c c c c f f f f f
    f f f f b b b b b b b b f f f f
    f f f f c c c c c c c c f f f f
    f f f f c c c c c c c c f f f f
    f f f d d d d d d d d d d f f f
    f f f b b b b b b b b b b f f f
    f f f c c c c c c c c c c f f f
    f f d d d d d d d d d d d d f f
    f f b b b b b b b b b b b b f f
    f f c c c c c c c c c c c c f f
    f f f f f f f f f f f f f f f f
    `
// Held von vorne: goldener Helm, blaues Wams mit hellblauem Wappen. Alle vier Blickrichtungen haben denselben Umriss (x
// von 2 bis 13 und y von 0 bis 15), damit sich die Trefferfläche beim Umschalten nicht ändert.
let BILD_HELD = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 d d d d d d 5 f . . .
    . . . f d d f d d f d d f . . .
    . . . f d d d d d d d d f . . .
    . . . . f d d e e d d f . . . .
    . . . f f f 8 8 8 8 f f f . . .
    . . f 8 8 8 8 9 9 8 8 8 8 f . .
    . . f d 8 8 9 9 9 9 8 8 d f . .
    . . f d 8 8 8 9 9 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Held von hinten: kein Gesicht, der ganze Kopf ist Haar, darunter blitzt der Nacken hervor.
BILD_HELD_HOCH = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f f f d d d d f f f . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Held im Profil nach links. Nach rechts wird das Bild gespiegelt.
BILD_HELD_LINKS = img`
    . . . . . f f f f f . . . . . .
    . . . . f 5 5 5 5 5 f . . . . .
    . . . f 5 5 5 5 5 5 5 f . . . .
    . . . f d d 5 5 5 5 5 f . . . .
    . . . f d f d 5 5 5 5 f . . . .
    . . . f d d d 5 5 5 5 f . . . .
    . . . . f d d d 5 5 f . . . . .
    . . . f f f 8 8 8 8 f f . . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 9 9 8 8 8 e f . .
    . . f d 8 8 8 9 8 8 8 8 e f . .
    . . . f 8 4 4 4 4 4 4 8 f . . .
    . . . f 8 8 8 8 8 8 8 8 f . . .
    . . . f 8 8 f f 8 8 f f . . . .
    . . . f e e f . f e e f . . . .
    . . . f f f . . . f f f . . . .
    `
// Nach unten schaut der Held wie im Standardbild. Es ist dasselbe Bild, so braucht es kein zweites im Flash.
BILD_HELD_RUNTER = BILD_HELD
BILD_HELD_RECHTS = BILD_HELD_LINKS.clone()
BILD_HELD_RECHTS.flipX()
// Skelett: hohle Augen, Rippenkorb, dünne Knochenarme.
BILD_SKELETT = img`
    . . . . . f f f f f f . . . . .
    . . . . f 1 1 1 1 1 1 f . . . .
    . . . f 1 1 1 1 1 1 1 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 1 1 f f 1 1 1 f . . .
    . . . . f 1 f f f f 1 f . . . .
    . . . . . f 1 1 1 1 f . . . . .
    . . . f f f 1 1 1 1 f f f . . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f 1 f 1 1 f f 1 1 f 1 f . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f f f . f 1 1 f . f f f . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . f f f . . f f f . . . .
    `
// Schleim: runder Klumpen, Glanzlicht oben links, kalter Schatten unten.
BILD_SCHLEIM = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . f f 7 1 7 7 7 7 f f . . .
    . . f 7 7 1 7 7 7 7 7 7 7 f . .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 f 1 7 7 f 1 7 7 f .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 7 f f f f f f 7 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 6 6 7 7 7 7 6 6 7 7 f .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f f f f f f f f f f f f f f .
    . . . . . . . . . . . . . . . .
    `
// Herz: heller Glanzpunkt oben links, damit es auf dem dunklen Boden auffällt.
BILD_HERZ = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . f f f . . . . f f f . . .
    . . f 3 3 2 f f f f 2 2 2 f . .
    . f 2 1 1 2 2 2 2 2 2 2 2 2 f .
    . f 2 1 2 2 2 2 2 2 2 2 2 2 f .
    . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . . f 2 2 2 2 2 2 2 2 f . . .
    . . . . f 2 2 2 2 2 2 f . . . .
    . . . . . f 2 2 2 2 f . . . . .
    . . . . . . f 2 2 f . . . . . .
    . . . . . . . f f . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Schlüssel: dicker Bart, runder Griff mit Loch, Glanzpunkt.
BILD_SCHLUESSEL = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . f f f f . . . . . . . .
    . . . f 1 5 5 5 f . . . . . . .
    . . f 5 5 f f 5 5 f . . . . . .
    . . f 5 f f f f 5 f f f f f . .
    . . f 5 5 f f 5 5 5 5 5 5 5 f .
    . . . f 5 5 5 5 f f 5 f 5 5 f .
    . . . . f f f f . . f f f f f .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Münze: Goldrand, geprägter Ring, Glanz oben links.
BILD_MUENZE = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . . f 5 1 5 5 5 5 f . . . .
    . . . f 5 1 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . . . f f f f f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Feuerball des Helden: weißer Kern, gelb, orange, roter Saum.
BILD_FEUER = img`
    . . 2 4 4 2 . .
    . 2 4 5 5 4 2 .
    2 4 5 5 5 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 5 5 5 4 2
    . 2 4 5 5 4 2 .
    . . 2 4 4 2 . .
    `
// Abgeleitete Kacheln: mehr Abwechslung im Boden und in der Wand.
//
// Variante 2: Risse quer über zwei Platten.
let KACHEL_BODEN_2 = KACHEL_BODEN.clone()
KACHEL_BODEN_2.drawLine(1, 3, 6, 5, 15)
KACHEL_BODEN_2.drawLine(6, 5, 5, 6, 15)
KACHEL_BODEN_2.drawLine(9, 10, 13, 13, 15)
KACHEL_BODEN_2.setPixel(11, 9, 11)
KACHEL_BODEN_2.setPixel(2, 10, 15)
// Variante 3: Kies auf der Platte unten rechts, feiner Riss links.
let KACHEL_BODEN_3 = KACHEL_BODEN.clone()
KACHEL_BODEN_3.setPixel(9, 10, 11)
KACHEL_BODEN_3.setPixel(11, 9, 11)
KACHEL_BODEN_3.setPixel(12, 12, 11)
KACHEL_BODEN_3.setPixel(10, 13, 11)
KACHEL_BODEN_3.setPixel(13, 11, 15)
KACHEL_BODEN_3.drawLine(2, 11, 5, 11, 15)
KACHEL_BODEN_3.setPixel(4, 2, 11)
// Mauerfuß: Hier stößt die Mauer auf den Boden. Ein heller Sockel und darunter eine schwarze Schattenfuge zeigen
// sofort, wo die Wand endet.
let KACHEL_WAND_KANTE = KACHEL_WAND.clone()
KACHEL_WAND_KANTE.fillRect(0, 12, 16, 2, 11)
KACHEL_WAND_KANTE.fillRect(0, 14, 16, 1, 12)
KACHEL_WAND_KANTE.fillRect(0, 15, 16, 1, 15)
KACHEL_WAND_KANTE.fillRect(4, 12, 1, 2, 15)
KACHEL_WAND_KANTE.fillRect(11, 12, 1, 2, 15)
KACHEL_WAND_KANTE.setPixel(1, 13, 7)
KACHEL_WAND_KANTE.setPixel(2, 13, 7)
KACHEL_WAND_KANTE.setPixel(13, 13, 7)
// Fels: der massive Berg hinter den Mauern, fast schwarz und mit wenig Struktur.
let KACHEL_FELS = image.create(16, 16)
KACHEL_FELS.fill(15)
KACHEL_FELS.drawLine(2, 2, 5, 3, 12)
KACHEL_FELS.drawLine(9, 6, 12, 5, 12)
KACHEL_FELS.drawLine(4, 11, 7, 12, 12)
KACHEL_FELS.setPixel(1, 8, 12)
KACHEL_FELS.setPixel(6, 8, 12)
KACHEL_FELS.setPixel(13, 9, 12)
KACHEL_FELS.setPixel(11, 14, 12)
// Stachelfalle: dunkle Grube im Boden, drei Stacheln mit hellem Grat.
KACHEL_STACHEL = KACHEL_BODEN.clone()
KACHEL_STACHEL.fillRect(1, 1, 14, 14, 15)
KACHEL_STACHEL.drawLine(1, 1, 14, 1, 12)
KACHEL_STACHEL.fillRect(3, 5, 1, 3, 11)
KACHEL_STACHEL.fillRect(2, 8, 3, 2, 11)
KACHEL_STACHEL.fillRect(1, 10, 5, 3, 11)
KACHEL_STACHEL.fillRect(8, 3, 1, 3, 11)
KACHEL_STACHEL.fillRect(7, 6, 3, 3, 11)
KACHEL_STACHEL.fillRect(6, 9, 5, 4, 11)
KACHEL_STACHEL.fillRect(12, 5, 1, 3, 11)
KACHEL_STACHEL.fillRect(11, 8, 3, 2, 11)
KACHEL_STACHEL.fillRect(10, 10, 5, 3, 11)
KACHEL_STACHEL.setPixel(3, 5, 1)
KACHEL_STACHEL.setPixel(2, 8, 1)
KACHEL_STACHEL.setPixel(1, 10, 1)
KACHEL_STACHEL.setPixel(8, 3, 1)
KACHEL_STACHEL.setPixel(7, 6, 1)
KACHEL_STACHEL.setPixel(6, 9, 1)
KACHEL_STACHEL.setPixel(12, 5, 1)
KACHEL_STACHEL.setPixel(11, 8, 1)
KACHEL_STACHEL.setPixel(10, 10, 1)
// Weitere Gegner und Gegenstände.
//
// Fledermaus: weite Flügel, spitze Ohren, rote Augen.
BILD_FLEDERMAUS = img`
    . . . . . f f . . f f . . . . .
    f f . . f a a f f a a f . . f f
    f a f f a a a a a a a a f f a f
    f a a a a a 2 a a 2 a a a a a f
    f a a a a a a f f a a a a a a f
    . f a a a a a a a a a a a a f .
    . . f f a a a a a a a a f f . .
    . . . . f f a a a a f f . . . .
    `
// Magier: spitze Kapuze, glühende Augen im Schatten, eine Zauberkugel in den Händen. Die Spitze macht seinen
// Umriss sofort erkennbar.
BILD_MAGIER = img`
    . . . . . . . f f . . . . . . .
    . . . . . . f a a f . . . . . .
    . . . . . f a a a a f . . . . .
    . . . . f a a a a a a f . . . .
    . . . f a a f f f f a a f . . .
    . . . f a f 9 f f 9 f a f . . .
    . . . f a f f f f f f a f . . .
    . . . . f a a a a a a f . . . .
    . . . f f a a a a a a f f . . .
    . . f a a a a a a a a a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a f 3 1 1 3 f a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a a a a a a a a a f . .
    . . f a a a a a a a a a a f . .
    . . . f f f f f f f f f f . . .
    `
// Wächter: schwerer Panzer, Topfhelm mit Sehschlitz und ein großer Rundschild an der linken Seite. Er hat den
// breitesten Umriss aller Gegner.
BILD_WAECHTER = img`
    . . . . . . . f f f f f . . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f f b f f f . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f c c f f f . . .
    . . f f f f f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . . f b 6 6 f b b b b b f . . .
    . . . f b b f b b b b f . . . .
    . . . . f f f b b b b f . . . .
    . . . . . . f e e f e e f . . .
    . . . . . . f f f . f f f . . .
    `
// Nach rechts wird gespiegelt (wie beim Helden). Für hoch und runter braucht der Wächter eigene Bilder, denn der
// Rundschild wandert an die obere oder untere Kante. Alle vier Bilder entstehen beim Start. Im Spiel wird dann nur noch
// mit setImage gewechselt, ohne neue Bilder anzulegen.
BILD_WAECHTER_RECHTS = BILD_WAECHTER.clone()
BILD_WAECHTER_RECHTS.flipX()
// Blick nach unten: Topfhelm mit Sehschlitz von vorne, der Schild hängt quer vor den Beinen.
BILD_WAECHTER_RUNTER = img`
    . . . . . f f f f f f . . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f b f f b f f . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f c c c c f f . . . .
    . . . f b b b b b b b b f . . .
    . . . f b b b b b b b b f . . .
    . . . f b b c c c c b b f . . .
    . . . f b b b b b b b b f . . .
    . . f f f f f f f f f f f f . .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . . . f f f f f f f f f f . . .
    `
// Blick nach oben: Man sieht den Rücken, der Schild ragt als breiter Bogen über den Helm.
BILD_WAECHTER_HOCH = img`
    . . . f f f f f f f f f f . . .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . . f f f f f f f f f f f f . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b c c b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . . f e e f e e f . . . .
    . . . . . f f f . f f f . . . .
    `
// Boss: Hörner, gelbe Glutaugen, Fangzähne. Er wird mit setScale(2) doppelt so groß gezeichnet, darum sind die Formen
// grob und ohne Feinheiten.
BILD_BOSS = img`
    . f f . . . . . . . . . . f f .
    . f 4 f . f f f f f f . f 4 f .
    . f 4 f f 2 2 2 2 2 2 f f 4 f .
    . . f 4 2 2 2 2 2 2 2 2 4 f . .
    . . f 2 5 5 2 2 2 2 5 5 2 f . .
    . . f 2 5 f 2 2 2 2 f 5 2 f . .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . f 2 f 1 1 1 1 1 1 f 2 f . .
    . . . f 2 f 1 f f 1 f 2 f . . .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . f 4 f 2 2 e e e e 2 2 f 4 f .
    . f 4 f 2 2 2 e e 2 2 2 f 4 f .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . . . f 2 2 f f f f 2 2 f . . .
    . . . f 2 2 f . . f 2 2 f . . .
    . . f f f f . . . . f f f f . .
    `
// Truhe: Holzbretter mit dunklen Fugen, Metallbänder, Goldschloss.
BILD_TRUHE = img`
    . . f f f f f f f f f f f f . .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f e e e f e e e e f e e e f .
    . f e e e f e e e e f e e e f .
    . f b b b b f f f f b b b b f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f 5 f f 5 f e e e f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f e e e e f e e e f .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f b b b b b b b b b b b b f .
    . . f f f f f f f f f f f f . .
    `
// Fackel: weiße Flammenspitze, umwickelter Griff.
BILD_FACKEL = img`
    . . . 5 . . . .
    . . 4 5 4 . . .
    . 4 5 1 5 4 . .
    . 4 5 1 1 5 4 .
    . 4 5 5 5 5 4 .
    . . 4 5 5 4 . .
    . . 2 4 4 2 . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    `
// Zauberkugel der Gegner: violetter Saum, rosa Kern. Sie sieht ganz anders aus als der gelbe Feuerball des Helden.
BILD_MAGIEKUGEL = img`
    . . a a a a . .
    . a 3 3 3 3 a .
    a 3 3 1 3 3 3 a
    a 3 1 1 3 3 3 a
    a 3 3 3 3 3 3 a
    a 3 3 3 3 3 3 a
    . a 3 3 3 3 a .
    . . a a a a . .
    `
// Fass: heller Deckelrand, Holzbretter, zwei Metallreifen.
DEKO_FASS = img`
    . . f f f f f f f f . .
    . f d d d d d d d d f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . . f f f f f f f f . .
    `
// Knochen: oben weiß beleuchtet, unten beige im Schatten.
DEKO_KNOCHEN = img`
    . f f . . . . . . f f .
    f 1 1 f . . . . f 1 1 f
    f 1 1 1 f f f f 1 1 1 f
    f 1 1 1 1 1 1 1 1 1 1 f
    f d d d d d d d d d d f
    f d d d f f f f d d d f
    f d d f . . . . f d d f
    . f f . . . . . . f f .
    `

// Der Calliope Hacker: Person im schwarzen Kapuzenpulli mit aufgesetzter Kapuze, von hinten, am Schreibtisch mit
// Monitor, Calliope mini und GameKit, dazu eine schlafende Katze, ein türkiser Rucksack und türkise Sneaker. Das Bild
// ist 64 × 40 Pixel groß. Seine Farben sind auf die Standardpalette dieses Spiels abgebildet (schwarz f, türkis 6,
// Randlicht 9, Holz e, Wand c), ein Palettentausch ist nicht nötig. Auf Schwarz wäre der Pulli unsichtbar, darum steht
// er immer vor einer Tafel in Farbe c (intro.studio_malen).
let BILD_HACKER = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
    . . . . . . . . . . . . . f b b f f f f f f 9 . c . c . c . c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 . c . c c c c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 c c c c c c c f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . c . . . . . . . . .
    . . . . . . . . . . . f b f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c . c . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . c . c . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c c . c . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 6 6 6 6 6 f f f f f f f f f f f f c c c c . c . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c . c 5 5 . .
    . . . . . . . . . . . b f f f f f f f f f f f f 9 c c c c c c f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f c c 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f b f f f f f f f f f f f f 9 c c c c c f f f f f f f f f f f f f f f f f f f f f f c 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f b b f f f f f f f f f f f 9 c c c c f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f b b b b f f f f f f f f 9 c c c f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c c f f f 8 8 8 8 f f f f f f f f f f f f f f f c 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c f f f f f f f f f f f f f f f f f f f f f f c c 5 8 8 8 8 8 5 . c
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f b f f f f 9 f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c f c 5 5 c .
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f f b f f f f 9 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f b f f f f f d d c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f b f f f f d d f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f f 8 b 9 b 6 b 2 b f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f d b d f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 8 8 6 6 8 8 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . f 8 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f b f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c c c c c c c c c c c b b c c . c . c . c . . b d d d d d d
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f c c c c c c c c c c c b b c . c . c . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . c f f f f f b . c . c . c . c . c . c b b . c . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . c f f f f b c . c . c . c . c . c . b b . . 8 6 6 6 8 . . . b d b b b b d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f b . . . c . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 f f f 6 8 . . b d d d d d d
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d b b b b d
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . b b . 8 6 b b b 6 8 . . b d d d d d d
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    8 6 6 6 6 6 6 6 6 6 8 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 8 8 8 8 8 . . . b d b b b b d
    . 8 8 8 8 8 8 8 8 8 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    `
// Das Bild an der Wand im Startraum von Ebene 1: derselbe Hacker in klein, im Goldrahmen. Reine Dekoration
// ohne Kollision (gegenstaende.ts).
let BILD_HACKER_WAND = img`
    5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    4 c c c c c c c c c c c c c c c c c c 4
    4 c c c f f f c c c c f f f f f f f c 4
    4 c c f b f f 9 c c c f 5 5 5 f f f c 4
    4 c c f b f f f 9 c c f f f f f f f c 4
    4 c c f f f f f 9 c c f 9 9 9 9 f f c 4
    4 c 6 f f f f f f 9 c f f f f f f f c 4
    4 c 6 f f f f f f f 9 f f 2 2 f f f c 4
    4 c 6 f f f f f f f f 9 f f f f f f c 4
    4 c 6 f f f f f f f f d e e e e e e e 4
    4 c 6 6 6 6 f f f f c c e c c c c e c 4
    4 c c c c c f f c f f c e c c c c e c 4
    4 c c c c 6 6 c c 6 6 c e c c c c e c 4
    4 c c c c 1 1 c c 1 1 c c c c c c c c 4
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    `
// Der Hacker als Zuschauer am Rand des Thronsaals im Abspann (outro.ts), von hinten wie auf der Studio-Karte. Das
// zweite Bild jubelt mit erhobenen Armen.
let BILD_ZUSCHAUER = img`
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . f f f 9 . . . .
    . . . f f f f f 9 . . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . b f f f f f f f f 9 .
    . b f f f f f f f f 9 .
    . b . f f f f f f . 9 .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
let BILD_ZUSCHAUER_JUBEL = img`
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b f . f f f 9 . 9 9 .
    . . b f f f f f 9 9 . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . . f f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f f . . .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
// Verpuffen: Ein besiegter Gegner verschwindet in hellen Sternen (gelb und weiß, nie in seinen eigenen Farben und nie
// rot). Die drei Bilder dauern je rund 150 ms, schalte_woelkchen_weiter() in ereignisse.ts wechselt sie.
let BILD_WOELKCHEN_1 = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . 5 5 1 1 1 5 5 . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let BILD_WOELKCHEN_2 = img`
    . . . . . . . 1 . . . . . . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . . . . . . 5 . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . 5 . . . . 5 1 5 . . . . 5 . .
    5 1 5 . . . . 5 . . . . 5 1 5 .
    . 5 . . . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 5 . . . . . . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . . . . . . 1 . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let BILD_WOELKCHEN_3 = img`
    . . . . . . . . . . . . . . . .
    . 1 . . . . . . . . . . . . 5 .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . 5 . . . . . . . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    1 . . . . . . . . . . . . . . 5
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 1 . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . 5 . . . . . . 1 . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    `
