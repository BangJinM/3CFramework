import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";
import { ColliderType } from "./ColliderableComponent";
import { FirableComponent } from "./FirableComponent";
import { IBaseActor } from "./IBaseActor";
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
                this.UpdateDirection(entity, playableComp)
            }

            if (event.keyCode == playableComp.fireKey) {
                let firableComp: FirableComponent = this.ecsWorld.GetComponent(entity, FirableComponent)
                if (firableComp && firableComp.cTime >= firableComp.duration) {
                    let actorObj = this.ecsWorld.GetEntity<IBaseActor>(entity)
                    TankGameLogic.GetInstance<TankGameLogic>().OnFire(actorObj.node.position, playableComp.lastDirection, 1, ColliderType.PLAYER_BULLET)
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
                this.UpdateDirection(entity, playableComp)
            }
        }
    }

    UpdateDirection(entity, playableComp) {
        let moveComp = this.ecsWorld.GetComponent(entity, MoveableComponent)
        if (playableComp.keyDowns.size > 0) {
            let array = Array.from(playableComp.keyDowns)
            let keyCode = array[array.length - 1]
            moveComp.direction = playableComp.Direction[playableComp.keyBoardMap.get(keyCode)] || cc.Vec3.ZERO
        }
        else {
            moveComp.direction = cc.Vec3.ZERO
        }
    }

    OnUpdate(deltaTime: number): void { }
}

@ccl.ecs_component(PlayableSystem)
export class PlayableComponent extends ccl.ECSComponent {
    Direction = [
        new cc.Vec3(0, 1, 0),
        new cc.Vec3(0, -1, 0),
        new cc.Vec3(1, 0, 0),
        new cc.Vec3(-1, 0, 0),
    ]
    lastDirection: cc.Vec3 = new cc.Vec3(0, 1, 0);

    keyBoardMap: Map<number, number> = new Map();
    keyDowns: Set<number> = new Set<number>();
    fireKey: number = cc.KeyCode.SPACE;

    constructor(id: number, keyBoards: number[], fireKey: number = cc.KeyCode.SPACE) {
        super(id);

        for (const key in keyBoards) {
            this.keyBoardMap.set(keyBoards[key], Number(key));
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
}