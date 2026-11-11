// Einstellungen: Hier kannst du schrauben!
//
// Diese Datei läuft vor allen anderen Spieldateien, die auf ihr aufbauen. In pxt.json stehen nur die Texte (texte.ts)
// und die Menüs (menues.ts) davor.
//
// Alle Zahlen hier kannst du ändern und das Spiel sofort im Simulator ausprobieren.
//
// Der Name des Spiels in zwei Zeilen, getrennt durch „|“. Er steht groß auf der Titelkarte im Vorspann und auf dem
// Holzschild des Titelbilds, jede Zeile in der Mitte.
namespace spiel {
    export const TITEL = "KRONEN|GEWÖLBE"   // Schriftzug im Titel, „|“ trennt die zwei Zeilen
    export const TITELZEILEN = TITEL.split("|")
}
// Schalter zur Fehlersuche auf echter Hardware.
//
// DIAGNOSE zeigt beim Start farbige Felder. Jede Startstufe hat ihre eigene Farbe und bleibt kurz stehen. Bricht das
// Spiel ab, friert das Bild bei der zuletzt erreichten Farbe ein, und man sieht genau, wie weit der Start gekommen ist.
// Auf dem GameKit ist das nötig, weil ein Absturz dort weder einen Fehlercode noch ein trauriges Gesicht zeigt,
// sondern nur Schwarz.
//
// Mit DUNKELHEIT = false fällt das Bild mit dem Sichtkreis weg (siehe licht.ts). Es hängt fest vor der Kamera, ist so
// groß wie der ganze Bildschirm und belegt rund 9,6 KB. Das hilft sehr, wenn der Bildschirm schwarz bleibt.
let DIAGNOSE = false
let DUNKELHEIT = true
// Mit VORSPANN = false fällt der ganze Vorspann weg: die Geschichte, die Karte „Calliope Hacker präsentiert“ mit der
// Titelkarte und die Lehrtafeln. Zum Ausprobieren des eigentlichen Spiels spart das rund eine Minute bei jedem Start.
// Für die Fehlersuche am Start nimmt man am besten DIAGNOSE = true dazu.
let VORSPANN = true

let START_LEBEN = 6
let TEMPO_HELD = 95
let TEMPO_STIEFEL = 25
// Obergrenze für die Stiefel-Verbesserungen. Ohne sie würden sich die Stiefel aus den Truhen immer weiter stapeln, und
// der Held wäre irgendwann nicht mehr zu steuern.
let TEMPO_HELD_MAX = 170
// Ab dieser Stufe werden die Gegner nicht mehr schneller. Die Grenze ist so gewählt, dass selbst die schnellste
// Gegnerart (die Fledermaus mit 34 + 2 × Stufe = 74) unter dem Grundtempo des Helden von 95 bleibt: Weglaufen soll
// immer möglich sein. Weil eine Stufe STUFE_TAKT Ebenen dauert, ist die Grenze erst in Ebene 39 erreicht. Tiefere
// Ebenen werden durch mehr Gegner und mehr Fallen schwerer, nicht durch mehr Tempo.
let STUFE_MAX = 20
// Wie viele Ebenen eine Gegner-Stufe dauert. Mit 2 steigt die Schwierigkeit nur halb so schnell, als wenn jede Ebene
// eine neue Stufe brächte.
let STUFE_TAKT = 2

// Ab welcher Ebene eine Gegnerart zum ersten Mal auftaucht. Fledermaus, Magier und Wächter liegen weit auseinander,
// damit die Schwierigkeit nicht sprunghaft steigt. Die Lehrtafeln im Vorspann lesen diese Werte mit, deshalb können
// Tutorial und Spiel nicht auseinanderlaufen.
let EBENE_FLEDERMAUS = 4
let EBENE_MAGIER = 7
let EBENE_WAECHTER = 10

// Zweiter und dritter Gegner im selben Raum. Die Chance beginnt in der genannten Ebene bei einem Zehntel und wächst mit
// jeder Ebene um ein weiteres Zehntel, bis zur jeweiligen Obergrenze (in Zehnteln).
let ZWEITER_AB = 4
let ZWEITER_MAX = 6
let DRITTER_AB = 12
let DRITTER_MAX = 4
// Notbremse für Speicher und Bildrate: Mehr als GEGNER_MAX Gegner gibt es in einer Ebene nie.
let GEGNER_MAX = 18

// Fallen: Alle FALLEN_TAKT Ebenen kommt eine Falle dazu (höchstens FALLEN_MAX).
let FALLEN_TAKT = 2
let FALLEN_MAX = 10

// Boss: Leben = BOSS_LEBEN_BASIS + Ebene, aber höchstens BOSS_LEBEN_MAX. So wird der Kampf in tiefen
// Ebenen nicht endlos.
let BOSS_LEBEN_BASIS = 14
let BOSS_LEBEN_MAX = 40
// Der Boss wird wütend, wenn nur noch dieser Bruchteil seiner Leben übrig ist (3 bedeutet: das letzte Drittel).
let BOSS_WUT_TEIL = 3

// Ausgleich für die Tiefe: Alle HERZ_BONUS_JE Ebenen liegt in einem Raum ein Zehntel öfter ein Herz statt einer Münze,
// höchstens HERZ_BONUS_MAX Zehntel mehr.
let HERZ_BONUS_JE = 5
let HERZ_BONUS_MAX = 2

// Auf dieser Ebene wartet der Endboss: der Kronenräuber mit der gestohlenen Krone auf dem Kopf und mit allen Leben. Wer
// ihn besiegt, gewinnt das Spiel: Der Held nimmt die Krone und entkommt (outro.ts). baue_ebene setzt den Boss auf
// dieser Ebene immer, auch wenn sie kein Vielfaches von BOSS_JEDE ist.
let ENDBOSS_EBENE = 15
let FEUER_TEMPO = 135
let NACHLADEN_NORMAL = 420
let NACHLADEN_SCHNELL = 190
let SCHUTZ_ZEIT = 2000
let RASTER_BREITE = 26
let RASTER_HOEHE = 22
let LICHT_NORMAL = 46
let LICHT_FACKEL = 80
let FACKEL_DAUER = 12000
let BOSS_JEDE = 5
// So lange (in ms) verpufft ein besiegter Gegner in Sternen.
let WOELKCHEN_DAUER = 450
