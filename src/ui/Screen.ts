import { BACK_BUTTON } from "./BackButton";

const SCREENS_STACK: Screen[] = [];

export class Screen {

    hideBack = false;

    parent: HTMLDivElement;
    contents: HTMLDivElement;

    constructor() {
        this.parent = document.createElement("div");
        this.parent.className = "screen pop";

        this.contents = document.createElement("div");
        this.parent.appendChild(this.contents);
    }

    screenPushAnimation() { this.parent.classList.remove("pop"); }
    screenPopAnimation() { this.parent.classList.add("pop"); }

    push() {
        document.body.appendChild(this.parent);
        SCREENS_STACK.push(this);
        setTimeout(() => this.screenPushAnimation());
    }

    static pop() {
        let screen = SCREENS_STACK.pop();
        screen.screenPopAnimation();
        setTimeout(() => screen.parent.remove(), 200);
        return screen;
    }

    static getStack() { return SCREENS_STACK; }

}