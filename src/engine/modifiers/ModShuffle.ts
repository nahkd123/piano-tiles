import { NoteInfo } from "../NoteInfo";
import { Modifier } from "./Modifier";

export class ModShuffle extends Modifier {

    name = "Shuffle";
    description = "Shuffle notes around";
    selectedColor = "#ff9cff";

    processNotes(notes: NoteInfo[]) {
        let notesAt = (offset: number) => {
            return notes.filter(v => offset >= v.offset && offset < (v.offset + Math.max(v.duration || 1, 1)));
        };

        const offsetStart = notes[0].offset;
        const offsetEnd = notes.at(-1).offset + Math.max(notes.at(-1).duration || 1, 1);
        const frozenNotes: NoteInfo[] = [];

        for (let i = offsetStart; i < offsetEnd; i++) {
            const notes = notesAt(i)
            const changes = notes.filter(v => !frozenNotes.includes(v));
            let isOccupied = (skip: NoteInfo, lane: number) => {
                return notes.some(v => v != skip && v.index == lane);
            };
            changes.forEach(n => {
                let newLane: number;
                do newLane = Math.floor(Math.random() * 4);
                while (isOccupied(n, newLane));
                n.index = newLane;
                frozenNotes.push(n);
            });
        }
    }

}