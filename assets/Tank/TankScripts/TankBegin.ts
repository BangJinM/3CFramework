import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "./TankGlobalConfig";

@cc._decorator.ccclass('TankBegin')
export class TankBegin extends ccl.BaseUIContainer {
    OnUILoad(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance() as ccl.SubjectManager
        subjectManager.AddObserver(Notify.TankGameEnd, this.RemoveSelf.bind(this))
    }

    OnChildUILoad(): void {
        this.childNode.getChildByName("button_orange").on(cc.Button.EventType.CLICK, () => {
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(Notify.TankGameStart, {})
            ccl.Logger.info("Error")
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(Notify.TankGameEnd, {})
        })
    }

    OnUIDestroy(): void {
        ccl.SubjectManager.GetInstance<ccl.SubjectManager>().RemoveObserver(Notify.TankGameEnd, this.RemoveSelf.bind(this))
    }

    RemoveSelf() {
        ccl.UIGraphManager.GetInstance<ccl.UIGraphManager>().RemoveNode(this)
    }
}   