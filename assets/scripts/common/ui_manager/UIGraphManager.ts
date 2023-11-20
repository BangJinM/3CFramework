import * as cc from "cc";
import { UIEnum } from "./UIEnum";
import { GlobalCommon } from "../GlobalCommon";
import { ISingleton } from "../ISingleton";
import { AssetCache } from "../resource_manager/ResourcesDefines";
import { Logger } from "../Logger";

export class UIGraphManager implements ISingleton {
    /** UICanvas */
    uiCanvasNode: cc.Node = null
    /** UI根目录 */
    uiRootNode: cc.Node = null
    /** 层级节点 */
    uiNodes: Map<string, cc.Node> = new Map()

    Init() {
    }
    Update(deltaTime: number) {
    }

    async InitUIRootNode() {
        if (!this.uiCanvasNode) {
            let prefab: AssetCache = null
            await new Promise((resolve) => {
                GlobalCommon.resourcesManager.LoadAsset("prefabs/common/Canvas_UI", cc.Prefab, GlobalCommon.bundleManager.GetBundle("resources"), function (error, asset: AssetCache) {
                    prefab = asset
                    resolve(true)
                })
            })
            this.uiCanvasNode = cc.instantiate(prefab.data as cc.Prefab)
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

            Logger.info("InitUIRootNode " + name)
        }
    }

    async ResetUIRoot() {
        if (this.uiRootNode) {
            this.uiRootNode.destroyAllChildren()
            this.uiRootNode.removeAllChildren()
        }

        this.uiNodes.clear()
        await this.InitUIRootNode()
        Logger.info("ddadas")
    }

    GetUINode(nodeType: UIEnum) {
        return this.uiNodes.get(UIEnum[nodeType])
    }

    Clean() {
        cc.director.removePersistRootNode(this.uiCanvasNode)

        this.uiCanvasNode = null
        this.uiRootNode = null

        this.uiNodes.clear()
    }
}