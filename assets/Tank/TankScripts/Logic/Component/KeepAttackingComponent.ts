import * as cc from "cc";
import { TankGameLogic } from "../TankGameLogic";

export class KeepAttackingBuff extends cc.Component {
    interval: number = 3;
    bulletType: number = 0;
    curTime: number = 0

    protected update(dt: number): void {
        this.curTime += dt
        if (this.curTime < this.interval) {
            return
        }

        this.curTime %= this.interval
        let tankGameLogic = (TankGameLogic.GetInstance() as TankGameLogic)
        tankGameLogic.OnFire(this.bulletType, this.node.getPosition().clone(), new cc.Vec3(0, 1, 0))
    }
}