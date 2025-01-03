import * as cc from "cc";
import * as ccl from "ccl";

const { ccclass, property } = cc._decorator;

@ccclass('UpdatePanel')
export class UpdatePanel extends ccl.BaseUIContainer {
    uiType = ccl.UIEnum.UI_NORMAL;
    layerName = "prefabs/layer/UpdatePanel"
    mainPrefabPropty: ccl.UiRefPrefabProperty = { bundleName: "resources", prefabName: "prefabs/layer/UpdatePanel" }
    @property(cc.Node)
    btnStart: cc.Node = null!;

    OnChildUILoad(): void {
        this.btnStart = this.childNode.getChildByName("update_panel").getChildByName("btnStart")
        this.btnStart.on(cc.Button.EventType.CLICK, () => {
            ccl.Logger.info("GameStatusTank")
            ccl.GameStatusManager.GetInstance<ccl.GameStatusManager>().ChangeStatus("GameStatusTank")
        }, this)
    }
};
