import * as midiPlayerImport from "midi-player-js";
import { GameMap, MapInfo } from "../engine/GameMap";
import {NoteInfo} from "../engine/NoteInfo";

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
                    if (event.velocity < 0.5) continue;
                    const lastNoteDelta = totalTicks - lastNoteTick;
                    if (lastNoteDelta > 0) {
                        lastNoteTick = totalTicks;
                        if (minNoteDelta == -1 || minNoteDelta > lastNoteDelta) minNoteDelta = lastNoteDelta;
                    }
                    midiNotes.push({
                        tick: totalTicks,
                        index: event.noteNumber
                    });
                }
                if (event.name == "Note off") {
                    // TODO: Implement hold note conversion
                }
            }
        });
        if (minNoteDelta == -1) minNoteDelta = ticksPerBeat / 4;
        const notesPerBeat = ticksPerBeat / minNoteDelta;
        console.log(tempo, notesPerBeat, midiNotes);

        map.initialSpeed = tempo * notesPerBeat / 60;
        map.scrollAcceleration = 0.002;
        let noteOffScale = 1;
        while (map.initialSpeed > 6) {
            map.initialSpeed /= 2;
            noteOffScale /= 2;
        }
        while (map.initialSpeed < 1) {
            map.initialSpeed *= 2;
            noteOffScale *= 2;
        }
        
        function findAll(offset: number) {
            let out: NoteInfo[] = [];
            map.notes.forEach(v => {
                if (v.offset == offset) out.push(v);
            });
            return out;
        }
        midiNotes.forEach((midi, idx) => {
            const lane = midi.index % 4;
            const offset = Math.floor(midi.tick / minNoteDelta * noteOffScale);
            let note = map.notes.find(v => v.offset == offset);
            if (!note) {
                let note = {
                    index: lane,
                    offset,
                    midiIndexes: [midi.index],
                    duration: 1
                };
                map.notes.push(note);
            } else {
                note.midiIndexes.push(midi.index);
                let totalMid = note.midiIndexes.reduce((a, b) => a + b);
                note.index = totalMid % 4;
            }
        });

        // Striping
        let firstNote = map.notes[0];
        const reoffset = firstNote.offset;
        map.notes.forEach((note) => {
            note.offset -= reoffset;
        });
        return map;
    }

}
