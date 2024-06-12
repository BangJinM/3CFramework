import * as cc from "cc"
import { Global } from "../common/Global";
import * as ccl from "ccl";

export class GameStatusInit extends ccl.GameStatus {
    layerProperty = null

    constructor() {
        super("GameStatusInit")
        ccl.Logger.info("GameStatusInit constructor");
    }

    async OnEnter() {
        await ccl.LoadBundle("MainRes")

        let node = new cc.Node()
        this.layerProperty = node.addComponent(ccl.BaseUIContainer)
        this.layerProperty.bundleName = "MainRes"
        this.layerProperty.uiType = ccl.UIEnum.UI_NORMAL
        this.layerProperty.prefabURL = "prefabs/layer/UpdatePanel"
        this.layerProperty.layerName = "prefabs/layer/UpdatePanel"

        Global.uiGraphManager.AddNode(this.layerProperty)
    }

    async OnExit(): Promise<void> {
        Global.uiGraphManager.RemoveNode(this.layerProperty)
    }
}