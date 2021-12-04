import { MIDIConverter } from "../../conversion/MIDIConverter";
import { MapInfo } from "../../engine/GameMap";
import { MapStore } from "../../engine/MapStore";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { MapInfoScreen } from "./MapInfoScreen";

export class ListingScreen extends Screen {

    header: HTMLDivElement;

    listingView: HTMLDivElement;
    uploadMIDIButton: HTMLDivElement;
    newMapButton: HTMLDivElement;

    constructor(public readonly store: MapStore) {
        super();

        this.header = QuickElement.header("Songs Listing", "Play any song you want!");
        this.header.classList.add("songslisting");

        this.listingView = document.createElement("div");
        this.listingView.className = "listing";
        this.contents.append(
            this.header,
            this.listingView
        );

        this.applyQuery();
    }

    async applyQuery(query: Partial<MapInfo> = {}) {
        while (this.listingView.firstChild) this.listingView.firstChild.remove();
        let maps = await this.store.queryMaps(query);
        maps.forEach(mapInfo => {
            let inf = QuickElement.header(mapInfo.title, `Mapped by ${mapInfo.author}`, true);
            this.listingView.append(inf);

            inf.addEventListener("click", async () => {
                const map = await this.store.getMap(mapInfo);
                if (!map) return;
                let screen = new MapInfoScreen(map);
                screen.push();
            });
        });
    }

}