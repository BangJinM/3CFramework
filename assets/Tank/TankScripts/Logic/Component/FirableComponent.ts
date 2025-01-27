import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../../Config/NoticeTable";
import { ColliderType } from "./ColliderableComponent";
import { IBaseActor } from "./IBaseActor";

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
                    ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.OnFire, [entityObj.node.position, entityObj.direction, 1, ColliderType.ENEMY_BULLET])
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

    constructor(id: number, auto: boolean = false) {
        super(id)
        this.auto = auto
    }
}