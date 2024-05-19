import * as cc from "cc"
import { Global } from "../common/Global";
import * as Core from "Core";
import { LoadAssetByName, LoadBundle } from "../common/ResourceUtils";
import { Logger } from "../../../Core/Runtime/Logger";
import { BundleManager } from "../../../Core/Runtime/ResourceManager/BundleManager";

export class GameStatusInit extends Core.GameStatus {
    constructor() {
        super("GameStatusInit")
        Logger.info("GameStatusInit constructor");
    }

    async OnEnter() {
        Logger.info("GameStatusInit OnEnter")
        await Global.Init()

        await LoadBundle("MainRes")
        let mainResBundle: Core.BundleCache = BundleManager.GetInstance().GetBundle("MainRes")

        let promise = LoadAssetByName("prefabs/layer/UpdatePanel", cc.Prefab, mainResBundle)
        promise.then(function (asset: cc.Prefab) {
            if (!asset) return
            let updateL = Core.ClonePrefab(asset)
            Global.uiGraphManager.AddNode({ layerNode: updateL, layerName: "UpdatePanel", uiType: Core.UIEnum.UI_NORMAL })
        })
    }
}