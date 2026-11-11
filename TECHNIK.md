# Technik: Kronengewölbe

Hier steht kurz, wie der Quelltext aufgebaut ist und wie du ihn baust. Die Begrüßung und die ersten Ideen zum Umbauen
stehen in `README.md`.

## Aufbau

Das ist ein Projekt für MakeCode Arcade, geschrieben in TypeScript. `pxt.json` nennt den Projektnamen `kronengewoelbe`
und alle Dateien in der Reihenfolge, in der MakeCode sie liest und ausführt. `mkc.json` sagt, für welches Gerät gebaut
wird: den Calliope mini 3 mit GameKit (Variante „n3“). Die Dateien `tilemap.g.ts` und `tilemap.g.jres` erzeugt der
Editor, sie stehen nur da und werden nicht von Hand geändert.

Die Dateien des Spiels:

- `texte.ts`: Alle Texte des Spiels: Zu jeder Nummer aus der Aufzählung TextNr gehört genau ein Text in der Liste texte.
- `menues.ts`: Pausenmenü und Endbildschirm des Spiels, mit den Texten aus texte.ts.
- `einstellungen.ts`: Einstellungen: Hier kannst du schrauben!
- `grafik.ts`: Grafiken: alle Kacheln, Sprites und abgeleiteten Bilder.
- `arten.ts`: Sprite-Arten (SpriteKind) für Gegenstände, Dekoration und Anzeige.
- `gegner.ts`: Gegner: Datenklasse, Erzeugung, Suche, Schüsse und die Steuerung des Bosses.
- `zustand.ts`: Globaler Spielzustand.
- `hilfen.ts`: Kleine Hilfsfunktionen ohne eigenen Zustand.
- `klang.ts`: Klang: alle Töne und die Musik an einer Stelle.
- `kino.ts`: Kino: der Werkzeugkasten für Vorspann und Abspann.
- `intro.ts`: Intro: die Geschichte und die Studio-Karte vor dem Titelbild.
- `lehre.ts`: Lehrtafeln: das Tutorial im Vorspann.
- `outro.ts`: Outro: der Sieg.
- `licht.ts`: Dunkelheit und Licht: der Sichtkreis um den Helden.
- `verlies.ts`: Das Verlies erzeugen: Raster, Räume, Gänge, Fallen und Tilemap.
- `gegenstaende.ts`: Gegenstände und Dekoration: setzen und beim Wechsel der Ebene wegräumen.
- `held.ts`: Der Held: Feuerbälle schießen, das Bild zur Blickrichtung wählen und Treffer einstecken.
- `titelbild.ts`: Das Titelbild und seine Bausteine: Steinmauer, Fackeln, Titelbild und Titelschirm.
- `ebene.ts`: Eine ganze Ebene aufbauen.
- `ereignisse.ts`: Alle Ereignis-Handler.
- `anzeige.ts`: Anzeige: die Ebenen-Nummer unten links und die Übersichtskarte auf Taste B.
- `main.ts`: Ein Zufalls-Verlies-Spiel für MakeCode Arcade.
- `tilemap.g.ts`: Vom Editor erzeugter Code.

## So läuft das Spiel

1. `katalog.richte_ein` in `texte.ts` prüft, ob dieser Start ein Neustart nach dem Spielende ist, und richtet die Menüs
   ein.
2. `titelschirm` in `titelbild.ts` spielt den Vorspann ab: die Geschichte, die Karte „Calliope Hacker präsentiert“, die
   Titelkarte und die Lehrtafeln. Mit A kannst du jede Station überspringen. Danach zeigt es das Titelbild und wartet
   auf A.
3. `main.ts` legt den Helden, das Bild für die Dunkelheit und die Anzeige an und ruft `baue_ebene` auf.
4. `baue_ebene` in `ebene.ts` baut eine Ebene: `erzeuge_raeume` und `grabe_gang` (in `verlies.ts`) graben Räume und
   Gänge in das Raster, `zeichne_raster` macht daraus die Tilemap. Dann kommen Schlüssel, Gegner, Fallen, Truhen und die
   Treppe dazu.
5. In jedem Bild läuft die Funktion in `game.onUpdate` in `main.ts`: Blickrichtung des Helden, Feuern mit A,
   Sternenwölkchen und Licht. Alle 280 Millisekunden steuert `game.onUpdateInterval` in `main.ts` die Gegner.
6. Berührungen (Feuerball trifft Gegner, Held sammelt etwas ein, Held steht auf der Treppe) behandeln die Handler in
   `ereignisse.ts`.
7. Wenn der Kronenräuber fällt, spielt `outro.abspielen` in `outro.ts` den Abspann.

Das Raster einer Ebene ist 26 Kacheln breit und 22 Kacheln hoch. Jede Kachel ist
eine Zahl in `raster`: 0 ist Wand, 2 die Treppe, 3 eine Falle, alles andere Boden. Wie schwer das Spiel wird, steht
in `einstellungen.ts`.

## Töne, Grafik und Speichern

- **Grafik:** Die Bilder stehen in `grafik.ts`, Namen mit `BILD_` sind Sprites, mit `KACHEL_` Kacheln. Alles andere wird
  beim Spielen aus Rechtecken, Kreisen und Linien gemalt. So bleibt die Spieldatei klein.
- **Ton:** `klang.ts` sammelt alle Töne und die Musik. Ein Klang ist ein kurzer Text aus Noten (`new
  music.Melody("…")`).
- **Speichern:** Der Bestwert (`info.saveHighScore`) und die Lautstärke bleiben auf dem Gerät gespeichert. Wenn du ein
  anderes Programm aufspielst, löscht MakeCode beim nächsten Start den gespeicherten Stand.

## Bauen

- **Im Browser:** Öffne arcade.makecode.com, wähle „Importieren“ und öffne die Spieldatei `kronengewoelbe.hex`. In der
  Spieldatei steckt der ganze Quelltext. Der Simulator zeigt das Spiel sofort.
- **Am Computer:** Mit dem Kommandozeilenwerkzeug von MakeCode (npm-Paket `makecode`) rufst du in diesem Ordner
  `makecode build` auf. Die Spieldatei für das Gerät liegt danach in `built/n3/binary.hex`.

## Auf das Gerät

Steck den Calliope mini 3 mit dem USB-Kabel an den Computer. Er erscheint als Laufwerk. Zieh die Spieldatei (`.hex`)
auf dieses Laufwerk; danach startet das Spiel von selbst. Der Bildschirm des GameKit hat 160 × 120 Pixel und 16 Farben.

Dieses Spiel gibt es auch auf Englisch, Französisch und Spanisch. Alle vier Fassungen entstehen aus demselben
Ausgangsprojekt.
