import { Screen } from "./Screen";

export class BackButton {

    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement("div");
        this.element.className = "backbutton invisible";
        this.element.textContent = "< Back";

        this.element.addEventListener("click", () => {
            Screen.pop();
            if (Screen.getStack().length <= 1) this.hide();
        });
    }

    show() {
        this.element.classList.add("invisibleFinal");
        this.element.classList.remove("invisible");
        setTimeout(() => this.element.classList.remove("invisibleFinal"));
    }

    hide() {
        this.element.classList.add("invisibleFinal");
        setTimeout(() => {
            this.element.classList.remove("invisibleFinal");
            this.element.classList.add("invisible");
        }, 200);
    }

}

export const BACK_BUTTON = new BackButton();
