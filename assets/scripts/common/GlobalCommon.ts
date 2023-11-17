import { SingletonManager } from "./SingletonManager";
import { MessageManager } from "./network/MessageManager";
import { IFacade } from "./puremvc/interfaces/IFacade";
import { BundleManager } from "./resource_manager/BundleManager";
import { ResourceManager } from "./resource_manager/ResourceManager";
import { LayerManager } from "./ui_manager/LayerManager";
import { UIGraphManager } from "./ui_manager/UIGraphManager";

export class GlobalCommon {
    /** puremvc */
    static Facade: IFacade = null
    /** 资源加载 */
    static resourcesManager: ResourceManager = null
    /** bundle管理 */
    static bundleManager: BundleManager = null
    /** 界面管理 */
    static layerManager: LayerManager = null
    /** 消息管理 */
    static messageManager: MessageManager = null
    /** 界面根节点管理 */
    static uiGraphManager: UIGraphManager = null
}