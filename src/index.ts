import { SimpleMapStore } from "./engine/MapStore";
import { ListingScreen } from "./ui/screens/ListingScreen";
import { BACK_BUTTON } from "./ui/BackButton";
import { AudioManager } from "./audio/AudioManager";
import { HomeScreen } from "./ui/screens/HomeScreen";

export const mapStore = new SimpleMapStore();

Promise.all([
    AudioManager.loadSamples()
]).then(() => {
    document.body.append(BACK_BUTTON.element);
    let screen = new HomeScreen();
    screen.push();
});
