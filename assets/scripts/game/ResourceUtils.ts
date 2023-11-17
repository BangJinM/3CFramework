// import * as cc from "cc";
// import { ReleaseComponent } from "./ReleaseComponent";
// import resourceManager from "./resource_index";
// import { LoadAssetCompleteFunc } from "./BaseResourcesManager";
// import { StringUtils } from "./StringUtils";

// function IsLocalAsset(path: string) {
//     if (cc.sys.platform != cc.sys.Platform.WIN32)
//         return false

//     if (!cc.native.fileUtils.isFileExist(path))
//         return false

//     return true
// }

// function onComplete(node: cc.Node, error: Error, asset: cc.Asset, callback: LoadAssetCompleteFunc) {
//     if (!node) {
//         callback(error, asset)
//         return
//     }
//     if (error) {
//         callback(error, asset)
//         return
//     }

//     // 如果对象已经不存在直接释放
//     if (!cc.isValid(node)) {
//         resourceManager.releaseManager.ReleaseAsset(asset)
//         return
//     }
//     ReleaseComponent.AddReleaseAsset(node, asset)
//     callback(error, asset)
// }

// export function LoadPrefab(url: string, callback: LoadAssetCompleteFunc) {
//     resourceManager.localResourcesManager.LoadPrefab(url, callback)
// }

// /** ！！！！ 不传Node需要手动释放asset */
// export function InstantiatePrefab(prefab: cc.Prefab): cc.Node {
//     if (!prefab)
//         return null

//     let object = cc.instantiate(prefab)
//     ReleaseComponent.AddReleaseAsset(object, prefab)
//     return object
// }

// /** ！！！！ 不传Node需要手动释放asset */
// export function LoadSpriteFrame(node: cc.Node, name: string, callback: LoadAssetCompleteFunc) {
//     let localPath = StringUtils.SubString(name, "res/")
//     if (IsLocalAsset(localPath + ".png"))
//         return resourceManager.remoteResourcesManager.LoadSpriteFrame(localPath + ".png", (error, asset) => { onComplete(node, error, asset, callback) })
//     if (IsLocalAsset(localPath + ".jpg"))
//         return resourceManager.remoteResourcesManager.LoadSpriteFrame(localPath + ".jpg", (error, asset) => { onComplete(node, error, asset, callback) })

//     let newName = StringUtils.SubString(name, ".png")
//     newName = StringUtils.SubString(newName, ".jpg")

//     let resPath = StringUtils.AddStringToFirst(newName, "res/")
//     resPath = StringUtils.AddStringToEnd(resPath, "/spriteFrame")

//     if (cc.resources.getInfoWithPath(resPath))
//         return resourceManager.localResourcesManager.LoadSpriteFrame(resPath, (error, asset) => { onComplete(node, error, asset, callback) })

//     let remotePath = StringUtils.SubString(name, "res/")
//     remotePath = EnvManager.GetUIURL() + newName
//     if (newName.length == name.length)
//         remotePath = StringUtils.AddStringToEnd(remotePath, ".png")
//     return resourceManager.remoteResourcesManager.LoadSpriteFrame(remotePath, (error, asset) => { onComplete(node, error, asset, callback) })
// }
// /** ！！！！ 不传Node需要手动释放asset */
// export function LoadAudio(node: cc.Node, name: string, callback: LoadAssetCompleteFunc) {
//     let localPath = StringUtils.SubString(name, "res/")
//     if (IsLocalAsset(localPath))
//         return resourceManager.remoteResourcesManager.LoadAudio(localPath, (error, asset) => { onComplete(node, error, asset, callback) })

//     let resPath = StringUtils.SubString(name, ".mp3")
//     if (cc.resources.getInfoWithPath(resPath))
//         return resourceManager.localResourcesManager.LoadAudio(resPath, (error, asset) => { onComplete(node, error, asset, callback) })

//     let remotePath = StringUtils.SubString(name, "res/")
//     remotePath = EnvManager.GetAudioURL() + remotePath
//     return resourceManager.remoteResourcesManager.LoadAudio(remotePath, (error, asset) => { onComplete(node, error, asset, callback) })
// }

// /** ！！！！ 不传Node需要手动释放asset 
//  * 加载UI图集
// */
// export function LoadCustomAtlas(node: cc.Node, name: string, callback: LoadAssetCompleteFunc) {
//     let localPath = StringUtils.SubString(name, "res/")
//     if (IsLocalAsset(localPath + ".plist") && IsLocalAsset(localPath + ".png"))
//         return resourceManager.remoteResourcesManager.LoadCustomAtlas(localPath, (error, asset) => { onComplete(node, error, asset, callback) })

//     if (cc.resources.getInfoWithPath(StringUtils.SubString(name, ".plist")) && cc.resources.getInfoWithPath(StringUtils.SubString(name, ".png")))
//         return resourceManager.localResourcesManager.LoadCustomAtlas(name, (error, asset) => { onComplete(node, error, asset, callback) })

//     let remotePath = StringUtils.SubString(name, "res/")
//     remotePath = EnvManager.GetUIURL() + remotePath
//     return resourceManager.remoteResourcesManager.LoadCustomAtlas(remotePath, (error, asset) => { onComplete(node, error, asset, callback) })
// }