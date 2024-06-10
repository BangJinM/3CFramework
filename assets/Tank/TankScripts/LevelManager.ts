import * as cc from "cc"
import * as Core from "Core";
import { ISceneGridManager } from "../../Core/Runtime/AStar/ISceneGridManager";
import { LoadAssetByName } from "../../Core/Runtime/ResourceManager/ResourceUtils";

@cc._decorator.ccclass()
@Core.set_manager_instance("Tank")
export class LevelManager extends Core.ISingleton implements ISceneGridManager {
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

        let promise = LoadAssetByName("level", cc.TiledMapAsset, Core.BundleManager.GetInstance().GetBundle("Tank"))
        promise.then((asset: cc.TiledMapAsset) => {

        })
    }

    LoadSuccess(asset: cc.TiledMapAsset) {
        if (!asset)
            return

        this.scene.removeAllChildren()
        
    }
}