import * as cc from "cc";

export class Utils {
    /** 获取组件，不存在时添加 */
    static GetOrAddComponent<T extends cc.Component>(node: Node | any, componentName: new () => T): T {
        return node.getComponent(componentName) || node.addComponent(componentName)
    }
}