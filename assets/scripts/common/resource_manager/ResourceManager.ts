import * as cc from "cc";
import { AssetCache, AssetType, BundleCache, LoadAssetCompleteFunc, USE_SPRITE_BUNDLE_LOAD } from "./ResourcesDefines";
import { CustomAtlas } from "./other_assets/CustomAtlas";
import { CacheManager } from "./CacheManager";
import { ISingleton } from "../ISingleton";

/** 资源管理类，所有在资源都会经由这个类，bundle中的资源，本地png，远程png */
export class ResourceManager implements ISingleton {
    private cacheManager: CacheManager = null

    /** 正在加载的资源列表 */
    private loadingAssets: Map<string, Map<string, Function[]>> = new Map()

    constructor(cacheManager: CacheManager) {
        this.cacheManager = cacheManager
    }

    Init() { }

    Update(deltaTime: number) { }

    Clean() { }

    private loadAnyAsset(url: string, assetType: AssetType = cc.Asset, bundleCache: BundleCache, opt, onComplete?) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this.loadAssetCompleteFunc(error, null, url, assetType)
                return
            }
            let assetCache = AssetCache.Create(url, assetType, bundleCache, [])
            this.cacheManager?.AddAssetCache(asset, assetCache)
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
    private loadCustomAtlas(url: string, bundleCache: BundleCache | null, opt) {
        let index = url.lastIndexOf(".")
        let plistUrl = ""
        if (index >= 0) {
            plistUrl = url.substring(0, index) + ".plist"
        }

        let loads = [
            {
                url: url,
                assetType: cc.SpriteFrame,
                bundleCache: bundleCache
            },
            {
                url: plistUrl,
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
            this.cacheManager?.AddAssetCache(customAtlas, assetCache)
            this.loadAssetCompleteFunc(null, customAtlas, url, CustomAtlas)
        }.bind(this)

        this.LoadAssets(loads, opt, loadCallBack)
    }

    private loadBundleTexture2D(url: string, bundleCache: BundleCache, opt) {
        let loadOnCompleteFunc = function (error: Error, asset: cc.Asset) {
            if (error) {
                this?.loadAssetCompleteFunc(error, null, url, cc.Texture2D)
                return
            }
            let assetCache = AssetCache.Create(url, cc.Texture2D, bundleCache, [])
            this.cacheManager?.AddAssetCache(asset, assetCache)
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
            this.cacheManager?.AddAssetCache(texture, assetCache)
            this?.loadAssetCompleteFunc(error, texture, url, cc.Texture2D)
        }.bind(this)

        let asset = this.cacheManager?.GetAssetCache(cc.ImageAsset, url)
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
            this.cacheManager?.AddAssetCache(asset, assetCache)
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
            this.cacheManager?.AddAssetCache(spriteFrame, assetCache)

            this?.loadAssetCompleteFunc(error, spriteFrame, url, cc.SpriteFrame)
        }.bind(this)

        let asset = this.cacheManager?.GetAssetCache(cc.Texture2D, url)
        if (asset) {
            loadOnCompleteFunc(null, asset)
            return
        }

        this.LoadAsset(url, cc.Texture2D, bundleCache, opt, loadOnCompleteFunc)
    }

    LoadSkeletonData(url: string, opt) {
        let loads = [
            {
                url: url + ".png",
                assetType: cc.Texture2D,
                bundleCache: null,
            },
            {
                url: url + ".json",
                assetType: cc.Asset,
                bundleCache: null,
            },
            {
                url: url + ".atlas",
                assetType: cc.Texture2D,
                bundleCache: null,
            }
        ]

        let loadCallBack = function (error: Error | null, assets: cc.Asset[]) {
            if (error) {
                this.loadAssetCompleteFunc(error, null, url, CustomAtlas)
                return
            }
            let asset = new cc.sp.SkeletonData();
            asset.skeletonJson = assets[1].nativeAsset;
            asset.atlasText = assets[0].nativeAsset;
            asset.textures = [assets[0] as cc.Texture2D];
            asset.textureNames = ['1.png'];
            asset._uuid = url; // 可以传入任意字符串，但不能为空

            let assetCache = AssetCache.Create(url, cc.sp.SkeletonData, null, assets)
            this.cacheManager?.AddAssetCache(asset, assetCache)
            this.loadAssetCompleteFunc(null, asset, url, cc.sp.SkeletonData)
        }.bind(this)

        this.LoadAssets(loads, opt, loadCallBack)
    }

    /** 加载单个资源 */
    LoadAsset(url: string, assetType: AssetType, bundleCache: BundleCache | null, opt, loadCallBack: LoadAssetCompleteFunc) {
        let asset = this.cacheManager?.GetAssetCache(assetType, url)
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
        else if (assetType == cc.sp?.SkeletonData) {
            this.LoadSkeletonData(url, opt)
        }
        else
            this.loadAnyAsset(url, assetType, bundleCache, opt)
    }

    /** 
     * 批量加载资源 
     * 如果有一个资源加载失败，清理全部的资源
     */
    LoadAssets(urlTypes: { bundleCache: BundleCache | null, url: string, assetType: AssetType }[], opt, onComplete: LoadAssetCompleteFunc) {
        let results = {}
        let count = 0
        let lastError: Error | null = null

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