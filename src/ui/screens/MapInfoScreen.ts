import { GameMap } from "../../engine/GameMap";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { PlayfieldScreen } from "./PlayfieldScreen";

export class MapInfoScreen extends Screen {

    metadata: HTMLDivElement;
    diffView: HTMLDivElement;
    speedView: HTMLDivElement;

    playButton: HTMLDivElement;

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
