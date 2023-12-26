import * as cc from "cc";
import { AssetCache, AssetType, USE_SPRITE_BUNDLE_LOAD } from "./ResourcesDefines";
// import AppLog from "../util/AppLog";

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
        this.DeleteAllAsset()
        this.assetCaches = {}
    }

    AddAssetCache(asset: cc.Asset, assetCache: AssetCache) {
        let key = cc.js.getClassName(assetCache.type)
        if (!this.assetCaches[key]) {
            this.assetCaches[key] = new Map()
        }

        let assetCacheMap: Map<string, cc.Asset> = this.assetCaches[key]
        if (assetCacheMap.has(assetCache.url)) {
            return
        }

        // AppLog.log("add asset cache", assetCache.url)

        asset.addRef()
        assetCacheMap.set(assetCache.url, asset)
        Object.defineProperty(asset, "__asset_cache__", { value: assetCache, configurable: true, writable: true, enumerable: true });
    }

    GetAssetCache(assetType: AssetType, url: string): cc.Asset {
        let key = cc.js.getClassName(assetType)
        let assetCacheMap: Map<string, cc.Asset> = this.assetCaches[key]
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

        let key = cc.js.getClassName(assetCache.type)
        if (this.assetCaches[key].has(assetCache.url)) {
            this.assetCaches[key].delete(assetCache.url)
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

        // AppLog.log("资源释放", assetCache.url)
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