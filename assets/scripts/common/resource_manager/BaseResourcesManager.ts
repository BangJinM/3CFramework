import { Asset, AudioClip, Constructor, ImageAsset, Prefab, Scene, SpriteAtlas, SpriteFrame, Texture2D, error } from "cc";
import { CustomAtlas } from "./other_assets/CustomAtlas";
import resourceManager from "./resource_index";

export type AssetType = Constructor<any>
export type LoadAssetCompleteFunc = (error: Error | null, assets: Asset) => void;

export abstract class IResourcesManager {
    loadingAssets: Map<string, Function[]> = new Map()
    /** 正在加载资源的回调 */
    AddLoadAssetCompleteFunc(url: string, loadAssetCompleteFunc: LoadAssetCompleteFunc) {
        if (!this.loadingAssets.has(url))
            this.loadingAssets.set(url, [])

        this.loadingAssets.get(url).push(loadAssetCompleteFunc)
    }
    /** 执行并删除正在加载资源的回调 */
    ExcuteLoadAssetCompleteFunc(url: string, error: Error | null, asset: Asset) {
        if (!this.loadingAssets.get(url))
            return

        let array = this.loadingAssets.get(url)
        for (const iterator of array) {
            iterator(error, asset)
        }

        this.loadingAssets.delete(url)
    }

    /** 加载资源 */
    abstract LoadAsset(url: string, type: AssetType | null, onComplete: LoadAssetCompleteFunc);
    /** 加载Prefab */
    public LoadPrefab(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, Prefab, onComplete)
    }
    /** 加载 Texture2D */
    public LoadTexture2D(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, Texture2D, onComplete)
    }
    /** 加载SpriteFrame */
    public LoadSpriteFrame(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, SpriteFrame, onComplete)
    }
    /** 加载场景 */
    public LoadScene(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, Scene, onComplete)
    }
    /** 加载音频 */
    public LoadAudio(url: string, onComplete: LoadAssetCompleteFunc) {
        this.LoadAsset(url, AudioClip, onComplete)
    }
    /** 加载自定义图集 */
    public LoadCustomAtlas(url: string, onComplete: LoadAssetCompleteFunc) {
        let asset = resourceManager.releaseManager.GetAsset(url)
        if (asset) {
            asset.addRef()
            onComplete(null, asset)
            return
        }

        let jsonError = null, jsonAsset = null
        let spriteFrameError = null, spriteFrame = null
        let loadCallBack = function (error: Error | null, asset: Asset) {
            if (jsonAsset && spriteFrame) {
                asset = CustomAtlas.createWithSpritePlist(spriteFrame, jsonAsset)
                asset.addRef()
                resourceManager.releaseManager.AddAsset(url, asset)
            }

            if ((spriteFrameError || spriteFrame) && (jsonError || jsonAsset)) {
                if (jsonAsset)
                    jsonAsset.decRef()

                if (spriteFrame)
                    spriteFrame.decRef()

                if (asset) {
                    onComplete(null, asset)
                    return
                }

                if (spriteFrameError) {
                    onComplete(spriteFrameError, null)
                    return
                }

                if (jsonError) {
                    onComplete(jsonError, null)
                    return
                }
            }
        }.bind(this)

        this.LoadAsset(url + ".png", ImageAsset, (error, asset: ImageAsset) => {
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
        this.LoadAsset(url, SpriteAtlas, onComplete)
    }
}