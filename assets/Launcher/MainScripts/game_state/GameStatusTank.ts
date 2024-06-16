import * as cc from "cc"
import { Global } from "../common/Global";
import * as ccl from "ccl";
import { TankMain } from "../../../Tank/TankScripts/TankMain";

@cc._decorator.ccclass("GameStatusTank")
export class GameStatusTank extends ccl.GameStatus {
    constructor() {
        super("GameStatusTank")
        ccl.Logger.info("GameStatusTank constructor");
    }

    async OnEnter() {
        await ccl.LoadBundle("Tank")
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance().GetBundle("Tank")

        mainResBundle.bundle.loadScene("TankMain", function (error, scene: cc.Scene) {
            cc.director.runScene(scene, null, function () {
                TankMain.GetInstance().Init()
            })
        })
    }

    async OnExit(): Promise<void> {
        let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance()
        bundleManager.RemoveBundle("Tank")
    }
}