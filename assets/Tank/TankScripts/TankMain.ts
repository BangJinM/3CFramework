import * as cc from 'cc';
import * as Core from 'Core';
import { LoadAssetByName } from '../../Launcher/MainScripts/common/ResourceUtils';
import { LevelManager } from './LevelManager';

@cc._decorator.ccclass('UserComp.TankMain')
@Core.set_manager_instance("Tank")
export class TankMain extends Core.ISingleton {

    public Init(): void {
        let mainResBundle: Core.BundleCache = Core.BundleManager.GetInstance().GetBundle("Tank")
        let promise = LoadAssetByName("TankRes/Prefabs/TankMain", cc.Prefab, mainResBundle)
        promise.then(function (asset: cc.Prefab) {
            cc.director.getScene().addChild(Core.CloneNP(asset))
        })

        LevelManager.GetInstance().Init()
        let world: Core.ECSWorld = new Core.ECSWorld()
        let entity: number = world.CreateEntity()
        world.AddSystem(new Core.AppearanceSystem())
        world.AddComponent(entity, Core.app)
    }
}


