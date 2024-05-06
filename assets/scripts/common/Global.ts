import { CacheManager, UIGraphManager } from "core"

/** 
 * 全局变量 根据不同的游戏周期，初始化对应的变量
 */
export class Global {
    static uiGraphManager: UIGraphManager = null
    static CacheManager: CacheManager = null

    static async LoadingInit() {
        Global.uiGraphManager = UIGraphManager.GetInstance()
        await Global.uiGraphManager.Init()
    }

    static LoadingClean() {
        Global.uiGraphManager.Clean()
        Global.uiGraphManager.node.destroy()
        Global.uiGraphManager = null
    }

    static LoginInit() { }
    static LoginClean() { }

}