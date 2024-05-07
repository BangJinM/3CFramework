import { ISingleton, GetManagerPersistNode } from "core";
import { GameStatus } from "./GameStatus";
import { GameStatusInit } from "./GameStatusInit";

export class GameStatusManager extends ISingleton {
    private static instance: GameStatusManager = null

    public static GetInstance() {
        if (!GameStatusManager.instance) {
            let node = GetManagerPersistNode("GameStatusManager")
            GameStatusManager.instance = node.addComponent(GameStatusManager)
        }
        return GameStatusManager.instance
    }

    gameStatuses: Map<string, GameStatus> = new Map()
    curStatus: GameStatus = null
    lastStatus: GameStatus = null

    Init() {
        this.AddGameStatus(new GameStatusInit())
    }

    AddGameStatus(gameStatus: GameStatus) {
        this.gameStatuses.set(gameStatus.NAME, gameStatus)
    }

    GetGameStatus(name: string) {
        return this.gameStatuses.get(name)
    }

    GetCurStatus() {
        return this.curStatus
    }

    SetCurStatus(status: GameStatus) {
        this.curStatus = status
    }

    GetLastStatus() {
        return this.lastStatus
    }

    SetLastStatus(status: GameStatus) {
        this.lastStatus = status
    }

    async ChangeStatus(name: string) {
        let gameStatus = this.gameStatuses.get(name)

        if (!gameStatus) return
        if (this.lastStatus && this.lastStatus.NAME == gameStatus.NAME) return

        this.lastStatus = this.curStatus
        if (this.lastStatus) await this.lastStatus.OnExit()

        this.curStatus = gameStatus
        await this.curStatus.OnEnter()
    }
}