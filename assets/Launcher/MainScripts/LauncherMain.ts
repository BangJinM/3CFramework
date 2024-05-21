import * as cc from "cc";

import * as Core from "Core";
import { GameStatusInit } from "./game_state/GameStatusInit";
import { GameStatusTank } from "./game_state/GameStatusTank";
import { Global } from "./common/Global";

const { ccclass, property } = cc._decorator;

@ccclass("LauncherMain")
export class LauncherMain extends cc.Component {
    protected onLoad(): void {
        Core.Logger.GetInstance().Init()

        Core.Logger.info("GameStatusInit OnEnter")
        Global.Init()

        let gameStatusManager: Core.GameStatusManager = Core.GameStatusManager.GetInstance();
        gameStatusManager.Init()
        gameStatusManager.AddGameStatus(new GameStatusInit())
        gameStatusManager.AddGameStatus(new GameStatusTank())
        Core.GameStatusManager.GetInstance().ChangeStatus("GameStatusInit")
    }
}