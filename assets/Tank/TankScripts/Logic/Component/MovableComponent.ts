import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../../Config/NoticeTable";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./ColliderableComponent";
import { IBaseActor } from "./IBaseActor";
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

    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()

        let quadBoundary: TankQuadBoundary = new TankQuadBoundary(0)
        let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()

        for (const element of entities) {
            let moveComp = this.ecsWorld.GetComponent(element, MoveableComponent)

            let entityObj = this.ecsWorld.GetEntity<IBaseActor>(element)
            quadBoundary.entity = element

            let position = entityObj.node.position.clone()

            // 如果是主控玩家，则步进为 16
            if (moveComp.moveType == MoveType.CONTROLLER) {
                // 如果坐标是16的倍数，才允许转向
                if ((moveComp.tmepDirection.x && position.x % 16 == 0) || (moveComp.tmepDirection.y && position.y % 16 == 0)) {
                    moveComp.tmepDirection.x = 0
                    moveComp.tmepDirection.y = 0
                }
                if (moveComp.tmepDirection.equals(cc.Vec3.ZERO) && (moveComp.direction.x != 0 || moveComp.direction.y != 0)) {
                    moveComp.tmepDirection.x = moveComp.direction.x
                    moveComp.tmepDirection.y = moveComp.direction.y
                }
                position.x += moveComp.tmepDirection.x * moveComp.speed
                position.y += moveComp.tmepDirection.y * moveComp.speed
            }
            else {
                position.x += moveComp.direction.x * moveComp.speed
                position.y += moveComp.direction.y * moveComp.speed
            }

            let collisionComp: ColliderableComponent = this.ecsWorld.GetComponent(element, ColliderableComponent)
            quadBoundary.x = position.x - collisionComp.boundary.width / 2
            quadBoundary.y = position.y - collisionComp.boundary.height / 2
            quadBoundary.width = collisionComp.boundary.width
            quadBoundary.height = collisionComp.boundary.height
            if (moveComp.moveType == MoveType.FORWARD) {
                entityObj.node.setPosition(position)

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
                    entityObj.node.setPosition(position)
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp)
                    collisionComp.boundary.x = quadBoundary.x
                    collisionComp.boundary.y = quadBoundary.y
                    tankQuadTreeManager.AddColliderEventComp(collisionComp)
                } else {
                    moveComp.tmepDirection.x = moveComp.tmepDirection.y = 0
                }
            } else {
                let isCollide: boolean = TankQuadTreeManager.GetInstance<TankQuadTreeManager>().IsCollisions([ColliderType.NORMAL, ColliderType.BOUNDARY], quadBoundary)
                if (!isCollide) {
                    entityObj.node.setPosition(position)
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
                    moveComp.direction = this.Direction[dir - 1]
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
    /** 方向 */
    direction: cc.Vec3 = cc.Vec3.ZERO;
    tmepDirection: cc.Vec3 = new cc.Vec3(0, 0, 0);
    /** 可自由移动 */
    time: number = 0
    /** 累计移动时间 */
    cTime: number = 0

    constructor(id: number, direction: cc.Vec3 = cc.Vec3.ZERO, moveType: MoveType = MoveType.FORWARD, speed: number = 1) {
        super(id);

        this.direction = direction;
        this.moveType = moveType;
        this.speed = speed;
    }
}
