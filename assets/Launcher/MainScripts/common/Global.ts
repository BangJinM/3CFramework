import { BundleManager, CacheManager, UIGraphManager } from "ccl"

/** 
 * 全局变量 根据不同的游戏周期，初始化对应的变量
 */
export class Global {
    static uiGraphManager: UIGraphManager = null
    static bundleManager: BundleManager = null
    static CacheManager: CacheManager = null

    static async Init() {
        Global.uiGraphManager = UIGraphManager.GetInstance() as UIGraphManager
        Global.uiGraphManager.Init()
        Global.bundleManager = BundleManager.GetInstance() as BundleManager
        Global.bundleManager.Init()
    }
}