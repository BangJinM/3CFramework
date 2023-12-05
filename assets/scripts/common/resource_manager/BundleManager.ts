import * as cc from "cc";
import { BundleCache, BundleLoadTask, LoadBundleCompleteFunc } from "./ResourcesDefines";
export class BundleManager {
    private bundles: Map<string, BundleCache> = new Map()
    private loadingBundles: Map<string, BundleLoadTask> = new Map()

    Init() {
    }

    Update(deltaTime: number) {
    }
    Clean() {
        for (const bundle of this.bundles.values()) {
            if (bundle.GetRef() <= 0) {
                bundle.bundle.releaseAll()
            }
        }
        this.loadingBundles.clear()
        this.bundles.clear()
    }
    AddBundle(bundleName: string, bundleCache) {
        this.bundles.set(bundleName, bundleCache)
    }

    GetBundle(bundleName: string) {
        return this.bundles.get(bundleName)
    }

    LoadBundle(url: string, loadCallBack: LoadBundleCompleteFunc) {
        if (!this.loadingBundles.has(url)) {
            this.loadingBundles.set(url, new BundleLoadTask)
        }
        let loadingBundle = this.loadingBundles.get(url)
        loadingBundle.loadBundleCompleteFunc.push(loadCallBack)

        this.loadingBundles.set(url, loadingBundle)

        let getBundle = function (error: Error, bundle: cc.AssetManager.Bundle) {
            let bundleCache = null
            if (!error) {
                bundleCache = new BundleCache()
                bundleCache.AddRef()
                bundleCache.url = url
                bundleCache.bundle = bundle

                this?.bundles?.set(bundleCache.url, bundleCache)
            }
            return bundleCache
        }.bind(this)

        cc.assetManager.loadBundle(url, {}, function (error, bundle) {
            this?.loadBundleComplete(url, error, getBundle(error, bundle))
        }.bind(this))
    }

    private loadBundleComplete(url: string, error: Error, bundle: BundleCache) {
        let loadingBundle = this.loadingBundles.get(url)
        if (!loadingBundle)
            return

        for (const iterator of loadingBundle.loadBundleCompleteFunc) {
            iterator(error, bundle)
        }

        this.loadingBundles.delete(url)
    }
}