import * as cc from "cc";
const { ccclass } = cc._decorator;
import UIGraphManager from "./common/ui_manager/UIGraphManager";
import resourceManager from "./common/resource_manager/resource_index";
import { InstantiatePrefab } from "./common/resource_manager/ResourceUtils";
import LayerManager, { LayerProperty } from "./common/ui_manager/LayerManager";
import { UIEnum } from "./common/ui_manager/UIEnum";

@ccclass("Main")
export class Main extends cc.Component {
    protected onLoad(): void {
        this.initUINode()
    }

    async initUINode() {
        await UIGraphManager.InitUIRootNode()
        console.log("Main onLoading")

        let prefab = null
        await new Promise((resolve) => {
            resourceManager.localResourcesManager.LoadPrefab("prefabs/layer/test", function (error, asset) {
                prefab = asset
                resolve(true)
            })
        })

        let node = InstantiatePrefab(prefab)
        let layerProperty: LayerProperty = { id: 1, uiType: UIEnum.UI_NORMAL, layerNode: node }
        LayerManager.AddNode(layerProperty)
    }
}