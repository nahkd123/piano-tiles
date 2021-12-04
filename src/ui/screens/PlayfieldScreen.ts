import { GameMap } from "../../engine/GameMap";
import { BACK_BUTTON } from "../BackButton";
import { Playfield, PlayfieldOptions } from "../Playfield";
import { Screen } from "../Screen";

export class PlayfieldScreen extends Screen {

    playfield: Playfield;

    constructor(
        public readonly map: GameMap,
        public readonly options: PlayfieldOptions = {}
    ) {
        super();
        this.playfield = new Playfield(map, options);
        this.contents.append(this.playfield.container);
        this.playfield.failedCallback = async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            Screen.pop();
            if (Screen.getStack().length > 1) BACK_BUTTON.show();
        };
    }

}
