import * as cc from "cc";
import { ISingleton } from "./ISingleton";
import { GetManagerPersistNode } from "./utils/CocosUtils";

export class InputManager extends ISingleton {
    private static instance: InputManager = null

    public static GetInstance() {
        if (!InputManager.instance) {
            let node = GetManagerPersistNode("InputManager")
            InputManager.instance = node.addComponent(InputManager)
        }
        return InputManager.instance
    }

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