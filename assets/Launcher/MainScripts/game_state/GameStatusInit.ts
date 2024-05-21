import * as cc from "cc"
import { Global } from "../common/Global";
import * as Core from "Core";
import { LoadAssetByName, LoadBundle } from "../common/ResourceUtils";

export class GameStatusInit extends Core.GameStatus {
    layerProperty = null

    constructor() {
        super("GameStatusInit")
        Core.Logger.info("GameStatusInit constructor");
    }

    async OnEnter() {
        await LoadBundle("MainRes")
        let mainResBundle: Core.BundleCache = Core.BundleManager.GetInstance().GetBundle("MainRes")

        let promise = LoadAssetByName("prefabs/layer/UpdatePanel", cc.Prefab, mainResBundle)
        promise.then(function (asset: cc.Prefab) {
            if (!asset) return
            let updateL = Core.ClonePrefab(asset)
            this.layerProperty = { layerNode: updateL, layerName: "UpdatePanel", uiType: Core.UIEnum.UI_NORMAL }
            Global.uiGraphManager.AddNode(this.layerProperty)
        }.bind(this))
    }

    async OnExit(): Promise<void> {
        Global.uiGraphManager.RemoveNode(this.layerProperty)
    }
}