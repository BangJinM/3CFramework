import * as cc from "cc";
import * as ccl from "ccl";
import { MoveComponent } from "./MoveComponent";

@cc._decorator.ccclass("AutoMoveComponent")
export class AutoMoveComponent extends cc.Component {
    time: number = 0
    protected onLoad(): void {
        let rigidComp = ccl.GetOrAddComponent(this.node, cc.RigidBody2D)
        rigidComp.type = cc.ERigidBody2DType.Kinematic
    }

    protected start(): void {
    }

    protected update(dt: number): void {
        this.time -= dt
        if (this.time > 0) return

        this.time = Math.ceil(Math.random() * 7) + 3
        let randomDir = Math.ceil(Math.random() * 4)

        let direction = new cc.Vec2(0, 0)
        switch (randomDir) {
            case 1:
                direction.x = 1
                break;
            case 2:
                direction.x = -1
                break;
            case 3:
                direction.y = 1
                break;
            default:
                direction.y = -1
                break
        }

        let moveComp = this.node.getComponent(MoveComponent)
        moveComp.SetMoving(true)
        moveComp.SetMoveDirection(direction)
    }
}