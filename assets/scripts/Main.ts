import * as cc from "cc";
import { GlobalCommon } from "./common/GlobalCommon";
import { Facade } from "./common/puremvc/patterns/facade/Facade";
import { TestMediator } from "./game/test/TestMediator";
import { NotificationTable } from "./game/config/NotificationTable";
import { LayerManager } from "./common/ui_manager/LayerManager";
import { ResourceManager } from "./common/resource_manager/ResourceManager";
import { BundleManager } from "./common/resource_manager/BundleManager";
import { UIGraphManager } from "./common/ui_manager/UIGraphManager";
import { CustomAtlas } from "./common/resource_manager/other_assets/CustomAtlas";
import { CustomAnimationManager } from "./common/animation/CustomAnimationManager";
import { Vec3 } from "cc";
import { InputManager } from "./common/InputManager";
import { LocalStorageManager } from "./common/LocalStorageManager";
import { Logger } from "./common/Logger";
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

        GlobalCommon.customAnimationManager = new CustomAnimationManager
        GlobalCommon.customAnimationManager.Init()

        GlobalCommon.inputManager = new InputManager
        GlobalCommon.inputManager.Init()

        GlobalCommon.localStorageManager = new LocalStorageManager
        GlobalCommon.localStorageManager.Init()

        GlobalCommon.logger = new Logger
        GlobalCommon.logger.Init()

        await new Promise((resolve) => {
            GlobalCommon.bundleManager.LoadBundle("resources", function () {
                resolve(true)
            })
        })

        await GlobalCommon.uiGraphManager.InitUIRootNode()
        Logger.info("Main onLoading")

        GlobalCommon.Facade = Facade.getInstance("3cframework")
        GlobalCommon.Facade.registerMediator(new TestMediator)

        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Open)
        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Close)
        GlobalCommon.Facade.sendNotification(NotificationTable.Test_Open)

        GlobalCommon.resourcesManager.LoadAsset("http://10.40.3.98/res/h5/anim/hair/hair_9999_1_2", CustomAtlas, null, function () {
            Logger.info("ddddddddddddd")
        }.bind(this))

        // GlobalCommon.resourcesManager.LoadAsset("models/MOB14008/MOB14008", Prefab, GlobalCommon.bundleManager.GetBundle("resources"), function (error, assetCache: AssetCache) {
        //     Logger.info("ddddddddddddd")
        //     let monster = cc.instantiate(assetCache.data as Prefab)
        //     cc.director.getScene().addChild(monster)

        //     let animation = Utils.GetOrAddComponent(monster, cc.SkeletalAnimation)
        //     let state = animation.getState("MOB14008_Attack1")
        //     if (state) {
        //         state.play()
        //     }
        // }.bind(this))

        for (let index = 0; index < 10; index++) {
            let monster = GlobalCommon.customAnimationManager.CreateAnim3D()
            cc.director.getScene().addChild(monster)
            monster.position = new Vec3(index, 0, 0)
        }
    }

    protected update(dt: number): void {
        GlobalCommon.layerManager.Update(dt)
        GlobalCommon.resourcesManager.Update(dt)
        GlobalCommon.bundleManager.Update(dt)
        GlobalCommon.uiGraphManager.Update(dt)
        GlobalCommon.customAnimationManager.Update(dt)
        GlobalCommon.inputManager.Update(dt)
        GlobalCommon.localStorageManager.Update(dt)
        GlobalCommon.logger.Update(dt)
    }

    onDestroy() {
        GlobalCommon.layerManager.Clean()
        GlobalCommon.resourcesManager.Clean()
        GlobalCommon.bundleManager.Clean()
        GlobalCommon.uiGraphManager.Clean()
        GlobalCommon.customAnimationManager.Clean()
        GlobalCommon.inputManager.Clean()
        GlobalCommon.localStorageManager.Clean()
        GlobalCommon.logger.Clean()
    }
}