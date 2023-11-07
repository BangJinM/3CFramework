import * as cc from "cc";
import { CustomAtlas } from "./other_assets/CustomAtlas";
import ReleaseManager from "./ReleaseManager";

export type AssetType = cc.Constructor<any>
export type LoadAssetCompleteFunc = (error: Error | null, asset: cc.Asset) => void;


export class RemoteLocalAssetData {
    url: string
    type: AssetType
    loadAssetCompleteFunc: LoadAssetCompleteFunc
    bundleName: string
}

export abstract class IResourcesManager {
    loadingAssets: Map<string, Function[]> = new Map()

    /** 正在加载资源的回调 */
    AddLoadAssetCompleteFunc(url: string, loadAssetCompleteFunc: LoadAssetCompleteFunc) {
        if (!this.loadingAssets.has(url))
            this.loadingAssets.set(url, [])

        this.loadingAssets.get(url).push(loadAssetCompleteFunc)
    }
    /** 执行并删除正在加载资源的回调 */
    ExcuteLoadAssetCompleteFunc(url: string, error: Error | null, asset: cc.Asset) {
        if (!this.loadingAssets.has(url))
            return

        let array = this.loadingAssets.get(url)
        for (const iterator of array) {
            iterator(error, asset)
        }

        this.loadingAssets.delete(url)
    }

    GetLoadAssetCompleteFuncLength(url: string) {
        if (!this.loadingAssets.get(url))
            return 0

        return this.loadingAssets.get(url).length
    }

    CheckAssetStatus(url: string, onComplete: LoadAssetCompleteFunc) {
        this.AddLoadAssetCompleteFunc(url, function (error, asset) {
            if (asset)
                ReleaseManager.AddAsset(url, asset)
            onComplete(error, asset)
        })

        let asset = ReleaseManager.GetAsset(url)
        if (asset) {
            this.ExcuteLoadAssetCompleteFunc(url, null, asset)
            return true
        }

        if (this.GetLoadAssetCompleteFuncLength(url) > 1)
            return true

        return false
    }

    /** 加载资源 */
    abstract LoadAsset(url: string, type: AssetType | null, onComplete: LoadAssetCompleteFunc);
    /** 加载Prefab */
    public LoadPrefab(url: string, onComplete: LoadAssetCompleteFunc) {
        if (this.CheckAssetStatus(url, onComplete))
            return
        this.LoadAsset(url, cc.Prefab, onComplete)
    }
    /** 加载 Texture2D */
    public LoadTexture2D(url: string, onComplete: LoadAssetCompleteFunc) {
        if (this.CheckAssetStatus(url, onComplete))
            return
        this.LoadAsset(url, cc.Texture2D, onComplete)
    }
    /** 加载SpriteFrame */
    public LoadSpriteFrame(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, cc.SpriteFrame, onComplete)
    }
    /** 加载场景 */
    public LoadScene(url: string, onComplete: LoadAssetCompleteFunc) {
        if (this.CheckAssetStatus(url, onComplete))
            return
        this.LoadAsset(url, cc.Scene, onComplete)
    }
    /** 加载音频 */
    public LoadAudio(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, cc.AudioClip, onComplete)
    }
    /** 加载自定义图集 */
    public LoadCustomAtlas(url: string, onComplete: LoadAssetCompleteFunc) {
        if (this.CheckAssetStatus(url, onComplete))
            return

        let jsonError = null, jsonAsset = null
        let spriteFrameError = null, spriteFrame = null
        let loadCallBack = function (error: Error | null, asset: cc.Asset) {
            if (jsonAsset && spriteFrame) {
                asset = CustomAtlas.createWithSpritePlist(spriteFrame, jsonAsset)
                ReleaseManager.AddAsset(url, asset)
            }

            if ((spriteFrameError || spriteFrame) && (jsonError || jsonAsset)) {
                if (jsonAsset)
                    jsonAsset.decRef()

                if (spriteFrame)
                    spriteFrame.decRef()

                if (asset) {
                    this.ExcuteLoadAssetCompleteFunc(url, null, asset)
                    return
                }

                if (spriteFrameError) {
                    this.ExcuteLoadAssetCompleteFunc(url, spriteFrameError, null)
                    return
                }

                if (jsonError) {
                    this.ExcuteLoadAssetCompleteFunc(url, jsonError, null)
                    return
                }
            }
        }.bind(this)

        this.LoadAsset(url + ".png", cc.ImageAsset, (error, asset: cc.ImageAsset) => {
            spriteFrameError = error
            spriteFrame = asset

            loadCallBack()
        })
        this.LoadAsset(url + ".plist", null, (error, asset) => {
            jsonError = error
            jsonAsset = asset

            loadCallBack()
        })
    }
    /** 加载图集 */
    public LoadSpriteAtlas(url: string, onComplete: LoadAssetCompleteFunc) {
        if (this.CheckAssetStatus(url, onComplete))
            return
        this.LoadAsset(url, cc.SpriteAtlas, onComplete)
    }
}