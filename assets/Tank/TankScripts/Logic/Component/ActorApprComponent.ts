import * as cc from "cc";
import * as ccl from "ccl";
import { GetOrAddComponent } from "ccl";

@cc._decorator.ccclass("ActorApprComponent")
@cc._decorator.requireComponent(cc.Sprite)
@cc._decorator.requireComponent(cc.UITransform)
export class ActorApprComponent extends cc.Component {
    /** 包名 */
    bundleName: string = ""
    /** 路径 */
    appr: string = ""

    type: number = 0

    protected onEnable(): void {
        this.OnUpdateFeature()
    }

    OnUpdateFeature() {
        if (!(this._objFlags & cc.CCObject.Flags.IsOnLoadCalled))
            return

        let sprite = GetOrAddComponent(this.node, cc.Sprite)
        let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance()
        ccl.Resources.UIUtils.LoadSpriteFrame(sprite, this.appr, bundleManager.GetBundle(this.bundleName))
    }
}