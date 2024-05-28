import * as cc from "cc"
import * as Core from "Core";

@cc._decorator.ccclass()
@Core.set_manager_instance("Tank")
export class LevelManager extends Core.ISingleton {
    level: number = 1

    GetLevel(): number {
        return this.level
    }

    SetLevel(level: number) {
        this.level = level
    }
}