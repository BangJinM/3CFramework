import * as cc from 'cc';
import * as ccl from "ccl";

import { NoticeTable } from "../Config/NoticeTable";
import { UITable } from "../Config/UITable";
import { TankBegin } from "../TankBegin";

export interface JumpInfo {
    type: typeof ccl.BaseUIContainer;
    key: number;
    open: number;
    close: number;
}

@cc._decorator.ccclass("TankUIManager")
export class TankUIManager extends ccl.ISingleton {
    uis: JumpInfo[] = [
        { key: UITable.TankGameBegin, type: TankBegin, open: NoticeTable.Tank_UI_GameBegin_Open, close: NoticeTable.Tank_UI_GameBegin_End },
    ]
    private uiMap = {}

    Init() {
        for (const element of this.uis) {
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().AddObserver(element.open, this.OpenUI.bind(this, element))
            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().AddObserver(element.close, this.CloseUI.bind(this, element))
        };
    }

    OpenUI(info: JumpInfo) {
        let node = new cc.Node()
        let comp = node.addComponent(info.type)
        ccl.UIGraphManager.GetInstance<ccl.UIGraphManager>().AddNode(comp)
        this.uiMap[info.key] = comp
    }

    CloseUI(info: JumpInfo) {
        ccl.UIGraphManager.GetInstance<ccl.UIGraphManager>().RemoveNode(this.uiMap[info.key])
    }
}


