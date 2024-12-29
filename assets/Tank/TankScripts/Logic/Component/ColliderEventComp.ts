import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";

export enum ColliderType {
    PLAYER,
    ENEMY,
    ENEMY_BULLET,
    PLAYER_BULLET,
    PROTECTOR,
    BOUNDARY,
    WALL,
}

@cc._decorator.ccclass("Tank.ColliderEventComp")
export class ColliderEventComp extends cc.Component implements ccl.QuadBoundary {
    @cc._decorator.property(cc.CCFloat)
    x: number;
    @cc._decorator.property(cc.CCFloat)
    y: number;
    @cc._decorator.property(cc.CCFloat)
    width: number;
    @cc._decorator.property(cc.CCFloat)
    height: number;
    @cc._decorator.property({ type: cc.Enum(ColliderType) })
    type: ColliderType = 0

    protected onLoad(): void {
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Add(this)
        this.UpdateXY(this.node.position.x, this.node.position.y)
    }
    protected onDestroy(): void {
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Remove(this)
    }

    UpdateXY(x: number, y: number) {
        this.UpdateQuadTree(x, y, this.width, this.height)
    }

    UpdateSize(width: number, height: number) {
        this.UpdateQuadTree(this.x, this.y, width, height)
    }

    UpdateQuadTree(x: number, y: number, width: number, height: number) {
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Remove(this)

        this.width = width
        this.height = height
        this.x = x - this.width / 2
        this.y = y - this.height / 2

        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Add(this)
    }

    protected update(dt: number): void {
        let sprite: cc.Sprite = this.node.getComponent(cc.Sprite)
        if (sprite) {
            if (this.IsCollision().length > 0) {
                sprite.color = cc.Color.RED
            } else {
                sprite.color = cc.Color.WHITE
            }
        }
    }

    CheckCollision(object: ccl.QuadBoundary) {
        var a_max_x = this.x + this.width;
        var a_max_y = this.y + this.height;
        var b_max_x = object.x + object.width;
        var b_max_y = object.y + object.height;
        return this.x < b_max_x && a_max_x > object.x && this.y < b_max_y && a_max_y > object.y;
    }

    IsCollision() {
        let quadTrees: ccl.QuadTree[] = TankGameLogic.GetInstance<TankGameLogic>().quadTree.FindTree(this)
        let objects: ColliderEventComp[] = []
        for (const element of quadTrees) {
            for (const object of element.objects) {
                if (this != object && this.CheckCollision(object)) objects.push(object as ColliderEventComp)
            }
        }
        return objects
    }
}