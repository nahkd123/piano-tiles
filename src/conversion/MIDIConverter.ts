import * as midiPlayerImport from "midi-player-js";
import { GameMap, MapInfo } from "../engine/GameMap";
import {NoteInfo} from "../engine/NoteInfo";

let midiPlayer: {
    Player: typeof midiPlayerImport.Player

//@ts-ignore
} = midiPlayerImport.default;

type MIDINote = {
    tick: number,
    index: number,
    velocity: number,
    duration: number
};

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
        let midiNotes: MIDINote[] = [];

        let tempo = 30;
        let minNoteDelta = -1;
        const ticksPerBeat = player.division;
        events.forEach(track => {
            let totalTicks = 0;
            let lastNoteTick = 0;
            let holdingNotes: MIDINote[] = [];

            for (let i = 0; i < track.length; i++) {
                const event = track[i];
                // @ts-ignore
                const delta = event.delta;
                totalTicks += delta;
                if (event.name == "Set Tempo" && event.data > tempo) tempo = event.data;

                function noteOnTrigger() {
                    const lastNoteDelta = totalTicks - lastNoteTick;
                    if (lastNoteDelta > 0) {
                        lastNoteTick = totalTicks;
                        if (minNoteDelta == -1 || minNoteDelta > lastNoteDelta) minNoteDelta = lastNoteDelta;
                    }
                    holdingNotes.push({
                        tick: totalTicks,
                        index: event.noteNumber,
                        velocity: event.velocity || 100,
                        duration: -1
                    });
                }
                function noteOffTrigger() {
                    let noteIdx = holdingNotes.findIndex(v => v.index == event.noteNumber);
                    if (noteIdx == -1) return;
                    let [note] = holdingNotes.splice(noteIdx, 1);
                    note.duration = totalTicks - note.tick;
                    midiNotes.push(note);
                }

                if (event.name == "Note on") {
                    if (event.velocity <= 0) noteOffTrigger();
                    else noteOnTrigger();
                }
                if (event.name == "Note off") { noteOffTrigger(); }
            }
        });
        if (minNoteDelta == -1) minNoteDelta = ticksPerBeat / 4;
        const notesPerBeat = ticksPerBeat / minNoteDelta;

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
        
        midiNotes.forEach((midi, idx) => {
            const lane = midi.index % 4;
            const offset = Math.floor(midi.tick / minNoteDelta * noteOffScale);
            const duration = Math.max(Math.floor(midi.duration / minNoteDelta * noteOffScale), 1);
            let note = map.notes.find(v => v.offset == offset);
            if (!note) {
                let note: NoteInfo = {
                    index: lane,
                    offset,
                    midi: [{ index: midi.index, velocity: midi.velocity / 100 }],
                    duration: 1
                };
                map.notes.push(note);
            } else {
                note.midi.push({ index: midi.index, velocity: midi.velocity / 100 });
                let totalMid = 0;
                note.midi.forEach(a => totalMid += a.index);
                note.index = totalMid % 4;
                if (duration > note.duration) note.duration = duration;
            }
        });

        // Striping
        let firstNote = map.notes[0];
        const reoffset = firstNote.offset;
        map.notes.forEach((note) => { note.offset -= reoffset; });

        // Finalize
        map.notes.sort((a, b) => a.offset - b.offset);
        map.notes.forEach((note, i) => {
            let prev = map.notes[i - 1];
            if (!prev) return;
            if (prev.offset + prev.duration > note.offset) prev.duration = note.offset - prev.offset;
        });

        return map;
    }

}
