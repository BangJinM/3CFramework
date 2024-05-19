import * as cc from "cc";

import { GameStatusManager } from "Core";
import { GameStatusInit } from "./game_state/GameStatusInit";
import { Logger } from "../../Core/Runtime/Logger";

const { ccclass, property } = cc._decorator;

@ccclass("LauncherMain")
export class LauncherMain extends cc.Component {
    protected onLoad(): void {
        Logger.GetInstance().Init()
        
        let gameStatusManager: GameStatusManager = GameStatusManager.GetInstance();
        gameStatusManager.Init()
        gameStatusManager.AddGameStatus(new GameStatusInit())
        GameStatusManager.GetInstance().ChangeStatus("GameStatusInit")
    }
}