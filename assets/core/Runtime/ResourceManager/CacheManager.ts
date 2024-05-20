import * as cc from "cc";
import { ISingleton, set_manager_instance } from "../ISingleton";
import { ASSET_CACHE_FLAG, AssetCache, AssetType, BundleCache, USE_SPRITE_BUNDLE_LOAD, spriteAtlasPipeLine } from "./ResourcesDefines";


export class AssetMap {
    private assets: Map<string, Map<string, cc.Asset>> = new Map()

    HaveAsset(assetType: string, fName: string): boolean {
        let asset = this.GetAsset(assetType, fName)
        return asset ? true : false
    }

    GetAsset(assetType: string, fName: string): cc.Asset {
        let nameMap = this.assets.get(assetType)
        if (!nameMap) return null

        let asset = nameMap.get(fName)
        if (!asset) return null

        return asset
    }

    DelAsset(assetType: string, fName: string) {
        let nameMap = this.assets.get(assetType)
        if (!nameMap) return

        nameMap.delete(fName)
    }

    AddAsset(assetType: string, fName: string, asset: cc.Asset) {
        let nameMap = this.assets.get(assetType)
        if (!nameMap) {
            nameMap = new Map()
            this.assets.set(assetType, nameMap)
        }

        nameMap.set(fName, asset)
    }

    GetAssetNames(assetType: string) {
        let nameMap = this.assets.get(assetType)
        if (!nameMap) {
            return []
        }
        return Array.from(nameMap.keys())
    }

    GetAssetTypes() {
        return Array.from(this.assets.keys())
    }

    Clear() {
        this.assets.clear()
    }
}

/** 缓存管理类 */
@set_manager_instance()
export class CacheManager extends ISingleton {
    private delayTime = 0
    private observers = new Map()
    private deleteAssets: AssetMap = new AssetMap()
    private usingAssets: AssetMap = new AssetMap()

    Init() {
    }

    Update(deltaTime: number) {
        this.delayTime += deltaTime
        if (this.delayTime < 1) {
            return
        }

        this.updateAssets(this.delayTime)
        this.DelAsset(this.deleteAssets)

        this.delayTime = 0
    }
    Clean() {
    }

    GetAssetData(assetType: AssetType, fName: string): cc.Asset {
        let key = cc.js.getClassName(assetType)

        if (this.usingAssets.HaveAsset(key, fName))
            return this.usingAssets.GetAsset(key, fName)

        if (this.deleteAssets.HaveAsset(key, fName)) {
            let asset = this.deleteAssets.GetAsset(key, fName)
            this.deleteAssets.DelAsset(key, fName)
            this.usingAssets.AddAsset(key, fName, asset)
            return asset
        }

        return null
    }

    AddAsset(assetType: string, fName: string, asset: cc.Asset) {
        this.usingAssets.AddAsset(assetType, fName, asset)
    }

    DelAssetAsset(asset: cc.Asset) {
        if (!asset)
            return

        if (!asset[ASSET_CACHE_FLAG]) {
            return
        }

        let assetCache: AssetCache = asset[ASSET_CACHE_FLAG]

        for (const iterator of assetCache.depends) {
            iterator.decRef()
        }

        asset.decRef()

        // 如果是bundle资源, bundle中的资源 是直接加载,卸载交由assetManager处理
        if (USE_SPRITE_BUNDLE_LOAD && assetCache.bundle) {
            return
        }

        // AppLog.log("资源释放", assetCache.url)
        cc.assetManager.releaseAsset(asset)
    }

    public DelAllAsset(asset: cc.Asset) {
        this.DelAsset(this.usingAssets)
        this.DelAsset(this.deleteAssets)
    }

    /** 释放所有资源 */
    public DelAsset(tab: AssetMap) {
        for (const typeName of tab.GetAssetTypes()) {
            let assets = tab.GetAssetNames(typeName)
            for (const assetName of assets) {
                let asset = tab.GetAsset(typeName, assetName)
                this.DelAssetAsset(asset)
            }
        }
        tab.Clear()
    }


    /**
     * 更新所有资源的状态， 将需要删除的资源放入deleteAssets
     */
    private updateAssets(deltaTime) {
        let assetTypes = this.usingAssets.GetAssetTypes()

        for (const typeName of assetTypes) {
            let assets: string[] = this.usingAssets.GetAssetNames(typeName)
            for (const assetName of assets) {
                let asset = this.usingAssets.GetAsset(typeName, assetName)
                if (asset.refCount <= 1) {
                    let assetCache = asset[ASSET_CACHE_FLAG] as AssetCache
                    if (!assetCache) {
                        console.error("error!!!!!!!!! asset  release : url = " + assetName)
                        this.usingAssets.DelAsset(typeName, assetName)
                    } else {
                        if (assetCache.releaseTime <= 0) {
                            this.usingAssets.DelAsset(typeName, assetName)
                            this.deleteAssets.AddAsset(typeName, assetName, asset)
                        } else {
                            assetCache.releaseTime -= deltaTime
                        }
                    }
                }
            }
        }
    }
}