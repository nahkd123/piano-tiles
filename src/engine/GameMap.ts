import { NoteInfo } from "./NoteInfo";

export interface MapInfo {

    title: string;
    author: string;
    id?: any;

    initialSpeed: number;
    scrollAcceleration: number;

}

export interface GameMap extends MapInfo {

    notes: NoteInfo[];

}

export const TEST_MAP: GameMap = {
    title: "Test Map",
    author: "nahkd123",

    initialSpeed: 1.6,
    scrollAcceleration: 0.02,
    notes: [
        {offset:  0, index: 0, duration: 2, midiIndexes: []},
        {offset:  0, index: 2, duration: 2, midiIndexes: []},
        {offset:  2, index: 1, duration: 2, midiIndexes: []},
        {offset:  2, index: 3, duration: 2, midiIndexes: []},

        {offset:  4, index: 0, midiIndexes: []},
        {offset:  5, index: 1, midiIndexes: []},
        {offset:  6, index: 2, midiIndexes: []},
        {offset:  7, index: 3, midiIndexes: []},
        {offset:  8, index: 2, midiIndexes: []},
        {offset:  9, index: 1, midiIndexes: []},
        {offset: 10, index: 0, midiIndexes: []},
        {offset: 11, index: 2, midiIndexes: []},
        {offset: 12, index: 1, midiIndexes: []},
        {offset: 13, index: 3, midiIndexes: []},
        {offset: 14, index: 0, midiIndexes: []},
        {offset: 15, index: 1, midiIndexes: []},
        {offset: 16, index: 3, midiIndexes: []},
        {offset: 17, index: 2, midiIndexes: []},
        {offset: 18, index: 1, midiIndexes: []},
        {offset: 19, index: 2, midiIndexes: []},
        {offset: 20, index: 1, midiIndexes: []},

        {offset: 21, index: 0, midiIndexes: []},
        {offset: 21, index: 2, midiIndexes: []},
        {offset: 22, index: 1, midiIndexes: []},
        {offset: 22, index: 3, midiIndexes: []},
        {offset: 23, index: 0, midiIndexes: []},
        {offset: 23, index: 2, midiIndexes: []},
        {offset: 24, index: 1, midiIndexes: []},
        {offset: 24, index: 3, midiIndexes: []},
        {offset: 25, index: 0, midiIndexes: []},
        {offset: 25, index: 2, midiIndexes: []},
        {offset: 26, index: 1, midiIndexes: []},
        {offset: 26, index: 3, midiIndexes: []},
        {offset: 27, index: 0, midiIndexes: []},
        {offset: 27, index: 2, midiIndexes: []},
        {offset: 28, index: 1, midiIndexes: []},
        {offset: 28, index: 3, midiIndexes: []},
    ]
};
