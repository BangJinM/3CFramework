import { ISingleton, set_manager_instance } from "../ISingleton";
import { LayerProperty } from "./LayerProperty";
import { UIGraphManager } from "./UIGraphManager";

/** 界面管理 */
@set_manager_instance()
export class LayerManager extends ISingleton {
    /** 节点属性列表 */
    uiNodes: Map<number, LayerProperty[]> = new Map()
    uiGraphManager: any;

    Init() {

    }
    Update(deltaTime: number) {
    }
    Clean() {
        this.RemoveAllNode()
    }
    Destroy() {
        this.Clean()
    }

    constructor() {
        super()
    }

    /** 添加界面节点 */
    AddNode(layerProperty: LayerProperty) {
        if (!layerProperty.layerNode)
            return

        if (!layerProperty.uiType)
            return

        if (!this.uiNodes.has(layerProperty.uiType))
            this.uiNodes.set(layerProperty.uiType, [])

        let properties = this.uiNodes.get(layerProperty.uiType)
        for (const property of properties) {
            if (property.name == layerProperty.name)
                return
        }

        let parent = UIGraphManager.GetInstance().GetUINode(layerProperty.uiType)
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
            if (property.name == layerProperty.name)
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