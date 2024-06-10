import * as cc from 'cc';
import * as Core from 'Core';
import { LoadAssetByName } from '../../Core/Runtime/ResourceManager/ResourceUtils';
import { LevelManager } from './LevelManager';
import { TankWorld } from './TankWorld';
import { PlayerManager } from './PlayerManager';
import { MonsterManager } from './MonsterManager';

@cc._decorator.ccclass('UserComp.TankMain')
@Core.set_manager_instance("Tank")
export class TankMain extends Core.ISingleton {
    escWorld: Core.ECSWorld = null
    sceneNode: cc.Node = null

    public Init(): void {
        this.escWorld = new TankWorld()

        PlayerManager.GetInstance().Init()
        LevelManager.GetInstance().Init()
        MonsterManager.GetInstance().Init()

        let mainResBundle: Core.BundleCache = Core.BundleManager.GetInstance().GetBundle("Tank")
        let promise = LoadAssetByName("TankRes/Prefabs/TankMain", cc.Prefab, mainResBundle)
        promise.then(function (asset: cc.Prefab) {
            this.sceneNode = Core.Clone(asset)
            cc.director.getScene().addChild( this.sceneNode)

            LevelManager.GetInstance().Set
        })

        let player: number = this.escWorld.CreateEntity()
        PlayerManager.GetInstance().SetPlayer(player)
    }

    public Update(deltaTime: number): void {

    }

}


