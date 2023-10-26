import * as cc from "cc";
import resourceManager from "./resource_index";
const { ccclass } = cc._decorator;

@ccclass("ReleaseComponent")
export class ReleaseComponent extends cc.Component {
    private needAssets: cc.Asset[] = new Array()

    AddReleaseAsset(asset: cc.Asset): ReleaseComponent {
        this.needAssets.push(asset)
        return this
    }

    DeleteAllReleaseAsset() {
        for (const iterator of this.needAssets) {
            resourceManager.releaseManager.ReleaseAsset(iterator)
        }
        this.needAssets.length = 0
    }

    protected onDestroy(): void {
        for (const iterator of this.needAssets) {
            resourceManager.releaseManager.ReleaseAsset(iterator)
        }
    }

    static AddReleaseAsset(node, asset): ReleaseComponent {
        let releaseComponent: ReleaseComponent = node.getComponent(ReleaseComponent)
        if (!releaseComponent)
            releaseComponent = node.addComponent(ReleaseComponent)

        releaseComponent.AddReleaseAsset(asset)
        return releaseComponent
    }
}