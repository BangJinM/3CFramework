import * as cc from 'cc';
import * as ccl from 'ccl';
import { NoticeTable } from './Config/NoticeTable';
import { TankGameLogic } from './Logic/TankGameLogic';
import { TankUIManager } from './UI/TankUIManager';

@cc._decorator.ccclass('TankMain')
export class TankMain extends ccl.ISingleton {
    sceneNode: cc.Node = null

    public Init(): void {
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank")
        ccl.Resources.Loader.LoadAsset("TankRes/Prefabs/SceneNode", cc.Prefab, mainResBundle, (iResource: ccl.IResource) => {
            this.sceneNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            cc.director.getScene().addChild(this.sceneNode)
            this.InitSuccess()
        })
    }

    public InitSuccess() {
        TankUIManager.GetInstance().Init()
        ccl.SubjectManager.GetInstance().Init()
        ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.Tank_UI_GameBegin_Open, null)
    }

    GetNode(name: string) {
        return cc.find(name, this.sceneNode)
    }
}


