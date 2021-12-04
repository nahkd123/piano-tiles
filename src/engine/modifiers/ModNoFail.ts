import { Modifier } from "./Modifier";

export class ModNoFail extends Modifier {

    name = "No Fail";
    description = "You can no longer fail";
    selectedColor = "#9cff9c";

    onNoteMiss() { return false; }

}
