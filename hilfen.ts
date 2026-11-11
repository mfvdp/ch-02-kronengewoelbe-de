// Kleine Hilfsfunktionen ohne eigenen Zustand.

function betrag (n: number) {
    if (n < 0) {
        return 0 - n
    }
    return n
}

function vorzeichen (n: number) {
    if (n > 0) {
        return 1
    }
    if (n < 0) {
        return -1
    }
    return 0
}

function ist_boden (x: number, y: number) {
    if (x < 0 || y < 0 || x >= RASTER_BREITE || y >= RASTER_HOEHE) {
        return false
    }
    return raster[y * RASTER_BREITE + x] > 0
}
