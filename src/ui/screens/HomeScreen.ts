import { mapStore } from "../..";
import { MIDIConverter } from "../../conversion/MIDIConverter";
import { GameMap, MapInfo } from "../../engine/GameMap";
import { Files } from "../../Files";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { EditScreen } from "./EditScreen";
import { ListingScreen } from "./ListingScreen";
import { MapInfoScreen } from "./MapInfoScreen";

export class HomeScreen extends Screen {

    constructor() {
        super();
        let listing = document.createElement("div");
        listing.className = "listing";
        listing.style.overflow = "hidden";

        let browse: HTMLDivElement;
        let newButton: HTMLDivElement;
        let importMIDI: HTMLDivElement;
        let importJSON: HTMLDivElement;

        listing.append(
            browse = QuickElement.header("Browse", "Browse imported songs", true),
            newButton = QuickElement.header("New", "Create new song from nothing", true),
            importMIDI = QuickElement.header("Import MIDI", "Import MIDI file", true),
            importJSON = QuickElement.header("Import JSON", "Import JSON map", true),
        );

        browse.addEventListener("click", () => {
            let screen = new ListingScreen(mapStore);
            screen.push();
            BACK_BUTTON.show();
        });
        newButton.addEventListener("click", () => {
            let screen = new EditScreen({
                title: "Untitled",
                author: "<Your name here>",
                initialSpeed: 1.8,
                scrollAcceleration: 0.01,
                notes: [
                    {offset: 0, index: 0, midi: []},
                    {offset: 1, index: 1, midi: []},
                    {offset: 2, index: 2, midi: []},
                    {offset: 3, index: 3, duration: 2, midi: []}
                ],
                id: "customsong-" + Math.random().toString()
            });
            screen.push();
        });
        importMIDI.addEventListener("click", async () => {
            let files = await Files.requestUpload(["audio/midi"]);
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
                await mapStore.putMap(map);
                lastMap = map;
            }

            if (lastMap) {
                let screen = new MapInfoScreen(lastMap);
                screen.push();
                BACK_BUTTON.show();
            }
        });
        importJSON.addEventListener("click", async () => {
            let files = await Files.requestUpload(["application/json"]);
            let lastMap: GameMap;
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i);
                const map: GameMap = JSON.parse(await file.text());
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