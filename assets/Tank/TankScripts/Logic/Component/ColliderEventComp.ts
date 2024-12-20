import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";

@cc._decorator.ccclass("ColliderEventComp")
export class ColliderEventComp extends cc.Component implements ccl.QuadBoundary {
    x: number;
    y: number;
    @cc._decorator.property(cc.CCFloat)
    width: number;
    @cc._decorator.property(cc.CCFloat)
    height: number;

    protected onLoad(): void {
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Add(this)
    }

    UpdateXY(x: number, y: number) {
        this.x = x
        this.y = y

        this.UpdateQuadTree()
    }

    UpdateSize(width: number, height: number) {
        this.width = width
        this.height = height

        this.UpdateQuadTree()
    }

    UpdateQuadTree() {
        if (!(this._objFlags & cc.CCObject.Flags.IsOnLoadCalled)) return
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.UpdateObject(this)
    }

    protected onDestroy(): void {
        TankGameLogic.GetInstance<TankGameLogic>().quadTree.Remove(this)
    }

    CheckCollision(object: ccl.QuadBoundary) {
        var a_min_x = this.x - this.width / 2;
        var a_min_y = this.y - this.height / 2;
        var a_max_x = this.x + this.width / 2;
        var a_max_y = this.y + this.height / 2;
        var b_min_x = object.x - object.width / 2;
        var b_min_y = object.y - object.height / 2;
        var b_max_x = object.x + object.width / 2;
        var b_max_y = object.y + object.height / 2;
        return a_min_x <= b_max_x && a_max_x >= b_min_x && a_min_y <= b_max_y && a_max_y >= b_min_y;
    }

    IsCollision() {
        let quadTrees: ccl.QuadTree[] = TankGameLogic.GetInstance<TankGameLogic>().quadTree.FindTree(this)
        for (const element of quadTrees) {
            for (const object of element.objects) {
                if (this != object && this.CheckCollision(object)) return true
            }
        }
        return false
    }
}