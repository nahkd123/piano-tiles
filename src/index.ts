import { TEST_MAP } from "./engine/GameMap";
import { SimpleMapStore } from "./engine/MapStore";
import { Playfield } from "./ui/Playfield";
import { Screen } from "./ui/Screen";
import { MapInfoScreen } from "./ui/screens/MapInfoScreen";
import { HomeScreen } from "./ui/screens/HomeScreen";
import { BACK_BUTTON } from "./ui/BackButton";

document.body.append(BACK_BUTTON.element);

let mapStore = new SimpleMapStore();
let screen = new HomeScreen(mapStore);
screen.push();
