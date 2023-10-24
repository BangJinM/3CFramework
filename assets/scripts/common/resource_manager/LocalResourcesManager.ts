import { Asset, assert, resources } from "cc";
import { AssetType, IResourcesManager, LoadAssetCompleteFunc } from "./BaseResourcesManager";
import resourceManager from "./resource_index";

class LocalResourcesManager extends IResourcesManager {
    LoadAsset(url: string, type: AssetType, onComplete: LoadAssetCompleteFunc): void {
        resources.load(url, type, function (error: Error | null, asset: Asset) {
            if (error)
                onComplete(error, null)
            else
                onComplete(null, asset)
        }.bind(this))
    }
}

export default new LocalResourcesManager()