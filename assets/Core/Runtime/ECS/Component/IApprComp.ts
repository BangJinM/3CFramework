import * as cc from "cc";
import { IComponent } from "../Base/IComponent";

export class IApprComp implements IComponent {
    node: cc.Node = null
    parent: cc.Node = null

    OnAdd() {
        this.node = new cc.Node()
        this.parent.addChild(this.node)
    }
    OnRemove() {
        this.node.removeFromParent()
        this.node.destroy()
        this.node = null
    }
    OnEnter() { }
    OnExit() { }
    OnUpdate(deltaTime: number) { }

}