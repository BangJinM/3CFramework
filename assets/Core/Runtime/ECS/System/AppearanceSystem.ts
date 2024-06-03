import * as cc from "cc"
import { IECSSystem } from "../Base/IECSSystem";

export class AppearanceSystem implements IECSSystem {
    /** 根节点 */
    rootNode: cc.Node = null

    constructor(rootNode: cc.Node) {
        this.rootNode = rootNode
    }

    OnEntityAdd(entity: number): void {
        throw new Error("Method not implemented.");
    }
    OnEntityRemove(entity: number): void {
        throw new Error("Method not implemented.");
    }
    OnEntityEnter(entity: number): void {
        throw new Error("Method not implemented.");
    }
    OnEntityExit(entity: number): void {
        throw new Error("Method not implemented.");
    }
    OnUpdate(entity: number): void {
        throw new Error("Method not implemented.");
    }

}