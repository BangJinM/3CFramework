import * as ccl from "ccl"
@ccl.ecs_component(ccl.ECSSystem)
export class ECSHPComp extends ccl.ECSComponent {
    hp: number = 1;

    SetHP(hp: number) {
        this.hp = hp
        this.SetDirty(true)
    }
}