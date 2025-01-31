import * as cc from "cc";
import * as ccl from "ccl";
import { Global } from "../common/Global";
import { UpdatePanel } from "../hotupdate/UpdatePanel";

export class GameStatusInit extends ccl.GameStatus {
    layerProperty: ccl.BaseUIContainer = null

    constructor() {
        super("GameStatusInit")
        ccl.Logger.info("GameStatusInit constructor");
    }

    OnEnter() {
        let node = new cc.Node()
        this.layerProperty = node.addComponent(UpdatePanel)
        Global.uiGraphManager.AddNode(this.layerProperty)
    }

    OnExit() {
        Global.uiGraphManager.RemoveNode(this.layerProperty)
    }
}