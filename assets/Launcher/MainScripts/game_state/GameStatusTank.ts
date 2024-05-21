import * as cc from "cc"
import { Global } from "../common/Global";
import * as Core from "Core";
import { LoadAssetByName, LoadBundle } from "../common/ResourceUtils";

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
            let promise = LoadAssetByName("TankRes/Prefabs/TankMain", cc.Prefab, mainResBundle)
            promise.then(function (asset: cc.Prefab) {
                asset.addRef()

                cc.director.runScene(scene, null, function () {
                    cc.director.getScene().addChild(Core.CloneNP(asset))
                    asset.decRef()
                })
            })
        })
    }

    async OnExit(): Promise<void> {
        let bundleManager: Core.BundleManager = Core.BundleManager.GetInstance()
        bundleManager.RemoveBundle("Tank")
    }
}