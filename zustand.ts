// Globaler Spielzustand.
//
// In MakeCode gibt es kein import und export: Alles, was hier steht, ist in jeder anderen Datei sichtbar.

// ---- Fortschritt ----
let ebene = 1
let schluessel_anzahl = 0
let boss_aktiv = false
let spiel_laeuft = true
// Sperre für die Sprechblase mit dem Hinweis an der Treppe: Der Kachel-Handler feuert in jedem Bild, solange der
// Held dort steht.
let hinweis_bis = 0

// ---- Held ----
let held: Sprite = null
let tempo_held = TEMPO_HELD
let blick_x = 1
let blick_y = 0
let nachladen = NACHLADEN_NORMAL
let schuss_frei_ab = 0
let schutz_bis = 0
let dreifach = false
let a_gedrueckt = false

// ---- Anzeige, Licht und Dunkelheit ----
let anzeige_schluessel: Sprite = null
let dunkel: Sprite = null
let licht_radius = 0
let licht_bis = 0
// Die beiden Anzeige-Bilder (Übersichtskarte und Ebenen-Schild) werden einmal beim Start angelegt und danach nur noch
// neu bemalt. Mitten im Spiel immer wieder neue Bilder anzulegen würde den Speicher zerstückeln, bis eine Anlage
// fehlschlägt und das Spiel abstürzt. Der Müllsammler von MakeCode räumt zwar auf, schiebt die freien Stücke
// aber nicht zusammen.
let karte_puffer: Image = null
let ebene_puffer: Image = null

// ---- Raster und Räume ----
let raster: number[] = []
let raum_x: number[] = []
let raum_y: number[] = []
let waende: Image = null

// ---- Gegner ----
let gegner_liste: Gegner[] = []

// Hilfsvariablen, die mehrere Funktionen gemeinsam benutzen. Sie stehen ganz oben, damit jede Datei sie sieht, obwohl
// sie eigentlich nur in einzelnen Funktionen gebraucht werden. Kurze Namen: x, y = Koordinaten; s, p, r = Sprites;
// treffer_gegner = der getroffene Gegner; dunkel_bild = das Bild der Dunkelheit (160 × 120); leinwand = das Vollbild
// für Vorspann, Lehrtafeln und Abspann (160 × 120); bild_an und bild_aus = die beiden Titelbilder mit und ohne Hinweis.
let hoechste_art = 0
let letzter_raum = 0
let truhen_wahl = 0
let blink_zaehler = 0
let leben = 0
let tempo = 0
let gegner_x = 0
let gegner_y = 0
let x = 0
let y = 0
let s: Sprite = null
let p: Sprite = null
let r: Sprite = null
let treffer_gegner: Gegner = null
let dunkel_bild: Image = null
let leinwand: Image = null
let bild: Image = null
let bild_an: Image = null
let bild_aus: Image = null
// Die gerade sichtbaren Sternenwölkchen besiegter Gegner (verpuffen in ereignisse.ts). Die Liste ist leer, sobald
// keines mehr läuft.
let woelkchen: Sprite[] = []
