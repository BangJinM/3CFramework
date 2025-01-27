import * as cc from "cc";
import * as ccl from "ccl";
import { NoticeTable } from "../../Config/NoticeTable";
import { ColliderType } from "./ColliderableComponent";
import { FirableComponent } from "./FirableComponent";
import { DirectionType, IBaseActor } from "./IBaseActor";
import { MoveableComponent } from "./MovableComponent";

export class PlayableSystem extends ccl.ECSSystem {
    OnEnter(): void {
        cc.input.on(cc.Input.EventType.KEY_DOWN, this.OnKeyDown, this)
        cc.input.on(cc.Input.EventType.KEY_UP, this.OnKeyUp, this)
    }
    OnExit(): void {
        cc.input.off(cc.Input.EventType.KEY_DOWN, this.OnKeyDown, this)
        cc.input.off(cc.Input.EventType.KEY_UP, this.OnKeyUp, this)
    }

    OnKeyDown(event: cc.EventKeyboard) {
        let entities = this.GetEntities()
        for (const entity of entities) {
            let playableComp = this.ecsWorld.GetComponent<PlayableComponent>(entity, PlayableComponent)
            if (playableComp.isKeyBoard(event.keyCode)) {
                playableComp.keyDown(event.keyCode)
            }

            if (event.keyCode == playableComp.fireKey) {
                let firableComp: FirableComponent = this.ecsWorld.GetComponent(entity, FirableComponent)
                if (firableComp && firableComp.cTime >= firableComp.duration) {
                    let actorObj = this.ecsWorld.GetEntity<IBaseActor>(entity)
                    ccl.SubjectManager.GetInstance<ccl.SubjectManager>().NotifyObserver(NoticeTable.OnFire, [actorObj.node.position, actorObj.direction, 1, ColliderType.PLAYER_BULLET])
                }
            }
        }
    }
    OnKeyUp(event: cc.EventKeyboard) {
        let entities = this.GetEntities()
        for (const entity of entities) {
            let playableComp = this.ecsWorld.GetComponent<PlayableComponent>(entity, PlayableComponent)
            if (playableComp.isKeyBoard(event.keyCode)) {
                playableComp.keyUp(event.keyCode)
            }
        }
    }


    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()
        for (const entity of entities) {
            let playableComp = this.ecsWorld.GetComponent<PlayableComponent>(entity, PlayableComponent)
            let entityObj = this.ecsWorld.GetEntity<IBaseActor>(entity)

            let keyCode = playableComp.GetKeyCode()
            if (keyCode != playableComp.lastKeyCode) {
                let dir = playableComp.GetDirection(playableComp.lastKeyCode)
                let moveXEnd = (dir == DirectionType.EAST || dir == DirectionType.WEST) && entityObj.node.position.x % 8 == 0
                let moveYEnd = (dir == DirectionType.SOUTH || dir == DirectionType.NORTH) && entityObj.node.position.y % 8 == 0

                let moveComp = this.ecsWorld.GetComponent(entity, MoveableComponent)
                if (playableComp.lastKeyCode == -1 || moveXEnd || moveYEnd) {
                    playableComp.lastKeyCode = keyCode
                    moveComp.moving = false
                }
                moveComp.moving = playableComp.lastKeyCode != -1

                let direction = playableComp.keyBoardMap.get(playableComp.lastKeyCode)
                if (direction != undefined && direction != entityObj.direction) {
                    entityObj.setDirection(direction)
                }
            }
        }
    }
}

@ccl.ecs_component(PlayableSystem)
export class PlayableComponent extends ccl.ECSComponent {
    lastKeyCode: number = -1;
    keyBoardMap: Map<number, DirectionType> = new Map();
    keyDowns: Set<number> = new Set<number>();
    fireKey: number = cc.KeyCode.SPACE;

    constructor(id: number, keyBoards: { key: number, value: DirectionType }[], fireKey: number = cc.KeyCode.SPACE) {
        super(id);

        for (const config of keyBoards) {
            this.keyBoardMap.set(config.key, config.value);
        }
        this.fireKey = fireKey;
    }
    isKeyBoard(keyCode: number) {
        return this.keyBoardMap.has(keyCode);
    }

    keyDown(keyCode: number) {
        this.keyDowns.add(keyCode);
    }

    keyUp(keyCode: number) {
        this.keyDowns.delete(keyCode);
    }

    GetDirection(keyCode: number): DirectionType {
        return this.keyBoardMap.get(keyCode);
    }

    GetKeyCode(): number {
        let array = Array.from(this.keyDowns)
        return array.length >= 1 ? array[array.length - 1] : -1
    }
}