import { Modifier } from "../../engine/modifiers/Modifier";
import { QuickElement } from "../QuickElement";
import { Screen } from "../Screen";

export class ModifiersScreen extends Screen {

    constructor(public readonly mods: Modifier[]) {
        super();

        let listing = document.createElement("div");
        listing.className = "listing";

        Modifier.modifiers.forEach(mod => {
            let e = QuickElement.header(mod.name, mod.description, true);
            if (mods.includes(mod)) e.classList.add("selected");
            e.style.setProperty("--selected-color", mod.selectedColor);
            listing.appendChild(e);

            e.addEventListener("click", () => {
                const idx = mods.indexOf(mod)
                if (idx != -1) {
                    e.classList.remove("selected");
                    mods.splice(idx, 1);
                } else {
                    e.classList.add("selected");
                    mods.push(mod);
                }
            });
        });

        this.contents.append(
            QuickElement.header("Modifiers", "Make your life easier or harder!"),
            listing
        );
    }

}