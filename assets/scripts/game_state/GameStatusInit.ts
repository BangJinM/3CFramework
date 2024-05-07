import { Global } from "../common/Global";
import { GameStatus } from "./GameStatus";

export class GameStatusInit extends GameStatus {
    constructor() {
        super("GameInitStatus")
        console.log("GameInit");
    }

    OnEnter() {
        Global.Init()
    }
}