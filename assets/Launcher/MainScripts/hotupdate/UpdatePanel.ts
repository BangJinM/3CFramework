import * as cc from "cc";
import * as ccl from "ccl";

const { ccclass, property } = cc._decorator;

@ccclass('UpdatePanel')
export class UpdatePanel extends ccl.BaseUIComp {
    @property(cc.Node)
    btnStart: cc.Node = null!;

    protected onLoad(): void {
        this.btnStart = this.node.getChildByName("update_panel").getChildByName("btnStart")
        this.btnStart.on(cc.Button.EventType.CLICK, () => {
            ccl.GameStatusManager.GetInstance().ChangeStatus("GameStatusTank")
        }, this)
    }
};
