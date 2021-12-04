import { mapStore } from "../..";
import { GameMap } from "../../engine/GameMap";
import { Modifier } from "../../engine/modifiers/Modifier";
import { Files } from "../../Files";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { EditScreen } from "./EditScreen";
import { ListingScreen } from "./ListingScreen";
import { ModifiersScreen } from "./ModifiersScreen";
import { PlayfieldScreen } from "./PlayfieldScreen";

export class MapInfoScreen extends Screen {

    metadata: HTMLDivElement;
    diffView: HTMLDivElement;
    speedView: HTMLDivElement;

    modifiers: Modifier[] = [];

    constructor(
        public map: GameMap
    ) {
        super();
        this.metadata = QuickElement.header(map.title, `Mapped by ${map.author}`);

        this.diffView = document.createElement("div");
        this.diffView.className = "diff";
        this.speedView = document.createElement("div");
        this.speedView.className = "speed";
        this.speedView.textContent = `${map.initialSpeed.toFixed(1)} n/s +${map.scrollAcceleration.toFixed(2)}/s`;
        this.diffView.appendChild(this.speedView);
        
        let listing = document.createElement("div");
        listing.className = "listing";
        listing.style.overflow = "hidden";
        
        let playButton: HTMLDivElement;
        let modifiersButton: HTMLDivElement;
        let editButton: HTMLDivElement;
        let exportButton: HTMLDivElement;
        let deleteButton: HTMLDivElement;

        listing.append(
            playButton = QuickElement.header("Start", "Play this map", true),
            modifiersButton = QuickElement.header("Modifiers", "Apply modifiers", true),
            editButton = QuickElement.header("Edit", "Edit this map", true),
            exportButton = QuickElement.header("Export JSON", "Export this map as JSON", true),
            deleteButton = QuickElement.header("Delete", "Delete this map", true),
        );

        this.contents.append(
            this.metadata,
            this.diffView,
            listing
        );

        playButton.addEventListener("click", () => {
            BACK_BUTTON.hide();
            Screen.pop();
            let playfieldScreen = new PlayfieldScreen(map, { modifiers: this.modifiers });
            playfieldScreen.push();
        });
        modifiersButton.addEventListener("click", () => {
            let screen = new ModifiersScreen(this.modifiers);
            screen.push();
        });
        editButton.addEventListener("click", () => {
            BACK_BUTTON.hide();
            Screen.pop(); Screen.pop();
            let screen = new EditScreen(map);
            screen.push();
        });
        exportButton.addEventListener("click", () => {
            Files.downloadJSON(map, `${map.title} (${map.author}).json`);
        });
        deleteButton.addEventListener("click", async () => {
            if (!confirm(`Delete ${map.title} (mapped by ${map.author})? You can create backup by exporting it to JSON.`)) return;
            await mapStore.deleteMap(map);

            Screen.pop();
            let prevScreen = Screen.getStack().at(-1);
            if (!prevScreen) return;
            if (prevScreen instanceof ListingScreen) {
                prevScreen.applyQuery({});
            }
        });
    }

}
