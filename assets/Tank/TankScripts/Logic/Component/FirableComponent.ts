import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";
import { ColliderType } from "./ColliderableComponent";
import { IBaseActor } from "./IBaseActor";
import { MoveableComponent } from "./MovableComponent";

export class FirableSystem extends ccl.ECSSystem {
    Direction = [
        new cc.Vec3(1, 0, 0),
        new cc.Vec3(-1, 0, 0),
        new cc.Vec3(0, 1, 0),
        new cc.Vec3(0, -1, 0)
    ]

    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()

        for (const element of entities) {
            let firableComp = this.ecsWorld.GetComponent(element, FirableComponent)
            let entityObj = this.ecsWorld.GetEntity<IBaseActor>(element)

            firableComp.cTime += deltaTime
            if (firableComp.auto) {
                if (firableComp && firableComp.cTime >= firableComp.duration) {
                    let moveableComp = this.ecsWorld.GetComponent(element, MoveableComponent)
                    TankGameLogic.GetInstance<TankGameLogic>().OnFire(entityObj.node.position, moveableComp.direction, 1, ColliderType.ENEMY_BULLET)
                    firableComp.cTime = 0
                }
            }
        }
    }
}

@ccl.ecs_component(FirableSystem)
export class FirableComponent extends ccl.ECSComponent {
    /** 间隔 */
    duration: number = 2;
    /** 当前时间 */
    cTime: number = 0;
    /** 自动开火 */
    auto: boolean = false;

    constructor(args: any[] = []) {
        super()
        this.auto = args[0] || false
    }
}