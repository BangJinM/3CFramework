import * as cc from "cc";
import * as ccl from "ccl";

export class TiledMapManager extends ccl.ISingleton {
    tiledMap: cc.TiledMap;

    LoadTiledMap(mapName: string) {
        this.tiledMap = cc.find("Canvas/Map").getComponent(cc.TiledMap);
    }
}