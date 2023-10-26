import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import resourceManager from "../resource_manager/resource_index";
import { InstantiatePrefab } from "../resource_manager/ResourceUtils";

class UIGraphManager {
    /** UICanvas */
    uiCanvasNode: cc.Node = null
    /** UI根目录 */
    uiRootNode: cc.Node = null
    /** 层级节点 */
    uiNodes: Map<string, cc.Node> = new Map()

    async InitUIRootNode() {
        if (!this.uiCanvasNode) {
            let prefab = null
            await new Promise((resolve) => {
                resourceManager.localResourcesManager.LoadPrefab("prefabs/common/Canvas_UI", function (error, asset) {
                    prefab = asset
                    resolve(true)
                })
            })

            this.uiCanvasNode = InstantiatePrefab(prefab)
            cc.director.addPersistRootNode(this.uiCanvasNode)
        }

        if (!this.uiRootNode) {
            this.uiRootNode = new cc.Node("RenderRoot")
            this.uiCanvasNode.addChild(this.uiRootNode)
        }

        for (let index = 0; index < UIEnum.UI_MAX; index++) {
            let name = UIEnum[index]
            let childNode = new cc.Node(name)
            this.uiRootNode.addChild(childNode)
            this.uiNodes.set(name, childNode)

            childNode.layer = cc.Layers.Enum.UI_2D

            console.log("InitUIRootNode ", name)
        }
    }

    async ResetUIRoot() {
        if (this.uiRootNode) {
            this.uiRootNode.destroyAllChildren()
            this.uiRootNode.removeAllChildren()
        }

        this.uiNodes.clear()
        await this.InitUIRootNode()
        console.log("ddadas")
    }

    GetUINode(nodeType: UIEnum) {
        return this.uiNodes.get(UIEnum[nodeType])
    }

    Cleanup() {
        this.uiRootNode = null
        this.uiNodes.clear()
    }
}

export default new UIGraphManager()