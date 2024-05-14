import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import { ISingleton, set_manager_instance } from "../ISingleton";
import { LayerProperty } from "./LayerProperty";

/** UI 根节点 管理 */
@set_manager_instance()
@cc._decorator.ccclass("UIGraphManager")
export class UIGraphManager extends ISingleton {
    /** UI根目录 */
    @cc._decorator.property({ type: cc.Node })
    uiRootNode: cc.Node = null
    /** UI Camera */
    @cc._decorator.property({ type: cc.Node })
    uiCameraNode: cc.Node = null
    /** UI Canvas */
    @cc._decorator.property({ type: cc.Node })
    uiCanvasNode: cc.Node = null

    /** 层级节点 */
    @cc._decorator.property({ type: Map<string, cc.Node> })
    uiRootNodes: Map<string, cc.Node> = new Map()
    /** 节点属性列表 */
    @cc._decorator.property({ type: Map })
    uiOpenNodes: Map<number, LayerProperty[]> = new Map()

    Init() {
        this.InitUIRootNode()
    }

    InitUIRootNode() {
        if (!this.uiRootNode) {
            this.uiRootNode = new cc.Node("ui_root_node")
            this.node.addChild(this.uiRootNode);
        }
        if (!this.uiCameraNode) {
            this.uiCameraNode = new cc.Node("ui_camera_node")
            this.uiRootNode.addChild(this.uiCameraNode);

            let uiCamera = this.uiCameraNode.addComponent(cc.Camera)
            uiCamera.visibility = cc.Layers.Enum.UI_2D | cc.Layers.Enum.UI_3D
            uiCamera.clearFlags = cc.Camera.ClearFlag.DEPTH_ONLY
            uiCamera.projection = cc.Camera.ProjectionType.ORTHO
        }

        if (!this.uiCanvasNode) {
            this.uiCanvasNode = new cc.Node("ui_canvas_node")
            this.uiRootNode.addChild(this.uiCanvasNode);

            let canvas: cc.Canvas = this.uiCanvasNode.addComponent(cc.Canvas)
            canvas.cameraComponent = this.uiCameraNode.getComponent(cc.Camera)
            canvas.alignCanvasWithScreen = true
        }

        for (let index = 0; index < UIEnum.UI_MAX; index++) {
            let name = UIEnum[index]
            let childNode = new cc.Node(name)
            this.uiCanvasNode.addChild(childNode)
            this.uiRootNodes.set(name, childNode)
            childNode.layer = cc.Layers.Enum.UI_2D
        }
    }

    GetUINode(nodeType: UIEnum) {
        return this.uiRootNodes.get(UIEnum[nodeType])
    }

    Clean() {
        this.RemoveAllNode()

        this.uiRootNode.destroy()
        this.uiRootNode.removeFromParent()
        this.uiRootNodes.clear()

        this.uiCameraNode = null
        this.uiCanvasNode = null
        this.uiRootNode = null
    }

    /** 添加界面节点 */
    AddNode(layerProperty: LayerProperty) {
        if (!layerProperty.layerNode)
            return

        if (!layerProperty.uiType)
            return

        if (!this.uiOpenNodes.has(layerProperty.uiType))
            this.uiOpenNodes.set(layerProperty.uiType, [])

        let properties = this.uiOpenNodes.get(layerProperty.uiType)
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

        if (!this.uiOpenNodes.has(layerProperty.uiType))
            return

        if (!layerProperty.layerNode)
            return

        let layerIndex = -1
        let properties = this.uiOpenNodes.get(layerProperty.uiType)
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
        for (const properties of this.uiOpenNodes.values()) {
            for (const property of properties.values()) {
                this.RemoveNode(property)
            }
        }
    }

}