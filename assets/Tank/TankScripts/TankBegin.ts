import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "./Config/NoticeTable";
@cc._decorator.ccclass('TankBegin')
export class TankBegin extends ccl.BaseUIContainer {
    uiType = ccl.UIEnum.UI_NORMAL
    layerName = "TankRes/Prefabs/TankBegin"
    mainPrefabPropty = { bundleName: "Tank", prefabName: "TankRes/Prefabs/TankBegin" }

    OnChildUILoad(): void {
        this.childNode.getChildByName("button_orange").on(cc.Button.EventType.CLICK, () => {
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.Tank_UI_GameBegin_End, {})
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.TankGameStart, null)
        })
    }
}   