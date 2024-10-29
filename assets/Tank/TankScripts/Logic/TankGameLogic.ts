import * as cc from "cc";
import * as ccl from "ccl";
import { Notify } from "../TankGlobalConfig";
import { TankMain } from "../TankMain";
import { ColliderEventComp } from "./Component/ColliderEventComp";

@ccl.set_manager_instance("Tank")
export class TankGameLogic extends ccl.ISingleton {
    level = 0
    players: number[] = []
    protectorId: number = 0
    terrainIds: number[] = []

    actorNode: cc.Node = null

    Init(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()
        subjectManager.AddObserver(Notify.TankGameStart, this.OnGameStart.bind(this))

        this.actorNode = TankMain.GetInstance().GetNode("TankCanvas/NODE_GAME/NODE_ACTER")
    }

    Update(deltaTime: number): void {
    }

    OnGameStart() {
        this.InitProtector()
        this.InitPlayer()
        this.LevelUp()
    }

    OnFire(buffType: number, position: cc.Vec3, direction: cc.Vec2) {
        let bulletNode = new cc.Node()
        {
            let rigidComp = ccl.GetOrAddComponent(bulletNode, cc.RigidBody2D)
            rigidComp.type = cc.ERigidBody2DType.Kinematic
            rigidComp.linearVelocity = direction
            rigidComp.enabledContactListener = true
        }
        {
            let boxCollider = ccl.GetOrAddComponent(bulletNode, cc.BoxCollider2D)
            boxCollider.size = new cc.Size(32, 32)
        }
        ccl.GetOrAddComponent(bulletNode, ColliderEventComp)

        bulletNode.setPosition(position)
        bulletNode.layer = this.actorNode.layer

        ccl.GetOrAddComponent(bulletNode, cc.UITransform)
        {
            let sprite = ccl.GetOrAddComponent(bulletNode, cc.Sprite)
            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, "TankRes/maps/landform/grass", ccl.BundleManager.GetInstance().GetBundle("Tank"))
        }

        this.actorNode.addChild(bulletNode)
    }

    OnBeginContact(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        ccl.Logger.info(`OnBeginContact, ${selfCollider.node.name}, ${otherCollider.node.name}`)
    }

    InitPlayer() {
        let playerNode = new cc.Node("player")
        {
            let boxCollider = ccl.GetOrAddComponent(playerNode, cc.BoxCollider2D)
            boxCollider.size = new cc.Size(32, 32)
        }
        ccl.GetOrAddComponent(playerNode, cc.UITransform)
        {
            let rigidComp = ccl.GetOrAddComponent(playerNode, cc.RigidBody2D)
            rigidComp.type = cc.ERigidBody2DType.Kinematic
        }
        {
            let sprite = ccl.GetOrAddComponent(playerNode, cc.Sprite)
            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, `TankRes/maps/landform/water`, ccl.BundleManager.GetInstance().GetBundle("Tank"))
        }

        playerNode.layer = this.actorNode.layer
        playerNode.setPosition(new cc.Vec3(0, 100, 0))
        this.actorNode.addChild(playerNode)
    }

    InitProtector() {
        let protectorNode = new cc.Node("protector")

        ccl.GetOrAddComponent(protectorNode, cc.UITransform)

        protectorNode.setPosition(new cc.Vec3(0, -390, 0))
        protectorNode.layer = this.actorNode.layer

        {
            let sprite = ccl.GetOrAddComponent(protectorNode, cc.Sprite)
            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, `TankRes/maps/landform/symbol`, ccl.BundleManager.GetInstance().GetBundle("Tank"))
        }
        {
            let rigidComp = ccl.GetOrAddComponent(protectorNode, cc.RigidBody2D)
            rigidComp.type = cc.ERigidBody2DType.Kinematic
        }
        this.actorNode.addChild(protectorNode)
    }

    LevelUp() {
        this.level++

        let tankMain: TankMain = TankMain.GetInstance()
        let mapNode = tankMain.GetNode("TankCanvas/NODE_GAME/NODE_MAP")
        mapNode.destroyAllChildren()
        mapNode.removeAllChildren()

        ccl.Resources.Loader.LoadAsset(`TankRes/maps/${this.level.toString()}`, cc.TextAsset, ccl.BundleManager.GetInstance().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return
            let text = (iResource.oriAsset as cc.TextAsset).text
            let index = 0
            for (let y = 0; y < 26; y++) {
                for (let x = 0; x < 26; x++) {
                    let spriteName = ""
                    if (text[index] == "3") {
                        spriteName = "walls"
                    } else if (text[index] == "5") {
                        spriteName == "steels"
                        // } else if (text[index] == "") {
                        //     spriteName == "walls"
                    } else if (text[index] == "1") {
                        spriteName == "grass"
                    } else if (text[index] == "4") {
                        spriteName == "water"
                    }
                    if (spriteName) {

                        let wallNode = new cc.Node()
                        {
                            let rigidComp = ccl.GetOrAddComponent(wallNode, cc.RigidBody2D)
                            rigidComp.type = cc.ERigidBody2DType.Kinematic
                        }

                        wallNode.setPosition(new cc.Vec3((x - 13) * 32 + 16, (13 - y) * 32 - 16, 0))
                        wallNode.layer = mapNode.layer

                        ccl.GetOrAddComponent(wallNode, cc.UITransform)
                        {
                            let sprite = ccl.GetOrAddComponent(wallNode, cc.Sprite)
                            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, `TankRes/maps/landform/${spriteName}`, ccl.BundleManager.GetInstance().GetBundle("Tank"))
                        }

                        mapNode.addChild(wallNode)
                    }
                    index++
                }
            }
        })
    }

    ActorDie() {

    }
}