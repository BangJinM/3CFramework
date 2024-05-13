import * as cc from "cc"
import { Global } from "../common/Global";
import { GameStatus } from "./GameStatus";
import * as core from "core";
import { LoadAssetByName } from "../common/ResourceUtils";

export class GameStatusInit extends GameStatus {
    constructor() {
        super("GameInitStatus")
        console.log("GameInit");
    }

    async OnEnter() {
        await Global.Init()

        let resources = new core.BundleCache()
        resources.bundle = cc.assetManager.getBundle("resources")
        let promise = LoadAssetByName("prefabs/layer/UpdatePanel", cc.Prefab, resources)
        promise.then(function (asset: cc.Prefab) {
            if (!asset) return
            let updateL = core.ClonePrefab(asset)
            let property = new core.LayerProperty()
            property.layerNode = updateL
            property.name = "UpdatePanel"
            property.uiType = core.UIEnum.UI_NORMAL
            core.LayerManager.GetInstance().AddNode(property)
        })
    }
}