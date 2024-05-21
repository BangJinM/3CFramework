import * as cc from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";
import { AssetRefComponent } from "./AssetRefComponent";

export type AssetType = cc.Constructor<cc.Asset>
/** 使用bundle.load直接加载spriteFrame */
export let USE_SPRITE_BUNDLE_LOAD = true
/** 延迟卸载资源 */
export let DELAY_RELEASE_ASSET = true
export let ASSET_CACHE_FLAG = "user_data_asset_cache_flag__"
export let OBSERVER_XX_PROPERTY_FLAG = "user_data_observer_xx_property_flag__"

/** 设置需要监听的get 和set */
function ObserverPropertySetter<T extends cc.Component>(target: T, propertyKey: string, beforeSetterFunc?: Function, afterSetterFunc?: Function) {
    let descriptor = Object.getOwnPropertyDescriptor(target.constructor.prototype, propertyKey)

    if (!descriptor)
        return

    const oldSet = descriptor.set
    const oldGet = descriptor.get

    Object.defineProperty(target, propertyKey, {
        get: oldGet,
        set: function (value: any | null) {
            let oldValue = oldGet?.call(this)
            if (oldValue === value)
                return

            let refComp: AssetRefComponent | null = null
            refComp = this.node.getComponent(AssetRefComponent)
            if (refComp) {
                refComp.DelAsset(oldValue)
            }

            oldSet?.call(this, value)

            if (value && value[ASSET_CACHE_FLAG]) {
                if (!refComp)
                    refComp = this.node.addComponent(AssetRefComponent)
                refComp?.AddAsset(value)
            }
        },
        enumerable: true,
        configurable: true
    });
}

/**
 * 增加Sprite资源监听
 * @description 为什么要用这种方式 
 * @description 第一个方案是CustomSprite继承Sprite x
 * @description 第二个方案是运行时注入Sprite的Setter和OnDestroy x
 * @description 第三个方案是全程交给业务层管理使用SpriteFrameRefComponent √
 * @description 在一个方案中缺陷是 在Button中，得先移除老的Sprite再新增CustomSprite，会移除Sprite失败，CustomSprite和Sprite同时存在
 * @param sprite 
 * @returns 
 */
export function ObserverSpriteProperty(sprite: cc.Sprite) {
    if (!sprite)
        return

    if (!cc.isValid(sprite.node))
        return

    if (sprite[OBSERVER_XX_PROPERTY_FLAG])
        return

    sprite[OBSERVER_XX_PROPERTY_FLAG] = true

    ObserverPropertySetter<cc.Sprite>(sprite, "spriteFrame")
    ObserverPropertySetter<cc.Sprite>(sprite, "spriteAtlas")
}

/** 增加Button资源监听 */
export function ObserverButtonProperty(button: cc.Button) {
    if (!button)
        return

    if (button[OBSERVER_XX_PROPERTY_FLAG])
        return

    button[OBSERVER_XX_PROPERTY_FLAG] = true

    ObserverPropertySetter<cc.Button>(button, "normalSprite")
    ObserverPropertySetter<cc.Button>(button, "pressedSprite")
    ObserverPropertySetter<cc.Button>(button, "hoverSprite")
    ObserverPropertySetter<cc.Button>(button, "disabledSprite")
}

/** 增加Label资源监听 */
export function ObserverLabelProperty(label: cc.Label) {
    if (!label)
        return

    if (label[OBSERVER_XX_PROPERTY_FLAG])
        return

    label[OBSERVER_XX_PROPERTY_FLAG] = true

    ObserverPropertySetter<cc.Label>(label, "font")
    ObserverPropertySetter<cc.Label>(label, "fontAtlas")
    ObserverPropertySetter<cc.Label>(label, "fontEx")
}

/** 增加AudioSource资源监听 */
export function ObserverAudioSourceProperty(audioSource: cc.AudioSource) {
    if (!audioSource)
        return

    if (audioSource[OBSERVER_XX_PROPERTY_FLAG])
        return

    audioSource[OBSERVER_XX_PROPERTY_FLAG] = true
    ObserverPropertySetter<cc.AudioSource>(audioSource, "clip")
}

/** 增加Tmx资源监听 */
export function ObserverTiledMapProperty(tiledMap: cc.TiledMap) {
    if (!tiledMap)
        return

    if (!cc.isValid(tiledMap.node))
        return

    if (tiledMap[OBSERVER_XX_PROPERTY_FLAG])
        return

    tiledMap[OBSERVER_XX_PROPERTY_FLAG] = true

    ObserverPropertySetter<cc.TiledMap>(tiledMap, "tmxAsset")
}

export function asyncify(cb: ((p1?: any, p2?: any) => void) | null): (p1?: any, p2?: any) => void {
    return (p1, p2): void => {
        if (!cb) { return; }
        const refs: cc.Asset[] = [];
        if (Array.isArray(p2)) {
            p2.forEach((x): number | boolean => x instanceof cc.Asset && refs.push(x.addRef()));
        } else if (p2 instanceof cc.Asset) {
            refs.push(p2.addRef());
        }
        cc.misc.callInNextTick((): void => {
            refs.forEach((x): cc.Asset => x.decRef(false));
            cb(p1, p2);
        });
    };
}

type ForEachFunction = (index: number, done: ((err?: Error | null) => void)) => void;
export function forEach<T = any>(array: T[], process: ForEachFunction, onComplete: (errs: Error[]) => void): void {
    let count = 0;
    const errs: Error[] = [];
    const length = array.length;
    if (length === 0 && onComplete) {
        onComplete(errs);
    }
    const cb = (err): void => {
        if (err) {
            errs.push(err);
        }
        count++;
        if (count === length) {
            if (onComplete) {
                onComplete(errs);
            }
        }
    };
    for (let i = 0; i < length; i++) {
        process(i, cb);
    }
}

@cc._decorator.ccclass("BundleCache")
export class BundleCache {
    /** 路径或者名字 */
    @cc._decorator.property(String)
    url: string = ""
    /** bundle */
    @cc._decorator.property(cc.AssetManager.Bundle)
    bundle: cc.AssetManager.Bundle | null = null
    @cc._decorator.property(Number)
    refCount = 0

    AddRef() { this.refCount++ }
    DecRef() { this.refCount-- }
}

export class AssetCache {
    /** 路径 */
    url: string | null = null
    /** 资源类型 */
    type: AssetType | null = null
    /** bundle缓存 */
    bundle: BundleCache | null = null
    /** 依赖的资源 */
    depends: cc.Asset[] = []
    /** 这个资源未使用时，可用，releaseTime<= 0卸载资源 */
    releaseTime = 0

    static Create(url: string, type: AssetType, bundle: BundleCache | null, depends: cc.Asset[]) {
        let asset = new AssetCache()
        asset.url = url
        asset.type = type
        asset.bundle = bundle
        asset.depends = depends

        for (const iterator of depends) {
            iterator.addRef()
        }

        asset.bundle?.AddRef()
        return asset
    }

    Destroy() {
        for (const asset of this.depends) {
            asset.decRef()
        }
        if (this.bundle) {
            this.bundle.DecRef()
        }
    }
}

export const normalPipeline = new cc.AssetManager.Pipeline('normal load pipeline', [function (task: cc.AssetManager.Task, done) {
    let { url, type } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    let onComplete = (err, result) => {
        if (result) {
            let assetCache = AssetCache.Create(url, type, bundle, [])
            cacheManager?.AddAssetCache(result, assetCache)
        }
        task.output = result;
        done(err)
    }

    if (EDITOR_NOT_IN_PREVIEW) {
        let uuidPromise = Editor.Message.request("asset-db", "query-uuid", url);
        uuidPromise.then(function (uuid) {
            cc.assetManager.loadAny(uuid, onComplete)
        })
    }
    else if (bundle) {
        bundle.bundle.load(url, type, onComplete)
    }
    else {
        cc.assetManager.loadRemote(url + (urlExt || ""), options, onComplete)
    }
}]);

function TextureLoader(task, done) {
    let { url, type } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options
    ''
    let onComplete = asyncify(function (error, result) {
        task.output = { result: result, url: url, type: type }
        done(error);
    })

    let subTask = cc.AssetManager.Task.create({
        input: {
            url: url,
            type: cc.ImageAsset,
        },
        options: options,
        onComplete: onComplete
    })
    normalPipeline.async(subTask)
}

export const texturePipeLine = new cc.AssetManager.Pipeline("texture load pipeline", [TextureLoader, (task, done) => {
    let { url, type, result } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    let texture = new cc.Texture2D();
    texture.image = result as cc.ImageAsset

    let assetCache = AssetCache.Create(url, cc.Texture2D, bundle, [result])
    cacheManager?.AddAssetCache(texture, assetCache)

    task.output = texture

    done()
}])

function SpriteFrameLoader(task, done) {
    let { url, type } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    let onComplete = asyncify(function (error, result) {
        task.output = { result: result, url: url, type: type }
        done(error);
    })

    let subTask = cc.AssetManager.Task.create({
        input: {
            url: url,
            type: cc.Texture2D,
        },
        options: options,
        onComplete: onComplete
    })
    texturePipeLine.async(subTask)
}

export const spriteFramePipeLine = new cc.AssetManager.Pipeline("spriteFrame load pipeline", [SpriteFrameLoader, (task, done) => {
    let { url, type, result } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    let spriteFrame = new cc.SpriteFrame();
    spriteFrame.texture = result as cc.Texture2D;

    let assetCache = AssetCache.Create(url, cc.SpriteFrame, bundle, [result])
    cacheManager?.AddAssetCache(spriteFrame, assetCache)

    task.output = spriteFrame

    done()
}])

function SpriteAtlasLoader(task, done) {
    let { url, type } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    let array = [{
        url: url + ".plist",
        type: cc.TextAsset,
    }, {
        url: url + ".png",
        type: cc.SpriteFrame,
    }]

    task.output = { url: url, type: type, result: [] }

    forEach(array, (index, subDone) => {
        let subTask = cc.AssetManager.Task.create({
            input: array[index],
            options: task.options,
            onComplete: function (error, result) {
                result?.addRef()
                task.output.result[index] = result
                subDone(error);
            }
        })
        index == 0 ? normalPipeline.async(subTask) : spriteFramePipeLine.async(subTask)
    }, (errors) => {
        for (const asset of task.output.result) {
            asset?.decRef()
        }
        done(errors.length > 0 ? errors : null)
    })

}

export const spriteAtlasPipeLine = new cc.AssetManager.Pipeline("spriteAtlas load pipeline", [SpriteAtlasLoader, (task, done) => {
    let { url, type, result } = task.input
    let { bundle, urlExt, options, cacheManager } = task.options

    function GetFrameData(str: string) {
        if (str.length < 13) {
            return null;
        }
        let newStr: string = str;
        newStr = newStr.slice(2);
        newStr = newStr.slice(0, newStr.length - 2);
        let newList_0: string[] = newStr.split('},{');
        let newList_1: string[] = newList_0[0].split(",");
        let newList_2: string[] = newList_0[1].split(",");
        if (newList_1.length < 2 || newList_2.length < 2) {
            return null;
        }
        return new cc.Rect(parseInt(newList_1[0]), parseInt(newList_1[1]), parseInt(newList_2[0]), parseInt(newList_2[1]));
    }

    function GetSizeData(str: string) {
        if (str.length < 5) {
            return null;
        }
        let newStr: string = str;
        newStr = newStr.slice(1);
        newStr = newStr.slice(0, newStr.length - 1);
        let newList_0: string[] = newStr.split(',');
        if (newList_0.length < 2) {
            return null;
        }
        return new cc.Size(parseInt(newList_0[0]), parseInt(newList_0[1]));
    }
    function GetOffsetData(str: string) {
        if (str.length < 5) {
            return null;
        }
        let newStr: string = str;
        newStr = newStr.slice(1);
        newStr = newStr.slice(0, newStr.length - 1);
        let newList_0: string[] = newStr.split(',');
        if (newList_0.length < 2) {
            return null;
        }
        return new cc.Vec2(parseInt(newList_0[0]), parseInt(newList_0[1]));
    }

    let plistAsset = result[0] as cc.Asset
    let spriteFrame = result[1] as cc.SpriteFrame

    let customAtlas = new cc.SpriteAtlas(url)
    let frames = plistAsset._nativeAsset?.frames
    if (frames) {
        for (const key of Object.keys(frames)) {
            let childSpriteFrame = new cc.SpriteFrame()
            let spriteFrameInfo = frames[key]
            childSpriteFrame.reset({
                texture: spriteFrame.texture,
                rect: GetFrameData(spriteFrameInfo.frame),
                isRotate: spriteFrameInfo.rotated,
                offset: GetOffsetData(spriteFrameInfo.offset),
                originalSize: GetSizeData(spriteFrameInfo.sourceSize)
            })

            let assetCache = AssetCache.Create(url + "/" + key, cc.SpriteFrame, bundle, [spriteFrame])
            cacheManager?.AddAssetCache(childSpriteFrame, assetCache)

            // 跟SpriteAtlas保持一致
            customAtlas.spriteFrames[key.replace(/.jpg|.png/, "")] = childSpriteFrame
        }
    }
    let assetCache = AssetCache.Create(url, cc.SpriteAtlas, bundle, result.concat(result, customAtlas.getSpriteFrames()))
    cacheManager?.AddAssetCache(customAtlas, assetCache)

    task.output = customAtlas

    done()
}])


export function GetPipeline(type: AssetType): cc.AssetManager.Pipeline {
    let pipeline = normalPipeline

    switch (type) {
        case cc.SpriteAtlas:
            return spriteAtlasPipeLine
        case cc.Texture2D:
            return texturePipeLine
        case cc.SpriteFrame:
            return spriteFramePipeLine
    }

    return pipeline
}


export const bundlePipeLine = new cc.AssetManager.Pipeline("bundle load pipeline", [
    (task: cc.AssetManager.Task, done) => {
        let { url } = task.input
        let { bundleManager } = task.options

        let onComplete = (err, result) => {
            if (result) {
                bundleManager?.AddBundle(url, result)
            }
            task.output = result;
            done(err)
        }
        cc.assetManager.loadBundle(url, onComplete)
    }])
