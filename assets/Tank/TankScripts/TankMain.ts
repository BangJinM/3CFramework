import * as cc from 'cc';
import * as ccl from 'ccl';
import { ECSActorApprComp } from './ECS/Comp/ECSActorApprComp';
import { ECSActorApprSystem } from './ECS/ECSActorApprSystem';
import { LevelManager } from './LevelManager';
import { TankGameLogic } from './Logic/TankGameLogic';
import { MonsterSystem } from './System/MonsterSystem';
import { PlayerSystem } from './System/PlayerSystem';
import { TankBegin } from './TankBegin';
import { TankWorld } from './TankWorld';

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
        let layerProperty = node.addComponent(TankBegin)
        layerProperty.uiType = ccl.UIEnum.UI_NORMAL
        layerProperty.layerName = "TankRes/Prefabs/TankBegin"
        layerProperty.mainPrefabPropty = { bundleName: "Tank", prefabName: "TankRes/Prefabs/TankBegin" }

        ccl.UIGraphManager.GetInstance().AddNode(layerProperty)

        ccl.SubjectManager.GetInstance()

        this.escWorld.AddSystem(ECSActorApprSystem)
        let apprSys = this.escWorld.GetSystem<ECSActorApprSystem>(ECSActorApprSystem)
        let player: number = this.escWorld.CreateEntity()
        let comp = this.escWorld.AddComponent(player, ECSActorApprComp)
        comp.SetAppr("Textures/UI/button_orange")
    }

    public Update(deltaTime: number): void {
        this.escWorld?.Update(deltaTime)
    }


    GetNode(name: string) {
        return cc.find(name, this.sceneNode)
    }
}


