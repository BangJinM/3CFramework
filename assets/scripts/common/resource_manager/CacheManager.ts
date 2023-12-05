import * as cc from "cc";
import { AssetCache, AssetType } from "./ResourcesDefines";

/** 缓存管理类 */
export class CacheManager {
    /** 资源 */
    private assetCaches = {}

    Init() {
    }

    Update(deltaTime: number) {
        let deleteArray = []
        for (const assetType in this.assetCaches) {
            let assetCacheMap: Map<string, cc.Asset> = this.assetCaches[assetType]

            for (const assetCache of assetCacheMap.values()) {
                if (assetCache.refCount <= 1) {
                    deleteArray.push(assetCache)
                }
            }
        }

        for (const iterator of deleteArray) {
            this.DelAssetAsset(iterator)
        }
    }
    Clean() {
        this.assetCaches = {}
    }

    AddAssetCache(asset: cc.Asset, assetCache: AssetCache) {
        if (!this.assetCaches[assetCache.type.name]) {
            this.assetCaches[assetCache.type.name] = new Map()
        }

        let assetCacheMap: Map<string, cc.Asset> = this.assetCaches[assetCache.type.name]
        if (assetCacheMap.has(assetCache.url)) {
            return
        }

        asset.addRef()
        assetCacheMap.set(assetCache.url, asset)
        Object.defineProperty(asset, "__asset_cache__", { value: assetCache, configurable: true, writable: true, enumerable: true });
    }

    GetAssetCache(assetType: AssetType, url: string): cc.Asset {
        let assetCacheMap: Map<string, cc.Asset> = this.assetCaches[assetType.name]
        if (!assetCacheMap) {
            return null
        }
        if (!assetCacheMap.has(url)) {
            return null
        }

        return assetCacheMap.get(url)
    }

    DelAssetAsset(asset) {
        if (!asset)
            return

        if (!asset["__asset_cache__"])
            return

        let assetCache: AssetCache = asset["__asset_cache__"]

        for (const iterator of assetCache.depends) {
            iterator.decRef()
        }

        if (this.assetCaches[assetCache.type.name].has(assetCache.url)) {
            this.assetCaches[assetCache.type.name].delete(assetCache.url)
        }

        asset.decRef()
        cc.assetManager.releaseAsset(asset)
    }

    /** 释放所有资源 */
    public DeleteAllAsset() {
        for (const assetType in this.assetCaches) {
            let assetCacheMap: Map<string, AssetCache> = this.assetCaches[assetType]
            for (const assetCache of assetCacheMap.values()) {
                this.DelAssetAsset(assetCache)
            }
        }
    }
}