import * as cc from "cc";
import * as ccl from "ccl";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./ColliderableComponent";
import { IBaseActor } from "./IBaseActor";
import { TankQuadTreeManager } from "./TankQuadTreeManager";

export enum MoveType {
    /** 直走 */
    FORWARD,
    /** 控制 */
    CONTROLLER1,
    /** 控制 */
    CONTROLLER2,
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
            if (moveComp.moveType == MoveType.FORWARD) {
                let position = entityObj.node.position.clone()
                position.x += moveComp.direction.x * moveComp.speed
                position.y += moveComp.direction.y * moveComp.speed
                entityObj.node.setPosition(position)

                let collisionComp: ColliderableComponent = this.ecsWorld.GetComponent(element, ColliderableComponent)
                if (collisionComp) {
      
                    quadBoundary.width = collisionComp.boundary.width
                    quadBoundary.height = collisionComp.boundary.height
                    quadBoundary.x = position.x - collisionComp.boundary.width / 2
                    quadBoundary.y = position.y - collisionComp.boundary.height / 2

                    let objects = tankQuadTreeManager.GetCollisionObjects([ColliderType.NORMAL, ColliderType.ENEMY, ColliderType.BOUNDARY, ColliderType.PLAYER, ColliderType.PLAYER_BULLET], quadBoundary)
                    // if (objects.length > 0) {
                    //     TankGameLogic.GetInstance<TankGameLogic>().OnContact(element, objects)
                    // }
                }
            } else if (moveComp.moveType == MoveType.CONTROLLER1 || moveComp.moveType == MoveType.CONTROLLER2) {
                let collisionComp: ColliderableComponent = this.ecsWorld.GetComponent(element, ColliderableComponent)
                quadBoundary.x = entityObj.node.position.x + moveComp.direction.x * moveComp.speed
                quadBoundary.y = entityObj.node.position.y + moveComp.direction.y * moveComp.speed
                quadBoundary.width = collisionComp.boundary.width
                quadBoundary.height = collisionComp.boundary.height

                if (!tankQuadTreeManager.IsCollisions([ColliderType.NORMAL, ColliderType.PLAYER, ColliderType.ENEMY, ColliderType.BOUNDARY], quadBoundary)) {
                    entityObj.node.setPosition(new cc.Vec3(quadBoundary.x, quadBoundary.y, 0))
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp.type, collisionComp.boundary)
                    collisionComp.boundary.x = quadBoundary.x - collisionComp.boundary.width / 2
                    collisionComp.boundary.y = quadBoundary.y - collisionComp.boundary.height / 2
                    tankQuadTreeManager.AddColliderEventComp(collisionComp.type, collisionComp.boundary)

                }
            } else {
                let collisionComp: ColliderableComponent = this.ecsWorld.GetComponent(element, ColliderableComponent)
                quadBoundary.x = entityObj.node.position.x + moveComp.direction.x * moveComp.speed
                quadBoundary.y = entityObj.node.position.y + moveComp.direction.y * moveComp.speed
                quadBoundary.width = collisionComp.boundary.width
                quadBoundary.height = collisionComp.boundary.height

                let isCollide: boolean = TankQuadTreeManager.GetInstance<TankQuadTreeManager>().IsCollisions([ColliderType.NORMAL, ColliderType.BOUNDARY], quadBoundary)
                if (!isCollide) {
                    entityObj.node.setPosition(new cc.Vec3(quadBoundary.x, quadBoundary.y, 0))
                    tankQuadTreeManager.RemoveColliderEventComp(collisionComp.type, collisionComp.boundary)
                    collisionComp.boundary.x = quadBoundary.x - collisionComp.boundary.width / 2
                    collisionComp.boundary.y = quadBoundary.y - collisionComp.boundary.height / 2
                    tankQuadTreeManager.AddColliderEventComp(collisionComp.type, collisionComp.boundary)
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
    speed: number = 1;
    moveType: MoveType = MoveType.FORWARD;
    direction: cc.Vec3 = cc.Vec3.ZERO;
    time: number = 0
    cTime: number = 0
}