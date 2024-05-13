import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import { Mediator } from "../puremvc/patterns/mediator/Mediator";

/** 界面属性 */
export class LayerProperty {
    /** 界面类型 */
    @cc._decorator.property({ type: cc.Enum(UIEnum) })
    public uiType: UIEnum;
    /** 界面节点 */
    @cc._decorator.property(Node)
    public layerNode: cc.Node;
    /** 节点ID */
    @cc._decorator.property(String)
    public name: string;
}
