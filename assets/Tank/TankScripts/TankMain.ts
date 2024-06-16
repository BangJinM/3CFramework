import * as cc from 'cc';
import * as ccl from 'ccl';
import { LevelManager } from './LevelManager';
import { TankWorld } from './TankWorld';
import { PlayerManager } from './PlayerManager';
import { MonsterManager } from './MonsterManager';

@cc._decorator.ccclass('UserComp.TankMain')
@ccl.set_manager_instance("Tank")
export class TankMain extends ccl.ISingleton {
    escWorld: ccl.ECSWorld = null
    sceneNode: cc.Node = null

    public Init(): void {


        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance().GetBundle("Tank")
        let promise = ccl.LoadAssetByName("TankRes/Prefabs/TankMain", cc.Prefab, mainResBundle)
        promise.then(function (asset: cc.Prefab) {
            this.sceneNode = ccl.Clone(asset)
            cc.director.getScene().addChild(this.sceneNode)

        }.bind(this))


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


