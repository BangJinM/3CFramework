import * as cc from "cc";
import { Global } from "./common/Global";
const { ccclass } = cc._decorator;

@ccclass("Main")
export class Main extends cc.Component {
    protected onLoad(): void {
        this.initUINode()
    }

    async initUINode() {
       await Global.LoadingInit()
    }
}