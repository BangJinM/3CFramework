import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import UIGraphManager from "./UIGraphManager";

/** 界面属性 */
export class LayerProperty {
    /** 界面类型 */
    public uiType: UIEnum
    /** 界面节点 */
    public layerNode: cc.Node
    /** 节点ID */
    public id: number
}
/** 界面管理 */
class LayerManager {
    /** 节点属性列表 */
    uiNodes: Map<number, LayerProperty[]> = new Map()

    /** 添加界面节点 */
    AddNode(layerProperty: LayerProperty) {
        if (!layerProperty.layerNode)
            return

        if (!layerProperty.uiType)
            return

        if (!layerProperty.id)
            return

        if (!this.uiNodes.has(layerProperty.uiType))
            this.uiNodes.set(layerProperty.uiType, [])

        let properties = this.uiNodes.get(layerProperty.uiType)
        for (const property of properties) {
            if (property.id == layerProperty.id)
                return
        }

        let parent = UIGraphManager.GetUINode(layerProperty.uiType)
        if (!parent)
            return

        properties.push(layerProperty)
        parent.addChild(layerProperty.layerNode)
    }

    /** 移除界面节点 */
    RemoveNode(layerProperty: LayerProperty) {
        if (!layerProperty.uiType)
            return

        if (!this.uiNodes.has(layerProperty.uiType))
            return

        if (!layerProperty.layerNode)
            return

        let layerIndex = -1
        let properties = this.uiNodes.get(layerProperty.uiType)
        for (let index = 0; index < properties.length; index++) {
            let property = properties[index]
            if (property.id == layerProperty.id)
                layerIndex = index
        }

        if (layerIndex < 0)
            return

        properties.slice(layerIndex, 1)

        layerProperty.layerNode.removeFromParent()
        layerProperty.layerNode.destroy()
    }

    /** 移除所有界面节点 */
    RemoveAllNode() {
        for (const properties of this.uiNodes.values()) {
            for (const property of properties.values()) {
                this.RemoveNode(property)
            }
        }
    }
}

export default new LayerManager()