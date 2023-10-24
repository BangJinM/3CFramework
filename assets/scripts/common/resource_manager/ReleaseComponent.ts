import { Asset, Component, _decorator } from "cc";
import resourceManager from "./resource_index";
const { ccclass } = _decorator;

@ccclass("ReleaseComponent")
export class ReleaseComponent extends Component {
    private needAssets: Asset[] = new Array()

    AddReleaseAsset(asset: Asset): ReleaseComponent {
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