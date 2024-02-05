import * as cc from "cc";
import { ASSET_CACHE_FLAG, AssetCache, AssetType, DELAY_RELEASE_ASSET, USE_SPRITE_BUNDLE_LOAD } from "./ResourcesDefines";
import { CustomAtlas } from "./other_assets/CustomAtlas";
import { ISingleton } from "../ISingleton";

/** 缓存管理类 */
export class CacheManager implements ISingleton {
    /** 正在使用的资源 */
    private usedAssets = {}
    /** 正在删除的列表 */
    private deleteAssets = {}
    /** 一帧最大删除数量 */
    private MAX_DELETE_COUNT = 20
    /** 当前帧正在删除的列表 */
    private deleteArray = []
    /** 资源最大驻留时间 */
    private releaseTimeMap: Map<string, number> = new Map()

    constructor() {
        this.releaseTimeMap.set(cc.js.getClassName(CustomAtlas), 90)
        this.releaseTimeMap.set(cc.js.getClassName(cc.AudioClip), 120)
        this.releaseTimeMap.set(cc.js.getClassName(cc.Prefab), 90)
        this.releaseTimeMap.set(cc.js.getClassName(cc.SpriteFrame), 90)
    }

    Init() {
    }
    /**
     * 更新所有资源的状态， 将需要删除的资源放入deleteAssets
     */
    private updateAssets(deltaTime) {
        for (const assetTypeName in this.usedAssets) {
            let assets: Map<string, cc.Asset> = this.usedAssets[assetTypeName]
            for (const key of assets.keys()) {
                let asset = assets.get(key)
                if (asset.refCount <= 1) {
                    let assetCache = asset[ASSET_CACHE_FLAG] as AssetCache
                    if (!assetCache) {
                        console.error("error!!!!!!!!! asset  release : url = " + key)
                        this.usedAssets[assetTypeName].delete(key)
                    } else {
                        if (assetCache.releaseTime <= 0) {
                            if (!this.deleteAssets[assetTypeName])
                                this.deleteAssets[assetTypeName] = new Map()
                            this.deleteAssets[assetTypeName].set(key, asset)

                            this.usedAssets[assetTypeName].delete(key)
                        } else {
                            assetCache.releaseTime -= deltaTime
                        }
                    }
                }
            }
        }
    }
    /**
     * 更新需要删除的列表，将deleteAssets中的资源塞入deleteArray
     */
    private updateDeleteArray(deltaTime) {
        this.deleteArray.length = 0
        for (const assetTypeName in this.deleteAssets) {
            let assets: Map<string, cc.Asset> = this.deleteAssets[assetTypeName]
            for (const key of assets.keys()) {
                let asset = assets.get(key)

                this.deleteArray.push(asset)
                this.deleteAssets[assetTypeName].delete(key)

                if (this.deleteArray.length >= this.MAX_DELETE_COUNT)
                    return
            }
        }
    }

    private updateExcuteDeleteAsset(deltaTime) {
        for (const deleteAsset of this.deleteArray) {
            this.DelAssetAsset(deleteAsset)
        }
        this.deleteArray.length = 0
    }

    Update(deltaTime: number) {
        this.updateAssets(deltaTime)
        this.updateDeleteArray(deltaTime)
        this.updateExcuteDeleteAsset(deltaTime)
    }
    Clean() {
        this.DeleteAllAsset()
    }

    AddAssetCache(asset: cc.Asset, assetCache: AssetCache) {
        let key = cc.js.getClassName(assetCache.type)
        if (!this.usedAssets[key]) {
            this.usedAssets[key] = new Map()
        }

        let assetMap: Map<string, cc.Asset> = this.usedAssets[key]
        if (assetMap.has(assetCache.url)) {
            return
        }

        asset.addRef()
        assetMap.set(assetCache.url, asset)
        Object.defineProperty(asset, ASSET_CACHE_FLAG, { value: assetCache, configurable: true, writable: true, enumerable: true });
        this.updateAssetReleaseTime(asset)
    }

    public GetDeleteAssetCache(assetTypeName: string, url: string) {
        let assetMap: Map<string, cc.Asset> = this.deleteAssets[assetTypeName]
        if (!assetMap) {
            return null
        }
        if (!assetMap.has(url)) {
            return null
        }
        let asset = assetMap.get(url)
        this.deleteAssets[assetTypeName].delete(url)
        this.usedAssets[assetTypeName].set(url, asset)
        return asset
    }

    public GetUsedAssetCache(assetTypeName: string, url: string): cc.Asset {
        let assetMap: Map<string, cc.Asset> = this.usedAssets[assetTypeName]
        if (!assetMap) {
            return null
        }
        if (!assetMap.has(url)) {
            return null
        }
        return assetMap.get(url)
    }

    public GetAssetCache(assetType: AssetType, url: string): cc.Asset {
        let key = cc.js.getClassName(assetType)
        let asset = this.GetUsedAssetCache(key, url) || this.GetDeleteAssetCache(key, url)
        if (asset && asset.refCount <= 1) {
            this.updateAssetReleaseTime(asset)
        }
        return asset
    }

    DelAssetAsset(asset) {
        if (!asset)
            return

        if (!asset[ASSET_CACHE_FLAG]) {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!error!!! asset release error!")
            return
        }

        let assetCache: AssetCache = asset[ASSET_CACHE_FLAG]

        for (const iterator of assetCache.depends) {
            iterator.decRef()
        }

        asset.decRef()

        // 如果是bundle资源, bundle中的spriteframe和texture 是直接加载,卸载交由assetManager处理
        if (USE_SPRITE_BUNDLE_LOAD && assetCache.bundle) {
            if (asset instanceof cc.SpriteFrame) {
                return
            }
            else if (asset instanceof cc.Texture2D) {
                return
            }
        }
        cc.assetManager.releaseAsset(asset)
    }

    /** 释放所有资源 */
    public DeleteAllAsset() {
        for (const assetTypeName in this.usedAssets) {
            let assetMap: Map<string, AssetCache> = this.usedAssets[assetTypeName]
            for (const assetCache of assetMap.values()) {
                this.DelAssetAsset(assetCache)
            }
        }
        this.usedAssets = {}
    }

    /** 更新时间
     * 默认卸载时间未90秒
     * 特殊类型走releaseTimeMap
     * 只处理顶层资源
     */
    private updateAssetReleaseTime(asset: cc.Asset) {
        if (!DELAY_RELEASE_ASSET)
            return
        let assetCache = asset[ASSET_CACHE_FLAG] as AssetCache
        if (!assetCache)
            return
        let key = cc.js.getClassName(assetCache.type)
        let releaseTime = 0//this.releaseTimeMap.get(key) || 90
        assetCache.releaseTime = releaseTime

        for (const dependAsset of assetCache.depends) {
            let dependAssetCache = dependAsset[ASSET_CACHE_FLAG] as AssetCache
            if (dependAssetCache) {
                dependAssetCache.releaseTime = 0
            }
        }
    }
}