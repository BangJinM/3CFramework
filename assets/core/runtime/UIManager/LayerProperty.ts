import * as cc from "cc";
import { UIEnum } from "./UIEnum";


@cc._decorator.ccclass("LayerProperty")
/** 界面属性 */
export class LayerProperty {
    /** 界面类型 */
    @cc._decorator.property({ type: cc.Enum(UIEnum), tooltip: "界面类型" })
    public uiType: UIEnum;
    /** 界面节点 */
    public layerNode: cc.Node;
    /** 节点名字 */
    public layerName: string;
}
