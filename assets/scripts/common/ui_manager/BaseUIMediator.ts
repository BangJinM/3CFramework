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
    UNUSED,
    LOADING,
    FINISH,
    CLOSED
}

export function GetClassName(name) {
    return (target) => {
        target["NAME"] = name ? name : target.constructor.name
    }
}

export class BaseUIMediator extends Mediator {
    status: number = UIStatus.UNUSED
    uiData: UIData = new UIData()
    layerProperty: LayerProperty = null

    LoadPrefabSuccess(prefab: cc.Prefab) {
        if (this.status != UIStatus.LOADING)
            return

        if (!prefab)
            return

        this.status = UIStatus.FINISH
        let panel = InstantiatePrefab(prefab)
        LayerManager.AddNode({ layerNode: panel, uiType: this.uiData.uiType, mediator: this })
    }

    Open() {
        if (this.uiData.async)
            this.OpenAsync()
        else
            this.OpenSync.call(this)
    }

    private OpenAsync() {
        if (this.status != UIStatus.UNUSED)
            return
        this.status = UIStatus.LOADING
        LoadPrefab(this.uiData.prefabURL, function (error: Error, asset: Prefab) {
            if (!asset)
                this.status = UIStatus.CLOSED

            this.LoadPrefabSuccess(asset)
        }.bind(this))
    }

    private async OpenSync() {
        if (this.status != UIStatus.UNUSED)
            return
        this.status = UIStatus.LOADING

        let prefab = null
        await new Promise(function (success) {
            LoadPrefab(this.uiData.prefabURL, function (error: Error, asset: Asset) {
                if (error)
                    this.status = UIStatus.CLOSED
                prefab = asset
                success()
            }.bind(this))
        }.bind(this))

        this.LoadPrefabSuccess(prefab)
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

        this.status = UIStatus.UNUSED
        LayerManager.RemoveNode(this.layerProperty)
    }
}