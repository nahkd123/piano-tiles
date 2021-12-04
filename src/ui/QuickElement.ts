export namespace QuickElement {

    export function header(title: string, desc: string, mini = false) {
        let e = document.createElement("div");
        e.className = "header";
        if (mini) e.classList.add("mini");
        let t = document.createElement("div");
        t.className = "title";
        t.textContent = title;
        let d = document.createElement("div");
        d.className = "description";
        d.textContent = desc;
        e.append(t, d);
        return e;
    }

}