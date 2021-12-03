import * as midiPlayerImport from "midi-player-js";
import { GameMap, MapInfo } from "../engine/GameMap";

let midiPlayer: {
    Player: typeof midiPlayerImport.Player

//@ts-ignore
} = midiPlayerImport.default;

/**
 * Convert MIDI file to playable map
 */
export namespace MIDIConverter {

    export function convertFromRaw(
        info: MapInfo,
        raw: ArrayBuffer
    ) {
        let map: GameMap = {
            ...info,
            notes: []
        };
        let player = new midiPlayer.Player(() => {});
        player.loadArrayBuffer(raw);
        let events = player.getEvents() as unknown as midiPlayerImport.Event[][];

        // Stage 1
        let midiNotes: {
            tick: number,
            index: number
        }[] = [];

        let tempo = 30;
        let minNoteDelta = -1;
        const ticksPerBeat = player.division;
        events.forEach(track => {
            let totalTicks = 0;
            let lastNoteTick = 0;

            for (let i = 0; i < track.length; i++) {
                const event = track[i];
                // @ts-ignore
                const delta = event.delta;
                totalTicks += delta;
                if (event.name == "Set Tempo" && event.data > tempo) tempo = event.data;
                if (event.name == "Note on") {
                    const lastNoteDelta = totalTicks - lastNoteTick;
                    if (lastNoteDelta > ticksPerBeat / 16) {
                        lastNoteTick = totalTicks;
                        if (minNoteDelta == -1 || minNoteDelta > lastNoteDelta) minNoteDelta = lastNoteDelta;
                    }
                    midiNotes.push({
                        tick: totalTicks,
                        index: event.noteNumber
                    });
                }
            }
        });
        if (minNoteDelta == -1) minNoteDelta = ticksPerBeat / 4;
        const notesPerBeat = ticksPerBeat / minNoteDelta;
        console.log(tempo, notesPerBeat, midiNotes);

        // Stage 2: Map them
        midiNotes.forEach(midi => {
            const lane = midi.index % 4;
            const offset = Math.floor(midi.tick / minNoteDelta);
            let note = map.notes.find(v => v.index == lane && v.offset == offset);
            if (!note) {
                note = {
                    index: lane,
                    offset,
                    midiIndexes: [midi.index],
                    duration: 1
                };
                map.notes.push(note);
            } else note.midiIndexes.push(midi.index);
        });

        map.initialSpeed = tempo * notesPerBeat / 60;
        map.scrollAcceleration = 0.002;
        // Let's limit at 4n/s
        while (map.initialSpeed > 6) map.initialSpeed /= 2;
        while (map.initialSpeed < 1) map.initialSpeed *= 2;

        // Striping
        let firstNote = map.notes[0];
        const reoffset = firstNote.offset;
        map.notes.forEach((note) => {
            note.offset -= reoffset;
        });
        return map;
    }

}
