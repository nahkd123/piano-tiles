import { PlayfieldOptions } from "../../ui/Playfield";
import { Modifier } from "./Modifier";

export class ModJudgementLine extends Modifier {

    name = "Judgement Line";
    description = "Play with judgement line. DFJK keys binding included";
    selectedColor = "#ff9cff";

    modifyOptions(opt: PlayfieldOptions) { opt.judgementLine = true; }

}