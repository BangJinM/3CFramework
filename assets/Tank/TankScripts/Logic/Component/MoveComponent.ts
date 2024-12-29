import * as cc from "cc";
import { TankGameLogic } from "../TankGameLogic";
import { ColliderEventComp } from "./ColliderEventComp";


@cc._decorator.ccclass("MoveComponent")
export class MoveComponent extends cc.Component {
    @cc._decorator.property(cc.CCFloat)
    public type: number = 0
    @cc._decorator.property(cc.CCFloat)
    public speed: number = 1
    public pushKey: number = 0
    @cc._decorator.property(cc.Vec3)
    public direction: cc.Vec3 = new cc.Vec3(0, 0, 0)
    @cc._decorator.property(cc.CCFloat)
    public curTime: number = 0
    @cc._decorator.property(cc.CCFloat)
    public cTime: number = 0

    SetDirection(direction: cc.Vec3) { this.direction = direction }
    GetMoveDirection() { return this.direction }
    SetSpeed(speed: number) { this.speed = speed }
    protected update(dt: number): void {
        if (this.type == 1) this.OnEnemyMoveing(dt)
        else if (this.type == 2) this.OnPlayerMoveing(dt)
        else this.OnBulletMoveing(dt)
    }

    OnBulletMoveing(dt: number) {
        let position = this.node.position.clone()
        position.x += this.direction.x * this.speed
        position.y += this.direction.y * this.speed
        this.node.setPosition(position)

        let collisionComp: ColliderEventComp = this.node.getComponent(ColliderEventComp)
        collisionComp.UpdateXY(this.node.position.x, this.node.position.y)

        let objects = collisionComp.IsCollision()
        if (objects.length > 0) {
            TankGameLogic.GetInstance<TankGameLogic>().OnContact(collisionComp, objects)
        }
    }

    OnPlayerMoveing(dt: number) {
        if (this.pushKey == 0) return

        let position = this.node.position.clone()
        position.x += this.direction.x * this.speed
        position.y += this.direction.y * this.speed

        let collisionComp: ColliderEventComp = this.node.getComponent(ColliderEventComp)
        if (collisionComp) {
            collisionComp.UpdateXY(position.x, position.y)
        }

        if (collisionComp.IsCollision().length <= 0) {
            this.node.setPosition(position)
        } else {
            collisionComp.UpdateXY(this.node.position.x, this.node.position.y)
        }
    }

    OnEnemyMoveing(dt: number) {
        let position = this.node.position.clone()
        position.x += this.direction.x * this.speed
        position.y += this.direction.y * this.speed

        let collisionComp: ColliderEventComp = this.node.getComponent(ColliderEventComp)
        if (collisionComp) {
            collisionComp.UpdateXY(position.x, position.y)
        }

        let isCollide: boolean = collisionComp.IsCollision().length > 0
        if (!isCollide) {
            this.node.setPosition(position)
        } else {
            collisionComp.UpdateXY(this.node.position.x, this.node.position.y)
        }

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
            this.SetDirection(Direction[dir - 1])
        }
    }
}