import { PlayfieldOptions } from "../../ui/Playfield";
import { Modifier } from "./Modifier";

export class ModDoubleSpeed extends Modifier {

    name = "Double Speed";
    description = "Double the notes per second";
    selectedColor = "#ff9c9c";

    modifyOptions(opt: PlayfieldOptions) {
        opt.initialSpeed *= 2;
        opt.scrollAcceleration *= 1.05;
    }

}