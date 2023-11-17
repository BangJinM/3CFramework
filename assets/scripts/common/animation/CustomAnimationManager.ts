import * as cc from "cc";
import { ISingleton } from "../ISingleton";
import { Utils } from "../Utils";
import { CustomAnimation3D } from "./CustomAnimation3D";
import { GlobalCommon } from "../GlobalCommon";

export class CustomAnimationManager implements ISingleton {
    Init() {
    }
    Update(deltaTime: number) {
    }
    Clean() {
    }

    CreateAnim3D(): cc.Node {
        let animNode = new cc.Node()

        let cAnim = Utils.GetOrAddComponent(animNode, CustomAnimation3D)
        cAnim.InitAnimation("models/MOB14008/MOB14008", GlobalCommon.bundleManager.GetBundle("resources"), "MOB14008_Die")
        // cAnim.PlayState("MOB14008_Attack2")
        return animNode
    }
}