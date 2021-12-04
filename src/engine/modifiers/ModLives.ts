import { Playfield } from "../../ui/Playfield";
import { Modifier } from "./Modifier";


export class ModLives extends Modifier {

    name = "5x Lives";
    description = "You can only miss 5 notes";
    selectedColor = "#9cff9c";

    onNoteMiss(playfield: Playfield) {
        let lives: number = playfield.modifiersStorage["nahkd123::lives"] ?? 5;
        if (lives > 0) {
            lives--;
            playfield.modifiersStorage["nahkd123::lives"] = lives;
            navigator.vibrate([80]);
            return false;
        } else return true;
    }

}
