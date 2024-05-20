import * as cc from "cc";

import * as Core from "Core";
import { GameStatusInit } from "./game_state/GameStatusInit";

const { ccclass, property } = cc._decorator;

@ccclass("LauncherMain")
export class LauncherMain extends cc.Component {
    protected onLoad(): void {
        Core.Logger.GetInstance().Init()

        let gameStatusManager: Core.GameStatusManager = Core.GameStatusManager.GetInstance();
        gameStatusManager.Init()
        gameStatusManager.AddGameStatus(new GameStatusInit())
        Core.GameStatusManager.GetInstance().ChangeStatus("GameStatusInit")
    }
}