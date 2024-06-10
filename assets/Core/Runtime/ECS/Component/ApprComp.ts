import * as cc from "cc";
import { IComponent } from "../Base/IComponent";

/** 外观 */
export class IApprComp extends IComponent {
    /** 外观的根节点 */
    node: cc.Node = null
}

/** 精灵外观 */
export class SpriteApprComp extends IApprComp {
    /** 图片名字 */
    spriteName: string = "ddd"
}