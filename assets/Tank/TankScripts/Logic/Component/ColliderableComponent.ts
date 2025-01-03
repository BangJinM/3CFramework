import { Color, Sprite } from "cc";
import * as ccl from "ccl";
import { IBaseActor } from "./IBaseActor";
import { TankQuadTreeManager } from "./TankQuadTreeManager";

/**
 * 碰撞类型枚举。
 * 定义了游戏中不同类型的碰撞对象。
 */
export enum ColliderType {
    /**
     * 普通碰撞类型。
     */
    NORMAL = 0,
    /**
     * 敌人碰撞类型。
     */
    ENEMY,
    /**
     * 玩家碰撞类型。
     */
    PLAYER,
    /**
     * 边界碰撞类型。
     */
    BOUNDARY,
    /**
     * 玩家子弹碰撞类型。
     */
    PLAYER_BULLET,
    /**
     * 敌人子弹碰撞类型。
     */
    ENEMY_BULLET,
    /**
     * 结束。
     */
    FINAL
}

export class ColliderableSystem extends ccl.ECSSystem {
    public tankQuadTreeManager: TankQuadTreeManager = null;

    OnEnter(): void {
        this.tankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()
    }

    OnExit(): void {
        this.tankQuadTreeManager = null
    }

    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()
        for (const element of entities) {
            let colliderableComp = this.ecsWorld.GetComponent(element, ColliderableComponent)
            if (colliderableComp.GetDirty()) {
                colliderableComp.SetDirty(false)
                colliderableComp.boundary.entity = element
                this.tankQuadTreeManager.RemoveColliderEventComp(colliderableComp.type, colliderableComp.boundary)
                this.tankQuadTreeManager.AddColliderEventComp(colliderableComp.type, colliderableComp.boundary)
            }

            let isCollide = this.tankQuadTreeManager.IsCollisions([ColliderType.NORMAL, ColliderType.ENEMY, ColliderType.BOUNDARY, ColliderType.PLAYER, ColliderType.PLAYER_BULLET], colliderableComp.boundary)
            if (isCollide) {
                let entityObj = this.ecsWorld.GetEntity<IBaseActor>(element)
                let sprite: Sprite = ccl.GetOrAddComponent(entityObj.node, Sprite)
                if (sprite) sprite.color = Color.RED
            } else {
                let entityObj = this.ecsWorld.GetEntity<IBaseActor>(element)
                let sprite: Sprite = ccl.GetOrAddComponent(entityObj.node, Sprite)
                if (sprite) sprite.color = Color.WHITE
            }
        }
    }
}

export class TankQuadBoundary extends ccl.QuadBoundary {
    public entity: number = 0;

    constructor(id: number) {
        super(0, 0)
        this.entity = id
    }
}

@ccl.ecs_component(ColliderableSystem)
export class ColliderableComponent extends ccl.ECSComponent {
    boundary: TankQuadBoundary = new TankQuadBoundary(0);
    type: ColliderType = ColliderType.NORMAL;
    preColliders: number[] = [];
    colliders: number[] = [];
}