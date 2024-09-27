import * as cc from "cc";

import * as ccl from "ccl";
import { Global } from "./common/Global";
import { GameStatusInit } from "./game_state/GameStatusInit";
import { GameStatusTank } from "./game_state/GameStatusTank";

const { ccclass, property } = cc._decorator;

@ccclass("LauncherMain")
export class LauncherMain extends cc.Component {
    protected onLoad(): void {
        ccl.Logger.info("LauncherMain")
        Global.Init()

        let gameStatusManager: ccl.GameStatusManager = ccl.GameStatusManager.GetInstance();
        gameStatusManager.Init()
        gameStatusManager.AddGameStatus(new GameStatusInit())
        gameStatusManager.AddGameStatus(new GameStatusTank())
        ccl.GameStatusManager.GetInstance().ChangeStatus("GameStatusInit")
    }
}