import * as cc from "cc";
import { GlobalCommon } from "./common/GlobalCommon";
import { Facade } from "./common/puremvc/patterns/facade/Facade";
import { TestMediator } from "./game/test/TestMediator";
import { NotificationTable } from "./game/config/NotificationTable";
import { SingletonManager } from "./common/SingletonManager";
import { LayerManager } from "./common/ui_manager/LayerManager";
import { ResourceManager } from "./common/resource_manager/ResourceManager";
import { BundleManager } from "./common/resource_manager/BundleManager";
import { UIGraphManager } from "./common/ui_manager/UIGraphManager";
import { CustomAtlas } from "./common/resource_manager/other_assets/CustomAtlas";
const { ccclass } = cc._decorator;

@ccclass("Main")
export class Main extends cc.Component {
    protected onLoad(): void {
        this.initUINode()
    }

    async initUINode() {
        GlobalCommon.layerManager = new LayerManager()
        GlobalCommon.layerManager.Init()

        GlobalCommon.resourcesManager = new ResourceManager()
        GlobalCommon.resourcesManager.Init()

        GlobalCommon.bundleManager = new BundleManager()
        GlobalCommon.bundleManager.Init()

        GlobalCommon.uiGraphManager = new UIGraphManager
        GlobalCommon.uiGraphManager.Init()

        await new Promise((resolve) => {
            GlobalCommon.bundleManager.LoadBundle("resources", function () {
                resolve(true)
            })
        })

        await GlobalCommon.uiGraphManager.InitUIRootNode()
        console.log("Main onLoading")

        GlobalCommon.Facade = Facade.getInstance("3cframework")
        GlobalCommon.Facade.registerMediator(new TestMediator)

        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Open)
        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Close)
        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Open)

        GlobalCommon.resourcesManager.LoadAsset("http://10.40.3.98/res/h5/anim/hair/hair_9999_1_2", CustomAtlas, null, function () {
            console.log("ddddddddddddd")
        }.bind(this))
    }

    protected update(dt: number): void {
        GlobalCommon.layerManager.Update(dt)
        GlobalCommon.resourcesManager.Update(dt)
        GlobalCommon.bundleManager.Update(dt)
    }

    onDestroy() {
        GlobalCommon.layerManager.Clean()
        GlobalCommon.resourcesManager.Clean()
        GlobalCommon.bundleManager.Clean()
    }
}