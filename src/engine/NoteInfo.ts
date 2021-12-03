export interface NoteInfo {

    /** Note offset in note units */
    offset: number;

    /** Note duration. It must always larger than or equals to 1 */
    duration?: number;

    /** Note index from 0 to 3. Value outside 4 will get wrapped back (a.k.a ``index %= 4``) */
    index: number;

    /** MIDI note indexes to play key sound. -1 for no sound, 0 for C0, 1 for D0, etc. */
    midiIndexes: number[];

}