import { CacheManager, UIGraphManager } from "Core"

/** 
 * 全局变量 根据不同的游戏周期，初始化对应的变量
 */
export class Global {
    static uiGraphManager: UIGraphManager = null
    static CacheManager: CacheManager = null

    static async Init() {
        Global.uiGraphManager = UIGraphManager.GetInstance()
        await Global.uiGraphManager.Init()
    }
}