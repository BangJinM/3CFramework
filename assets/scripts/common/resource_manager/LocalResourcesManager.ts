import { Asset, assert, resources } from "cc";
import { AssetType, IResourcesManager, LoadAssetCompleteFunc } from "./BaseResourcesManager";
import resourceManager from "./resource_index";

class LocalResourcesManager extends IResourcesManager {
    LoadAsset(url: string, type: AssetType, onComplete: LoadAssetCompleteFunc): void {
        let asset = resourceManager.releaseManager.GetAsset(url)
        if (asset) {
            asset.addRef()
            onComplete(null, asset)
            return
        }

        this.AddLoadAssetCompleteFunc(url, onComplete)

        resources.load(url, type, function (error: Error | null, asset: Asset) {
            if (error) {
                this.ExcuteLoadAssetCompleteFunc(url, error, null)
                return
            }

            asset.addRef()
            resourceManager.releaseManager.AddAsset(url, asset)
            this.ExcuteLoadAssetCompleteFunc(url, null, asset)
        }.bind(this))
    }
}

export default new LocalResourcesManager()