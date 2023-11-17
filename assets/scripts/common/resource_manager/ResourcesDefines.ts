import * as cc from "cc";

export type AssetType = cc.Constructor<cc.Asset>
export type LoadAssetCompleteFunc = (error: Error | null, asset: AssetCache) => void;
export type LoadBundleCompleteFunc = (error: Error | null, asset: BundleCache) => void;

/** 资源下载任务 */
export class AssetLoadTask {
    completeFuncs: LoadAssetCompleteFunc[] = []
}
/** bundle 下载任务 */
export class BundleLoadTask {
    loadBundleCompleteFunc: LoadBundleCompleteFunc[] = []
}
/** 缓存引用 */
export class CacheRef {
    refCount = 0

    AddRef() {
        this.refCount++
    }

    DecRef() {
        this.refCount--
    }

    GetRef() { return this.refCount }
}

export class AssetCache extends CacheRef {
    /** 路径 */
    url: string
    /** 资源类型 */
    type: AssetType
    /** 资源 */
    data: cc.Asset
    /** bundle缓存 */
    bundle: BundleCache
}

export class BundleCache extends CacheRef {
    /** 路径或者名字 */
    url: string
    /** bundle */
    bundle: cc.AssetManager.Bundle
}