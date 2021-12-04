import { PlayfieldOptions } from "../../ui/Playfield";
import { Modifier } from "./Modifier";

export class ModSlow extends Modifier {

    name = "Slow";
    description = "Halves the notes per second";
    selectedColor = "#9cff9c";

    modifyOptions(opt: PlayfieldOptions) {
        opt.initialSpeed /= 2;
        opt.scrollAcceleration /= 1.5;
    }

}