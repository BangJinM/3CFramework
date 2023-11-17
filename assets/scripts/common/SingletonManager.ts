import { ISingleton } from "./ISingleton";
import { MessageManager } from "./network/MessageManager";
import { LayerManager } from "./ui_manager/LayerManager";

export class SingletonManager implements ISingleton {
    singleton: Map<string, ISingleton> = null

    singletonTable = [
        LayerManager,
        MessageManager
    ]

    Init() {
        this.singleton = new Map()
        for (const key in this.singletonTable) {
            let singletonClass = this.singletonTable[key]
            let singleton = new singletonClass()
            this.singleton[singletonClass.constructor.name] = singleton
            singleton.Init()
        }
    }
    Update(deltaTime: number) {
        for (const iterator of this.singleton.values()) {
            iterator.Update(deltaTime)
        }
    }
    Clean() {
        for (const iterator of this.singleton.values()) {
            iterator.Clean()
        }
    }

    GetSingletonByName<T extends ISingleton>(name: string): T {
        if (this.singleton.has(name))
            return this.singleton.get(name) as T
        return null
    }
}
