import * as cc from "cc";
import { ISingleton } from "../ISingleton";
import { AssetCache, AssetLoadTask, AssetType, BundleCache, LoadAssetCompleteFunc } from "./ResourcesDefines";
import { CustomAtlas } from "./other_assets/CustomAtlas";

/** 资源管理类，所有在资源都会经由这个类，bundle中的资源，本地png，远程png */
export class ResourceManager implements ISingleton {
    /** 已经加载完成的资源列表 */
    assets: Map<string, AssetCache> = null
    /** 正在加载的资源列表 */
    loadingAssets: Map<string, AssetLoadTask> = null

    Init() {
        this.assets = new Map()
        this.loadingAssets = new Map()
    }
    Update(deltaTime: number) {
        for (const assetCache of this.assets.values()) {
            if (assetCache.GetRef() <= 0) {
                this.DeleteAsset(assetCache)
            }
        }
    }
    Clean() {
        this.DeleteAllAsset()
        this.assets = null
        this.loadingAssets = null
    }

    private loadAsset(url: string, assetType: AssetType, bundleCache: BundleCache, loadCallBack: LoadAssetCompleteFunc) {
        if (this.assets.has(url)) {
            let assetCache = this.assets.get(url)
            assetCache.AddRef()
            loadCallBack(null, assetCache)
            return
        }
        if (!this.loadingAssets.has(url)) {
            this.loadingAssets.set(url, new AssetLoadTask)
        }
        let loadingAsset = this.loadingAssets.get(url)
        loadingAsset.completeFuncs.push(loadCallBack)
        this.loadingAssets.set(url, loadingAsset)

        let getAssetCache = function (error: Error, asset: cc.Asset) {
            let assetCache = null
            if (!error) {
                assetCache = new AssetCache()
                assetCache.data = asset
                assetCache.url = url
                assetCache.type = assetType
                assetCache.AddRef()
                
                asset.addRef()

                if (bundleCache) {
                    bundleCache.AddRef()
                    assetCache.bundle = bundleCache
                }

                this?.assets?.set(assetCache.url, assetCache)
            }
            return assetCache
        }.bind(this)

        if (bundleCache) {
            bundleCache.bundle.load(url, function (error: Error, asset: cc.Asset) {
                let assetCache = getAssetCache(error, asset)
                this?.loadAssetCompleteFunc(url, error, assetCache)
            }.bind(this))
        }
        else {
            cc.assetManager.loadRemote(url, function (error, asset) {
                let assetCache = getAssetCache(error, asset)
                this?.loadAssetCompleteFunc(url, error, assetCache)
            }.bind(this))
        }
    }

    private loadAssetCompleteFunc(url: string, error: Error, asset: AssetCache) {
        let loadingAsset = this.loadingAssets.get(url)
        if (!loadingAsset)
            return

        for (const iterator of loadingAsset.completeFuncs) {
            iterator(error, asset)
        }

        this.loadingAssets.delete(url)
    }

    /** 引用次数减1 */
    public ReleaseAsset(asset: AssetCache, immediately?: boolean) {
        if (!asset["__ReleaseManager__url__"])
            return

        asset.DecRef()
        if (immediately) {
            this.DeleteAsset(asset)
        }
    }

    /** 释放所有资源 */
    public ReleaseAllAsset() {
        for (const iterator of this.assets.values()) {
            this.ReleaseAsset(iterator)
        }
    }

    /** 释放所有资源 */
    public DeleteAllAsset() {
        for (const iterator of this.assets.values()) {
            this.DeleteAsset(iterator)
        }
    }
    /** 释放资源 */
    public DeleteAsset(asset: AssetCache) {
        cc.assetManager.releaseAsset(asset.data)
        if (asset.bundle) {
            asset.bundle.DecRef()
        }
        this.assets.delete(asset.url)
    }

    /** 加载自定义图集 */
    private loadCustomAtlas(url: string, bundleCache: BundleCache, onComplete: LoadAssetCompleteFunc) {
        let jsonLoadError = null, jsonAssetCache = null
        let sfLoadError = null, sfAssetCache = null
        let loadCallBack = function (error: Error | null, asset: cc.Asset) {
            let customAtlas = null
            if (jsonAssetCache && sfAssetCache) {
                customAtlas = CustomAtlas.createWithSpritePlist(sfAssetCache, jsonAssetCache)
            }

            if ((sfLoadError || sfAssetCache) && (jsonLoadError || jsonAssetCache)) {
                if (jsonAssetCache)
                    jsonAssetCache.DecRef()

                if (sfAssetCache)
                    sfAssetCache.DecRef()

                if (customAtlas) {
                    this.loadAssetCompleteFunc(url, null, customAtlas)
                    return
                }

                if (sfLoadError) {
                    this.loadAssetCompleteFunc(url, sfLoadError, null)
                    return
                }

                if (jsonLoadError) {
                    this.loadAssetCompleteFunc(url, jsonLoadError, null)
                    return
                }
            }
        }.bind(this)

        this.loadAsset(url + ".png", cc.ImageAsset, bundleCache, (error: Error, asset: AssetCache) => {
            sfLoadError = error
            sfAssetCache = asset

            loadCallBack()
        })
        this.loadAsset(url + ".plist", null, bundleCache, (error: Error, asset: AssetCache) => {
            jsonLoadError = error
            jsonAssetCache = asset

            loadCallBack()
        })
    }

    LoadAsset(url: string, assetType: AssetType, bundleCache: BundleCache, loadCallBack: LoadAssetCompleteFunc) {
        if (assetType == CustomAtlas)
            this.loadCustomAtlas(url, bundleCache, loadCallBack)
        else
            this.loadAsset(url, assetType, bundleCache, loadCallBack)

    }
}