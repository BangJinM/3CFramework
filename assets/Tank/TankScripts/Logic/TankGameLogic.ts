import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "../TankGlobalConfig";
import { TankMain } from "../TankMain";
import { ApprSystem } from "./Component/ApprComponent";
import { ColliderableComponent, ColliderableSystem, ColliderType } from "./Component/ColliderableComponent";
import { ColliderEventComp } from "./Component/ColliderEventComp";
import { IBaseActor } from "./Component/IBaseActor";
import { MoveableComponent, MoveableSystem, MoveType } from "./Component/MovableComponent";
import { TankQuadTreeManager } from "./Component/TankQuadTreeManager";

@cc._decorator.ccclass("TankGameLogic")
export class TankGameLogic extends ccl.ISingleton {
    actors: Set<IBaseActor> = new Set()
    tankWorld: ccl.ECSWorld = new ccl.ECSWorld()

    level = 0
    players: cc.Node[] = []
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

        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/NodeMapBoundery", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP_BOUNDARY").addChild(bulletNode)

            for (const element of bulletNode.children) {
                let actorId = this.tankWorld.CreateEntity(IBaseActor)
                let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
                actorObj.id = actorId.toString()
                actorObj.node = element

                let uiT: cc.UITransform = ccl.GetOrAddComponent(element, cc.UITransform)

                let colliderComp = this.tankWorld.AddComponent(actorId, ColliderableComponent)
                colliderComp.boundary.width = uiT.contentSize.width
                colliderComp.boundary.height = uiT.contentSize.height
                colliderComp.boundary.x = element.position.x - uiT.contentSize.width / 2
                colliderComp.boundary.y = element.position.y - uiT.contentSize.height / 2
                colliderComp.type = ColliderType.BOUNDARY

                colliderComp.SetDirty(true)
            }
        })

        // cc.input.on(cc.Input.EventType.KEY_DOWN, (event: cc.EventKeyboard) => {
        //     if (event.keyCode == cc.KeyCode.KEY_W) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.SetDirection(new cc.Vec3(0, 1, 0))
        //         moveComp.pushKey++;
        //         ccl.Logger.info(`down pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_S) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.SetDirection(new cc.Vec3(0, -1, 0))
        //         moveComp.pushKey++;
        //         ccl.Logger.info(`down pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_A) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.SetDirection(new cc.Vec3(-1, 0, 0))
        //         moveComp.pushKey++;
        //         ccl.Logger.info(`down pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_D) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.SetDirection(new cc.Vec3(1, 0, 0))
        //         moveComp.pushKey++;
        //         ccl.Logger.info(`down pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.SPACE) {
        //         this.OnFire(this.players[0])
        //     }
        // })
        // cc.input.on(cc.Input.EventType.KEY_UP, (event: cc.EventKeyboard) => {
        //     if (event.keyCode == cc.KeyCode.KEY_W) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.pushKey--;
        //         ccl.Logger.info(`up pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_S) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.pushKey--;
        //         ccl.Logger.info(`up pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_A) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.pushKey--;
        //         ccl.Logger.info(`up pushKey: ${moveComp.pushKey}`)

        //     } else if (event.keyCode == cc.KeyCode.KEY_D) {
        //         let player = this.players[0]
        //         let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
        //         moveComp.pushKey--;
        //         ccl.Logger.info(`up pushKey: ${moveComp.pushKey}`)

        //     }
        // })
    }


    OnGameStart() {
        this.level = 1
        this.InitProtector()
        this.InitPlayer()
        this.CreateEnemy()
        this.CreateWalls(this.level)
    }

    OnFire(node: cc.Node) {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Bullet", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset || !node || !cc.isValid(node)) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(bulletNode)

            // let colliderEventComp = ccl.GetOrAddComponent(bulletNode, ColliderEventComp)
            // colliderEventComp.type = ColliderType.PLAYER_BULLET

            // let fireMoveComp = ccl.GetOrAddComponent(node, MoveComponent)
            // let moveComp = ccl.GetOrAddComponent(bulletNode, MoveComponent)
            // moveComp.type = 0
            // moveComp.direction = fireMoveComp.direction
            // moveComp.node.position = node.position.clone().add(moveComp.direction)
        })
    }

    OnContact(selfCollider: ColliderEventComp, otherColliders: ColliderEventComp[]) {
        // ccl.Logger.info(`OnBeginContact, ${selfCollider.node.name}`)
        // for (const element of otherColliders) {
        //     if (selfCollider.type == ColliderType.ENEMY_BULLET || selfCollider.type == ColliderType.PLAYER_BULLET) {
        //         if (element.type == ColliderType.BOUNDARY) {
        //             selfCollider.node.destroy()
        //         } else if (element.type == ColliderType.NORMAL) {
        //             element.node.destroy()
        //             selfCollider.node.destroy()
        //         }
        //     }
        // }
    }


    InitPlayer() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Player", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let playerNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(playerNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
            actorObj.id = actorId.toString()
            actorObj.node = playerNode

            let colliderableComponent = this.tankWorld.AddComponent(actorId, ColliderableComponent)
            colliderableComponent.type = ColliderType.PLAYER
            colliderableComponent.boundary.width = colliderableComponent.boundary.height = 64
            colliderableComponent.boundary.x = playerNode.position.x - colliderableComponent.boundary.width / 2
            colliderableComponent.boundary.y = playerNode.position.y - colliderableComponent.boundary.height / 2
            colliderableComponent.SetDirty(true)

            let moveableComp = this.tankWorld.AddComponent(actorId, MoveableComponent)
            moveableComp.moveType = MoveType.CONTROLLER1
            moveableComp.speed = 1


            this.players[0] = playerNode
        })
    }

    CreateEnemy() {
        let posX = [0, -13 * 32 + 32, 13 * 32 - 32]

        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Enemy", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let enemyNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(enemyNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
            actorObj.id = actorId.toString()
            actorObj.node = enemyNode

            let posXIndex = Math.ceil(cc.math.random() * 3)
            enemyNode.setPosition(new cc.Vec3(posX[posXIndex], 13 * 32 - 32, 0))

            let colliderableComponent = this.tankWorld.AddComponent(actorId, ColliderableComponent)
            colliderableComponent.type = ColliderType.ENEMY
            colliderableComponent.boundary.width = colliderableComponent.boundary.height = 64
            colliderableComponent.boundary.x = enemyNode.position.x - colliderableComponent.boundary.width / 2
            colliderableComponent.boundary.y = enemyNode.position.y - colliderableComponent.boundary.height / 2
            colliderableComponent.SetDirty(true)

            let moveableComp = this.tankWorld.AddComponent(actorId, MoveableComponent)
            moveableComp.moveType = MoveType.RANDOM
            moveableComp.speed = 1
        })
    }

    InitProtector() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Protector", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let protectorNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.protectorNode.addChild(protectorNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
            actorObj.id = actorId.toString()
            actorObj.node = protectorNode

            let colliderableComponent = this.tankWorld.AddComponent(actorId, ColliderableComponent)
            colliderableComponent.boundary.width = colliderableComponent.boundary.height = 64
            colliderableComponent.boundary.x = this.protectorNode.position.x - colliderableComponent.boundary.width / 2
            colliderableComponent.boundary.y = this.protectorNode.position.y - colliderableComponent.boundary.height / 2
            colliderableComponent.type = ColliderType.NORMAL
            colliderableComponent.SetDirty(true)
        })
    }

    CreateWall(type: number, posX, posY, iResource: ccl.IResource) {
        if (type <= 0) return
        let position = new cc.Vec3(posX * 32 + 16, - posY * 32 - 16, 0)
        let wallNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)

        wallNode.setPosition(position)
        wallNode.layer = this.mapNode.layer

        this.mapNode.addChild(wallNode)

        let actorId = this.tankWorld.CreateEntity(IBaseActor)
        let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
        actorObj.id = actorId.toString()
        actorObj.node = wallNode

        let colliderableComponent = this.tankWorld.AddComponent(actorId, ColliderableComponent)
        colliderableComponent.boundary.width = colliderableComponent.boundary.height = 32
        colliderableComponent.boundary.x = position.x - colliderableComponent.boundary.width / 2
        colliderableComponent.boundary.y = position.y - colliderableComponent.boundary.height / 2
        colliderableComponent.SetDirty(true)
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