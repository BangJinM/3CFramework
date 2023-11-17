import * as cc from "cc";
import { ISingleton } from "../ISingleton";
import { BundleCache, BundleLoadTask, LoadBundleCompleteFunc } from "./ResourcesDefines";
export class BundleManager implements ISingleton {
    bundles: Map<string, BundleCache> = null
    loadingBundles: Map<string, BundleLoadTask> = null

    Init() {
        this.bundles = new Map()
        this.loadingBundles = new Map()
    }
    Update(deltaTime: number) {
    }
    Clean() {
        for (const bundle of this.bundles.values()) {

        }
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
            this?.LoadBundleComplete(url, error, getBundle(error, bundle))
        }.bind(this))
    }

    LoadBundleComplete(url: string, error: Error, bundle: BundleCache) {
        let loadingBundle = this.loadingBundles.get(url)
        if (!loadingBundle)
            return

        for (const iterator of loadingBundle.loadBundleCompleteFunc) {
            iterator(error, bundle)
        }

        this.loadingBundles.delete(url)
    }
}