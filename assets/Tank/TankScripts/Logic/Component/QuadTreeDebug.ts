import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";

@cc._decorator.ccclass("QuadTreeDebug")
@cc._decorator.requireComponent(cc.Graphics)
export class QuadTreeDebug extends cc.Component {

    protected update(dt: number): void {
        const ctx = ccl.GetOrAddComponent(this.node, cc.Graphics);

        ctx.clear();

        let draw = (quadTree: ccl.QuadTree) => {
            if (quadTree.children.length <= 0) {

                ctx.lineWidth = 4;
                ctx.strokeColor = cc.Color.WHITE
                ctx.rect(quadTree.boundary.x, quadTree.boundary.y, quadTree.boundary.width, quadTree.boundary.height);
                ctx.stroke();

                for (const element of quadTree.objects) {
                    ctx.lineWidth = 4;
                    ctx.strokeColor = cc.Color.CYAN
                    ctx.rect(element.x, element.y, element.width, element.height);
                    ctx.stroke();
                }
            }

            for (const element of quadTree.children) {
                draw(element)
            }
        }

        draw(TankGameLogic.GetInstance<TankGameLogic>().quadTree)
    }
}