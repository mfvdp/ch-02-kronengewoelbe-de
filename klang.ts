// Klang: alle Töne und die Musik an einer Stelle. Der Rest des Spiels ruft nur diese Funktionen auf und weiß nicht, wie
// ein Geräusch gebaut ist.
//
// Warum nicht music.playTone()? Diese Funktion hält den Aufrufer so lange an, wie der Ton dauert (bei höchstens 2000 ms
// folgt direkt ein pause). Unsere Geräusche laufen aber mitten im Physik-Schritt in den Handlern für Berührungen. Das
// Spiel würde bei jeder eingesammelten Münze kurz stehen bleiben.
//
// Stattdessen nehmen wir music.Melody:
//   new music.Melody(text)   baut einen Klang aus einem kurzen Textmuster
//   melodie.play(laut)       spielt einmal im Hintergrund
//   melodie.loop(laut)       spielt in Dauerschleife im Hintergrund
//   melodie.stop()           bricht ab
//
// play() und loop() starten die Wiedergabe mit control.runInParallel() in einem eigenen Faden. Der Aufrufer läuft
// sofort weiter, genau das brauchen wir.
//
// Das Textmuster (die Notenschrift) besteht aus Wörtern:
//   ~n            Wellenform: 1 Dreieck, 2 Sägezahn, 3 Sinus, 4 stimmbares Rauschen, 5 weißes Rauschen,
//                 11 bis 15 Rechteck, 16 bis 18 gefiltertes Rechteck
//   @a,d,s,r      Hüllkurve: Anstieg in ms, Abfall in ms, Haltelautstärke 0 bis 255, Ausklang in ms
//   !hz,ms        ein Ton mit fester Frequenz und Dauer
//   ^hz           Zielfrequenz: Der Ton gleitet dorthin
//   C4:2          Note C in Oktave 4, Länge 2 (4 = eine Zählzeit)
//   R:2           Pause
//   -180          Tempo in Schlägen pro Minute
//
// Ein Wort ohne Note und ohne „!“ spielt nichts, es stellt nur Wellenform, Hüllkurve oder Tempo um. Darum kann man
// einen Klang aus mehreren Abschnitten zusammensetzen.
//
// Achtung beim Gleiten: Bei „^“ muss der Ausklang r = 0 sein. Sonst rechnet der Parser die Frequenzrampe über das
// Tonende hinaus weiter und landet im Negativen (ein hässliches Zirpen).
namespace klang {
    // Lautstärken. Der Parser rechnet am Ende (Wert × music.volume()) >> 8, es sind also relative Stufen. LAUT_VOLL ist
    // für große Momente.
    const LAUT_VOLL = 255
    // Normale Belohnungen.
    const LAUT_MITTEL = 200
    // Sehr häufige Geräusche.
    const LAUT_LEISE = 150
    // Titelmusik.
    const LAUT_TITEL = 165
    // Schleife im Verlies, läuft dauernd.
    const LAUT_MUSIK = 120
    // Zweite Stimme: Sie trägt nur und drängt sich nicht vor.
    const LAUT_BASS = 115
    // Ferne Akzente über der Intro-Schleife.
    const LAUT_FERN = 95

    // Die Klänge. Jeder ist ein eigenes Melody-Objekt, damit ein erneuter Aufruf nur sich selbst abschneidet und nicht
    // die anderen Geräusche.

    // ---- Kampf ----
    // Feuerball: ein kurzes, helles „Pew“, das schnell abfällt.
    const TON_SCHUSS = new music.Melody("~15 @1,8,120,0 !1150,50^380")
    // Gegner getroffen, aber noch da: ein kurzer, knirschender Schlag.
    const TON_TREFFER = new music.Melody("~4 @0,6,180,0 !520,45^200")
    // Abgeprallt: erst ein metallisches Klacken, dann ein aufsteigendes Sirren, das klingt nach einem Querschläger.
    const TON_BLOCK = new music.Melody("~4 @0,0,255,0 !170,22 ~15 @0,3,110,0 !560,34^1600")
    // Gegner verpufft: eine Rauschwolke nach unten, dann zwei helle Töne.
    const TON_GEGNER_VERPUFFT = new music.Melody("~4 @0,0,255,0 !640,50^90 ~15 @1,8,110,0 !784,40 !1046,55")
    // Boss verpufft: ein langer Rauschknall, ein tiefer Absturz, dann eine Siegesfigur. Absichtlich deutlich satter
    // und länger (rund 1,8 s).
    const TON_BOSS_VERPUFFT = new music.Melody(
        "~5 @8,700,0,1 !400,1 ~2 @4,2,200,0 !260,320^60 ~15 @2,18,150,0 -230 C5:2 E5:2 G5:2 C6:6")
    // Held getroffen: ein tiefes, rutschendes Stöhnen mit Rumpeln.
    const TON_AUA = new music.Melody("~2 @0,0,255,0 !220,120^90 ~4 @0,2,170,0 !75,90")

    // ---- Gegenstände ---- (alle steigen auf, klingen aber klar verschieden)
    // Schlüssel: ein Glockenspiel in vier Stufen, gefiltertes Rechteck.
    const TON_SCHLUESSEL = new music.Melody("~16 @1,14,120,70 -380 C5:2 G5:2 C6:2 E6:4")
    // Herz: ein warmer Sinus, tiefer und weicher als alles andere.
    const TON_HERZ = new music.Melody("~3 @12,2,210,90 -300 G4:2 C5:2 E5:4")
    // Münze: nur zwei sehr kurze, hohe Rechtecktöne.
    const TON_MUENZE = new music.Melody("~15 @1,4,95,45 -560 B5:2 E6:4")
    // Fackel: ein anschwellendes Rauschen (das Anzünden), dann ein warmes Dreieck, das nach oben
    // gleitet (das Aufflammen).
    const TON_FACKEL = new music.Melody("~5 @70,2,120,90 !1,150 ~1 @14,2,190,0 !430,150^760")
    // Truhe: ein hölzerner Deckelschlag, danach ein kleiner Dreiklang.
    const TON_TRUHE = new music.Melody("~4 @0,0,255,0 !150,55^80 ~15 @1,10,110,80 -400 C5:2 E5:2 G5:2 C6:5")

    // ---- Vorspann ----
    // Studio-Klang: Der Lichtschein fährt über die Buchstaben.
    const TON_STUDIOKARTE = new music.Melody("~16 @3,26,120,140 -260 C4:2 G4:2 C5:2 E5:6")
    // Der Anflug des Meteors: stimmbares Rauschen, das aus der Ferne anschwillt und dabei nach oben zieht. Rund 0,74 s.
    const TON_ANFLUG = new music.Melody("~4 @80,2,150,0 !70,660^1400")
    // Der Einschlag dauert rund 0,5 s: erst der weiße Knall (gebaut wie TON_TUER), dann ein Sägezahn, der in
    // den Keller fällt.
    const TON_EINSCHLAG = new music.Melody("~5 @0,170,0,1 !240,1 ~2 @0,8,255,0 !180,320^24")
    // Die Fanfare zur Titelkarte steht in d-Moll, wie das ganze Spiel: Die Geschichte ist an dieser Stelle noch
    // nicht gut ausgegangen.
    const TON_FANFARE = new music.Melody("~16 @2,14,190,140 -190 D4:2 A4:2 D5:2 F5:6 R:1 F5:2 A5:2 D6:10")
    // Gewitter über der Burg: erst der weiße Knall des Einschlags, dann das reißende Ende der Blitzbahn, erst danach
    // das Rollen. Das Rollen allein klang wie ferner Verkehr, der Schlag fehlte.
    const TON_DONNER = new music.Melody("~5 @0,24,0,1 !2800,1"
        + " ~4 @0,3,215,0 !1800,70^300"
        + " ~5 @6,540,80,0 !96,660^30")
    // Der Dieb huscht davon: ein Rauschen, das nach oben wegzischt.
    const TON_HUSCH = new music.Melody("~5 @2,14,110,0 !260,220^1500")
    // Studio-Karte und Schlussbild: Das Logo steht. Zwei Stimmen, beide genau 2,0 s lang (20 Einheiten zu je 100 ms bei
    // Tempo 150). Oben ein D-Dur-Dreiklang, der über zwei Oktaven aufsteigt ...
    const TON_LOGO_HOCH = new music.Melody("~16 @6,26,150,220 -150"
        + " D4:2 A4:2 D5:2 F#5:2 A5:4 D6:8")
    // ... unten die Kadenz D, A, D als Fundament darunter.
    const TON_LOGO_TIEF = new music.Melody("~1 @18,40,165,260 -150"
        + " D3:8 A2:4 D3:8")

    // ---- Ablauf ----
    // Ebene geschafft: eine kleine Fanfare, die oben endet.
    const TON_EBENE = new music.Melody("~15 @2,12,150,90 -300 C5:1 E5:1 G5:2 C6:2 G5:2 C6:6")
    // Boss erscheint: ein anschwellendes Grollen, dann ein tiefes Sägezahn-Motiv mit Tritonus (C zu
    // Fis), absichtlich schief.
    const TON_BOSS_DA = new music.Melody(
        "~5 @150,2,110,200 !1,300 ~2 @10,2,235,120 -150 C3:2 R:1 C3:2 R:1 F#3:3 G3:8")
    // Tür zu: erst der harte Knall, dann der dumpfe Nachschlag.
    const TON_TUER = new music.Melody("~5 @0,90,0,1 !200,1 ~4 @0,10,200,0 !130,150^38")
    // Spiel vorbei: Die Töne gehen Halbton für Halbton abwärts von G bis Dis, dann springt die Melodie zum tiefen C,
    // lang und dick.
    const TON_ENDE = new music.Melody(
        "~15 @2,16,160,110 -200 G4:2 F#4:2 F4:2 E4:2 ~2 @6,2,190,300 D#4:2 C4:10")
    // Vor der Krönung: langsame Glocken mit viel Luft. Rund 1,8 s, ungefähr so lang wie die Zeitlupe (KROENUNG_MS
    // in outro.ts, zusammen 1,65 s).
    const TON_GLOCKE = new music.Melody("~3 @2,420,60,340 -100 D6:2 R:2 A6:2 R:1 D7:5")
    // Die Krönung: erst der Lichtschlag, dann eine steigende Fanfare in D-Dur (Fis statt F). Das ganze Spiel steht in
    // d-Moll, hier löst es sich zum ersten Mal auf. Rund 1,9 s.
    const TON_KRONE = new music.Melody("~5 @1,40,0,1 !800,1"
        + " ~16 @2,12,205,130 -180 D5:1 F#5:1 A5:1 D6:1 F#6:2 A6:2 F#6:2 D6:12")
    // Der Abspann: dasselbe Thema wie die Titelmusik (D, F, A, G, F, E, D), aber in D-Dur, halb so schnell und als
    // warmer Sinus. Wer das Spiel kennt, hört die Erlösung, ohne zu wissen warum. Rund 3,25 s.
    const TON_ABSPANN = new music.Melody(
        "~3 @18,6,160,240 -120 D4:2 F#4:2 A4:4 G4:2 F#4:2 E4:4 D4:2 C#4:2 D4:6")

    // ---- Musik ----
    // Alle großen Musikstücke außer der Dungeon-Schleife haben zwei Stimmen: zwei Melody-Objekte, die getrennt in
    // Schleife laufen (jedes in einem eigenen Faden). Damit die Stimmen nicht auseinanderlaufen, haben Oberstimme und
    // Unterstimme immer dasselbe Tempo und dieselbe Zahl an Längeneinheiten. Der Parser rechnet eine Einheit
    // als Math.idiv(15000, tempo).
    //   Das geht restlos auf bei Tempo 100, 125 und 150.
    //
    // Darum bleibt der Versatz zwischen den Stimmen klein und wächst nicht.

    // Titelthema in d-Moll, 8 Takte zu 16 Einheiten bei Tempo 125, das ergibt 15,36 s je Runde. Punktierte Auftakte, im
    // dritten Takt ein Oktavsprung nach D5 und ein Gis4, der Tritonus über dem D-Bass. Takt 7 schreitet von F5 über E5
    // und D5 bis Cis5 abwärts.
    const NOTEN_TITEL = new music.Melody("~2 @6,30,150,90 -125"
        + " D4:3 D4:1 A4:6 A#4:2 A4:4"
        + " G4:3 G4:1 F4:6 E4:2 D4:4"
        + " D5:6 A4:2 F4:4 G#4:4"
        + " A4:12 R:4"
        + " F4:3 F4:1 C5:6 A#4:2 A4:4"
        + " D5:3 D5:1 C5:6 A#4:2 A4:4"
        + " F5:4 E5:4 D5:4 C#5:4"
        + " D5:8 A4:4 D4:4")
    // Der Unterbau dazu: ein Quintbass im gleichen punktierten Puls, Dreieck statt Sägezahn, damit er trägt, ohne zu
    // kratzen. Jeder Takt hat 3 + 1 + 4 + 3 + 1 + 4 = 16 Einheiten, genau so viel wie die Melodie. Der tiefste Ton ist
    // A2 (110 Hz), darunter wird der kleine Lautsprecher dünn.
    const NOTEN_TITEL_BASS = new music.Melody("~1 @2,22,140,60 -125"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 D4:4"
        + " A2:3 A2:1 A2:4 A2:3 A2:1 E3:4"
        + " F3:3 F3:1 F3:4 F3:3 F3:1 C4:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " A#2:3 A#2:1 A#2:4 A2:3 A2:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4")

    // Untermalung des Vorspanns: phrygisch auf D, mit den Halbtonreibungen Es-D und B-A. Ein Herzschlag-Puls aus Ton
    // und Pause, 8 Takte zu 16 Einheiten bei Tempo 100, das ergibt 19,2 s je Runde. So lang, dass man die
    // Wiederholung kaum bemerkt.
    const NOTEN_INTRO = new music.Melody("~1 @2,90,60,150 -100"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 C3:2 R:2 D3:2 R:2"
        + " A#2:2 R:2 A#2:2 R:2 A2:2 R:2 A2:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D#3:2 R:2"
        + " F3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " G3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " A2:2 R:2 A2:2 R:2 A#2:2 R:2 A2:2 R:2")
    // Darüber nur drei Akzente in 19 Sekunden, fast alles ist Pause. Weicher Anschlag und langer Ausklang lassen sie
    // von weit her kommen. Auch diese Stimme zählt 128 Einheiten.
    const NOTEN_INTRO_HOCH = new music.Melody("~16 @25,140,55,320 -100"
        + " R:16 R:16"
        + " R:8 A5:4 R:4"
        + " R:16"
        + " R:12 A#5:2 A5:2"
        + " R:16"
        + " R:8 D#5:4 D5:4"
        + " R:16")

    // Siegesmusik für den Abspann: D-Dur, dieselbe Tonika wie das d-Moll-Titelthema, nur aufgehellt. 4 Takte zu 16
    // Einheiten bei Tempo 100, das ergibt 9,6 s. Sägezahn als Fanfare, Höhepunkt B5 im dritten Takt, dann die
    // Rückkehr nach D5.
    const NOTEN_SIEG = new music.Melody("~2 @5,25,175,110 -100"
        + " D5:3 D5:1 F#5:4 A5:8"
        + " A5:2 G5:2 F#5:4 E5:4 D5:4"
        + " E5:3 E5:1 G5:4 B5:8"
        + " A5:6 F#5:2 D5:8")
    // Schreitender Begleitbass in Vierteln, D, D, G, A/D: eine ganze Kadenz. 64 Einheiten, genau so lang
    // wie die Fanfare.
    const NOTEN_SIEG_BASS = new music.Melody("~1 @3,25,150,90 -100"
        + " D3:4 D3:4 A3:4 D3:4"
        + " D3:4 D3:4 A2:4 A2:4"
        + " G3:4 G3:4 D3:4 D3:4"
        + " D3:4 D3:4 A2:4 D3:4")

    // Zeigt auf die gerade laufende Hintergrundmusik, damit wir sie gezielt anhalten können, ohne die kurzen Geräusche
    // abzuwürgen (music.stopAllSounds würde alles stoppen). musik_zweite ist die Unterstimme. Sie darf null bleiben,
    // dann klingt das Stück einstimmig (so wie die Schleife im Verlies).
    let musik_laeuft: music.Melody = null
    let musik_zweite: music.Melody = null

    // Startet die Hintergrundmusik. Beide Melody-Objekte laufen ab hier in eigenen Fäden weiter, der Aufrufer wird
    // nicht angehalten. Für einstimmige Musik übergibt man null als zweite.
    function musik_an(haupt: music.Melody, laut_haupt: number,
        zweite: music.Melody, laut_zweite: number) {
        musik_stopp()
        musik_laeuft = haupt
        musik_zweite = zweite
        // Erst die Unterstimme, dann die Melodie: Der winzige Vorsprung des Basses fällt nicht auf, umgekehrt würde die
        // Melodie hörbar hinterherhinken.
        if (musik_zweite != null) {
            musik_zweite.loop(laut_zweite)
        }
        musik_laeuft.loop(laut_haupt)
    }

    // Spielt einen kurzen Klang im Hintergrund. Kehrt sofort zurück, das Spiel läuft ohne Stocken weiter.
    function kurz(m: music.Melody, laut: number) {
        m.play(laut)
    }

    // ---- Kampf ----
    export function schuss() {
        kurz(TON_SCHUSS, LAUT_LEISE)
    }
    export function treffer() {
        kurz(TON_TREFFER, LAUT_MITTEL)
    }
    export function block() {
        kurz(TON_BLOCK, LAUT_MITTEL)
    }
    export function gegner_verpufft() {
        kurz(TON_GEGNER_VERPUFFT, LAUT_MITTEL)
    }
    export function boss_verpufft() {
        kurz(TON_BOSS_VERPUFFT, LAUT_VOLL)
    }
    export function held_getroffen() {
        kurz(TON_AUA, LAUT_VOLL)
    }

    // ---- Gegenstände ----
    export function schluessel() {
        kurz(TON_SCHLUESSEL, LAUT_MITTEL)
    }
    export function herz() {
        kurz(TON_HERZ, LAUT_MITTEL)
    }
    export function muenze() {
        kurz(TON_MUENZE, LAUT_LEISE)
    }
    export function fackel() {
        kurz(TON_FACKEL, LAUT_MITTEL)
    }
    export function truhe() {
        kurz(TON_TRUHE, LAUT_VOLL)
    }

    // ---- Vorspann ----
    export function studiokarte() {
        kurz(TON_STUDIOKARTE, LAUT_VOLL)
    }
    export function donner() {
        kurz(TON_DONNER, LAUT_VOLL)
    }
    export function husch() {
        kurz(TON_HUSCH, LAUT_MITTEL)
    }
    export function anflug() {
        kurz(TON_ANFLUG, LAUT_MITTEL)
    }
    export function einschlag() {
        kurz(TON_EINSCHLAG, LAUT_VOLL)
    }
    export function fanfare() {
        kurz(TON_FANFARE, LAUT_VOLL)
    }
    // Das Logo steht: zwei Stimmen gleichzeitig, beide 2,0 s lang.
    export function logo_steht() {
        kurz(TON_LOGO_TIEF, LAUT_BASS)
        kurz(TON_LOGO_HOCH, LAUT_TITEL)
    }

    // ---- Ablauf ----
    export function ebene_geschafft() {
        kurz(TON_EBENE, LAUT_VOLL)
    }
    export function boss_erscheint() {
        kurz(TON_BOSS_DA, LAUT_VOLL)
    }
    export function tuer_zu() {
        kurz(TON_TUER, LAUT_VOLL)
    }
    export function spiel_vorbei() {
        kurz(TON_ENDE, LAUT_VOLL)
    }
    // Vor der Krönung: Die Zeit wird langsam, Glocken von fern.
    export function glocke() {
        kurz(TON_GLOCKE, LAUT_MITTEL)
    }
    // Die Krone sitzt auf dem Kopf des Helden.
    export function krone() {
        kurz(TON_KRONE, LAUT_VOLL)
    }
    // Der Abspann: das Titelthema, aufgelöst nach Dur.
    export function abspann() {
        kurz(TON_ABSPANN, LAUT_VOLL)
    }

    // ---- Musik ----
    // Titelthema, zweistimmig, in Dauerschleife.
    export function musik_titel() {
        musik_an(NOTEN_TITEL, LAUT_TITEL, NOTEN_TITEL_BASS, LAUT_BASS)
    }

    // Untermalung des Vorspanns. Sie trägt die Geschichte und die Lehrtafeln, intro.leinwand_aus() hält sie an.
    export function musik_intro() {
        musik_an(NOTEN_INTRO, LAUT_MUSIK, NOTEN_INTRO_HOCH, LAUT_FERN)
    }

    // Siegesmusik im Abspann. Sie läuft bis zur ersten Abspann-Karte, dort hält outro.abspielen sie an.
    export function musik_sieg() {
        musik_an(NOTEN_SIEG, LAUT_TITEL, NOTEN_SIEG_BASS, LAUT_BASS)
    }

    // Schleife im Verlies: ein tiefes, pochendes Ostinato in d-Moll. Bis Ebene 9 wird das Tempo mit jeder Ebene
    // schneller (100 + 12 je Ebene, höchstens 200). Ab Ebene 4 hängt sich ein schiefer Nachsatz mit Gis an (Tritonus zu
    // D). Absichtlich karg, denn die Musik läuft die ganze Zeit.
    export function musik_verlies(ebene: number) {
        let takt: number;
        let muster: string;
        musik_stopp()
        takt = 100 + ebene * 12
        if (takt > 200) {
            takt = 200
        }
        muster = "~17 @4,2,80,70 -" + convertToText(takt) + " D3:2 R:2 D3:2 A3:2 D3:2 R:2 F3:2 E3:2"
        if (ebene >= 4) {
            muster = muster + " G#3:2 A3:2 G#3:2 D3:4"
        }
        musik_an(new music.Melody(muster), LAUT_MUSIK, null, 0)
    }

    // Hält beide Schichten der Hintergrundmusik an. Kurze Geräusche, die gerade ausklingen, dürfen zu Ende spielen.
    export function musik_stopp() {
        if (musik_laeuft != null) {
            musik_laeuft.stop()
            musik_laeuft = null
        }
        if (musik_zweite != null) {
            musik_zweite.stop()
            musik_zweite = null
        }
    }
}
