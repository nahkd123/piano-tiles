import { QuickElement } from "../QuickElement";
import * as npmPackage from "../../../package.json";
import { Screen } from "../Screen";

let openURL = (url: string) => window.open(url, "_blank").focus();

export class AboutScreen extends Screen {

    constructor() {
        super();
        let listing = document.createElement("div");
        listing.className = "listing";
        
        let sourceCodeButton: HTMLDivElement;
        let issuesButton: HTMLDivElement;
        let creditsButtons: HTMLDivElement;

        listing.append(
            QuickElement.header("Version", npmPackage.version, true),
            QuickElement.header("Made By", npmPackage.author, true),
            sourceCodeButton = QuickElement.header("Source Code", "nahkd's Piano Tiles is open sourced!", true),
            issuesButton = QuickElement.header("Bugs Tracker", "Open the bugs tracker", true),
            creditsButtons = QuickElement.header("Credits", "All the awesome people!", true),
        );

        sourceCodeButton.addEventListener("click", () => openURL(npmPackage.homepage));
        issuesButton.addEventListener("click", () => openURL(npmPackage.bugs.url));
        creditsButtons.addEventListener("click", () => {
            new CreditScreen().push();
        });

        this.contents.append(
            QuickElement.header("About", "nahkd's Piano Tiles"),
            listing
        );
    }

}

class CreditScreen extends Screen {

    constructor() {
        super();
        let listing = document.createElement("div");
        listing.className = "listing";

        Object.keys(npmPackage.credits).forEach((k) => {
            const c = npmPackage.credits[k] as { author: string, url: string, license: string };
            let e = QuickElement.header(c.author, `for ${k} ${c.license? `(${c.license})` : ""}`, true);
            listing.appendChild(e);
            if (c.url) e.addEventListener("click", () => openURL(c.url));
        });
        
        this.contents.append(
            QuickElement.header("Credits", "All the awesome people!"),
            listing
        );
    }

}