import * as cc from "cc";

export function set_manager_instance(name: string) {
    return (target) => {

    }
}

export abstract class ISingleton extends cc.Component {
    protected update(dt: number): void {
        this.Update(dt)
    }

    protected onDestroy(): void {
        this.Clean()
    }

    /** 单例初始化 */
    public Init() { }
    /** 单例每帧更新 */
    public Update(deltaTime: number) { }
    /** 单例清理数据 */
    public Clean() { }
}

