import * as cc from "cc";
import { ColliderEventComp } from "./ColliderEventComp";


@cc._decorator.ccclass("ColliderEventComp")
export class MoveComponent extends cc.Component {
    @cc._decorator.property(cc.CCFloat)
    public speed: number = 1
    @cc._decorator.property(cc.CCBoolean)
    public moving: boolean = false
    @cc._decorator.property(cc.CCBoolean)
    public autoMoving: boolean = false
    @cc._decorator.property(cc.Vec3)
    public direction: cc.Vec3 = new cc.Vec3(0, 0, 0)
    @cc._decorator.property(cc.CCFloat)
    public curTime: number = 0
    @cc._decorator.property(cc.CCFloat)
    public cTime: number = 0

    SetMoveDirection(direction: cc.Vec3) { this.direction = direction }
    GetMoveDirection() { return this.direction }
    SetSpeed(speed: number) { this.speed = speed }
    SetMoving(isMoving: boolean) { this.moving = isMoving }
    GetMoving() { return this.moving }

    protected update(dt: number): void {
        this.OnUpdateMoveing(dt)
    }

    OnUpdateMoveing(dt: number) {
        if (!(this._objFlags & cc.CCObject.Flags.IsOnLoadCalled)) return

        let isCollide: boolean = false
        /** 移动 */
        if (this.moving) {
            let position = this.node.position.clone()
            position.x += this.direction.x * this.speed
            position.y += this.direction.y * this.speed

            let collisionComp: ColliderEventComp = this.node.getComponent(ColliderEventComp)
            if (!collisionComp || !collisionComp.IsCollision()) {
                this.node.setPosition(position)
            }
        }
        /** 自动移动 */
        if (this.autoMoving) {
            this.curTime += dt
            if (isCollide || this.curTime >= this.cTime) {
                this.curTime = 0
                this.cTime = cc.math.random() * 4 + 2

                let Direction = [
                    new cc.Vec3(1, 0, 0),
                    new cc.Vec3(-1, 0, 0),
                    new cc.Vec3(0, 1, 0),
                    new cc.Vec3(0, -1, 0)
                ]
                let dir = Math.ceil(cc.math.random() * 4)
                this.SetMoveDirection(Direction[dir - 1])
            }
        }
    }
}