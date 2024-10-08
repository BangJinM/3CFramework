import * as ccl from "ccl";
import { ECSActorApprSystem } from "../ECSActorApprSystem";

@ccl.ecs_component(ECSActorApprSystem)
export class ECSActorApprComp extends ccl.ECSComponent {
    appr: string = ""

    SetAppr(appr: string) {
        this.appr = appr
        this.SetDirty(true)
    }

    GetAppr() {
        return this.appr
    }
}