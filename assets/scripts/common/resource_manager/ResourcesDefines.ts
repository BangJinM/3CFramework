import * as cc from "cc";
import { AssetRefComponent } from "./custom_component/AssetRefComponent";

export type AssetType = cc.Constructor<cc.Asset>
export type LoadAssetCompleteFunc = (error: Error | null, asset: cc.Asset | cc.Asset[]) => void;
export type LoadBundleCompleteFunc = (error: Error | null, asset: BundleCache) => void;

/** 使用bundle.load直接加载spriteframe */
export let USE_SPRITE_BUNDLE_LOAD = true

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

export class AssetCache {
    /** 路径 */
    url: string
    /** 资源类型 */
    type: AssetType
    /** bundle缓存 */
    bundle: BundleCache
    /** 依赖的资源 */
    depends: cc.Asset[] = []

    static Create(url: string, type: AssetType, bundle: BundleCache, depends?: cc.Asset[]) {
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

export class BundleCache extends CacheRef {
    /** 路径或者名字 */
    url: string
    /** bundle */
    bundle: cc.AssetManager.Bundle
}

/** 设置需要监听的get 和set */
function ObserverPropertySetter<T>(target: T, propertyKey: string, beforeSetterFunc?: Function, afterSetterFunc?: Function) {
    let descriptor = Object.getOwnPropertyDescriptor(target.constructor.prototype, propertyKey)

    if (!descriptor)
        return

    const oldSpriteFrameSet = descriptor.set
    const oldSpriteFrameGet = descriptor.get

    Object.defineProperty(target, propertyKey, {
        get: oldSpriteFrameGet,
        set: function (value: any | null) {
            let oldValue = oldSpriteFrameGet.call(this)
            if (oldValue === value)
                return

            let refComp: AssetRefComponent = null
            refComp = this.node.getComponent(AssetRefComponent)
            if (refComp) {
                refComp.DelAsset(oldValue)
            }

            oldSpriteFrameSet.call(this, value)

            if (value && value["__asset_cache__"]) {
                if (!refComp)
                    refComp = this.node.addComponent(AssetRefComponent)
                refComp.AddAsset(value)
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
export function ObserverSpriteProperty(sprite) {
    if (!sprite)
        return

    if (!cc.isValid(sprite.node))
        return

    if (sprite["__overwrite_flag__"])
        return

    sprite["__overwrite_flag__"] = true

    ObserverPropertySetter<cc.Sprite>(sprite, "spriteFrame")
    ObserverPropertySetter<cc.Sprite>(sprite, "spriteAtlas")
}

/** 增加Button资源监听 */
export function ObserverButtonProperty(button: cc.Button) {
    if (!button)
        return

    if (button["__overwrite_flag__"])
        return

    button["__overwrite_flag__"] = true

    ObserverPropertySetter<cc.Button>(button, "normalSprite")
    ObserverPropertySetter<cc.Button>(button, "pressedSprite")
    ObserverPropertySetter<cc.Button>(button, "hoverSprite")
    ObserverPropertySetter<cc.Button>(button, "disabledSprite")
}

/** 增加Label资源监听 */
export function ObserverLabelProperty(label: cc.Label) {
    if (!label)
        return

    if (label["__overwrite_flag__"])
        return

        label["__overwrite_flag__"] = true

    ObserverPropertySetter<cc.Label>(label, "font")
    ObserverPropertySetter<cc.Label>(label, "fontAtlas")
    ObserverPropertySetter<cc.Label>(label, "fontEx")
}