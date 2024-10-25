import * as cc from "cc";
import * as ccl from "ccl";
import { TankMain } from "../../../Tank/TankScripts/TankMain";

@cc._decorator.ccclass("GameStatusTank")
export class GameStatusTank extends ccl.GameStatus {
    constructor() {
        super("GameStatusTank")
        ccl.Logger.info("GameStatusTank constructor");
    }

    OnEnter() {
        let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance() as ccl.BundleManager
        bundleManager.LoadBundle("Tank", (bundleCache: ccl.BundleCache) => {
            ccl.Resources.Loader.LoadSceneAsset("TankMain", bundleCache, (scene) => {
                scene.oriAsset.addRef()
                cc.director.runScene(scene.oriAsset as cc.SceneAsset, null, () => {
                    scene.oriAsset.decRef()
                    TankMain.GetInstance().Init()
                })
            })
        })

    }

    OnExit() {
        let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance()
        bundleManager.RemoveBundle("Tank")
    }
}