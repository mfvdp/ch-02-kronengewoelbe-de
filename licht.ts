// Dunkelheit und Licht: der Sichtkreis um den Helden.
//
// Das Bild mit der Dunkelheit ist 160 × 120 Pixel groß und hängt als Sprite relativ zur Kamera fest vor ihr. Der
// Lichtkreis wird in jedem Bild an die Bildschirmposition des Helden gemalt (licht_malen, aufgerufen aus game.onUpdate
// in main.ts). Das sind drei eingebaute Füllaufrufe je Bild und kostet praktisch nichts.
//
// Ein Bild in Weltkoordinaten am Helden müsste 320 × 240 Pixel groß sein, denn an den Rändern des Verlieses bleibt die
// Kamera stehen, und der Held wandert bis zu 80 und 60 Pixel aus der Mitte. Das wären 38 KB in einem Block, die Hälfte
// des ganzen Speichers, und jede freie Stelle im Speicher wäre dadurch zweigeteilt. 160 × 120 Pixel sind nur 9,6 KB.
//
// Das Bild wird einmal beim Start angelegt (main.ts) und danach nur noch übermalt.

// Merkt sich nur den gewünschten Radius. Gemalt wird in jedem Bild neu.
function setze_licht (r: number) {
    licht_radius = r
}

// Malt die Dunkelheit: alles schwarz, ein Dämmerring und in der Mitte ein Loch, zentriert auf die Bildschirmposition
// des Helden. Die ergibt sich aus seiner Weltposition minus dem Kameraausschnitt. So stimmt der Kreis auch, wenn die
// Kamera am Rand des Verlieses stehen bleibt.
function licht_malen () {
    if (dunkel_bild == null || held == null) {
        return
    }
    let sx = held.x - scene.cameraProperty(CameraProperty.Left)
    let sy = held.y - scene.cameraProperty(CameraProperty.Top)
    dunkel_bild.fill(15)
    dunkel_bild.fillCircle(sx, sy, licht_radius + 6, 12)
    dunkel_bild.fillCircle(sx, sy, licht_radius, 0)
}
