import * as cc from "cc";
import * as ccl from "ccl";

export class IBaseActor extends ccl.ECSEntity {
    node: cc.Node = null
    direction: cc.Vec3 = new cc.Vec3(0, 1, 0)

    constructor(id: number, node: cc.Node) {
        super(id);
        this.node = node;
    }
}
