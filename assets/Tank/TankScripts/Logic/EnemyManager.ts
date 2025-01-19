import * as cc from "cc";
import * as ccl from "ccl";
import { TankMain } from "../TankMain";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./Component/ColliderableComponent";
import { FirableComponent } from "./Component/FirableComponent";
import { IBaseActor } from "./Component/IBaseActor";
import { MoveableComponent, MoveType } from "./Component/MovableComponent";

@cc._decorator.ccclass("EnemyManager")
export class EnemyManager {
    /** 每局怪物最大数量 */
    remainingEnemyCount = 10;
    /** 当前怪物Id */
    enemies: number[] = [];
    /**当前存活怪物 */
    liveCount: number = 0;
    /**最大存活数量 */
    liveMaxCount: number = 5;

    actorNode: cc.Node = null;
    tankWorld: ccl.ECSWorld = null;

    Init(tankWorld): void {
        this.tankWorld = tankWorld
        this.actorNode = TankMain.GetInstance<TankMain>().GetNode("TankCanvas/NODE_GAME/NODE_ACTER")
    }

    CreateEnemy(level: number) {
        let posX = [0, -13 * 32 + 32, 13 * 32 - 32]

        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Enemy", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let enemyNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(enemyNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, enemyNode)

            let posXIndex = Math.ceil(cc.math.random() * 3)
            enemyNode.setPosition(new cc.Vec3(posX[posXIndex], 13 * 32 - 32, 0))

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = enemyNode.position.x - boundary.width / 2
            boundary.y = enemyNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.ENEMY, boundary)
            this.tankWorld.AddComponent(actorId, MoveableComponent, cc.Vec3.ZERO, MoveType.RANDOM)
            this.tankWorld.AddComponent(actorId, FirableComponent, true)
        })


    }

    Update(deltaTime: number): void {
        if (this.remainingEnemyCount > 0 && this.liveCount <= this.liveMaxCount) {
            this.CreateEnemy(1)

            this.liveCount++
        }
    }
}