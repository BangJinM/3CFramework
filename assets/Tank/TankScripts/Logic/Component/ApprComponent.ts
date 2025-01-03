import * as cc from "cc";
import * as ccl from "ccl";
import { IBaseActor } from "./IBaseActor";

export class ApprSystem extends ccl.ECSSystem {
    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()

        for (const element of entities) {
            let apprComp = this.ecsWorld.GetComponent(element, ApprComponent)
            if (apprComp.GetDirty()) {
                let entity = this.ecsWorld.GetEntity<IBaseActor>(element)
                let sprite: cc.Sprite = ccl.GetOrAddComponent(entity.node, cc.Sprite)
                ccl.Resources.UIUtils.LoadSpriteFrame(sprite, apprComp.spriteFrames[apprComp.index], apprComp.bundleCache)
            }
        }
    }
}

@ccl.ecs_component(ApprSystem)
export class ApprComponent extends ccl.ECSComponent {
    index: number = 0;
    spriteFrames: string[] = [];
    bundleCache: ccl.BundleCache;
}