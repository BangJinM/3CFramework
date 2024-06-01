import * as cc from "cc";
import { GetManagerPersistNode } from "./Utils/CocosUtils";
import { IECSSystem } from "./ECS/Base/IECSSystem";
import { IObject } from "./IObject";

/**
 * 单例类装饰
 */
export function set_manager_instance(pName?) {
    return (target) => {
        target.GetInstance = function () {
            if (!target.instance) {
                let node = GetManagerPersistNode(`__${target.name}__`, pName)
                target.instance = node.addComponent(target)
            }
            return target.instance
        }
    }
}

/**
 * 单例
 */
export abstract class ISingleton extends cc.Component implements IObject {
    protected update(dt: number): void {
        this.Update(dt)
    }

    protected onDestroy(): void {
        this.Clean()
    }

    /** 单例获取方法，实际方法通过set_manager_instance装饰器设置 */
    static GetInstance: Function = function () {
        throw ("GetInstance is not implemented")
    }

    public Init() { }
    public Update(deltaTime: number) { }
    public Clean() { }
}

