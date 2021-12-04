import { mapStore } from "../..";
import { MIDIConverter } from "../../conversion/MIDIConverter";
import { GameMap, MapInfo } from "../../engine/GameMap";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { ListingScreen } from "./ListingScreen";
import { MapInfoScreen } from "./MapInfoScreen";

export class HomeScreen extends Screen {

    constructor() {
        super();
        let listing = document.createElement("div");
        listing.className = "listing";
        listing.style.overflow = "hidden";

        let browse: HTMLDivElement;
        let importMIDI: HTMLDivElement;

        listing.append(
            browse = QuickElement.header("Browse", "Browse imported songs", true),
            QuickElement.header("New", "Create new song from nothing", true),
            importMIDI = QuickElement.header("Import MIDI", "Import MIDI file", true),
            QuickElement.header("Import JSON", "Import JSON map (and you can export it too!)", true),
        );

        browse.addEventListener("click", () => {
            let screen = new ListingScreen(mapStore);
            screen.push();
            BACK_BUTTON.show();
        });
        importMIDI.addEventListener("click", async () => {
            let inp = document.createElement("input");
            inp.type = "file";
            inp.click();
            let files = await new Promise<FileList>(resolve => { inp.onchange = () => { resolve(inp.files); }; });
            let lastMap: GameMap;
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i);
                const info: MapInfo = {
                    title: file.name,
                    author: "Autoconverter (MIDI)",
                    initialSpeed: 1.8,
                    scrollAcceleration: 0.01,
                    id: file.name + "-" + Math.random()
                };
                const map = MIDIConverter.convertFromRaw(info, await file.arrayBuffer());
                console.log(map);
                await mapStore.putMap(map);
                lastMap = map;
            }

            if (lastMap) {
                let screen = new MapInfoScreen(lastMap);
                screen.push();
                BACK_BUTTON.show();
            }
        });

        this.contents.append(
            QuickElement.header("Welcome!", "What do you want?"),
            listing
        );
    }

}