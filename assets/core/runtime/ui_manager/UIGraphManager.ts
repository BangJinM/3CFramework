import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import { ISingleton, set_manager_instance } from "../ISingleton";
import { LayerProperty } from "./LayerManager";
import { GetManagerPersistNode } from "../utils/CocosUtils";

/** UI 根节点 管理 */
@set_manager_instance()
export class UIGraphManager extends ISingleton {
    uiCameraNode: cc.Node = null
    /** UICanvas */
    uiCanvasNode: cc.Node = null
    /** UI根目录 */
    uiRootNode: cc.Node = null
    uiNode: cc.Node = null
    /** 层级节点 */
    uiNodes: Map<string, cc.Node> = new Map()

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

        if (!this.uiNode) {
            this.uiNode = new cc.Node("ui_node")
            this.uiRootNode.addChild(this.uiNode)
        }

        for (let index = 0; index < UIEnum.UI_MAX; index++) {
            let name = UIEnum[index]
            let childNode = new cc.Node(name)
            this.uiNode.addChild(childNode)
            this.uiNodes.set(name, childNode)
            childNode.layer = cc.Layers.Enum.UI_2D
        }
    }

    GetUINode(nodeType: UIEnum) {
        return this.uiNodes.get(UIEnum[nodeType])
    }

    Clean() {
        cc.director.removePersistRootNode(this.uiRootNode)

        this.uiRootNode.destroy()
        this.uiRootNode.removeFromParent()
        this.uiNodes.clear()

        this.uiCameraNode = null
        this.uiCanvasNode = null
        this.uiRootNode = null
        this.uiNode = null
    }
}