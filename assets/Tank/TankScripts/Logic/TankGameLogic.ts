import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../Config/NoticeTable";
import { TankMain } from "../TankMain";
import { ApprSystem } from "./Component/ApprComponent";
import { ColliderableComponent, ColliderableSystem, ColliderType, TankQuadBoundary } from "./Component/ColliderableComponent";
import { FirableSystem } from "./Component/FirableComponent";
import { IBaseActor } from "./Component/IBaseActor";
import { MoveableComponent, MoveableSystem, MoveType } from "./Component/MovableComponent";
import { PlayableSystem } from "./Component/PlayableComponent";
import { TankQuadTreeManager } from "./Component/TankQuadTreeManager";
import { EnemyManager } from "./EnemyManager";
import { PlayerManager } from "./PlayerManager";
import { SceneManager } from "./SceneManager";

@cc._decorator.ccclass("TankGameLogic")
export class TankGameLogic extends ccl.ISingleton {
    actors: Set<IBaseActor> = new Set()
    tankWorld: ccl.ECSWorld = new ccl.ECSWorld()
    enemyManager: EnemyManager = null;
    playerManager: PlayerManager = null;
    sceneManager: SceneManager = null;

    level = 0
    protectorId: number = 0
    protectorNode: cc.Node = null
    actorNode: cc.Node = null

    Init(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()
        subjectManager.AddObserver(NoticeTable.TankGameStart, this.OnGameStart.bind(this))
        subjectManager.AddObserver(NoticeTable.OnContact, this.OnContact.bind(this))

        let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()
        tankQuadTreeManager.quadBoundary.width = tankQuadTreeManager.quadBoundary.height = 32 * 32
        tankQuadTreeManager.quadBoundary.x = tankQuadTreeManager.quadBoundary.y = -16 * 32
        tankQuadTreeManager.Init()

        this.playerManager = new PlayerManager()
        this.enemyManager = new EnemyManager()
        this.sceneManager = new SceneManager()

        this.sceneManager.Init(this.tankWorld)
        this.enemyManager.Init(this.tankWorld)
        this.playerManager.Init(this.tankWorld)

        let tankMain: TankMain = TankMain.GetInstance()
        this.protectorNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAIN")
        this.actorNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_ACTER")

        this.tankWorld.AddSystem(ApprSystem)
        this.tankWorld.AddSystem(MoveableSystem)
        this.tankWorld.AddSystem(ColliderableSystem)
        this.tankWorld.AddSystem(FirableSystem)
        this.tankWorld.AddSystem(PlayableSystem)

        this.InitBoundary()
    }

    InitBoundary() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/NodeMapBoundery", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            TankMain.GetInstance<TankMain>().GetNode("TankCanvas/NODE_GAME/NODE_MAP_BOUNDARY").addChild(bulletNode)

            for (const element of bulletNode.children) {
                let actorId = this.tankWorld.CreateEntity(IBaseActor, bulletNode)

                let uiT: cc.UITransform = ccl.GetOrAddComponent(element, cc.UITransform)
                let boundary = new TankQuadBoundary(actorId)
                boundary.width = uiT.contentSize.width
                boundary.height = uiT.contentSize.height
                boundary.x = element.position.x - uiT.contentSize.width / 2
                boundary.y = element.position.y - uiT.contentSize.height / 2
                this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.BOUNDARY, boundary)
            }
        })
    }


    OnGameStart() {
        this.level = 3

        ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.SceneChange, { level: this.level })
    }

    OnFire(position: cc.Vec3, direction: cc.Vec3, level: number, type: ColliderType) {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Bullet", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(bulletNode)
            bulletNode.position = position.clone()

            let actorId = this.tankWorld.CreateEntity(IBaseActor, bulletNode)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = bulletNode.position.x - boundary.width / 2
            boundary.y = bulletNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, type, boundary)
            this.tankWorld.AddComponent(actorId, MoveableComponent, direction, MoveType.FORWARD, 1.5)
        })
    }

    OnContact(data) {
        let selfQuadBoundary: TankQuadBoundary = data.selfCollision
        let otherQuadBoundarys: Set<TankQuadBoundary> = data.collisions

        // ccl.Logger.info(`OnBeginContact, ${selfQuadBoundary.entity}`)
        let selfCollider = this.tankWorld.GetComponent(selfQuadBoundary.entity, ColliderableComponent)
        let selfObj = this.tankWorld.GetEntity<IBaseActor>(selfQuadBoundary.entity)

        // 子弹碰撞到边界墙
        let BulletHitBoundary = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)
        }
        // 碰撞到玩家
        let HitPlayer = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到敌人
        let HitEnemy = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)

            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.EnemyDie, { level: 1 })
        }
        // 碰撞到地形
        let HitTerrain = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到老鹰
        let HitProtector = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到子弹
        let HitBullet = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }

        let funcs = {
            [ColliderType.ENEMY_BULLET]: {
                [ColliderType.BOUNDARY]: BulletHitBoundary,
                [ColliderType.NORMAL]: HitTerrain,
                [ColliderType.PLAYER]: HitPlayer,
                [ColliderType.PLAYER_BULLET]: HitBullet,
                [ColliderType.PROTECTOR]: HitProtector,
            },
            [ColliderType.PLAYER_BULLET]: {
                [ColliderType.BOUNDARY]: BulletHitBoundary,
                [ColliderType.NORMAL]: HitTerrain,
                [ColliderType.ENEMY]: HitEnemy,
                [ColliderType.ENEMY_BULLET]: HitBullet,
                [ColliderType.PROTECTOR]: HitProtector,
            },
        }

        for (const element of otherQuadBoundarys) {
            let otherCollider = this.tankWorld.GetComponent(element.entity, ColliderableComponent)
            if (funcs[selfCollider.type] && funcs[selfCollider.type][otherCollider.type]) {
                let otherObj = this.tankWorld.GetEntity<IBaseActor>(element.entity)
                funcs[selfCollider.type][otherCollider.type](otherObj)
            }
        }
    }

    InitProtector() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Protector", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let protectorNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.protectorNode.addChild(protectorNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, protectorNode)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = this.protectorNode.position.x - boundary.width / 2
            boundary.y = this.protectorNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.NORMAL, boundary)
        })
    }

    LevelUp() {
        this.level = 3
    }

    Update(deltaTime: number): void {
        this.tankWorld.Update(deltaTime)
        this.enemyManager.Update(deltaTime)
    }

    ActorDie() {

    }
}