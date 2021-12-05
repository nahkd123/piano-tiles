import { AudioManager } from "../audio/AudioManager";
import { GameMap } from "../engine/GameMap";
import { Modifier } from "../engine/modifiers/Modifier";
import { NoteInfo } from "../engine/NoteInfo";
import { DefaultSkin } from "./Skin";

/**
 * A simple playfield. It can also be used as editor (if you wish)
 */
export class Playfield {

    modifiersStorage: Record<string, any> = {};

    container: HTMLDivElement;
    scoreDisplay: HTMLDivElement;
    speedDisplay: HTMLDivElement;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    skin = new DefaultSkin();
    canvasScale = 1;

    notes: NoteInfo[] = [];
    lastNote: NoteInfo;
    holdNotes: PlayfieldHoldNote[] = [];
    hitAnimations: PlayfieldHitAnimation[] = [];
    score = 0;
    time = 0; scrollPosition = 0;
    nextNote = 0;
    isStarted = false;

    debugIndex = -1; debugOffset = 0;
    failed = false; failedIndex = -1; failedOffset = -1; failedTime = -1;
    failedCallback: () => any;

    constructor(
        public map: GameMap,
        public options: PlayfieldOptions = {}
    ) {
        this.options = {
            initialSpeed: map.initialSpeed,
            scrollAcceleration: map.scrollAcceleration,
            judgementLine: false,
            modifiers: [],
            ...options
        };
        this.options.modifiers.forEach(mod => mod.modifyOptions(this.options));

        this.lastNote = {
            index: 0,
            offset: -9,
            midi: [],
            duration: 1
        };
        this.applyLoop();
        this.scrollPosition = this.scrollPositionAtTime(0);

        this.container = document.createElement("div");
        this.container.className = "container playfield";

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvasScale = devicePixelRatio;
        
        this.scoreDisplay = document.createElement("div");
        this.scoreDisplay.className = "display score";
        this.scoreDisplay.textContent = `${this.score}`;
        
        this.speedDisplay = document.createElement("div");
        this.speedDisplay.className = "display speed";
        this.speedDisplay.textContent = `${this.speedAtTimeDisplay(this.time)} n/s`;

        this.container.append(
            this.canvas,
            this.scoreDisplay,
            this.speedDisplay
        );

        let observer = new ResizeObserver(() => { this.renderCanvas(); });
        observer.observe(this.canvas);

        this.canvas.addEventListener("pointerup", event => {
            const holdIdx = this.holdNotes.findIndex(v => v.pointerId == event.pointerId);
            if (holdIdx == -1) return;
            
            const width = this.canvas.width;
            const height = this.canvas.height;
            const noteWidth = width / 4;
            const noteBaseHeight = noteWidth * 1.75;
            const hold = this.holdNotes[holdIdx];
            const note = hold.note;
            const noteDuration = Math.max(note.duration || 1, 1);
            const noteY = height - (note.offset + noteDuration - this.scrollPosition) * noteBaseHeight;
            const pointerCHeight = Math.floor(hold.pointerY * this.canvasScale);
            const prog = 1 - (pointerCHeight - noteY) / (noteBaseHeight * noteDuration);
            this.hitAnimations.push({
                note: hold.note,
                timestamp: -1,
                holdProgress: prog
            });

            this.score += Math.floor((noteDuration - 1) * (prog + 0.5)); // TODO: add based on prog
            this.scoreDisplay.textContent = `${this.score}`;

            this.holdNotes.splice(holdIdx, 1);
        });
        this.canvas.addEventListener("pointerdown", event => {
            if (this.failed) return;

            const width = this.canvas.offsetWidth;
            const height = this.canvas.offsetHeight;

            const noteWidth = width / 4;
            const noteHeight = noteWidth * 1.75;
            const noteIndex = Math.floor(event.offsetX / noteWidth);
            const noteOffset = (height - event.offsetY) / noteHeight + this.scrollPosition;

            this.debugIndex = noteIndex;
            this.debugOffset = noteOffset;
            const note = this.noteAt(noteOffset, noteIndex);
            if (note != -1) {
                const prevNote = this.notes[note - 1];
                if (prevNote && prevNote.offset < this.notes[note].offset && this.checkFail()) {
                    this.failed = true;
                    this.failedIndex = noteIndex;
                    this.failedOffset = Math.floor(noteOffset);
                } else {
                    this.score++;
                    this.scoreDisplay.textContent = `${this.score}`;
                    this.notes[note].midi?.forEach(midi => {
                        AudioManager.noteAt(midi.index, 0, midi.velocity);
                    });
                    if (Math.max(this.notes[note].duration || 1, 1) == 1) {
                        this.hitAnimations.push({
                            note: this.notes[note],
                            timestamp: -1
                        });
                    } else {
                        this.holdNotes.push({
                            note: this.notes[note],
                            pointerId: event.pointerId,
                            pointerY: event.offsetY
                        });
                    }
                }
                this.notes.splice(note, 1);
                this.applyLoop();
            } else if (this.checkFail()) {
                this.failed = true;
                this.failedIndex = noteIndex;
                this.failedOffset = Math.floor(noteOffset);
            }

            if (!this.isStarted) this.start();
        });
    }

    checkFail() {
        for (let i = 0; i < this.options.modifiers.length; i++) if (!this.options.modifiers[i].onNoteMiss(this)) return false;
        return true;
    }

    renderCanvas() {
        const ctx = this.ctx;
        if (
            this.canvas.width != Math.floor(this.canvas.offsetWidth * this.canvasScale) ||
            this.canvas.height != Math.floor(this.canvas.offsetHeight * this.canvasScale)
        ) {
            this.canvas.width = Math.floor(this.canvas.offsetWidth * this.canvasScale);
            this.canvas.height = Math.floor(this.canvas.offsetHeight * this.canvasScale);
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        const noteWidth = width / 4;
        const noteBaseHeight = noteWidth * 1.75;
        const renderScale = noteWidth / 100;
        
        ctx.clearRect(0, 0, width, height);
        ctx.scale(width / 100, height / 100);
        this.skin.drawBackground(ctx);
        ctx.scale(100 / width, 100 / height);
        
        // Bar lines
        const visibleNotes = Math.floor(height / noteBaseHeight) + 1;
        const topOffset = 1 - (this.scrollPosition % 1);
        for (let i = 0; i < visibleNotes; i++) {
            ctx.translate(0, height - (topOffset + i) * noteBaseHeight);
            ctx.scale(width / 100, height / 100);
            this.skin.drawBarLine(ctx);
            ctx.scale(100 / width, 100 / height);
            ctx.translate(0, -(height - (topOffset + i) * noteBaseHeight));
        }

        // Lanes
        for (let i = 0; i < 4; i++) {
            ctx.translate(noteWidth * i, 0);
            ctx.scale(width / 100, height / 100);
            this.skin.drawLaneSeperator(ctx);
            ctx.scale(100 / width, 100 / height);
            ctx.translate(-(noteWidth * i), 0);
        }

        let missedNotes = [];

        for (let i = 0; i < this.notes.length; i++) {
            if (this.nextNote > i) continue;
            const note = this.notes[i];

            const noteDuration = Math.max(note.duration || 1, 1);
            const noteX = noteWidth * note.index;
            const noteY = height - (note.offset + noteDuration - this.scrollPosition) * noteBaseHeight;
            if (noteY > height) {
                if (this.checkFail()) {
                    this.failed = true;
                    this.failedIndex = note.index;
                    this.failedOffset = note.offset;
                }
                missedNotes.push(note);
            }
            if (noteY + noteBaseHeight * noteDuration < 0) break;

            ctx.translate(noteX, noteY);
            ctx.scale(renderScale, renderScale);
            this.skin.drawNote(ctx, noteDuration, 0.0);
            ctx.scale(1/renderScale, 1/renderScale);
            ctx.translate(-noteX, -noteY);
        }

        for (let i = 0; i < missedNotes.length; i++) {
            const n = missedNotes[i];
            const idx = this.notes.indexOf(n);
            if (idx == -1) return;
            this.notes.splice(idx, 1);
        }

        this.holdNotes.forEach(hold => {
            const note = hold.note;
            const noteDuration = Math.max(note.duration || 1, 1);
            const noteX = noteWidth * note.index;
            const noteY = height - (note.offset + noteDuration - this.scrollPosition) * noteBaseHeight;

            ctx.translate(noteX, noteY);
            ctx.scale(renderScale, renderScale);

            const pointerCHeight = Math.floor(hold.pointerY * this.canvasScale);
            const prog = 1 - (pointerCHeight - noteY) / (noteBaseHeight * noteDuration);
            this.skin.drawNote(ctx, noteDuration, prog);

            ctx.scale(1/renderScale, 1/renderScale);
            ctx.translate(-noteX, -noteY);
        });

        ctx.resetTransform();
    }

    scrollPositionAtTime(t: number) {
        return this.options.initialSpeed * t + (this.options.scrollAcceleration * (t ** 2)) / 2 - 1;
    }

    speedAtTimeDisplay(t: number) {
        const val = this.options.initialSpeed + this.options.scrollAcceleration * t;
        return val.toFixed(1);
    }

    noteAt(offset: number, lane: number) {
        return this.notes.findIndex(v => {
            if (v.index != lane) return;
            const offsetEnd = v.offset + (v.duration || 1);
            return offset >= v.offset && offset < offsetEnd;
        });
    }

    start() {
        let beginTimestamp = -1;
        let render = (ts: number) => {
            if (beginTimestamp == -1) {
                beginTimestamp = ts;
                window.requestAnimationFrame(render);
                return;
            }

            const ctx = this.ctx;
            const width = this.canvas.width;
            const height = this.canvas.height;
            const noteWidth = width / 4;
            const noteHeight = noteWidth * 1.75;
            const renderScale = noteWidth / 100;

            this.renderCanvas();
            if (!this.failed) {
                this.time = (ts - beginTimestamp) / 1000;
                this.scrollPosition = this.scrollPositionAtTime(this.time);
                this.speedDisplay.textContent = `${this.speedAtTimeDisplay(this.time)} n/s`;
            } else {
                if (this.failedTime == -1) this.failedTime = ts;
                const failedDuration = ts - this.failedTime;
                const failAlpha = failedDuration < 200? failedDuration / 200 : 1;
                const targetScroll = Math.floor(this.failedOffset - 1);
                this.scrollPosition = failedDuration < 500? this.scrollPosition * 0.8 + targetScroll * 0.2 : targetScroll;

                ctx.fillStyle = `hsla(0, 100%, ${50 + Math.abs(Math.sin(failedDuration / 200) * 30)}%, ${failAlpha})`;
                ctx.fillRect(this.failedIndex * noteWidth, height - (this.failedOffset + 1 - this.scrollPosition) * noteHeight, noteWidth, noteHeight);
                if (failedDuration > 1800) {
                    if (this.failedCallback) this.failedCallback();
                    return;
                }
            }

            this.hitAnimations.forEach(hit => {
                if (hit.timestamp == -1) hit.timestamp = ts;
                const noteTime = ts - hit.timestamp;
                const noteScale = Math.sqrt(noteTime / 200) * Math.min(this.score / 200, 0.6);
                const noteScaleAdd = 1 + noteScale;
                const noteDuration = Math.max(hit.note.duration || 1, 1);
                const noteX = noteWidth * hit.note.index - noteWidth / 2 * noteScale;
                const noteY = height - (hit.note.offset + noteDuration - this.scrollPosition) * noteHeight - noteHeight / 2 * noteScale;

                ctx.translate(noteX, noteY);
                ctx.scale(renderScale * noteScaleAdd, renderScale * noteScaleAdd);
                ctx.globalAlpha = Math.max(1.0 - noteTime / 200, 0.0);
                this.skin.drawNote(ctx, noteDuration, hit.holdProgress ?? 0.0);
                ctx.globalAlpha = 1.0;
                ctx.scale(1/(renderScale * noteScaleAdd), 1/(renderScale * noteScaleAdd));
                ctx.translate(-noteX, -noteY);
            });
            this.hitAnimations.filter(v => (ts - v.timestamp) >= 200).forEach(hit => {
                this.hitAnimations.splice(this.hitAnimations.indexOf(hit), 1);
            });

            window.requestAnimationFrame(render);
        }
        window.requestAnimationFrame(render);
        this.isStarted = true;
    }

    applyLoop() {
        if (this.notes.length > 0) return;
        const lastNoteEnd = this.lastNote.offset + Math.max(this.lastNote.duration || 1, 1);
        this.map.notes.forEach(note => {
            this.notes.push({
                ...note,
                offset: lastNoteEnd + 8 + note.offset
            });
        });
        this.lastNote = this.notes[this.notes.length - 1];
        this.options.modifiers.forEach(mod => mod.processNotes(this.notes));
    }

}

export interface PlayfieldOptions {

    initialSpeed?: number;
    scrollAcceleration?: number;
    judgementLine?: boolean;
    modifiers?: Modifier[];

}

export interface PlayfieldHitAnimation {

    note: NoteInfo;
    timestamp: number;
    holdProgress?: number;

}

export interface PlayfieldHoldNote {

    note: NoteInfo;
    pointerId: number;
    pointerY: number;

}
