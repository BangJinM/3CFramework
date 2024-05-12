import * as cc from "cc";
import { AssetType, BundleCache, GetPipeline, asyncify } from "core";
import { Global } from "./Global";

function GetTask(fName: string, type: AssetType, options): cc.AssetManager.Task {
    return cc.AssetManager.Task.create({
        input: {
            url: fName,
            type: type,
        },
        options: options
    })
}

/** 缓存资源 */
function LoadCacheAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { url, type } = task.input
    let { needCache } = task.options

    if (!needCache) return [false, null]

    let asset = Global.CacheManager.GetAssetData(type, url);
    if (!asset) return [false, null]
    let promise = new Promise(function (success) {
        success(asset)
    })
    return [true, promise]
}

/**
  * 判断电脑磁盘是否拥有该资源
  * @param path 资源路径
  * @param type 资源类型
  * @returns 
  */
function LoadLocalAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { url, type } = task.input
    let { needCache } = task.options

    if (cc.sys.platform == cc.sys.Platform.WIN32) {
        if (cc.native.fileUtils.isFileExist(url)) {
            console.log("windows" + url + " isFileExist")
            return [true, new Promise((success, fail) => {

            })]
        }
    }
    return [false, null]
}


/** 判断resources包  */
function LoadBundleAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { url, type } = task.input
    let { bundle } = task.options

    if (!bundle) return [false, null]

    let assetInfo = bundle.bundle.getInfoWithPath(url, type)
    if (assetInfo) {
        return [true, new Promise((success) => {
            task.onComplete = asyncify(function (error, asset) {
                success(asset)
            })
            let pipeline = GetPipeline(type)
            pipeline.async(task)
        })]
    }
    return [false, null]
}

/** 远程  */
function LoadRemoteAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { url, type } = task.input
    let { needCache } = task.options
    return [true, new Promise((success) => {

    })]
}

export function LoadAssetByName(fName: string, type: AssetType, bundle: BundleCache = null, needCache: boolean = true) {
    let task = GetTask(fName, type, { bundle: bundle })
    return LoadAssetByTask(task)
}

export function LoadAssetByTask(task: cc.AssetManager.Task) {
    // 缓存加载
    let [cache, cachePromise] = LoadCacheAsset(task)
    if (cache) return cachePromise

    // bundle加载
    let [bundle, bundlePromise] = LoadBundleAsset(task)
    if (bundle) return bundlePromise

    // 本地加载
    let [local, localPromise] = LoadLocalAsset(task)
    if (local) return localPromise

    // 网络加载
    let [remote, remotePromise] = LoadRemoteAsset(task)
    if (remote) return remotePromise
}

export function LoadSpriteFrame(fName: string, type: AssetType) {

}
