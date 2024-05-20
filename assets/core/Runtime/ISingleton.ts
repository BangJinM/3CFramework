import * as cc from "cc";
import { GetManagerPersistNode } from "./Utils/CocosUtils";

/**
 * 单例类装饰
 */
export function set_manager_instance() {
    return (target) => {
        target.GetInstance = function () {
            if (!target.instance) {
                let node = GetManagerPersistNode(`__${target.name}__`)
                target.instance = node.addComponent(target)
            }
            return target.instance
        }
    }
}

/**
 * 单例
 */
export abstract class ISingleton extends cc.Component {
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

    /** 单例初始化 */
    public Init() { }
    /** 单例每帧更新 */
    public Update(deltaTime: number) { }
    /** 单例清理数据 */
    public Clean() { }
}

