import * as cc from "cc";
import { Global } from "./Global";
import { AssetType, GetPipeline, asyncify } from "core";

/** 缓存资源 */
function LoadCacheAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { fName, type } = task.input
    let { needCache } = task.options

    if (!needCache) return [false, null]

    let asset = Global.CacheManager.GetAssetData(type, fName);
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
    let { fName, type } = task.input
    let { needCache } = task.options

    if (cc.sys.platform == cc.sys.Platform.WIN32) {
        if (cc.native.fileUtils.isFileExist(fName)) {
            console.log("windows" + fName + " isFileExist")
            return [true, new Promise((success, fail) => {

            })]
        }
    }
    return [false, null]
}


/** 判断resources包  */
function LoadBundleAsset(task: cc.AssetManager.Task): [boolean, Promise<any>] {
    let { fName, type } = task.input
    let { needCache } = task.options
    let assetInfo = cc.resources.getInfoWithPath(fName, type)
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
    let { fName, type } = task.input
    let { needCache } = task.options
    return [true, new Promise((success) => {

    })]
}

export function LoadAssetByName(fName: string, type: AssetType, needCache: boolean = true) {
    let task = GetTask(fName, type, needCache)
}

export function LoadAssetByTask(task: cc.AssetManager.Task) {
    // 缓存加载
    let [cache, cachePromise] = LoadCacheAsset(task)
    if (cache) return cachePromise

    // 本地加载
    let [local, localPromise] = LoadLocalAsset(task)
    if (local) return localPromise

    // bundle加载
    let [bundle, bundlePromise] = LoadBundleAsset(task)
    if (bundle) return bundlePromise

    // 网络加载
    let [remote, remotePromise] = LoadRemoteAsset(task)
    if (remote) return remotePromise
}

export function LoadSpriteFrame(fName: string, type: AssetType) {

}


function GetTask(fName: string, type: AssetType, options): cc.AssetManager.Task {
    return cc.AssetManager.Task.create({
        input: {
            url: fName,
            type: type,
        },
        options: options
    })
}