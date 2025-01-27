import * as cc from 'cc';
import * as ccl from 'ccl';
import { NoticeTable } from './Config/NoticeTable';
import { ColliderableComponent, ColliderableSystem, ColliderType, TankQuadBoundary } from './Logic/Component/ColliderableComponent';
import { FirableSystem } from './Logic/Component/FirableComponent';
import { IBaseActor } from './Logic/Component/IBaseActor';
import { MoveableComponent, MoveableSystem, MoveType } from './Logic/Component/MovableComponent';
import { PlayableSystem } from './Logic/Component/PlayableComponent';
import { TankQuadTreeManager } from './Logic/Component/TankQuadTreeManager';
import { EnemyManager } from './Logic/EnemyManager';
import { PlayerManager } from './Logic/PlayerManager';
import { SceneManager } from './Logic/SceneManager';
import { TankUIManager } from './UI/TankUIManager';

@cc._decorator.ccclass('TankMain')
export class TankMain extends ccl.ISingleton {
    tankWorld: ccl.ECSWorld = new ccl.ECSWorld()
    sceneNode: cc.Node = null
    level: number;
    playerManager: PlayerManager;
    enemyManager: EnemyManager;
    sceneManager: SceneManager;
    protectorNode: cc.Node;
    actorNode: cc.Node;

    public Init(): void {
        let mainResBundle: ccl.BundleCache = ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank")
        ccl.Resources.Loader.LoadAsset("TankRes/Prefabs/SceneNode", cc.Prefab, mainResBundle, (iResource: ccl.IResource) => {
            this.sceneNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            cc.director.getScene().addChild(this.sceneNode)
            this.InitSuccess()
        })
    }

    GetNode(name: string) {
        return cc.find(name, this.sceneNode)
    }

    public InitSuccess() {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()

        TankUIManager.GetInstance().Init()
        subjectManager.Init()
        subjectManager.NotifyObserver(NoticeTable.Tank_UI_GameBegin_Open, null)

        subjectManager.AddObserver(NoticeTable.TankGameStart, this.OnGameStart.bind(this))
        subjectManager.AddObserver(NoticeTable.OnContact, this.OnContact.bind(this))
        subjectManager.AddObserver(NoticeTable.OnFire, this.OnFire.bind(this))
    }

    OnGameStart() {
        this.level = 3

        let tankQuadTreeManager: TankQuadTreeManager = TankQuadTreeManager.GetInstance<TankQuadTreeManager>()
        tankQuadTreeManager.quadBoundary.width = tankQuadTreeManager.quadBoundary.height = 32 * 32
        tankQuadTreeManager.quadBoundary.x = tankQuadTreeManager.quadBoundary.y = -16 * 32
        tankQuadTreeManager.Init()

        this.playerManager = new PlayerManager()
        this.enemyManager = new EnemyManager()
        this.sceneManager = new SceneManager()

        this.sceneManager.Init(this.tankWorld)
        this.enemyManager.Init(this.tankWorld)
        this.playerManager.Init(this.tankWorld)

        this.protectorNode = this.GetNode("TankCanvas/NODE_GAME/NODE_MAIN")
        this.actorNode = this.GetNode("TankCanvas/NODE_GAME/NODE_ACTER")

        this.tankWorld.AddSystem(MoveableSystem)
        this.tankWorld.AddSystem(ColliderableSystem)
        this.tankWorld.AddSystem(FirableSystem)
        this.tankWorld.AddSystem(PlayableSystem)

        this.InitBoundary()

        ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.SceneChange, { level: this.level })
    }
    InitBoundary() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/NodeMapBoundery", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.GetNode("TankCanvas/NODE_GAME/NODE_MAP_BOUNDARY").addChild(bulletNode)

            for (const element of bulletNode.children) {
                let actorId = this.tankWorld.CreateEntity(IBaseActor, bulletNode)

                let uiT: cc.UITransform = ccl.GetOrAddComponent(element, cc.UITransform)
                let boundary = new TankQuadBoundary(actorId)
                boundary.width = uiT.contentSize.width
                boundary.height = uiT.contentSize.height
                boundary.x = element.position.x - uiT.contentSize.width / 2
                boundary.y = element.position.y - uiT.contentSize.height / 2
                this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.BOUNDARY, boundary)
            }
        })
    }


    OnFire(data: any[]) {
        let position: cc.Vec3 = data[0]
        let direction: number = data[1]
        let type: ColliderType = data[3]
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Bullet", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let bulletNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.actorNode.addChild(bulletNode)
            bulletNode.position = position.clone()

            let actorId = this.tankWorld.CreateEntity(IBaseActor, bulletNode)
            let actorObj = this.tankWorld.GetEntity<IBaseActor>(actorId)
            actorObj.setDirection(direction)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = bulletNode.position.x - boundary.width / 2
            boundary.y = bulletNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, type, boundary)
            this.tankWorld.AddComponent(actorId, MoveableComponent, true, MoveType.FORWARD, 1.5)
        })
    }

    OnContact(data) {
        let selfQuadBoundary: TankQuadBoundary = data.selfCollision
        let otherQuadBoundarys: Set<TankQuadBoundary> = data.collisions

        // ccl.Logger.info(`OnBeginContact, ${selfQuadBoundary.entity}`)
        let selfCollider = this.tankWorld.GetComponent(selfQuadBoundary.entity, ColliderableComponent)
        let selfObj = this.tankWorld.GetEntity<IBaseActor>(selfQuadBoundary.entity)

        // 子弹碰撞到边界墙
        let BulletHitBoundary = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)
        }
        // 碰撞到玩家
        let HitPlayer = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到敌人
        let HitEnemy = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)

            ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.EnemyDie, { level: 1 })
        }
        // 碰撞到地形
        let HitTerrain = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到老鹰
        let HitProtector = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }
        // 碰撞到子弹
        let HitBullet = (otherObj: IBaseActor) => {
            selfObj.node.destroy()
            this.tankWorld.RemoveEntity(selfObj.id)

            otherObj.node.destroy()
            this.tankWorld.RemoveEntity(otherObj.id)
        }

        let funcs = {
            [ColliderType.ENEMY_BULLET]: {
                [ColliderType.BOUNDARY]: BulletHitBoundary,
                [ColliderType.NORMAL]: HitTerrain,
                [ColliderType.PLAYER]: HitPlayer,
                [ColliderType.PLAYER_BULLET]: HitBullet,
                [ColliderType.PROTECTOR]: HitProtector,
            },
            [ColliderType.PLAYER_BULLET]: {
                [ColliderType.BOUNDARY]: BulletHitBoundary,
                [ColliderType.NORMAL]: HitTerrain,
                [ColliderType.ENEMY]: HitEnemy,
                [ColliderType.ENEMY_BULLET]: HitBullet,
                [ColliderType.PROTECTOR]: HitProtector,
            },
        }

        for (const element of otherQuadBoundarys) {
            let otherCollider = this.tankWorld.GetComponent(element.entity, ColliderableComponent)
            if (funcs[selfCollider.type] && funcs[selfCollider.type][otherCollider.type]) {
                let otherObj = this.tankWorld.GetEntity<IBaseActor>(element.entity)
                funcs[selfCollider.type][otherCollider.type](otherObj)
            }
        }
    }

    InitProtector() {
        ccl.Resources.Loader.LoadPrefabAsset("TankRes/Prefabs/Protector", ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return

            let protectorNode = ccl.Resources.UIUtils.Clone(iResource.oriAsset as cc.Prefab)
            this.protectorNode.addChild(protectorNode)

            let actorId = this.tankWorld.CreateEntity(IBaseActor, protectorNode)

            let boundary = new TankQuadBoundary(actorId)
            boundary.width = boundary.height = 64
            boundary.x = this.protectorNode.position.x - boundary.width / 2
            boundary.y = this.protectorNode.position.y - boundary.height / 2
            this.tankWorld.AddComponent(actorId, ColliderableComponent, ColliderType.NORMAL, boundary)
        })
    }

    Update(deltaTime: number): void {
        this.tankWorld?.Update(deltaTime)
        this.enemyManager?.Update(deltaTime)
    }
}


