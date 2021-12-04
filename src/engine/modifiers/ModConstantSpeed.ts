import { PlayfieldOptions } from "../../ui/Playfield";
import { Modifier } from "./Modifier";

export class ModConstantSpeed extends Modifier {

    name = "Constant Speed";
    description = "Play without speed changes";
    selectedColor = "#9cff9c";

    modifyOptions(opt: PlayfieldOptions) { opt.scrollAcceleration = 0; }

}