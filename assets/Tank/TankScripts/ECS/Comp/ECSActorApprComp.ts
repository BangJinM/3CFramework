import * as ccl from "ccl";
import { ECSActorApprSystem } from "../ECSActorApprSystem";

@ccl.ecs_component(ECSActorApprSystem)
export class ECSActorApprComp extends ccl.ECSComponent {
    bundleName: string = ""
    appr: string = ""

    SetAppr(appr: string, bundleName?: string) {
        this.appr = appr
        this.bundleName = bundleName
        this.SetDirty(true)
    }

    GetAppr() {
        return this.appr
    }
}