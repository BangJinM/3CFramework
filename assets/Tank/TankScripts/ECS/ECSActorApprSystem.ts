import * as cc from "cc";
import * as ccl from "ccl";
import { TankMain } from "../TankMain";
import { ECSActorApprComp } from "./Comp/ECSActorApprComp";

export class ECSActorApprSystem extends ccl.ECSSystem {
    apprRootNode: cc.Node = null
    children: { [key: number]: cc.Node } = {}

    OnEnter(): void {
        this.apprRootNode = TankMain.GetInstance().GetNode("TankCanvas/NODE_GAME/NODE_ACTER")
    }

    OnUpdate(deltaTime: number): void {
        if (!this.apprRootNode) return
        let entities = this.GetEntities()
        for (const entity of entities) {
            let object = this.ecsWorld.GetComponent(entity, ECSActorApprComp)
            if (object.GetDirty()) {
                let node = this.children[entity]
                if (!node) {
                    node = new cc.Node(entity.toString())
                    node.parent = this.apprRootNode
                    node.addComponent(cc.UITransform)
                    node.addComponent(cc.Button)

                    node.layer = this.apprRootNode.layer

                    node.on(cc.Button.EventType.CLICK, () => {
                        let gameStatusManager: ccl.GameStatusManager = ccl.GameStatusManager.GetInstance() as ccl.GameStatusManager
                        gameStatusManager.ChangeStatus("GameStatusInit")
                    })

                    this.children[entity] = node
                }
                let appr = object.GetAppr()
                let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance()
                ccl.Resources.UIUtils.LoadButton(node.getComponent(cc.Button), appr, appr, appr, appr, bundleManager.GetBundle("resources"))
                object.SetDirty(false)
            }
        }
    }
}