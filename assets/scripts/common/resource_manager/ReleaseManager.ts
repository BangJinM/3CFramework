import { Asset, assetManager } from "cc";

class ReleaseManager {
    private loadedAssets: Map<string, Asset> = new Map()

    public GetAsset(url: string) {
        if (this.loadedAssets.has(url))
            return this.loadedAssets.get(url)

        return null
    }
    /**
     * IsReleaseAsset
     */
    public IsReleaseAsset(asset) {
        if (!asset["__ReleaseManager__url__"])
            return false

        if (!this.loadedAssets.get(asset["__ReleaseManager__url__"]))
            return false

        return true
    }
    /** 引用次数 + 1 */
    public AddAsset(url: string, asset: Asset) {
        asset.addRef()
        if (this.loadedAssets.has(url))
            return

        asset.addRef()
        this.loadedAssets.set(url, asset)
        this.loadedAssets.get(url)["__ReleaseManager__url__"] = url
    }
    /** 引用次数减1 */
    public ReleaseAssetWithURL(url: string, autoRelease?: boolean) {
        let asset = this.loadedAssets.get(url)
        if (!asset)
            return
        this.ReleaseAsset(asset, autoRelease)
    }
    /** 引用次数减1 */
    public ReleaseAsset(asset: Asset, autoRelease?: boolean) {
        if (!asset["__ReleaseManager__url__"])
            return

        asset.decRef()
        if (autoRelease) {
            this.DeleteAsset(asset)
        }
    }
    /** 释放所有资源 */
    public DeleteAllAsset() {
        for (const iterator of this.loadedAssets.values()) {
            this.DeleteAsset(iterator)
        }
    }
    /** 释放资源 */
    public DeleteAsset(asset) {
        asset.decRef()
        assetManager.releaseAsset(asset)
        this.loadedAssets.delete(asset["__ReleaseManager__url__"])
    }

    public Tick() {
        for (const iterator of this.loadedAssets.values()) {
            if (iterator.refCount <= 1) {
                this.DeleteAsset(iterator)
            }
        }
    }
}

export default new ReleaseManager();