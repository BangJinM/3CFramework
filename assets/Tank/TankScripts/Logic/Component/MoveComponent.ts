import * as cc from "cc";
import * as ccl from "ccl";

@cc._decorator.requireComponent(cc.RigidBody2D)
export class MoveComponent extends cc.Component {
    public speed: number = 1
    public direction: cc.Vec2 = new cc.Vec2(0, 0)
    public isMoving: boolean = false

    SetMoveDirection(direction: cc.Vec2) {
        this.direction = direction
        this.OnUpdateMoveing()
    }

    SetMoveSpeed(speed: number) {
        this.speed = speed
        this.OnUpdateMoveing()
    }

    SetMoving(isMoving: boolean) {
        this.isMoving = isMoving
        this.OnUpdateMoveing()
    }

    GetMoving() {
        return this.isMoving
    }

    protected onLoad(): void {
        let rigidComp = ccl.GetOrAddComponent(this.node, cc.RigidBody2D)
        rigidComp.type = cc.ERigidBody2DType.Kinematic
    }

    protected start(): void {
        this.OnUpdateMoveing()
    }

    OnUpdateMoveing() {
        if (!(this._objFlags & cc.CCObject.Flags.IsOnLoadCalled))
            return

        let rigidComp = ccl.GetOrAddComponent(this.node, cc.RigidBody2D)
        if (!this.isMoving) {
            rigidComp.linearVelocity = cc.Vec2.ZERO
        }
        else {
            rigidComp.linearVelocity = this.direction.clone().multiplyScalar(this.speed)
        }
    }
}