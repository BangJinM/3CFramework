import * as cc from "cc";
import { Mediator } from "../puremvc/patterns/mediator/Mediator";
import { UIEnum } from "./UIEnum";
import { LayerManager, LayerProperty } from "./LayerManager";
import { AssetCache } from "../resource_manager/ResourcesDefines";

export class UIData {
    prefabURL: string = ""
    uiType: number = UIEnum.UI_NORMAL
    async: boolean = false
    bundle: string = "resources"
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
    layerManager: LayerManager;

    constructor(layerManager: LayerManager, mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent)

        this.layerManager = layerManager
    }

    // LoadPrefabSuccess(prefab: AssetCache) {
    //     if (this.status != UIStatus.LOADING)
    //         return

    //     if (!prefab)
    //         return

    //     this.status = UIStatus.FINISH
    //     let panel = cc.instantiate(prefab.data as cc.Prefab)
    //     this.layerManager.AddNode({ layerNode: panel, uiType: this.uiData.uiType, mediator: this })
    // }

    // Open() {
    //     if (this.uiData.async)
    //         this.OpenAsync()
    //     else
    //         this.OpenSync.call(this)
    // }

    // private OpenAsync() {
    //     if (this.status != UIStatus.UNUSED)
    //         return
    //     this.status = UIStatus.LOADING

    //     GlobalCommon.resourcesManager.LoadAsset(this.uiData.prefabURL, cc.Prefab, GlobalCommon.bundleManager.GetBundle(this.uiData.bundle), function (error, asset: AssetCache) {
    //         if (error)
    //             this.status = UIStatus.CLOSED
    //         this.LoadPrefabSuccess(asset)
    //     }.bind(this))

    // }

    // private async OpenSync() {
    //     if (this.status != UIStatus.UNUSED)
    //         return
    //     this.status = UIStatus.LOADING

    //     let prefab = null
    //     await new Promise(function (success) {
    //         GlobalCommon.resourcesManager.LoadAsset(this.uiData.prefabURL, cc.Prefab, GlobalCommon.bundleManager.GetBundle(this.uiData.bundle), function (error, asset: AssetCache) {
    //             if (error)
    //                 this.status = UIStatus.CLOSED
    //             prefab = asset
    //             success()
    //         }.bind(this))
    //     }.bind(this))

    //     this.LoadPrefabSuccess(prefab)
    // }

    // CloseLayer() {
    //     if (!this.uiData)
    //         return

    //     if (this.status == UIStatus.LOADING) {
    //         this.status = UIStatus.CLOSED
    //         return
    //     }

    //     if (!this.layerProperty)
    //         return

    //     this.status = UIStatus.UNUSED
    //     GlobalCommon.layerManager.RemoveNode(this.layerProperty)
    // }
}