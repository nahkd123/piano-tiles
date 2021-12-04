import { GameMap } from "../../engine/GameMap";
import { BACK_BUTTON } from "../BackButton";
import { Screen } from "../Screen";
import { PlayfieldScreen } from "./PlayfieldScreen";

export class MapInfoScreen extends Screen {

    metadata: HTMLDivElement;
    titleView: HTMLDivElement;
    mapperView: HTMLDivElement;

    diffView: HTMLDivElement;
    speedView: HTMLDivElement;

    playButton: HTMLDivElement;

    constructor(
        public map: GameMap
    ) {
        super();
        this.metadata = document.createElement("div");
        this.metadata.className = "header";
        this.titleView = document.createElement("div");
        this.titleView.className = "title";
        this.titleView.textContent = map.title;
        this.mapperView = document.createElement("div");
        this.mapperView.className = "description";
        this.mapperView.textContent = `Mapped by ${map.author}`;
        this.metadata.append(this.titleView, this.mapperView);

        this.diffView = document.createElement("div");
        this.diffView.className = "diff";
        this.speedView = document.createElement("div");
        this.speedView.className = "speed";
        this.speedView.textContent = `${map.initialSpeed.toFixed(1)} n/s +${map.scrollAcceleration.toFixed(2)}/s`;
        this.diffView.appendChild(this.speedView);

        this.playButton = document.createElement("div");
        this.playButton.className = "button play";
        this.playButton.textContent = "Start";

        this.contents.append(
            this.metadata,
            this.playButton,
            this.diffView
        );

        this.playButton.addEventListener("click", () => {
            BACK_BUTTON.hide();
            Screen.pop();
            let playfieldScreen = new PlayfieldScreen(map);
            playfieldScreen.push();
        });
    }

}
