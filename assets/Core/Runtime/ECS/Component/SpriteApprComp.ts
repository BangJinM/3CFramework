import * as cc from "cc";
import { IApprComp } from "./IApprComp";
import { GetOrAddComponent } from "../../Utils/CocosUtils";

export class SpriteApprComp extends IApprComp {
    /** 图片名字 */
    spriteName: string = ""
    spriteNode: cc.Node = null

    OnAdd(): void {
        super.OnAdd()
        this.spriteNode = new cc.Node()

        let sprite: cc.Sprite = GetOrAddComponent(this.spriteNode, cc.Sprite)

    }
}