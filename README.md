# Kronengewölbe

Hallo! Das ist **Kronengewölbe**, ein Spiel von **Calliope Hacker** für den **Calliope mini 3 mit GameKit**.

Ein Dieb hat die Krone der Burg gestohlen und sich tief unten im Verlies versteckt. Du steigst als Held Ebene für Ebene
hinab. Jede Ebene wird bei jedem Spiel neu und zufällig gebaut. Im Dunkeln siehst du nur einen kleinen Kreis um dich
herum. Finde den Schlüssel, suche die Treppe und lass Gegner mit deinem Feuerball verpuffen. Alle 5 Ebenen
wartet ein Boss, und auf Ebene 15 der Kronenräuber. Besiege ihn und hol die Krone zurück! In der
ersten Ebene hängt übrigens ein kleines Bild vom Calliope Hacker an der Wand.

## So spielst du

- **Steuerkreuz:** laufen und zielen (der Held schaut dorthin, wohin er läuft)
- **A:** Feuerball (gedrückt halten schießt immer wieder)
- **B halten:** die Karte der Ebene ansehen
- **Menü:** Pause, dort kannst du auch den Ton an- und ausschalten
- **Truhen und Fackeln einsammeln:** Dreifach-Schuss, Schnellfeuer, schnelle Stiefel, ein Extra-Herz oder mehr Licht

## Selbst weiterbauen

Der ganze Quelltext steckt in dieser Spieldatei. Öffne sie in MakeCode Arcade (arcade.makecode.com, „Importieren“). Alle
Zahlen zum Ausprobieren stehen in `einstellungen.ts`. Ändere eine Zahl, starte den Simulator und schau, was passiert:

- **Mehr Leben:** Dort steht `START_LEBEN = 6`. Mit `20` startest du mit viel mehr Herzen.
- **Größerer Lichtkreis:** Dort steht `LICHT_NORMAL = 46`. Mit `90` siehst du viel weiter in die Dunkelheit.
- **Schneller schießen:** Dort steht `NACHLADEN_NORMAL = 420`, die Wartezeit zwischen zwei Schüssen in
  Millisekunden. Mit `100` feuerst du fast ohne Pause.

Die Erklärung des Quelltexts für Kinder, Eltern und Lehrkräfte steht auf calliope-hacker.de.
