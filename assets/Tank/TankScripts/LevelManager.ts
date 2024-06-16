import * as cc from "cc"
import * as ccl from "ccl";

@cc._decorator.ccclass()
@ccl.set_manager_instance("Tank")
export class LevelManager extends ccl.ISingleton implements ccl.ISceneGridManager {
    scene: cc.Node = null
    level: number = 1

    GetLevel(): number {
        return this.level
    }

    SetLevel(level: number) {
        this.level = level
    }

    CheckObstacle(x: number, y: number): boolean {
        throw new Error("Method not implemented.");
    }

    InitRootNode(node: cc.Node) {
        this.scene = node
    }

    GetRootNode() {
        return this.scene
    }

    LoadScene(level: number) {
        this.level = level

        let promise = ccl.LoadAssetByName("level", cc.TiledMapAsset, ccl.BundleManager.GetInstance().GetBundle("Tank"))
        promise.then((asset: cc.TiledMapAsset) => {

        })
    }

    LoadSuccess(asset: cc.TiledMapAsset) {
        if (!asset)
            return

        this.scene.removeAllChildren()

    }
}