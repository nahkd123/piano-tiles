import { mapStore } from "../..";
import { AudioManager } from "../../audio/AudioManager";
import { GameMap } from "../../engine/GameMap";
import { MIDINoteInfo, NoteInfo } from "../../engine/NoteInfo";
import { Files } from "../../Files";
import { BACK_BUTTON } from "../BackButton";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";
import { PlayfieldScreen } from "./PlayfieldScreen";

const SELECTED_INSET = 4;
const LONG_TAP_MS = 500;

export class EditScreen extends Screen {

    hideBack = true;

    title: HTMLDivElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pianoContainer: HTMLDivElement;

    scroll = 0;
    smoothScrollTo = 0;
    selectedNotes: NoteInfo[] = [];
    get selectedNote() { return this.selectedNotes[0]; }
    set selectedNote(v: NoteInfo) { this.selectedNotes = [v]; }

    ghostNote: NoteInfo;
    targetNote: NoteInfo;

    constructor(
        public map: GameMap
    ) {
        super();
        this.contents.className = "editor";

        let titleBar = document.createElement("div");
        titleBar.className = "titlebar";

        let topBackButton = document.createElement("div"); topBackButton.className = "back";
        this.title = document.createElement("div"); this.title.className = "title"; this.title.textContent = map.title;
        let optionsButton = document.createElement("div"); optionsButton.className = "options"; optionsButton.textContent = "Options";
        titleBar.append(topBackButton, this.title, optionsButton);

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.pianoContainer = document.createElement("div");
        this.pianoContainer.className = "piano";
        this.constructPiano();

        let observer = new ResizeObserver(() => { this.renderCanvas(); });
        observer.observe(this.canvas);

        this.contents.append(
            titleBar,
            this.canvas,
            this.pianoContainer
        );

        topBackButton.addEventListener("click", () => {
            Screen.pop();
            if (Screen.getStack().length > 1) BACK_BUTTON.show();
            mapStore.putMap(map);
        });

        optionsButton.addEventListener("click", () => {
            let screen = new EditOptionsScreen(this);
            screen.push();
            BACK_BUTTON.show();
        });

        this.canvas.addEventListener("pointerdown", eventDown => {
            const rect = this.canvas.getBoundingClientRect();
            const ptWidth = this.canvas.offsetWidth;
            const ptHeight = this.canvas.offsetHeight;
            const noteWidth = ptWidth / 4;
            const noteHeight = noteWidth * 1.75;
            
            const interactedLane = Math.floor(eventDown.pageX / noteWidth);
            const interactedOffset = (ptHeight - eventDown.pageY + rect.y) / noteHeight + this.scroll;

            const oldScroll = this.scroll;
            let scrollLock = true;
            let smoothScrollVelocity = 0;

            let longTap = false;
            let longTapOldDuration = -1;
            let longTapTask = setTimeout(() => {
                longTap = true;
                this.ghostNote = undefined;
                console.log("long tap detected");
                navigator.vibrate([20]);

                this.targetNote = this.map.notes.find(v =>
                    v.index == interactedLane &&
                    interactedOffset >= v.offset &&
                    interactedOffset < (v.offset + (v.duration ?? 1))
                );
                if (!this.targetNote) this.ghostNote = {
                    index: interactedLane,
                    offset: Math.floor(interactedOffset),
                    midi: this.getSelectedMIDINotes(),
                    duration: 1
                }; else {
                    longTapOldDuration = this.targetNote.duration || 1;
                }
                this.renderCanvas();
            }, LONG_TAP_MS);

            let pointerMove = (eventMove: PointerEvent) => {
                if (!scrollLock) {
                    if (longTap) {
                        const yIncreasement = (ptHeight - eventMove.pageY + rect.y) / noteHeight + this.scroll - interactedOffset;
                        if (this.targetNote) this.targetNote.duration = Math.max(Math.round(longTapOldDuration + yIncreasement), 1);
                        else this.ghostNote.duration = Math.max(Math.round(1 + yIncreasement), 1);
                        this.renderCanvas();
                        return;
                    }

                    smoothScrollVelocity = eventMove.movementY;
                    this.scroll = Math.max(oldScroll + (eventMove.pageY - eventDown.pageY) / noteHeight, 0);
                    this.renderCanvas();
                    return;
                }

                const offDistance = Math.sqrt((eventMove.offsetX - eventDown.offsetX) ** 2 + (eventMove.offsetY - eventDown.offsetY) ** 2);
                if (offDistance > 7.0) {
                    scrollLock = false;
                    clearTimeout(longTapTask);
                    return;
                }
            };

            let pointerUp = (eventUp: PointerEvent) => {
                document.removeEventListener("pointermove", pointerMove);
                document.removeEventListener("pointerup", pointerUp);
                clearTimeout(longTapTask);

                const ptWidth = this.canvas.offsetWidth;
                const ptHeight = this.canvas.offsetHeight;
                const noteWidth = ptWidth / 4;
                const noteHeight = noteWidth * 1.75;
                
                if (this.ghostNote) {
                    this.map.notes.push(this.ghostNote);
                    this.map.notes.sort((a, b) => a.offset - b.offset);
                } else if (!scrollLock) { /* TODO: Implement smooth scroll here */ }
                else {
                    const note = this.map.notes.find(v =>
                        v.index == interactedLane &&
                        interactedOffset >= v.offset &&
                        interactedOffset < (v.offset + (v.duration ?? 1))
                    );

                    if (note) {
                        if (longTap) this.map.notes.splice(this.map.notes.indexOf(note), 1);
                        else {
                            this.selectedNote = note;
                            this.applySelectedMIDINotes(note.midi);
                        }
                    } else if (this.selectedNote) this.selectedNotes = [];
                    else {
                        let note: NoteInfo = {
                            index: interactedLane,
                            offset: Math.floor(interactedOffset),
                            midi: this.getSelectedMIDINotes(),
                            duration: 1
                        };
                        this.map.notes.push(note);
                        this.map.notes.sort((a, b) => a.offset - b.offset);
                    }
                }

                this.ghostNote = undefined;
                this.renderCanvas();
            };

            document.addEventListener("pointermove", pointerMove);
            document.addEventListener("pointerup", pointerUp);
        });
        console.log(this);
    }

    constructPiano() {
        const NOTES_NAMING = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const BEGIN_OFFSET = 9;

        let whiteNoteIndex = 0;
        let appendLater: HTMLDivElement[] = [];
        for (let note = 0; note < 88; note++) {
            // IMPORTANT: A0 starts from 21, C1 starts from 24
            const noteName = NOTES_NAMING[(BEGIN_OFFSET + note) % NOTES_NAMING.length];
            let e = document.createElement("div");
            e.id = `${21 + note}`;
            if (noteName == "C") e.textContent = `${Math.floor((BEGIN_OFFSET + note) / NOTES_NAMING.length)}`;
            e.style.setProperty("--note-offset", `${whiteNoteIndex}`);
            e.className = "note";
            if (noteName.includes("#")) {
                e.classList.add("sharp");
                appendLater.push(e);
            } else {
                whiteNoteIndex++;
                this.pianoContainer.appendChild(e);
            }

            e.addEventListener("click", () => {
                if (e.classList.contains("selected")) {
                    e.classList.remove("selected");
                    this.selectedNotes.forEach(inf => {
                        const idx = inf.midi.findIndex(v => v.index == (21 + note));
                        if (idx != -1) inf.midi.splice(idx, 1);
                    });
                } else {
                    e.classList.add("selected");
                    AudioManager.noteAt(note + 21, 0, 1);
                    this.selectedNotes.forEach(inf => {
                        const idx = inf.midi.findIndex(v => v.index == (21 + note));
                        if (idx == -1) inf.midi.push({ index: (21 + note), velocity: 1.0 });
                    });
                }
            });
        }

        appendLater.forEach(n => this.pianoContainer.appendChild(n));
    }

    applySelectedMIDINotes(midi: MIDINoteInfo[]) {
        for (let i = 0; i < this.pianoContainer.children.length; i++) {
            const e = this.pianoContainer.children.item(i);
            const related = midi.find(v => v.index == parseInt(e.id));
            e.classList.remove("selected");
            if (related) e.classList.add("selected");
        }
    }

    getSelectedMIDINotes() {
        let list: MIDINoteInfo[] = [];
        for (let i = 0; i < this.pianoContainer.children.length; i++) {
            const e = this.pianoContainer.children.item(i);
            if (e.classList.contains("selected")) list.push({ index: parseInt(e.id), velocity: 1.0 });
        }
        return list;
    }

    renderCanvas() {
        const pxWidth = Math.floor(this.canvas.offsetWidth * devicePixelRatio);
        const pxHeight = Math.floor(this.canvas.offsetHeight * devicePixelRatio);
        if (this.canvas.width != pxWidth || this.canvas.height != pxHeight) {
            this.canvas.width = pxWidth;
            this.canvas.height = pxHeight;
        }

        const ptWidth = this.canvas.offsetWidth;
        const ptHeight = this.canvas.offsetHeight;

        this.ctx.clearRect(0, 0, pxWidth, pxHeight);
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        // We're now in pt coord space

        const noteWidth = ptWidth / 4;
        const noteHeight = noteWidth * 1.75;

        // Render grid
        this.ctx.strokeStyle = "#0000002e";
        this.ctx.lineWidth = 2;
        const topOffset = 1 - (this.scroll % 1);
        const barLinesCount = Math.floor(ptHeight / noteHeight) + 1;
        for (let i = 0; i < barLinesCount; i++) {
            const barLineY = ptHeight - (topOffset + i) * noteHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, barLineY);
            this.ctx.lineTo(ptWidth, barLineY);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        for (let i = 1; i < 4; i++) {
            const lX = noteWidth * i;
            this.ctx.beginPath();
            this.ctx.moveTo(lX, 0);
            this.ctx.lineTo(lX, ptHeight);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        // Render notes
        let renderNote = (note: NoteInfo) => {
            const noteDuration = Math.max(note.duration || 1, 1);
            const noteY = ptHeight - (note.offset + noteDuration - this.scroll) * noteHeight;
            if (noteY > ptHeight) return false;
            if (noteY + noteHeight * noteDuration < 0) return true;
            const isSelected = this.selectedNotes.includes(note);

            if (noteDuration == 1) this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            else {
                let gradient = this.ctx.createLinearGradient(0, noteY + 175 * noteDuration, 0, noteY);
                gradient.addColorStop(0, "rgba(0,0,0,0.8)");
                gradient.addColorStop(1 / (noteDuration - 0.5), "rgba(156,117,83,0.8)");
                this.ctx.fillStyle = gradient;
            }
            this.ctx.fillRect(note.index * noteWidth, noteY, noteWidth, noteHeight * noteDuration);

            let arcAt = (x: number, y: number, r: number, start = 0, end = Math.PI * 2) => {
                this.ctx.beginPath();
                this.ctx.moveTo(x + r, y);
                this.ctx.arc(x, y, r, start, end);
                this.ctx.closePath();
            };

            // Guide
            this.ctx.fillStyle = isSelected? "#FF8A00" : "#ffffff";
            if (noteDuration > 1) {
                let fillHold = (rad: number) => {
                    this.ctx.beginPath();
                    this.ctx.moveTo((note.index + 0.5) * noteWidth + rad, noteY + noteHeight / 2);
                    this.ctx.arc((note.index + 0.5) * noteWidth, noteY + noteHeight / 2, rad, Math.PI, Math.PI * 2);
                    this.ctx.lineTo((note.index + 0.5) * noteWidth - rad, noteY + noteHeight / 2);
                    this.ctx.lineTo((note.index + 0.5) * noteWidth - rad, noteY + noteHeight * (noteDuration - 0.5));
                    this.ctx.lineTo((note.index + 0.5) * noteWidth + rad, noteY + noteHeight * (noteDuration - 0.5));
                    this.ctx.moveTo((note.index + 0.5) * noteWidth, noteY + noteHeight * (noteDuration - 0.5));
                    this.ctx.arc((note.index + 0.5) * noteWidth, noteY + noteHeight * (noteDuration - 0.5), rad, 0, Math.PI);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                fillHold(noteWidth / 4);
                if (isSelected) {
                    this.ctx.fillStyle = "#FFB258";
                    fillHold(noteWidth / 4 - SELECTED_INSET);
                }
            } else {
                arcAt((note.index + 0.5) * noteWidth, noteY + noteHeight / 2, noteWidth / 4);
                this.ctx.fill();
                if (isSelected) {
                    this.ctx.fillStyle = "#FFB258";
                    arcAt((note.index + 0.5) * noteWidth, noteY + noteHeight / 2, noteWidth / 4 - SELECTED_INSET);
                    this.ctx.fill();
                }
            }
            return false;
        }
        for (let i = 0; i < this.map.notes.length; i++) if (renderNote(this.map.notes[i])) break;

        if (this.ghostNote) {
            this.ctx.globalAlpha = 0.5;
            renderNote(this.ghostNote);
            this.ctx.globalAlpha = 1;
        }

        this.ctx.resetTransform();
        // We're now in px coord space
    }

}

export class EditOptionsScreen extends Screen {

    constructor(public readonly editor: EditScreen) {
        super();
        let listing = document.createElement("div");
        listing.className = "listing";

        let testButton: HTMLDivElement;
        let setTitleButton: HTMLDivElement;
        let setMapperButton: HTMLDivElement;
        let setSpeedButton: HTMLDivElement;
        let setAccelButton: HTMLDivElement;
        let exportButton: HTMLDivElement;

        listing.append(
            testButton = QuickElement.header("Test", "Open the player so you can test it", true),
            setTitleButton = QuickElement.header("Set Title", "Set the song title", true),
            setMapperButton = QuickElement.header("Set Mapper", "Set the mapper so everyone can find you", true),
            setSpeedButton = QuickElement.header("Set Speed", "Set initial speed (notes/s)", true),
            setAccelButton = QuickElement.header("Set Acceleration", "Set speed acceleration (notes/s^2)", true),
            exportButton = QuickElement.header("Export JSON", "Export as JSON", true),
        );

        testButton.addEventListener("click", () => {
            let screen = new PlayfieldScreen(editor.map);
            screen.push();
            BACK_BUTTON.hide();
        });

        setTitleButton.addEventListener("click", () => {
            this.editor.map.title = prompt("Type the title:", this.editor.map.title);
            this.editor.title.textContent = this.editor.map.title;
        });
        setMapperButton.addEventListener("click", () => { this.editor.map.author = prompt("Type the mapper's name:", this.editor.map.author); });
        setSpeedButton.addEventListener("click", () => { this.editor.map.initialSpeed = parseFloat(prompt("Type the initial speed (notes/s):", `${this.editor.map.initialSpeed}`)); });
        setAccelButton.addEventListener("click", () => { this.editor.map.scrollAcceleration = parseFloat(prompt("Type the acceleration (notes/s^2):", `${this.editor.map.scrollAcceleration}`)); });

        exportButton.addEventListener("click", () => {
            Files.downloadJSON(editor.map, `${editor.map.title} (${editor.map.author}).json`);
        });

        this.contents.append(
            QuickElement.header("Edit Options", "Select an option or go back"),
            listing
        );
    }

}