import { Asset, ImageAsset, SpriteFrame, assetManager } from "cc";
import resourceManager from "./resource_index";
import { AssetType, IResourcesManager, LoadAssetCompleteFunc } from "./BaseResourcesManager";

class RemoteResourcesManager extends IResourcesManager {
    LoadAsset(url: string, type: AssetType, onComplete: LoadAssetCompleteFunc): void {
        assetManager.loadRemote(url, type, function (error: Error | null, asset: Asset) {
            if (error)
                onComplete(error, null)
            else
                onComplete(null, asset)
        }.bind(this))
    }

    public LoadSpriteFrame(url: string, onComplete: LoadAssetCompleteFunc): void {
        if (this.CheckAssetStatus(url, onComplete))
            return

        this.LoadAsset(url, ImageAsset, function (error: Error, asset: ImageAsset) {
            if (error) {
                this.ExcuteLoadAssetCompleteFunc(url, error, null)
                return
            }

            let sp = SpriteFrame.createWithImage(asset)
            this.ExcuteLoadAssetCompleteFunc(url, null, sp)
        }.bind(this))
    }
}

export default new RemoteResourcesManager()