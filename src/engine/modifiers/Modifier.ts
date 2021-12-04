import { Playfield, PlayfieldOptions } from "../../ui/Playfield";
import { NoteInfo } from "../NoteInfo";

export abstract class Modifier {

    abstract name: string;
    abstract description: string;
    selectedColor = "#ffcaca";

    /**
     * Modify the playfield options
     * @param opt The playfield options
     */
    modifyOptions(opt: PlayfieldOptions) {}

    /**
     * Process next notes. You shouldn't touch the note offset, unless you're making
     * swing modifier (which is cool I think)
     * @param notes Notes to process
     */
    processNotes(notes: NoteInfo[]) {}

    /**
     * Triggered when player miss a note
     * @param playfield The playfield with active modifier
     * @returns true will play fail animation
     */
    onNoteMiss(playfield: Playfield) { return true; }

    static modifiers: Modifier[] = [];
    static registerModifier(mod: Modifier) { this.modifiers.push(mod); }

}
