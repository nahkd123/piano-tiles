import { SimpleMapStore } from "./engine/MapStore";
import { ListingScreen } from "./ui/screens/ListingScreen";
import { BACK_BUTTON } from "./ui/BackButton";
import { AudioManager } from "./audio/AudioManager";

Promise.all([
    AudioManager.loadSamples()
]);

document.body.append(BACK_BUTTON.element);

let mapStore = new SimpleMapStore();
let screen = new ListingScreen(mapStore);
screen.push();
