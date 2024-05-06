import * as cc from "cc";

/** 获取组件，不存在时添加 */
export function GetOrAddComponent<T extends cc.Component>(node: Node | any, componentName: new () => T): T {
    return node.getComponent(componentName) || node.addComponent(componentName)
}

/** 初始化持久化节点 */
export function GetPersistRootNode() {
    let scene = cc.director.getScene()
    if (!scene)
        return

    let persistRootNode = scene.getChildByName("__PersistRootNode__")
    if (!persistRootNode) {
        persistRootNode = new cc.Node("__PersistRootNode__")
        cc.director.addPersistRootNode(persistRootNode)
    }
    return persistRootNode
}

/** 获取管理类下的持久化节点 */
export function GetManagerPersistNode(name: string) {
    let scene = cc.director.getScene()
    if (!scene)
        return

    let persistRootNode = scene.getChildByName("__PersistRootNode__")
    if (!persistRootNode) {
        persistRootNode = GetPersistRootNode()
    }

    let managerNode = persistRootNode.getChildByName("__ManagerNode__")
    if (!managerNode) {
        managerNode = new cc.Node(name)
        persistRootNode.addChild(managerNode)
    }
    return managerNode
}