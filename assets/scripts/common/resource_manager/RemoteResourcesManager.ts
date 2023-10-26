import * as cc from "cc";
import { AssetType, IResourcesManager, LoadAssetCompleteFunc } from "./BaseResourcesManager";

class RemoteResourcesManager extends IResourcesManager {
    LoadAsset(url: string, type: AssetType, onComplete: LoadAssetCompleteFunc): void {
        cc.assetManager.loadRemote(url, type, function (error: Error | null, asset: cc.Asset) {
            if (error)
                onComplete(error, null)
            else
                onComplete(null, asset)
        }.bind(this))
    }

    public LoadSpriteFrame(url: string, onComplete: LoadAssetCompleteFunc): void {
        if (this.CheckAssetStatus(url, onComplete))
            return

        this.LoadAsset(url, cc.ImageAsset, function (error: Error, asset: cc.ImageAsset) {
            if (error) {
                this.ExcuteLoadAssetCompleteFunc(url, error, null)
                return
            }

            let sp = cc.SpriteFrame.createWithImage(asset)
            this.ExcuteLoadAssetCompleteFunc(url, null, sp)
        }.bind(this))
    }
}

export default new RemoteResourcesManager()