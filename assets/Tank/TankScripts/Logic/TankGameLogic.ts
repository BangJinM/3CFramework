import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "../TankGlobalConfig";
import { TankMain } from "../TankMain";
import { ActorApprComponent } from "./Component/ActorApprComponent";
import { MoveComponent } from "./Component/MoveComponent";

@cc._decorator.ccclass("TankGameLogic")
export class TankGameLogic extends ccl.ISingleton implements ccl.ISceneGridManager {
    level = 0
    players: cc.Node[] = []
    protectorId: number = 0
    terrainIds: number[] = []
    quadTree: ccl.QuadTree = null

    actorNode: cc.Node = null
    mapNode: cc.Node;

    Init(): void {
        this.quadTree = new ccl.QuadTree({ x: 0, y: 0, width: 26 * 30, height: 26 * 30 }, 4, 10, 0)

        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()
        subjectManager.AddObserver(Notify.TankGameStart, this.OnGameStart.bind(this))
        let tankMain: TankMain = TankMain.GetInstance()
        this.mapNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        this.actorNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_ACTER")

        cc.input.on(cc.Input.EventType.KEY_DOWN, (event: cc.EventKeyboard) => {
            if (event.keyCode == cc.KeyCode.KEY_W) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoveDirection(new cc.Vec3(0, 1, 0))
                moveComp.SetMoving(true)
            } else if (event.keyCode == cc.KeyCode.KEY_S) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoveDirection(new cc.Vec3(0, 1, 0))
                moveComp.SetMoving(true)
            } else if (event.keyCode == cc.KeyCode.KEY_A) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoveDirection(new cc.Vec3(0, 1, 0))
                moveComp.SetMoving(true)
            } else if (event.keyCode == cc.KeyCode.KEY_D) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoveDirection(new cc.Vec3(0, 1, 0))
                moveComp.SetMoving(true)
            } else if (event.keyCode == cc.KeyCode.SPACE) {
                let player = this.players[0]

                this.OnFire(0, player.getPosition(), new cc.Vec3(1, 1))
            }
        })
        cc.input.on(cc.Input.EventType.KEY_UP, (event: cc.EventKeyboard) => {
            if (event.keyCode == cc.KeyCode.KEY_W) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoving(false)
            } else if (event.keyCode == cc.KeyCode.KEY_S) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoving(false)
            } else if (event.keyCode == cc.KeyCode.KEY_A) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoving(false)
            } else if (event.keyCode == cc.KeyCode.KEY_D) {
                let player = this.players[0]
                let moveComp = ccl.GetOrAddComponent(player, MoveComponent)
                moveComp.SetMoving(false)
            }
        })
    }



    Update(deltaTime: number): void {
    }

    OnGameStart() {
        this.InitProtector()
        this.InitPlayer()
        this.LevelUp()
    }

    OnFire(buffType: number, position: cc.Vec3, direction: cc.Vec3) {
        let bulletNode = new cc.Node()

        let moveComp = ccl.GetOrAddComponent(bulletNode, MoveComponent)
        moveComp.direction = direction
        moveComp.moving = true

        let apprComp = ccl.GetOrAddComponent(bulletNode, ActorApprComponent)
        apprComp.bundleName = "Tank"
        apprComp.appr = "TankRes/maps/landform/grass"
        apprComp.type = 3

        bulletNode.setPosition(position)
        bulletNode.layer = this.actorNode.layer

        this.actorNode.addChild(bulletNode)
    }

    OnBeginContact(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        ccl.Logger.info(`OnBeginContact, ${selfCollider.node.name}, ${otherCollider.node.name}`)
        let apprComp = selfCollider.getComponent(ActorApprComponent)
        if (apprComp.type == 1) {
            let otherApprComp = otherCollider.getComponent(ActorApprComponent)
            if (otherApprComp.type == 2) {
                let moveComp = ccl.GetOrAddComponent(selfCollider.node, MoveComponent)
                moveComp.SetMoving(false)
            }
        } else if (apprComp.type == 3) {
            let otherApprComp = otherCollider.getComponent(ActorApprComponent)
            if (otherApprComp.type == 2) {
                this.scheduleOnce(() => {
                    if (cc.isValid(selfCollider.node)) selfCollider.node.destroy()
                    if (cc.isValid(otherCollider.node)) otherCollider.node.destroy()
                })
            }
        }
    }

    InitPlayer() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Actor", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let playerNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            ccl.GetOrAddComponent(playerNode, MoveComponent)
            this.actorNode.addChild(playerNode)

            this.players[0] = playerNode
        })
    }

    CreateEnemy() {
        let enemyNode = new cc.Node("enemy")
        ccl.GetOrAddComponent(enemyNode, MoveComponent)

        let apprComp = ccl.GetOrAddComponent(enemyNode, ActorApprComponent)
        apprComp.bundleName = "Tank"
        apprComp.appr = `TankRes/maps/landform/water`
        apprComp.type = 4

        enemyNode.layer = this.actorNode.layer
        enemyNode.setPosition(new cc.Vec3(0, 100, 0))
        this.actorNode.addChild(enemyNode)
    }

    InitProtector() {
        let protectorNode = new cc.Node("protector")

        ccl.GetOrAddComponent(protectorNode, cc.UITransform)

        protectorNode.setPosition(new cc.Vec3(0, -390, 0))
        protectorNode.layer = this.actorNode.layer

        {
            let sprite = ccl.GetOrAddComponent(protectorNode, cc.Sprite)
            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, `TankRes/maps/landform/symbol`, ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"))
        }
        {
            let rigidComp = ccl.GetOrAddComponent(protectorNode, cc.RigidBody2D)
            rigidComp.type = cc.ERigidBody2DType.Kinematic
        }
        this.actorNode.addChild(protectorNode)
    }

    CreateWall(type: number, posX, posY, iResource: ccl.IResource) {
        if (type <= 0) return
        let position = new cc.Vec3(posX * 30 - 13 * 30 + 15, 13 * 30 - posY * 30 + 15, 0)
        let wallNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)

        wallNode.setPosition(position)
        wallNode.layer = this.mapNode.layer

        this.mapNode.addChild(wallNode)
    }

    LevelUp() {
        this.level++

        let tankMain: TankMain = TankMain.GetInstance()
        let mapNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        mapNode.destroyAllChildren()
        mapNode.removeAllChildren()

        ccl.Resources.Loader.LoadAsset(`TankRes/maps/${this.level.toString()}`, cc.TextAsset, ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return
            let text = (iResource.oriAsset as cc.TextAsset).text
            let index = 0
            iResource.oriAsset.addRef()
            ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Wall", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
                for (let y = 0; y < 26; y++) {
                    for (let x = 0; x < 26; x++) {
                        this.CreateWall(text[index] ? parseInt(text[index]) : 0, x, y, iResource)
                        index++
                    }
                }
            })

            iResource.oriAsset.decRef()
        })
    }

    CheckObstacle(x: number, y: number): boolean {
        let node = this.mapNode.getChildByName(`${y}_${x}`)
        return node ? true : false
    }

    ActorDie() {

    }
}