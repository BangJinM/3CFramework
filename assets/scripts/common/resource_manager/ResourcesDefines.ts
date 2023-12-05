import * as cc from "cc";

export type AssetType = cc.Constructor<cc.Asset>
export type LoadAssetCompleteFunc = (error: Error | null, asset: cc.Asset | cc.Asset[]) => void;
export type LoadBundleCompleteFunc = (error: Error | null, asset: BundleCache) => void;

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
        set: function (value: cc.SpriteAtlas | null) {
            if (beforeSetterFunc)
                beforeSetterFunc.call(this, value)
            oldSpriteFrameSet.call(this, value)
            if (afterSetterFunc)
                afterSetterFunc.call(this, value)
        },
        enumerable: true,
        configurable: true
    });
}


/**
 * 增加SpriteFame引用监听
 * @description 为什么要用这种方式 
 * @description 第一个方案是CustomSprite继承Sprite
 * @description 第二个方案是运行时注入Sprite的Setter和OnDestroy
 * @description 在一个方案中缺陷是 在Button中，得先移除老的Sprite再新增CustomSprite，会移除Sprite失败，CustomSprite和Sprite同时存在
 * @param sprite 
 * @returns 
 */
export function ObserverSpriteProperty(sprite: cc.Sprite) {
    if (!sprite)
        return

    if (sprite["__overwrite_flag__"])
        return

    sprite["__overwrite_flag__"] = true

    ObserverPropertySetter<cc.Sprite>(sprite, "spriteFrame", function () {
        if (this._spriteFrame && this._spriteFrame["__asset_cache__"]) {
            this._spriteFrame.decRef()
        }
    }, function () {
        if (this._spriteFrame && this._spriteFrame["__asset_cache__"]) {
            this._spriteFrame.addRef()
        }
    })

    ObserverPropertySetter<cc.Sprite>(sprite, "spriteAtlas", function () {
        if (this._atlas && this._atlas["__asset_cache__"]) {
            this._atlas.decRef()
        }
    }, function () {
        if (this._atlas && this._atlas["__asset_cache__"]) {
            this._atlas.addRef()
        }
    })

    const onDestroy = sprite.onDestroy
    sprite.onDestroy = function () {
        if (this._spriteFrame && this._spriteFrame["__asset_cache__"]) {
            this._spriteFrame.decRef()
        }

        if (this._atlas && this._atlas["__asset_cache__"]) {
            this._atlas.addRef()
        }

        //调用之前的onDestroy
        onDestroy?.call(this);
    };
}

/** 增加SpriteFrame引用监听 */
export function ObserverButtonProperty(button: cc.Button) {
    if (!button)
        return

    if (button["__overwrite_flag__"])
        return

    button["__overwrite_flag__"] = true

    ObserverPropertySetter<cc.Button>(button, "normalSprite", function () {
        if (this._normalSprite && this._normalSprite["__asset_cache__"]) {
            this._normalSprite.decRef()
        }
    }, function () {
        if (this._normalSprite && this._normalSprite["__asset_cache__"]) {
            this._normalSprite.addRef()
        }
    })

    ObserverPropertySetter<cc.Button>(button, "pressedSprite", function () {
        if (this._pressedSprite && this._pressedSprite["__asset_cache__"]) {
            this._pressedSprite.decRef()
        }
    }, function () {
        if (this._pressedSprite && this._pressedSprite["__asset_cache__"]) {
            this._pressedSprite.addRef()
        }
    })

    ObserverPropertySetter<cc.Button>(button, "hoverSprite", function () {
        if (this._hoverSprite && this._hoverSprite["__asset_cache__"]) {
            this._hoverSprite.decRef()
        }
    }, function () {
        if (this._hoverSprite && this._hoverSprite["__asset_cache__"]) {
            this._hoverSprite.addRef()
        }
    })

    ObserverPropertySetter<cc.Button>(button, "disabledSprite", function () {
        if (this._disabledSprite && this._disabledSprite["__asset_cache__"]) {
            this._disabledSprite.decRef()
        }
    }, function () {
        if (this._disabledSprite && this._disabledSprite["__asset_cache__"]) {
            this._disabledSprite.addRef()
        }
    })

    const onDestroy = button.onDestroy
    button.onDestroy = function () {
        if (this._normalSprite && this._normalSprite["__asset_cache__"]) {
            this._normalSprite.addRef()
        }

        if (this._pressedSprite && this._pressedSprite["__asset_cache__"]) {
            this._pressedSprite.addRef()
        }

        if (this._hoverSprite && this._hoverSprite["__asset_cache__"]) {
            this._hoverSprite.addRef()
        }

        if (this._disabledSprite && this._disabledSprite["__asset_cache__"]) {
            this._disabledSprite.addRef()
        }

        //调用之前的onDestroy
        onDestroy?.call(this);
    };
}