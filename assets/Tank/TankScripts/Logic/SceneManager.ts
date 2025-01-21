import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../Config/NoticeTable";
import { TankMain } from "../TankMain";
import { ApprComponent } from "./Component/ApprComponent";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./Component/ColliderableComponent";
import { IBaseActor } from "./Component/IBaseActor";

export class SceneManager {
    mapNode: cc.Node = null;
    tankWorld: ccl.ECSWorld = null;
    protectorNode: any;

    Init(tankWorld): void {
        this.tankWorld = tankWorld
        this.mapNode = TankMain.GetInstance<TankMain>().GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        this.protectorNode = TankMain.GetInstance<TankMain>().GetNode("TankCanvas/NODE_GAME/NODE_MAIN")

        ccl.SubjectManager.GetInstance<ccl.SubjectManager>().AddObserver(NoticeTable.SceneChange, this.OnSceneChange.bind(this))
    }

    OnSceneChange(data: { level: number }) {
        this.CreateWalls(data.level)
    }

    CreateWall(type: number, posX, posY, iResource: ccl.IResource) {
        let walls = {
            [3]: ["TankRes/Textures/Block/wall"],
            [5]: ["TankRes/Textures/Block/stone"]
        }
        if (!walls[type]) return

        let position = new cc.Vec3(posX * 32 + 16, - posY * 32 - 16, 0)
        let wallNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)

        wallNode.setPosition(position)
        wallNode.layer = this.mapNode.layer

        this.mapNode.addChild(wallNode)

        let actorId = this.tankWorld.CreateEntity(IBaseActor, wallNode)

        let boundary = new TankQuadBoundary(actorId)
        boundary.width = boundary.height = 32
        boundary.x = wallNode.position.x - boundary.width / 2
        boundary.y = wallNode.position.y - boundary.height / 2
        this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.NORMAL, boundary)
        this.tankWorld.AddComponent(actorId, ApprComponent, walls[type], "Tank")
    }

    CreateWalls(level: number) {
        let tankMain: TankMain = TankMain.GetInstance()
        let mapNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        mapNode.destroyAllChildren()
        mapNode.removeAllChildren()

        ccl.Resources.Loader.LoadAsset(`TankRes/maps/${level.toString()}`, cc.TextAsset, ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return
            let text = (iResource.oriAsset as cc.TextAsset).text
            let index = 0
            iResource.oriAsset.addRef()
            ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Wall", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
                for (let y = 0; y < 26; y++) {
                    for (let x = 0; x < 26; x++) {
                        this.CreateWall(text[index] ? parseInt(text[index]) : 0, x - 13, y - 13, iResource)
                        index++
                    }
                }
            })

            iResource.oriAsset.decRef()
        })
    }
}