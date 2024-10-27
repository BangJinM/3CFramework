import * as cc from "cc";
import * as ccl from "ccl";

const { ccclass, property } = cc._decorator;

@ccclass('UpdatePanel')
export class UpdatePanel extends ccl.BaseUIContainer {
    @property(cc.Node)
    btnStart: cc.Node = null!;

    OnUILoad(): void {
        this.btnStart = this.childNode.getChildByName("update_panel").getChildByName("btnStart")
        this.btnStart.on(cc.Button.EventType.CLICK, () => {
            ccl.Logger.info("GameStatusTank")
            ccl.GameStatusManager.GetInstance().ChangeStatus("GameStatusTank")
        }, this)
    }
};
