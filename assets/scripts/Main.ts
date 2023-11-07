import * as cc from "cc";
import UIGraphManager from "./common/ui_manager/UIGraphManager";
import { Global } from "./Global";
import { Facade } from "./common/puremvc/patterns/facade/Facade";
import { TestMediator } from "./game/test/TestMediator";
import { NotificationTable } from "./game/config/NotificationTable";
const { ccclass } = cc._decorator;

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

        cc.assetManager.resources
        cc.assetManager.main.load
    }
}