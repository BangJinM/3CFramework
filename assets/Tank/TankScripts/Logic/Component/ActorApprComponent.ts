import * as cc from "cc";
import * as ccl from "ccl";
import { GetOrAddComponent } from "ccl";

@cc._decorator.ccclass("ActorApprComponent")
export class ActorApprComponent extends cc.Component {
    /** 包名 */
    bundleName: string = ""
    /** 路径 */
    appr: string = ""
    /** actor对应的节点 */
    node: cc.Node = null
    /** 对应的actor类型 */
    actorType: number = 0

    protected onEnable(): void {
        this.OnUpdateFeature()
    }

    OnUpdateFeature() {
        if (this._objFlags & cc.CCObject.Flags.IsOnLoadCalled)
            return

        let uiTf = GetOrAddComponent(this.node, cc.UITransform)
        let sprite = GetOrAddComponent(this.node, cc.Sprite)

        let bundleManager: ccl.BundleManager = ccl.BundleManager.GetInstance()
        ccl.Resources.UIUtils.LoadSpriteFrame(sprite, this.appr, bundleManager.GetBundle(this.bundleName))
    }
}