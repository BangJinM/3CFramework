import * as cc from "cc";
import { ASSET_CACHE_FLAG } from "../ResourcesDefines";
const { ccclass, property } = cc._decorator;

//79b4bca3-f66c-488c-9761-6c74513a1132
@ccclass('AssetRefComponent')
export class AssetRefComponent extends cc.Component {
    @property({ type: [cc.Asset] })
    private assets = []

    /**
     * 克隆时，需要增加引用
     * 原因：instantiate 后需要重新增加引用，引擎没有提供相应的方法,只能业务层实现，
     * 注意：_instantiate只会在instantiate(AssetRefComponent)的时候生效。instantiate(Node)，则不会调用到
     */
    static AfterClone(origin, clone: cc.Node) {
        if (origin instanceof cc.Prefab) {
            let prefabRef: AssetRefComponent = clone.addComponent(AssetRefComponent)
            prefabRef.AddAsset(origin)
        }
        else if (origin instanceof cc.Node) {// clone node需要执行AfterClone
            let assetRefs = clone.getComponentsInChildren(AssetRefComponent)
            for (let i = 0; i < assetRefs.length; i++) {
                assetRefs[i].assets.forEach(asset => {
                    asset.addRef()
                })
            }
        }
    }

    /**
     * 添加资源
     */
    AddAsset(asset: cc.Asset) {
        if (!asset || !asset[ASSET_CACHE_FLAG])
            return

        if (!cc.isValid(this))
            return

        this.assets.push(asset)
        asset.addRef()
    }
    /**
     * 删除资源
     */
    DelAsset(asset: cc.Asset) {
        if (!asset || !asset[ASSET_CACHE_FLAG])
            return

        let resultIndex = -1
        for (let index = 0; index < this.assets.length; index++) {
            if (asset[ASSET_CACHE_FLAG].url == this.assets[index][ASSET_CACHE_FLAG].url) {
                resultIndex = index
            }
        }

        if (resultIndex >= 0) {
            this.assets.splice(resultIndex, 1)
            asset.decRef()
        }
    }

    onDestroy() {
        for (const asset of this.assets) {
            this.DelAsset(asset)
        }
        this.assets.length = 0
    }
}