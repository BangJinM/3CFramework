import * as cc from "cc"
import { Global } from "../common/Global";
import * as Core from "Core";
import { LoadAssetByName, LoadBundle } from "../../../Core/Runtime/ResourceManager/ResourceUtils";
import { TankMain } from "../../../Tank/TankScripts/TankMain";

@cc._decorator.ccclass("GameStatusTank")
export class GameStatusTank extends Core.GameStatus {
    constructor() {
        super("GameStatusTank")
        Core.Logger.info("GameStatusTank constructor");
    }

    async OnEnter() {
        await LoadBundle("Tank")
        let mainResBundle: Core.BundleCache = Core.BundleManager.GetInstance().GetBundle("Tank")

        mainResBundle.bundle.loadScene("TankMain", function (error, scene: cc.Scene) {
            cc.director.runScene(scene, null, function () {
                TankMain.GetInstance().Init()
            })
        })
    }

    async OnExit(): Promise<void> {
        let bundleManager: Core.BundleManager = Core.BundleManager.GetInstance()
        bundleManager.RemoveBundle("Tank")
    }
}