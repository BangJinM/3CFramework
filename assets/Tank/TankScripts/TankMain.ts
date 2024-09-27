import * as cc from 'cc';
import * as ccl from 'ccl';
import { LevelManager } from './LevelManager';
import { MonsterManager } from './MonsterManager';
import { PlayerManager } from './PlayerManager';
import { TankWorld } from './TankWorld';

@cc._decorator.ccclass('UserComp.TankMain')
@ccl.set_manager_instance("Tank")
export class TankMain extends ccl.ISingleton {
    escWorld: ccl.ECSWorld = null
    sceneNode: cc.Node = null

    public Init(): void {
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance().GetBundle("Tank")
        ccl.Resources.Loader.LoadAsset("TankRes/Prefabs/TankMain", cc.Prefab, mainResBundle, (iResource: ccl.IResource) => {
            this.sceneNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            cc.director.getScene().addChild(this.sceneNode)
        })
    }

    public InitSuccess() {
        this.escWorld = new TankWorld()

        PlayerManager.GetInstance().Init()
        LevelManager.GetInstance().Init()
        MonsterManager.GetInstance().Init()

        let player: number = this.escWorld.CreateEntity()
        PlayerManager.GetInstance().SetPlayer(player)
    }

    public Update(deltaTime: number): void {

    }

}


