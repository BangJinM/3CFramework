import * as cc from 'cc';
import * as ccl from 'ccl';
import { TankGameLogic } from './Logic/TankGameLogic';
import { TankBegin } from './TankBegin';

@cc._decorator.ccclass('UserComp.TankMain')
@ccl.set_manager_instance("Tank")
export class TankMain extends ccl.ISingleton {
    sceneNode: cc.Node = null

    public Init(): void {
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance().GetBundle("Tank")
        ccl.Resources.Loader.LoadAsset("TankRes/Prefabs/SceneNode", cc.Prefab, mainResBundle, (iResource: ccl.IResource) => {
            this.sceneNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            cc.director.getScene().addChild(this.sceneNode)
            this.InitSuccess()
        })
    }

    public InitSuccess() {
        TankGameLogic.GetInstance().Init()
        ccl.SubjectManager.GetInstance().Init()

        let node = new cc.Node()
        let layerProperty = node.addComponent(TankBegin)
        layerProperty.uiType = ccl.UIEnum.UI_NORMAL
        layerProperty.layerName = "TankRes/Prefabs/TankBegin"
        layerProperty.mainPrefabPropty = { bundleName: "Tank", prefabName: "TankRes/Prefabs/TankBegin" }

        ccl.UIGraphManager.GetInstance().AddNode(layerProperty)
    }

    GetNode(name: string) {
        return cc.find(name, this.sceneNode)
    }
}


