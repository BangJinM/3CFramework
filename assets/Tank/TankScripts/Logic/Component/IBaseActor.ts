import * as cc from "cc";
import * as ccl from "ccl";

export class IBaseActor extends ccl.ECSEntity {
    node: cc.Node = null

    constructor(id: number, node: cc.Node) {
        super(id);
        this.node = node;
    }
}
