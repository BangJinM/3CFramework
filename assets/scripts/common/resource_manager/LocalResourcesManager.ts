import * as cc from "cc";
import { AssetType, IResourcesManager, LoadAssetCompleteFunc } from "./BaseResourcesManager";

class LocalResourcesManager extends IResourcesManager {
    LoadAsset(url: string, type: AssetType, onComplete: LoadAssetCompleteFunc): void {
        cc.resources.load(url, type, function (error: Error | null, asset: cc.Asset) {
            if (error)
                onComplete(error, null)
            else
                onComplete(null, asset)
        }.bind(this))
    }
}

export default new LocalResourcesManager()