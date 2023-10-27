import * as cc from "cc";
import { Mediator } from "../puremvc/patterns/mediator/Mediator";
import { UIEnum } from "./UIEnum";
import { InstantiatePrefab, LoadPrefab } from "../resource_manager/ResourceUtils";
import { Asset } from "cc";
import LayerManager, { LayerProperty } from "./LayerManager";
import { Prefab } from "cc";

export class UIData {
    prefabURL: string = ""
    uiType: number = UIEnum.UI_NORMAL
    async: boolean = false
}

export enum UIStatus {
    LOADING = 0,
    FINISH,
    CLOSED
}

export class BaseUIMediator extends Mediator {
    status: number = UIStatus.LOADING
    uiData: UIData = new UIData()
    layerProperty: LayerProperty = null

    OpenLayerAsync() {
        this.status = UIStatus.LOADING
        LoadPrefab(this.uiData.prefabURL, function (error: Error, asset: Prefab) {
            if (!asset)
                return

            if (this.status == UIStatus.CLOSED)
                return
            this.status = UIStatus.FINISH

            let panel = InstantiatePrefab(asset)
            LayerManager.AddNode({ layerNode: panel, uiType: this.uiData.uiType, mediator: this })
        })
    }

    async OpenLayer() {
        let prefab = null
        this.status = UIStatus.LOADING
        await new Promise(function (success) {
            LoadPrefab(this.uiData.prefabURL, function (error: Error, asset: Asset) {
                if (error) {
                    this.status = UIStatus.CLOSED
                    success()
                    return
                }
                prefab = asset
                success()
            }.bind(this))
        }.bind(this))

        if (!prefab)
            return

        if (this.status == UIStatus.CLOSED)
            return
        this.status = UIStatus.FINISH

        let panel = InstantiatePrefab(prefab)
        this.layerProperty = { layerNode: panel, uiType: this.uiData.uiType, mediator: this }
        LayerManager.AddNode(this.layerProperty)
    }

    CloseLayer() {
        if (!this.uiData)
            return

        if (this.status == UIStatus.LOADING) {
            this.status = UIStatus.CLOSED
            return
        }

        if (!this.layerProperty)
            return

        LayerManager.RemoveNode(this.layerProperty)
    }
}