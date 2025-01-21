import * as cc from "cc";
import * as ccl from "ccl";
import { TankMain } from "../TankMain";
import { ColliderableComponent, ColliderType, TankQuadBoundary } from "./Component/ColliderableComponent";
import { FirableComponent } from "./Component/FirableComponent";
import { IBaseActor } from "./Component/IBaseActor";
import { MoveableComponent, MoveType } from "./Component/MovableComponent";
import { PlayableComponent } from "./Component/PlayableComponent";

export class PlayerManager {
    birthPlace: cc.Vec3[] = []
    players: number[] = [];

    actorNode: cc.Node = null;
    tankWorld: ccl.ECSWorld = null;

    Init(tankWorld): void {
        this.tankWorld = tankWorld
        this.actorNode = TankMain.GetInstance<TankMain>().GetNode("TankCanvas/NODE_GAME/NODE_ACTER")

        this.birthPlace.push(new cc.Vec3(-64 - 32, -13 * 32 + 32, 0))
        this.birthPlace.push(new cc.Vec3(64 + 32, -13 * 32 + 32, 0))

        this.CreatePlayer(0)
        // this.CreatePlayer(1)
    }

    CreatePlayer(index: number) {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Player", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let playerNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            playerNode.setPosition(this.birthPlace[index])
            this.actorNode.addChild(playerNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, playerNode)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = playerNode.position.x - boundary.width / 2
            boundary.y = playerNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.PLAYER, boundary)

            this.tankWorld.AddComponent(actorId, MoveableComponent, cc.Vec3.ZERO, MoveType.CONTROLLER, 1)
            this.tankWorld.AddComponent(actorId, FirableComponent)
            this.tankWorld.AddComponent(actorId, PlayableComponent, [cc.KeyCode.KEY_W, cc.KeyCode.KEY_S, cc.KeyCode.KEY_D, cc.KeyCode.KEY_A], cc.KeyCode.SPACE)

            this.players.push(actorId)
        })
    }

}