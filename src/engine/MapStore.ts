import { IDBPDatabase, openDB } from "idb";
import { GameMap, MapInfo, TEST_MAP } from "./GameMap";

export abstract class MapStore {

    /**
     * Query maps based on given info. 1 song can have multiple maps, but 1 ID can
     * only be assigned to 1 map
     * @param info The info to query
     */
    abstract queryMaps(info: Partial<MapInfo>): Promise<MapInfo[]>;

    /**
     * Get map from given info
     * @param info The info to get. Some MapStore implementations might requires ID field
     * to present
     */
    abstract getMap(info: MapInfo): Promise<GameMap>;

    abstract putMap(map: GameMap): Promise<boolean>;

    abstract deleteMap(map: GameMap): Promise<boolean>;

}

export class SimpleMapStore extends MapStore {

    maps: GameMap[] = [
        {...TEST_MAP, id: "0"}
    ];

    async queryMaps(info: Partial<MapInfo>) {
        const title = info.title ?? "";
        const author = info.author ?? "";
        return this.maps.filter(v => v.title.includes(title) && v.author.includes(author));
    }

    async getMap(info: MapInfo) { return this.maps.find(v => v.id == info.id); }

    async putMap(map: GameMap) {
        const prevIdx = this.maps.findIndex(v => v.id == map.id);
        if (prevIdx != -1) this.maps.splice(prevIdx, 1, map);
        else this.maps.push(map);
        return true;
    }

    async deleteMap(map: GameMap) {
        const prevIdx = this.maps.findIndex(v => v.id == map.id);
        if (prevIdx != -1) {
            this.maps.splice(prevIdx, 1);
            return true;
        }
        return false;
    }

}

export class IDBMapStore extends MapStore {

    db: IDBPDatabase;

    constructor() {
        super();
    }

    async loadIDB() {
        this.db = await openDB("nahkd-piano-tiles", 1, {
            upgrade(db, old, newV, tx) {
                let store = db.createObjectStore("maps", { keyPath: "id" });
                store.put(TEST_MAP);
            }
        });
    }

    async queryMaps(info: Partial<MapInfo>): Promise<MapInfo[]> {
        const title = info.title ?? "";
        const author = info.author ?? "";

        let tx = this.db.transaction("maps", "readonly");
        let store = tx.objectStore("maps");
        let cursor = await store.openCursor();
        let maps: GameMap[] = [];
        while (cursor && cursor.value) {
            let map: GameMap = cursor.value;
            if (map.title.includes(title) && map.author.includes(author)) maps.push(cursor.value);
            cursor = await cursor.continue();
        }
        return maps;
    }

    async getMap(info: MapInfo): Promise<GameMap> {
        let tx = this.db.transaction("maps", "readonly");
        let store = tx.objectStore("maps");
        let map: GameMap = await store.get(info.id);
        return map;
    }

    async putMap(map: GameMap): Promise<boolean> {
        let tx = this.db.transaction("maps", "readwrite");
        let store = tx.objectStore("maps");
        await store.put(map);
        return true;
    }
    
    async deleteMap(map: GameMap): Promise<boolean> {
        let tx = this.db.transaction("maps", "readwrite");
        let store = tx.objectStore("maps");
        await store.delete(map.id);
        return true;
    }

}
