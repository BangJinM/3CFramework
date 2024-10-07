import * as cc from 'cc';
import * as ccl from 'ccl';
import { LevelManager } from './LevelManager';
import { TankWorld } from './TankWorld';
import { PlayerSystem } from './System/PlayerSystem';
import { MonsterSystem } from './System/MonsterSystem';
import { TankGameLogic } from './Logic/TankGameLogic';
import { TankBegin } from './TankBegin';

@cc._decorator.ccclass('UserComp.TankMain')
@ccl.set_manager_instance("Tank")
export class TankMain extends ccl.ISingleton {
    escWorld: ccl.ECSWorld = null
    sceneNode: cc.Node = null
    mapNode: cc.Node = null

    public Init(): void {
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance().GetBundle("Tank")
        ccl.Resources.Loader.LoadAsset("TankRes/Prefabs/SceneNode", cc.Prefab, mainResBundle, (iResource: ccl.IResource) => {
            this.sceneNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.mapNode = this.sceneNode.getChildByName("TankCanvas").getChildByName("NODE_GAME").getChildByName("NODE_MAP")
            cc.director.getScene().addChild(this.sceneNode)
            this.InitSuccess()
        })
    }

    public InitSuccess() {
        this.escWorld = new TankWorld()
        this.escWorld.AddSystem(PlayerSystem)
        this.escWorld.AddSystem(MonsterSystem)

        ccl.SubjectManager.GetInstance().Init()
        let tankGameLogic: TankGameLogic = TankGameLogic.GetInstance()
        tankGameLogic.Init()

        LevelManager.GetInstance().Init()

        let node = new cc.Node()
        let layerProperty = node.addComponent(ccl.BaseUIContainer)
        layerProperty.uiType = ccl.UIEnum.UI_NORMAL
        layerProperty.layerName = "TankRes/Prefabs/TankBegin"
        layerProperty.ScriptAsset = TankBegin
        layerProperty.mainPrefabPropty = { bundleName: "Tank", prefabName: "TankRes/Prefabs/TankBegin" }

        ccl.UIGraphManager.GetInstance().AddNode(layerProperty)

        ccl.SubjectManager.GetInstance()
    }

    public Update(deltaTime: number): void {
        this.escWorld?.Update(deltaTime)
    }

}


