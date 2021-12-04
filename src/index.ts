import { IDBMapStore } from "./engine/MapStore";
import { BACK_BUTTON } from "./ui/BackButton";
import { AudioManager } from "./audio/AudioManager";
import { HomeScreen } from "./ui/screens/HomeScreen";
import { Modifier } from "./engine/modifiers/Modifier";
import { ModNoFail } from "./engine/modifiers/ModNoFail";
import { ModSlow } from "./engine/modifiers/ModSlow";
import { ModShuffle } from "./engine/modifiers/ModShuffle";
import { ModConstantSpeed } from "./engine/modifiers/ModConstantSpeed";
import { ModDoubleSpeed } from "./engine/modifiers/ModDoubleSpeed";
import { ModLives } from "./engine/modifiers/ModLives";

export const mapStore = new IDBMapStore();

Promise.all([
    AudioManager.loadSamples(),
    mapStore.loadIDB()
]).then(() => {
    Modifier.registerModifier(new ModNoFail());
    Modifier.registerModifier(new ModLives());
    Modifier.registerModifier(new ModSlow());
    Modifier.registerModifier(new ModConstantSpeed());
    Modifier.registerModifier(new ModDoubleSpeed());
    Modifier.registerModifier(new ModShuffle());

    document.body.append(BACK_BUTTON.element);
    let screen = new HomeScreen();
    screen.push();
});
