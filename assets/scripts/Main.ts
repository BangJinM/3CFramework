import * as cc from "cc";
import { Global } from "./common/Global";
import { GameStatusManager } from "./game_state/GameStatusManager";
const { ccclass } = cc._decorator;

@ccclass("Main")
export class Main extends cc.Component {
    protected onLoad(): void {
        GameStatusManager.GetInstance().Init();
        GameStatusManager.GetInstance().ChangeStatus("GameInitStatus")
    }
}