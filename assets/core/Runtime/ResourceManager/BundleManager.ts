import * as cc from "cc";
import { ISingleton, set_manager_instance } from "../ISingleton";
import { ASSET_CACHE_FLAG, AssetCache, AssetType, BundleCache, USE_SPRITE_BUNDLE_LOAD, spriteAtlasPipeLine } from "./ResourcesDefines";
import { Logger } from "../Logger";


/** 缓存管理类 */
@set_manager_instance()
export class BundleManager extends ISingleton {
    bundleMap: Map<string, BundleCache> = new Map()

    Init() {
    }

    GetBundle(fName: string): BundleCache {
        return this.bundleMap.get(fName)
    }

    AddBundleCache(fName: string, bundleCache: BundleCache) {
        if (this.bundleMap.has(fName)) {
            Logger.error("重复设置Bundle！！！！")
            return
        }

        this.bundleMap.set(fName, bundleCache)
    }

    AddBundle(fName: string, bundle: cc.AssetManager.Bundle) {
        let bundleCache = new BundleCache()
        bundleCache.url = fName
        bundleCache.bundle = bundle

        this.AddBundleCache(fName, bundleCache)
    }
}