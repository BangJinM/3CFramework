import * as cc from "cc";
import { GlobalCommon } from "../GlobalCommon";
import { AssetCache, BundleCache } from "../resource_manager/ResourcesDefines";
import { Utils } from "../Utils";

export enum AnimationLoadState {
    LOADING,
    FINISH
}

export class CustomAnimation3D extends cc.Component {
    /** 路径 */
    prefabUrl: string = null
    /** 包名 */
    bundle: BundleCache = null
    /** 资源缓存 */
    assetCache: AssetCache = null
    /** 加载状态 */
    animLoadState: AnimationLoadState = AnimationLoadState.LOADING
    /** 同步的时间 */
    syncTime: number = 0
    /** 状态名称 */
    stateName = ""
    /** SkeletalAnimation */
    animation: cc.SkeletalAnimation = null

    InitAnimation(url: string, bundle: BundleCache, stateName = "") {
        this.prefabUrl = url
        this.bundle = bundle
        this.stateName = stateName
    }

    protected onLoad(): void {
        if (!this.prefabUrl) return

        GlobalCommon.resourcesManager.LoadAsset(this.prefabUrl, cc.Prefab, this.bundle, function (error: Error, assetCache: AssetCache) {
            let animNode = cc.instantiate(assetCache.data as cc.Prefab)
            this.node.addChild(animNode)

            this.animation = Utils.GetOrAddComponent(animNode, cc.SkeletalAnimation)
            this.animLoadState = AnimationLoadState.FINISH
            this.assetCache = assetCache

            this.PlayState(this.stateName)
        }.bind(this))
    }

    protected update(dt: number): void {
        if (this.animLoadState == AnimationLoadState.LOADING) {
            this.syncTime += dt
        }
    }

    PlayState(name: string) {
        this.stateName = name
        if (!this.animation) {
            this.syncTime = 0
        }
        else {
            let state = this.animation.getState(name)
            if (state) {
                state.play()
            }

            if (this.syncTime > 0) {
                state.time = this.syncTime
                this.syncTime = 0
            }
        }
    }

    protected onDestroy(): void {
        this.assetCache?.DecRef()
    }
}