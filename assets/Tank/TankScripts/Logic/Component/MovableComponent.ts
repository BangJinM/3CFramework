import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../../Config/NoticeTable";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./ColliderableComponent";
import { Direction, IBaseActor } from "./IBaseActor";
import { TankQuadTreeManager } from "./TankQuadTreeManager";

export enum MoveType {
    /** 直走 */
    FORWARD,
    /** 控制 */
    CONTROLLER,
    /** 随机 */
    RANDOM
}

export class MoveableSystem extends ccl.ECSSystem {
    Direction = [
        new cc.Vec3(1, 0, 0),
        new cc.Vec3(-1, 0, 0),
        new cc.Vec3(0, 1, 0),
        new cc.Vec3(0, -1, 0)
    ]
    position: cc.Vec3 = new cc.Vec3(0, 0, 0)

    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()

        let quadBoundary: TankQuadBoundary = new TankQuadBoundary(0)
        let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()

        for (const element of entities) {
            let moveComp = this.ecsWorld.GetComponent(element, MoveableComponent)
            if (!moveComp.moving) continue

            let entityObj = this.ecsWorld.GetEntity<IBaseActor>(element)
            quadBoundary.entity = element

            cc.Vec3.multiplyScalar(this.position, Direction.GetDirection(entityObj.direction), moveComp.speed)
            this.position.add(entityObj.node.getPosition())

            let collisionComp: ColliderableComponent = this.ecsWorld.GetComponent(element, ColliderableComponent)
            quadBoundary.x = this.position.x - collisionComp.boundary.width / 2
            quadBoundary.y = this.position.y - collisionComp.boundary.height / 2
            quadBoundary.width = collisionComp.boundary.width
            quadBoundary.height = collisionComp.boundary.height
            if (moveComp.moveType == MoveType.FORWARD) {
                entityObj.node.setPosition(this.position.clone())

                let colliderTypes = [ColliderType.NORMAL, ColliderType.BOUNDARY]
                if (collisionComp.type == ColliderType.PLAYER_BULLET) {
                    colliderTypes.push(...[ColliderType.ENEMY, ColliderType.ENEMY_BULLET])
                } else {
                    colliderTypes.push(...[ColliderType.PLAYER, ColliderType.PLAYER_BULLET])
                }
                let objects = tankQuadTreeManager.GetCollisionObjects(colliderTypes, quadBoundary)
                if (objects.size > 0) {
                    ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.OnContact, { selfCollision: collisionComp.boundary, collisions: objects })
                } else {
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp)
                    collisionComp.boundary.x = quadBoundary.x
                    collisionComp.boundary.y = quadBoundary.y
                    tankQuadTreeManager.AddColliderEventComp(collisionComp)
                }
            } else if (moveComp.moveType == MoveType.CONTROLLER) {
                if (!tankQuadTreeManager.IsCollisions([ColliderType.NORMAL, ColliderType.PLAYER, ColliderType.ENEMY, ColliderType.BOUNDARY], quadBoundary)) {
                    entityObj.node.setPosition(this.position.clone())
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp)
                    collisionComp.boundary.x = quadBoundary.x
                    collisionComp.boundary.y = quadBoundary.y
                    tankQuadTreeManager.AddColliderEventComp(collisionComp)
                }
            } else {
                let isCollide: boolean = TankQuadTreeManager.GetInstance<TankQuadTreeManager>().IsCollisions([ColliderType.NORMAL, ColliderType.BOUNDARY], quadBoundary)
                if (!isCollide) {
                    entityObj.node.setPosition(this.position.clone())
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp)
                    collisionComp.boundary.x = quadBoundary.x
                    collisionComp.boundary.y = quadBoundary.y
                    tankQuadTreeManager.AddColliderEventComp(collisionComp)
                }
                moveComp.cTime += deltaTime
                if (isCollide || moveComp.cTime >= moveComp.time) {
                    moveComp.cTime = 0
                    moveComp.time = cc.math.random() * 4 + 2

                    let dir = Math.ceil(cc.math.random() * 4)
                    entityObj.setDirection(dir - 1)
                }
            }
        }
    }
}

@ccl.ecs_component(MoveableSystem)
export class MoveableComponent extends ccl.ECSComponent {
    /** 速度 */
    speed: number = 1;
    /** 移动类型 */
    moveType: MoveType = MoveType.FORWARD;
    moving: boolean = false
    /** 可自由移动 */
    time: number = 0
    /** 累计移动时间 */
    cTime: number = 0

    constructor(id: number, isMoving: boolean = false, moveType: MoveType = MoveType.FORWARD, speed: number = 1) {
        super(id);

        this.moving = isMoving;
        this.moveType = moveType;
        this.speed = speed;
    }
}
