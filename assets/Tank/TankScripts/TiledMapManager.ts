import * as cc from "cc"
import * as Core from "Core";

export class TiledMapManager extends Core.ISingleton {
    tiledMap: cc.TiledMap;

    LoadTiledMap(mapName: string) {
        this.tiledMap = cc.find("Canvas/Map").getComponent(cc.TiledMap);
    }
}