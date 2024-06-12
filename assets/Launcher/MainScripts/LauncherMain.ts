import * as cc from "cc";

import * as ccl from "ccl";
import { GameStatusInit } from "./game_state/GameStatusInit";
import { GameStatusTank } from "./game_state/GameStatusTank";
import { Global } from "./common/Global";

const { ccclass, property } = cc._decorator;

@ccclass("LauncherMain")
export class LauncherMain extends cc.Component {
    protected onLoad(): void {
        ccl.Logger.GetInstance().Init()

        ccl.Logger.info("LauncherMain")
        Global.Init()

        let gameStatusManager: ccl.GameStatusManager = ccl.GameStatusManager.GetInstance();
        gameStatusManager.Init()
        gameStatusManager.AddGameStatus(new GameStatusInit())
        gameStatusManager.AddGameStatus(new GameStatusTank())
        ccl.GameStatusManager.GetInstance().ChangeStatus("GameStatusInit")

        let apprComp = new ccl.SpriteApprComp()
        apprComp.spriteName = "1111"
    }
}