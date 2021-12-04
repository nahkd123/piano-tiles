import { GameMap } from "../../engine/GameMap";
import { BACK_BUTTON } from "../BackButton";
import { Playfield } from "../Playfield";
import { Screen } from "../Screen";

export class PlayfieldScreen extends Screen {

    playfield: Playfield;

    constructor(
        public readonly map: GameMap
    ) {
        super();
        this.playfield = new Playfield(map);
        this.contents.append(this.playfield.container);
        this.playfield.failedCallback = async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            Screen.pop();
            if (Screen.getStack().length > 1) BACK_BUTTON.show();
        };
    }

}
