import { MIDIConverter } from "../../conversion/MIDIConverter";
import { MapInfo } from "../../engine/GameMap";
import { MapStore } from "../../engine/MapStore";
import { BACK_BUTTON } from "../BackButton";
import { Screen } from "../Screen";
import { MapInfoScreen } from "./MapInfoScreen";

export class ListingScreen extends Screen {

    header: HTMLDivElement;

    listingView: HTMLDivElement;
    uploadMIDIButton: HTMLDivElement;
    newMapButton: HTMLDivElement;

    constructor(public readonly store: MapStore) {
        super();

        this.header = document.createElement("div");
        this.header.className = "header songslisting";
        let headerTitle = document.createElement("div");
        headerTitle.className = "title";
        headerTitle.textContent = "Songs Listing";
        let headerDesc = document.createElement("div");
        headerDesc.className = "description";
        headerDesc.textContent = "Play any song you want!";
        this.header.append(headerTitle, headerDesc);

        this.listingView = document.createElement("div");
        this.listingView.className = "listing";
        this.uploadMIDIButton = document.createElement("div");
        this.uploadMIDIButton.className = "button upload"
        this.uploadMIDIButton.textContent = "Upload MIDI"
        
        this.newMapButton = document.createElement("div");
        this.newMapButton.className = "button upload"
        this.newMapButton.textContent = "New Map"
        this.contents.append(
            this.header,
            this.listingView
        );

        this.applyQuery();
        this.uploadMIDIButton.addEventListener("click", async () => {
            let inp = document.createElement("input");
            inp.type = "file";
            inp.click();
            let files = await new Promise<FileList>(resolve => { inp.onchange = () => { resolve(inp.files); }; });
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
                await this.store.putMap(map);
                await this.applyQuery();
            }
        });
    }

    async applyQuery(query: Partial<MapInfo> = {}) {
        while (this.listingView.firstChild) this.listingView.firstChild.remove();
        let maps = await this.store.queryMaps(query);
        maps.forEach(mapInfo => {
            let inf = document.createElement("div");
            inf.className = "header mini";
            
            let titleView = document.createElement("div");
            titleView.className = "title";
            titleView.textContent = mapInfo.title;
            let mapperView = document.createElement("div");
            mapperView.className = "description";
            mapperView.textContent = `Mapped by ${mapInfo.author}`;
            inf.append(titleView, mapperView);
            this.listingView.append(inf);

            inf.addEventListener("click", async () => {
                const map = await this.store.getMap(mapInfo);
                if (!map) return;
                let screen = new MapInfoScreen(map);
                screen.push();
                BACK_BUTTON.show();
            });
        });
    }

}