import * as cc from "cc";
import { ISingleton, set_manager_instance } from "./ISingleton";
import { GetManagerPersistNode } from "./Utils/CocosUtils";

@set_manager_instance()
export class InputManager extends ISingleton {
    Init() {
        cc.input.on(cc.Input.EventType.KEY_DOWN, this.keyDown, this)
        cc.input.on(cc.Input.EventType.KEY_UP, this.keyUp, this)
    }
    Update(deltaTime: number) {
    }

    Clean() {
        cc.input.off(cc.Input.EventType.KEY_DOWN, this.keyDown, this)
        cc.input.off(cc.Input.EventType.KEY_UP, this.keyUp, this)
    }

    private keyDown(event: cc.EventKeyboard) {
        console.log(event.keyCode)
    }

    private keyUp(event: cc.EventKeyboard) {
        console.log(event.keyCode)
    }
}