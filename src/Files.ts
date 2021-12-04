export namespace Files {

    export function requestUpload(accepts: string[] = []) {
        let inp = document.createElement("input");
        inp.type = "file";
        inp.accept = accepts.join(",");
        inp.click();
        return new Promise<FileList>(resolve => { inp.onchange = () => { resolve(inp.files); }; });
    }

    export function download(blob: Blob, saveAs: string) {
        let a = document.createElement("a");
        let url = URL.createObjectURL(blob);
        a.href = url;
        a.download = saveAs;
        a.click();
        URL.revokeObjectURL(url);
    }

    export function downloadJSON(json: any, saveAs: string) { download(new Blob([JSON.stringify(json)], { type: "application/json" }), saveAs); }

}