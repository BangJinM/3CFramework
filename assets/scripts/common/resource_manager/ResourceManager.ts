import * as cc from "cc";
import { AssetCache, AssetType, BundleCache, LoadAssetCompleteFunc, USE_SPRITE_BUNDLE_LOAD } from "./ResourcesDefines";
import { CustomAtlas } from "./other_assets/CustomAtlas";
import Global from "../config/Global";
// import AppLog from "../util/AppLog";

/** 资源管理类，所有在资源都会经由这个类，bundle中的资源，本地png，远程png */
export class ResourceManager {
    /** 正在加载的资源列表 */
    private loadingAssets: Map<string, Map<string, Function[]>> = new Map()

    Init() {
    }

    Update(deltaTime: number) {
    }
    Clean() {
    }

    private loadAnyAsset(url: string, assetType: AssetType = cc.Asset, bundleCache: BundleCache, opt, onComplete?) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this.loadAssetCompleteFunc(error, null, url, assetType)
                return
            }
            let assetCache = AssetCache.Create(url, assetType, bundleCache, [])
            Global.GameCacheManager.AddAssetCache(asset, assetCache)
            this?.loadAssetCompleteFunc(error, asset, url, assetType)
        }.bind(this)

        // AppLog.log("load asset", url)

        if (bundleCache) {
            bundleCache.bundle.load(url, onComplete ? onComplete : loadOnCompleteFunc)
        }
        else {
            if (opt?.urlExt)
                cc.assetManager.loadRemote(url + opt.urlExt, opt?.native, onComplete ? onComplete : loadOnCompleteFunc)
            else
                cc.assetManager.loadRemote(url, opt?.native, onComplete ? onComplete : loadOnCompleteFunc)
        }
    }

    private loadAssetCompleteFunc(error: Error, asset: cc.Asset, url, assetType) {
        let key = cc.js.getClassName(assetType)
        let loadingAsset = this.loadingAssets.get(key)
        if (!loadingAsset)
            return

        asset?.addRef()
        let funcs = loadingAsset.get(url)
        for (const iterator of funcs) {
            iterator(error, asset)
        }

        asset?.decRef()
        loadingAsset.delete(url)
    }

    private checkLoadingAsset(assetType: AssetType, url: string, func: Function) {
        let loading = false

        let key = cc.js.getClassName(assetType)
        if (!this.loadingAssets.has(key)) {
            this.loadingAssets.set(key, new Map())
        }

        let funcMap = this.loadingAssets.get(key)
        if (funcMap.has(url)) {
            funcMap.get(url).push(func)
            loading = true
        }
        else {
            funcMap.set(url, [func])
        }
        return loading
    }

    /** 加载自定义图集 */
    private loadCustomAtlas(url: string, bundleCache: BundleCache, opt) {
        let laods = [
            {
                url: url + ".png",
                assetType: cc.SpriteFrame,
                bundleCache: bundleCache
            },
            {
                url: url + ".plist",
                assetType: cc.Asset,
                bundleCache: bundleCache
            }
        ]

        let loadCallBack = function (error: Error | null, assets: cc.Asset[]) {
            if (error) {
                this.loadAssetCompleteFunc(error, null, url, CustomAtlas)
                return
            }
            let customAtlas = CustomAtlas.createWithSpritePlist(assets[0] as cc.SpriteFrame, assets[1])

            let assetCache = AssetCache.Create(url, CustomAtlas, bundleCache, [assets[0]])
            Global.GameCacheManager.AddAssetCache(customAtlas, assetCache)
            this.loadAssetCompleteFunc(null, customAtlas, url, CustomAtlas)
        }.bind(this)

        this.LoadAssets(laods, opt, loadCallBack)
    }

    private loadBundleTexture2D(url: string, bundleCache: BundleCache, opt) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this?.loadAssetCompleteFunc(error, null, url, cc.Texture2D)
                return
            }
            let assetCache = AssetCache.Create(url, cc.Texture2D, bundleCache, [])
            Global.GameCacheManager.AddAssetCache(asset, assetCache)
            this?.loadAssetCompleteFunc(error, asset, url, cc.Texture2D)
        }.bind(this)

        this.loadAnyAsset(url, cc.Texture2D, bundleCache, opt, loadOnCompleteFunc)
    }


    private loadRemoteTexture2D(url: string, bundleCache: BundleCache, opt) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this?.loadAssetCompleteFunc(error, null, url, cc.Texture2D)
                return
            }

            const texture = new cc.Texture2D();
            texture.image = asset as cc.ImageAsset
            let assetCache = AssetCache.Create(url, cc.Texture2D, bundleCache, [asset])
            Global.GameCacheManager.AddAssetCache(texture, assetCache)
            this?.loadAssetCompleteFunc(error, texture, url, cc.Texture2D)
        }.bind(this)

        let asset = Global.GameCacheManager.GetAssetCache(cc.ImageAsset, url)
        if (asset) {
            loadOnCompleteFunc(null, asset)
            return
        }

        if (this.checkLoadingAsset(cc.ImageAsset, url, loadOnCompleteFunc))
            return

        this.loadAnyAsset(url, cc.ImageAsset, bundleCache, opt)

    }

    /** 加载Bundle 中 SpriteFrame */
    private loadBundleSpriteFrame(url: string, bundleCache: BundleCache, opt) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this?.loadAssetCompleteFunc(error, null, url, cc.SpriteFrame)
                return
            }
            let assetCache = AssetCache.Create(url, cc.SpriteFrame, bundleCache, [])
            Global.GameCacheManager.AddAssetCache(asset, assetCache)
            this?.loadAssetCompleteFunc(error, asset, url, cc.SpriteFrame)
        }.bind(this)

        this.loadAnyAsset(url, cc.SpriteFrame, bundleCache, opt, loadOnCompleteFunc)
    }

    /** 加载 远端 SpriteFrame */
    private loadRemoteSpriteFrame(url: string, bundleCache: BundleCache, opt) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this?.loadAssetCompleteFunc(error, null, url, cc.SpriteFrame)
                return
            }

            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.texture = asset as cc.Texture2D;

            let assetCache = AssetCache.Create(url, cc.SpriteFrame, bundleCache, [asset])
            Global.GameCacheManager.AddAssetCache(spriteFrame, assetCache)

            this?.loadAssetCompleteFunc(error, spriteFrame, url, cc.SpriteFrame)
        }.bind(this)

        let asset = Global.GameCacheManager.GetAssetCache(cc.Texture2D, url)
        if (asset) {
            loadOnCompleteFunc(null, asset)
            return
        }

        this.LoadAsset(url, cc.Texture2D, bundleCache, opt, loadOnCompleteFunc)
    }

    /** 加载单个资源 */
    LoadAsset(url: string, assetType: AssetType, bundleCache: BundleCache, opt, loadCallBack: LoadAssetCompleteFunc) {
        let asset = Global.GameCacheManager.GetAssetCache(assetType, url)
        if (asset) {
            // asset.addRef()
            loadCallBack(null, asset)
            return
        }

        if (this.checkLoadingAsset(assetType, url, loadCallBack))
            return

        if (assetType == CustomAtlas)
            this.loadCustomAtlas(url, bundleCache, opt)
        else if (assetType == cc.SpriteFrame)
            if (USE_SPRITE_BUNDLE_LOAD && bundleCache)
                this.loadBundleSpriteFrame(url, bundleCache, opt)
            else
                this.loadRemoteSpriteFrame(url, bundleCache, opt)
        else if (assetType == cc.Texture2D)
            if (USE_SPRITE_BUNDLE_LOAD && bundleCache)
                this.loadBundleTexture2D(url, bundleCache, opt)
            else
                this.loadRemoteTexture2D(url, bundleCache, opt)
        else
            this.loadAnyAsset(url, assetType, bundleCache, opt)
    }

    /** 
     * 批量加载资源 
     * 如果有一个资源加载失败，清理全部的资源
     */
    LoadAssets(urlTypes: { bundleCache: BundleCache, url: string, assetType: AssetType }[], opt, onComplete: LoadAssetCompleteFunc) {
        let results = {}
        let count = 0
        let lastError: Error = null

        let loadCompleted = function (url, error: Error, asset: cc.Asset) {
            if (error)
                lastError = error

            count++
            results[url] = { error: error, asset: asset }
            asset?.addRef()

            if (count >= urlTypes.length) {
                for (const key in results) {
                    results[key].asset?.decRef()
                }
                if (lastError) {
                    onComplete(lastError, [])
                    return
                } else {
                    let temp = []
                    for (const urlType of urlTypes) {
                        temp.push(results[urlType.url].asset)
                    }
                    onComplete(error, temp)
                }
            }
        }

        for (const key in urlTypes) {
            let value = urlTypes[key]
            this.LoadAsset(value.url, value.assetType, value.bundleCache, opt, function (error, asset: cc.Asset) {
                loadCompleted(value.url, error, asset)
            })
        }
    }
}