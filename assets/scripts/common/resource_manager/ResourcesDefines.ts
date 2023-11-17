import * as cc from "cc";

export type AssetType = cc.Constructor<cc.Asset>
export type LoadAssetCompleteFunc = (error: Error | null, asset: AssetCache) => void;
export type LoadBundleCompleteFunc = (error: Error | null, asset: BundleCache) => void;

export class AssetLoadTask {
    completeFuncs: LoadAssetCompleteFunc[] = []
}

export class BundleLoadTask {
    loadBundleCompleteFunc: LoadBundleCompleteFunc[] = []
}

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
    url: string
    type: AssetType
    data: cc.Asset
    loadAssetCompleteFunc: LoadAssetCompleteFunc
    bundle: BundleCache
}

export class BundleCache extends CacheRef {
    url: string
    bundle: cc.AssetManager.Bundle
}