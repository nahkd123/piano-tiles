export namespace AudioManager {

    export const Context = new AudioContext({ latencyHint: "interactive" });
    export let PIANO_SAMPLE: AudioBuffer;

    export async function sampleFromServer(path: string) {
        let fetchInfo = await fetch(path);
        if (!fetchInfo.ok) return null;
        
        let arrbuff = await fetchInfo.arrayBuffer();
        let sample = await Context.decodeAudioData(arrbuff);
        return sample;
    }

    export async function loadSamples() {
        PIANO_SAMPLE = await sampleFromServer("334537__teddy-frost__c5.wav");
    }

    export function playCheck() { if (Context.state != "running") Context.resume(); }
    export function noteAt(midi: number, delay: number) {
        if (!PIANO_SAMPLE) return;
        playCheck();

        let node = Context.createBufferSource();
        node.buffer = PIANO_SAMPLE;
        node.detune.value = (midi - 72) * 100;
        node.connect(Context.destination);
        node.start(delay);
    }

}
