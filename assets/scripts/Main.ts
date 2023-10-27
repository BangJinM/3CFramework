import * as cc from "cc";
const { ccclass } = cc._decorator;
import UIGraphManager from "./common/ui_manager/UIGraphManager";
import resourceManager from "./common/resource_manager/resource_index";
import { InstantiatePrefab } from "./common/resource_manager/ResourceUtils";
import LayerManager, { LayerProperty } from "./common/ui_manager/LayerManager";
import { UIEnum } from "./common/ui_manager/UIEnum";
import { Global } from "./Global";
import { Facade } from "./common/puremvc/patterns/facade/Facade";
import { TestMediator } from "./game/TestMediator";
import { NotificationTable } from "./game/config/NotificationTable";

@ccclass("Main")
export class Main extends cc.Component {
    protected onLoad(): void {
        this.initUINode()
    }

    async initUINode() {
        await UIGraphManager.InitUIRootNode()
        console.log("Main onLoading")

        Global.Facade = Facade.getInstance("3cframework")
        Global.Facade.registerMediator(new TestMediator)

        Global.Facade.sendNotification(NotificationTable.Test_Open)
        Global.Facade.sendNotification(NotificationTable.Test_Close)
        Global.Facade.sendNotification(NotificationTable.Test_Open)
    }
}