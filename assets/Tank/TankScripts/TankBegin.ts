import * as ccl from "ccl";
import * as cc from "cc"
import { NotifyID } from "./TankGlobalConfig";
export class TankBegin extends ccl.BaseUIComp {
    protected onLoad(): void {
        this.node.getChildByName("button_orange").on(cc.Button.EventType.CLICK, () => {
            (ccl.SubjectManager.GetInstance() as ccl.SubjectManager).NotifyObserver(NotifyID.TankGameStart, {})
            ccl.Logger.info("Error")
        })
    }
}   