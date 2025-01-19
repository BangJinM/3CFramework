import * as cc from "cc";
import * as ccl from "ccl";
import { IBaseActor } from "./IBaseActor";

export class ApprSystem extends ccl.ECSSystem {

    OnEntityEnter(entity: number): void {
        super.OnEntityEnter(entity)

        let apprComp = this.ecsWorld.GetComponent(entity, ApprComponent)
        let actorObj = this.ecsWorld.GetEntity<IBaseActor>(entity)
        let sprite: cc.Sprite = ccl.GetOrAddComponent(actorObj.node, cc.Sprite)
        ccl.Resources.UIUtils.LoadSpriteFrame(sprite, apprComp.spriteFrameNames[apprComp.index], apprComp.bundleCache)
    }

    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()

        for (const element of entities) {
            let apprComp = this.ecsWorld.GetComponent(element, ApprComponent)
            if (apprComp.GetDirty()) {
                let entity = this.ecsWorld.GetEntity<IBaseActor>(element)
                let sprite: cc.Sprite = ccl.GetOrAddComponent(entity.node, cc.Sprite)
                ccl.Resources.UIUtils.LoadSpriteFrame(sprite, apprComp.spriteFrameNames[apprComp.index], apprComp.bundleCache)
            }
        }
    }
}

@ccl.ecs_component(ApprSystem)
export class ApprComponent extends ccl.ECSComponent {
    index: number = 0;
    spriteFrameNames: string[] = [];
    bundleCache: ccl.BundleCache;

    constructor(id: number, spriteFrames: string[], bundleName: string) {
        super(id)

        this.spriteFrameNames = spriteFrames
        this.bundleCache = ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle(bundleName)
    }
}