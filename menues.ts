// Pausenmenü und Endbildschirm des Spiels, mit den Texten aus texte.ts.
namespace katalog {
    function zeige_pausenmenue(): void {
        if (menue_offen) return
        menue_offen = true
        game.pushScene()
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let auswahl = 0
        const anzahl = 2
        const zeichner = scene.createRenderable(250, function (ziel_bild: Image) {
            ziel_bild.fill(15)
            ziel_bild.printCenter(text(TextNr.PAUSE), 18, 5, image.font8)
            ziel_bild.printCenter(text(TextNr.WEITERSPIELEN), 46, auswahl == 0 ? 5 : 1, image.font8)
            ziel_bild.printCenter(formatiere(TextNr.TON_STATUS, music.volume()), 64,
                auswahl == anzahl - 1 ? 5 : 1, image.font8)
        })
        while (controller.menu.isPressed() || controller.A.isPressed() || controller.B.isPressed()) pause(20)
        let hoch_war = false
        let runter_war = false
        let a_war = false
        let soll_schliessen = false
        while (!soll_schliessen) {
            const hoch = controller.up.isPressed()
            const runter = controller.down.isPressed()
            const gedrueckt = controller.A.isPressed()
            if (hoch && !hoch_war) auswahl = (auswahl + anzahl - 1) % anzahl
            if (runter && !runter_war) auswahl = (auswahl + 1) % anzahl
            if (controller.B.isPressed() || controller.menu.isPressed()) soll_schliessen = true
            if (gedrueckt && !a_war) {
                if (auswahl == 0) soll_schliessen = true
                else if (auswahl == anzahl - 1) {
                    const lautstaerke = music.volume() == 0 ? 128 : 0
                    music.setVolume(lautstaerke)
                    settings.writeNumber("#volume", lautstaerke)
                }
            }
            hoch_war = hoch
            runter_war = runter
            a_war = gedrueckt
            pause(20)
        }
        while (controller.A.isPressed() || controller.B.isPressed() || controller.menu.isPressed()) pause(20)
        zeichner.destroy()
        game.popScene()
        menue_offen = false
    }
    export function installiere_menues(): void {
        controller.menu.onEvent(ControllerButtonEvent.Pressed, zeige_pausenmenue)
        game.onGameOver(function (gewonnen: boolean) {
            info.saveHighScore()
            const punkte = info.score()
            const bestpunkte = info.highScore()
            game.pushScene()
            controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
            scene.createRenderable(250, function (ziel_bild: Image) {
                ziel_bild.fill(15)
                ziel_bild.printCenter(text(gewonnen ? TextNr.GEWONNEN : TextNr.SPIEL_VORBEI),
                    26, gewonnen ? 5 : 2, image.font8)
                ziel_bild.printCenter(formatiere(TextNr.PUNKTE, punkte), 52, 1, image.font8)
                ziel_bild.printCenter(formatiere(TextNr.BESTPUNKTE, bestpunkte), 69, 5, image.font8)
                ziel_bild.printCenter(text(TextNr.NEUSTART), 98, 1, image.font8)
            })
            warte_auf_neues_a(1000)
            // Nach dem Spielende führt der Neustart zum Titelbild und nicht noch einmal durch den Vorspann (siehe
            // neustart_merker in texte.ts). Die kurze Pause gibt dem Simulator Zeit, das Merkzeichen zu speichern: Im
            // Browser lädt control.reset() die ganze Seite neu, und die Einstellungen werden dort nur alle 200 ms
            // geschrieben. Auf dem Gerät schreibt settings sofort in den Flash.
            settings.writeNumber(neustart_merker, 1)
            pause(300)
            control.reset()
        })
    }

    // Wartet auf einen neuen Druck auf A, frühestens nach sperre_ms Millisekunden. Wer beim letzten Treffer A hält oder
    // hämmert (A ist auch der Feuerknopf), drückt so den Text am Spielende nicht ungelesen weg.
    export function warte_auf_neues_a(sperre_ms: number): void {
        const sperre_ende_ms = control.millis() + sperre_ms
        let a_war = true
        while (true) {
            const gedrueckt = controller.A.isPressed()
            if (gedrueckt && !a_war && control.millis() >= sperre_ende_ms) break
            a_war = gedrueckt
            pause(20)
        }
    }

    // Bricht einen Text in Zeilen mit höchstens breite Zeichen um. Nach einem Punkt beginnt immer eine neue Zeile,
    // damit zum Beispiel „Punkte: 345“ zusammenbleibt. Ein einzelner Doppelpunkt mit Leerzeichen davor (so schreibt man
    // ihn im Französischen) bleibt beim Wort davor.
    export function breche_um(meldung: string, breite: number): string[] {
        const woerter = meldung.split(" ")
        const zeilen: string[] = []
        let zeile = ""
        for (let i = 0; i < woerter.length; i++) {
            let wort = woerter[i]
            if (i + 1 < woerter.length && woerter[i + 1] == ":") {
                wort = wort + " :"
                i++
            }
            if (zeile.length == 0) zeile = wort
            else if (zeile.length + 1 + wort.length <= breite) zeile = zeile + " " + wort
            else {
                zeilen.push(zeile)
                zeile = wort
            }
            if (wort.charAt(wort.length - 1) == ".") {
                zeilen.push(zeile)
                zeile = ""
            }
        }
        if (zeile.length > 0) zeilen.push(zeile)
        return zeilen
    }

    // Zeigt den Text am Spielende (TextNr.ENDE) in einem eigenen Kasten über dem stehenden Spielbild. A zählt erst nach
    // einer Sekunde, damit niemand den Text samt Punkten versehentlich wegdrückt. Danach erscheint
    // der Hinweis TextNr.DRUECKE_A.
    export function zeige_abschied(meldung: string): void {
        const zeilen = breche_um(meldung, 22)
        game.pushScene()
        game.currentScene().flags |= scene.Flag.SeeThrough
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let bereit = false
        const hoehe = zeilen.length * 11 + 26
        const oben = (120 - hoehe) >> 1
        const zeichner = scene.createRenderable(250, function (ziel_bild: Image) {
            ziel_bild.fillRect(8, oben, 144, hoehe, 1)
            ziel_bild.drawRect(8, oben, 144, hoehe, 12)
            ziel_bild.drawRect(9, oben + 1, 142, hoehe - 2, 11)
            for (let i = 0; i < zeilen.length; i++) {
                ziel_bild.printCenter(zeilen[i], oben + 8 + i * 11, 15, image.font8)
            }
            if (bereit) ziel_bild.printCenter(text(TextNr.DRUECKE_A), oben + hoehe - 14, 12, image.font8)
        })
        control.runInParallel(function () {
            pause(1000)
            bereit = true
        })
        warte_auf_neues_a(1000)
        zeichner.destroy()
        game.popScene()
    }
}
