import { Asset, assetManager } from "cc";

class ReleaseManager {
    private loadedAssets: Map<string, Asset> = new Map()

    public GetAsset(url: string) {
        if (this.loadedAssets.has(url))
            return this.loadedAssets[url]

        return null
    }

    public AddAsset(url: string, asset: Asset) {
        if (this.loadedAssets.has(url))
            return

        this.loadedAssets.set(url, asset)
        this.loadedAssets.get(url)["__ReleaseManager__url__"] = url
    }
    public ReleaseAssetWithURL(url: string) {
        let asset = this.loadedAssets.get(url)
        if (!asset)
            return
        this.ReleaseAsset(asset)
    }
    public ReleaseAsset(asset: Asset) {
        if (!asset["__ReleaseManager__url__"])
            return

        assetManager.releaseAsset(asset)
        this.loadedAssets.delete(asset["__ReleaseManager__url__"])
    }
    public ReleaseAll() {
        for (const iterator of this.loadedAssets.values()) {
            this.ReleaseAsset(iterator)
        }
    }

    public Tick() {
        for (const iterator of this.loadedAssets.values()) {
            if (iterator.refCount <= 0)
                this.ReleaseAsset(iterator)
        }
    }
}

export default new ReleaseManager();