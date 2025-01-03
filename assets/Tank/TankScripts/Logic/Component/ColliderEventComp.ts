import * as cc from "cc";
import * as ccl from "ccl";

@cc._decorator.ccclass("Tank.ColliderEventComp")
export class ColliderEventComp extends cc.Component implements ccl.QuadBoundary {
    // @cc._decorator.property(cc.CCFloat)
    // x: number;
    // @cc._decorator.property(cc.CCFloat)
    // y: number;
    // @cc._decorator.property(cc.CCFloat)
    // width: number;
    // @cc._decorator.property(cc.CCFloat)
    // height: number;
    // @cc._decorator.property({ type: cc.Enum(ColliderType) })
    // type: ColliderType = ColliderType.NORMAL;

    // protected onLoad(): void {
    //     this.x = this.node.position.x - this.width / 2
    //     this.y = this.node.position.y - this.height / 2
    //     TankQuadTreeManager.GetInstance<TankQuadTreeManager>().AddColliderEventComp(this)
    // }
    // protected onDestroy(): void {
    //     TankQuadTreeManager.GetInstance<TankQuadTreeManager>().RemoveColliderEventComp(this)
    // }

    // UpdateXY(x: number, y: number) {
    //     this.UpdateQuadTree(x, y, this.width, this.height)
    // }

    // UpdateSize(width: number, height: number) {
    //     this.UpdateQuadTree(this.x, this.y, width, height)
    // }

    // UpdateQuadTree(x: number, y: number, width: number, height: number) {
    //     TankQuadTreeManager.GetInstance<TankQuadTreeManager>().RemoveColliderEventComp(this)

    //     this.width = width
    //     this.height = height
    //     this.x = x - this.width / 2
    //     this.y = y - this.height / 2

    //     TankQuadTreeManager.GetInstance<TankQuadTreeManager>().AddColliderEventComp(this)
    // }

    // protected update(dt: number): void {
    //     // let sprite: cc.Sprite = this.node.getComponent(cc.Sprite)
    //     // if (sprite) {
    //     //     let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()
    //     //     if (tankQuadTreeManager.IsCollisions([ColliderType.BOUNDARY, ColliderType.ENEMY, ColliderType.PLAYER, ColliderType.NORMAL, ColliderType.PLAYER_BULLET, ColliderType.ENEMY_BULLET], this)) {
    //     //         sprite.color = cc.Color.RED
    //     //     } else {
    //     //         sprite.color = cc.Color.WHITE
    //     //     }
    //     // }
    // }


}