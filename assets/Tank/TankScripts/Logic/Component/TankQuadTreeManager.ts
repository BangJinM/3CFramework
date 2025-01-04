import * as cc from "cc";
import * as ccl from "ccl";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./ColliderableComponent";


@cc._decorator.ccclass("TankQuadTreeManager")
export class TankQuadTreeManager extends ccl.ISingleton {
    objects: Map<number, number> = new Map()
    quadBoundary: ccl.QuadBoundary = new ccl.QuadBoundary(0, 0, 0, 0);
    quadTrees: Map<number, ccl.QuadTree> = new Map();
    /**
     * 初始化四叉树管理器。
     * 为每种碰撞类型创建一个新的四叉树，并设置其边界和参数。
     */
    Init() {
        this.AddQuadTree(ColliderType.NORMAL, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
        this.AddQuadTree(ColliderType.ENEMY, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
        this.AddQuadTree(ColliderType.PLAYER, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
        this.AddQuadTree(ColliderType.BOUNDARY, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
        this.AddQuadTree(ColliderType.PLAYER_BULLET, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
        this.AddQuadTree(ColliderType.ENEMY_BULLET, new ccl.QuadTree(this.quadBoundary, 8, 5, 0));
    }
    AddQuadTree(key: number, quadTree: ccl.QuadTree) {
        this.quadTrees.set(key, quadTree)
    }

    RemoveQuadTree(key: number) {
        this.quadTrees.delete(key)
    }

    /**
     * 将碰撞事件组件添加到对应的四叉树中。
     * 
     * @param comp - 需要添加的碰撞事件组件。
     */
    AddColliderEventComp(comp: ColliderableComponent) {
        if (this.objects.get(comp.boundary.entity)) return
        let quadTree = this.quadTrees.get(comp.type)
        if (!quadTree) return
        quadTree.Add(comp.boundary);
        this.objects.set(comp.boundary.entity, comp.type)
    }

    /**
     * 从四叉树中移除碰撞事件组件。
     * 
     * @param comp - 需要移除的碰撞事件组件。
     */
    RemoveColliderEventComp(comp: ColliderableComponent) {
        if (!this.objects.has(comp.boundary.entity)) return
        let type = this.objects.get(comp.boundary.entity)
        let quadTree = this.quadTrees.get(type)
        if (!quadTree) return
        quadTree.Remove(comp.boundary);
        this.objects.delete(comp.boundary.entity)
    }
    /**
     * 检查两个四叉树边界是否发生碰撞。
     * 
     * @param object - 第一个四叉树边界。
     * @param check - 第二个四叉树边界。
     * @returns 如果两个边界发生碰撞，则返回 true，否则返回 false。
     */
    CheckCollision(object: TankQuadBoundary, check: TankQuadBoundary) {
        if (object.entity == check.entity) return false

        const maxax = object.x + object.width;
        const maxay = object.y + object.height;
        const maxbx = check.x + check.width;
        const maxby = check.y + check.height;
        return !(maxax <= check.x || maxbx <= object.x || maxay <= check.y || maxby <= object.y);
    }

    IsCollision(type: ColliderType, obj: TankQuadBoundary) {
        let quadTree = this.quadTrees.get(type)
        if (!quadTree) return false

        let quadTrees = quadTree.FindTree(obj);
        for (const element of quadTrees) {
            for (const check of element.objects) {
                if (this.CheckCollision(obj, check as TankQuadBoundary)) return true
            }
        }

        return false;
    }
    /**
     * 检查给定对象是否与指定类型的任何对象发生碰撞。
     * 
     * @param types - 需要检查碰撞的对象类型数组。
     * @param obj - 需要检查碰撞的目标对象。
     * @returns 如果目标对象与任何指定类型的对象发生碰撞，则返回 true，否则返回 false。
     */
    IsCollisions(types: ColliderType[], obj: TankQuadBoundary) {
        for (const element of types) {
            if (this.IsCollision(element, obj)) return true
        }
        return false
    }

    /**
     * 获取与给定对象发生碰撞的所有对象。
     * 
     * @param type - 需要检查碰撞的对象类型。
     * @param obj - 需要检查碰撞的目标对象。
     * @returns 一个数组，包含所有检测到的碰撞对象。
     */
    GetCollisionObject(type: ColliderType, obj: TankQuadBoundary) {
        let quadTree = this.quadTrees.get(type)
        if (!quadTree) return []

        let objects: Set<TankQuadBoundary> = new Set()
        let quadTrees = quadTree.FindTree(obj);
        for (const element of quadTrees) {
            for (const check of element.objects) {
                if (this.CheckCollision(obj, check as TankQuadBoundary)) objects.add(check as TankQuadBoundary);
            }
        }

        return objects;
    }

    /**
     * 获取与给定对象发生碰撞的所有对象。
     * 
     * @param types - 一个数组，包含需要检查碰撞的对象类型。
     * @param obj - 需要检查碰撞的目标对象。
     * @returns 一个数组，包含所有检测到的碰撞对象。
     */
    GetCollisionObjects(types: ColliderType[], obj: TankQuadBoundary) {
        let objects: Set<TankQuadBoundary> = new Set()
        for (const element of types) {
            for (const value of this.GetCollisionObject(element, obj)) {
                objects.add(value)
            }
        }
        return objects
    }
}
