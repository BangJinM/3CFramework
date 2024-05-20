import * as cc from "cc";
import { ISingleton, set_manager_instance } from "../ISingleton";

type EventCallback = (...args: any[]) => void;

@set_manager_instance()
export class EventManager extends ISingleton {
    eventTarget: cc.EventTarget = null

    public Init(): void {
        this.eventTarget = new cc.EventTarget()
    }

    on(eventType: string, callback: EventCallback, target?: any) {
        this.eventTarget.on(eventType, callback, target);
    }



    off(eventType: string, callback: EventCallback, target?: any) {
        this.eventTarget.off(eventType, callback, target);
    }



    emit(eventType: string, ...args: any[]) {
        this.eventTarget.emit(eventType, ...args);
    }

    public Clean(): void {

    }
}