import { NoteInfo } from "../../../engine/NoteInfo";
import { BACK_BUTTON } from "../../BackButton";
import { Screen } from "../../Screen";
import { EditScreen } from "../../screens/EditScreen";

/**
 * hmm...
 */

/**
 * Fullscreen editor that's designed for desktop
 */
export class DesktopEditor extends Screen {

    get map() { return this.prevEditor.map; }

    selected: NoteInfo[] = [];
    horizontalZoom = 1.75;
    horizontalScroll = 0;

    pianoWidth = 100;
    pianoNoteHeight = 25;
    verticalScroll = 0; // IMPORTANT: From bottom

    selectedLane = 0;

    constructor(
        public readonly prevEditor: EditScreen
    ) {
        super();
        this.contents.classList.add("desktop-editor");

        let titleBar = document.createElement("div");
        titleBar.className = "titlebar";
        let backButton = document.createElement("div"); backButton.className = "back-button";
        backButton.addEventListener("click", () => this.close());
        let titleElement = document.createElement("div"); titleElement.className = "title";
        titleElement.textContent = this.map.title;
        titleElement.spellcheck = false;
        titleElement.addEventListener("keyup", () => this.map.title = titleElement.textContent);
        titleBar.append(backButton, titleElement);

        this.playfield = document.createElement("canvas");
        this.playfield.className = "playfield";
        this.playfieldCtx = this.playfield.getContext("2d");
        this.playfieldObserver = new ResizeObserver(() => this.renderPlayfield());
        this.playfieldObserver.observe(this.playfield);

        this.pianoRoll = document.createElement("canvas");
        this.pianoRoll.className = "piano-roll";
        this.pianoRollCtx = this.pianoRoll.getContext("2d");
        this.pianoRollObserver = new ResizeObserver(() => this.renderPianoRoll());
        this.pianoRollObserver.observe(this.pianoRoll);

        this.contents.append(
            titleBar,
            this.playfield,
            this.pianoRoll
        );
    }

    open() {
        document.body.classList.add("desktop");
        this.push();
        BACK_BUTTON.hide();
    }

    close() {
        let scr = Screen.getStack().at(-1);
        if (scr != this) return;
        document.body.classList.remove("desktop");
        Screen.pop();
        if (Screen.getStack().length > 1) BACK_BUTTON.show();
        this.playfieldObserver.unobserve(this.playfield);
        this.pianoRollObserver.unobserve(this.pianoRoll);
    }

    renderAll() {
        this.renderPlayfield();
        this.renderPianoRoll();
    }

    playfield: HTMLCanvasElement;
    playfieldObserver: ResizeObserver;
    playfieldCtx: CanvasRenderingContext2D;
    renderPlayfield() {
        const ctx = this.playfieldCtx;
        prepareCanvas(this.playfield, ctx);

        const width = this.playfield.offsetWidth;
        const height = this.playfield.offsetHeight;
        const noteHeight = height / 4;
        const noteWidth = noteHeight * this.horizontalZoom;
        const notesPerView = Math.floor(width / noteWidth) + 1;
        const leftOffsetNotPx = this.horizontalScroll % 1;

        // Grid
        ctx.fillStyle = "#0000000e";
        for (let i = 0; i < notesPerView; i++) ctx.fillRect(this.pianoWidth + (i + leftOffsetNotPx) * noteWidth, -1, 2, height);
        for (let i = 1; i < 4; i++) ctx.fillRect(0, i * noteHeight - 1, width, 2);

        // Notes
        // We'll have different style here
        for (let i = 0; i < this.map.notes.length; i++) {
            const note = this.map.notes[i];
            const noteX = (this.horizontalScroll + note.offset) * noteWidth + this.pianoWidth;
            const noteY = note.index * noteHeight;
            const noteDuration = Math.max(note.duration || 1, 1);
            const bodyDiameter = noteHeight / 2;

            ctx.fillStyle = "#0000007f";
            ctx.fillRect(noteX, noteY, noteDuration * noteWidth, noteHeight);

            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#5c5c5c";
            ctx.lineWidth = 2;

            // Note body
            ctx.beginPath();
            ctx.arc(noteX + noteHeight / 2, noteY + noteHeight / 2, bodyDiameter / 2, Math.PI / 2, Math.PI * 3 / 2);
            ctx.arc(noteX + (noteWidth * noteDuration) - noteHeight / 2, noteY + noteHeight / 2, bodyDiameter / 2, Math.PI * 3 / 2, Math.PI * 5 / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Misc
        ctx.fillStyle = "#7f7f7f";
        ctx.fillRect(0, 0, this.pianoWidth, height);

        ctx.resetTransform();
    }

    pianoRoll: HTMLCanvasElement;
    pianoRollObserver: ResizeObserver;
    pianoRollCtx: CanvasRenderingContext2D;
    renderPianoRoll() {
        const ctx = this.pianoRollCtx;
        prepareCanvas(this.pianoRoll, ctx);

        const width = this.pianoRoll.offsetWidth;
        const height = this.pianoRoll.offsetHeight;

        ctx.fillStyle = "#7f7f7f";
        ctx.fillRect(0, 0, this.pianoWidth, height);
        
        ctx.resetTransform();
    }

}

function prepareCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const pxW = Math.floor(canvas.offsetWidth * devicePixelRatio);
    const pxH = Math.floor(canvas.offsetHeight * devicePixelRatio);
    if (canvas.width != pxW || canvas.height != pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
    }

    ctx.clearRect(0, 0, pxW, pxH);
    ctx.scale(devicePixelRatio, devicePixelRatio);
}
