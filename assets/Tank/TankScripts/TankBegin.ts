import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "./TankGlobalConfig";

@cc._decorator.ccclass('TankBegin')
export class TankBegin extends ccl.BaseUIContainer {

    OnUILoad(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance() as ccl.SubjectManager
        subjectManager.AddObserver(Notify.TankGameEnd, () => {
            let uiGraphManager: ccl.UIGraphManager = ccl.UIGraphManager.GetInstance()
            uiGraphManager.RemoveNode(this)
        })

        this.childNode.getChildByName("button_orange").on(cc.Button.EventType.CLICK, () => {
            subjectManager.NotifyObserver(Notify.TankGameStart, {})
            ccl.Logger.info("Error")
            subjectManager.NotifyObserver(Notify.TankGameEnd, {})
        })
    }
}   