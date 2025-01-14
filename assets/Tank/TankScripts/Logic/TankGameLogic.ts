import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "../TankGlobalConfig";
import { TankMain } from "../TankMain";
import { ApprSystem } from "./Component/ApprComponent";
import { ColliderableComponent, ColliderableSystem, ColliderType, TankQuadBoundary } from "./Component/ColliderableComponent";
import { FirableComponent, FirableSystem } from "./Component/FirableComponent";
import { IBaseActor } from "./Component/IBaseActor";
import { MoveableComponent, MoveableSystem, MoveType } from "./Component/MovableComponent";
import { PlayableComponent, PlayableSystem } from "./Component/PlayableComponent";
import { TankQuadTreeManager } from "./Component/TankQuadTreeManager";

@cc._decorator.ccclass("TankGameLogic")
export class TankGameLogic extends ccl.ISingleton {
    actors: Set<IBaseActor> = new Set()
    tankWorld: ccl.ECSWorld = new ccl.ECSWorld()

    level = 0
    players: IBaseActor[] = []
    enemies: cc.Node[] = []
    protectorId: number = 0
    terrainIds: number[] = []
    protectorNode: cc.Node = null
    actorNode: cc.Node = null
    mapNode: cc.Node;

    Init(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()
        subjectManager.AddObserver(Notify.TankGameStart, this.OnGameStart.bind(this))

        let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()
        tankQuadTreeManager.quadBoundary.width = tankQuadTreeManager.quadBoundary.height = 32 * 32
        tankQuadTreeManager.quadBoundary.x = tankQuadTreeManager.quadBoundary.y = -16 * 32
        tankQuadTreeManager.Init()

        let tankMain: TankMain = TankMain.GetInstance()
        this.mapNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        this.actorNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_ACTER")
        this.protectorNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAIN")

        this.tankWorld.AddSystem(ApprSystem)
        this.tankWorld.AddSystem(MoveableSystem)
        this.tankWorld.AddSystem(ColliderableSystem)
        this.tankWorld.AddSystem(FirableSystem)
        this.tankWorld.AddSystem(PlayableSystem)

        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/NodeMapBoundery", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP_BOUNDARY").addChild(bulletNode)

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
        this.level = 1
        this.InitProtector()
        this.InitPlayer()
        this.CreateEnemy()
        this.CreateWalls(this.level)
    }

    OnFire(position: cc.Vec3, direction: cc.Vec3, level: number, type: ColliderType) {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Bullet", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(bulletNode)
            bulletNode.position = position.clone()

            let actorId = this.tankWorld.CreateEntity(IBaseActor, bulletNode)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 8
            boundary.x = bulletNode.position.x - boundary.width / 2
            boundary.y = bulletNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, type, boundary)
            this.tankWorld.AddComponent(actorId, MoveableComponent, direction, MoveType.FORWARD, 1.5)
        })
    }

    OnContact(selfQuadBoundary: TankQuadBoundary, otherQuadBoundarys: Set<TankQuadBoundary>) {
        // ccl.Logger.info(`OnBeginContact, ${selfQuadBoundary.entity}`)
        let selfCollider = this.tankWorld.GetComponent(selfQuadBoundary.entity, ColliderableComponent)
        let selfObj = this.tankWorld.GetEntity<IBaseActor>(selfQuadBoundary.entity)

        for (const element of otherQuadBoundarys) {
            let otherCollider = this.tankWorld.GetComponent(element.entity, ColliderableComponent)
            let otherObj = this.tankWorld.GetEntity<IBaseActor>(element.entity)
            if (selfCollider.type == ColliderType.ENEMY_BULLET || selfCollider.type == ColliderType.PLAYER_BULLET) {
                if (otherCollider.type == ColliderType.BOUNDARY) {
                    selfObj.node.destroy()
                    this.tankWorld.RemoveEntity(selfObj.id)
                }
                else if (otherCollider.type == ColliderType.NORMAL) {
                    selfObj.node.destroy()
                    this.tankWorld.RemoveEntity(selfObj.id)

                    otherObj.node.destroy()
                    this.tankWorld.RemoveEntity(otherObj.id)
                }
            }
        }
    }


    InitPlayer() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Player", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let playerNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(playerNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, playerNode)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = playerNode.position.x - boundary.width / 2
            boundary.y = playerNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.PLAYER, boundary)

            this.tankWorld.AddComponent(actorId, MoveableComponent, cc.Vec3.ZERO, MoveType.CONTROLLER1, 1)
            this.tankWorld.AddComponent(actorId, FirableComponent)
            this.tankWorld.AddComponent(actorId, PlayableComponent, [cc.KeyCode.KEY_W, cc.KeyCode.KEY_S, cc.KeyCode.KEY_D, cc.KeyCode.KEY_A], cc.KeyCode.SPACE)

            this.players[0] = actorObj
        })

        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Player", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let playerNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(playerNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, playerNode)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)

            playerNode.setPosition(new cc.Vec3(-300, -13 * 32 + 32, 0))

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = playerNode.position.x - boundary.width / 2
            boundary.y = playerNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.PLAYER, boundary)
            this.tankWorld.AddComponent(actorId, MoveableComponent, cc.Vec3.ZERO, MoveType.CONTROLLER1)
            this.tankWorld.AddComponent(actorId, FirableComponent)
            this.tankWorld.AddComponent(actorId, PlayableComponent, [cc.KeyCode.KEY_I, cc.KeyCode.KEY_K, cc.KeyCode.KEY_J, cc.KeyCode.KEY_L], cc.KeyCode.SPACE)

            this.players[1] = actorObj
        })
    }

    CreateEnemy() {
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

    CreateWall(type: number, posX, posY, iResource: ccl.IResource) {
        if (type <= 0) return
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

    LevelUp() {
        this.level = 1
        this.CreateWalls(this.level)
    }

    Update(deltaTime: number): void {
        this.tankWorld.Update(deltaTime)
    }

    ActorDie() {

    }
}