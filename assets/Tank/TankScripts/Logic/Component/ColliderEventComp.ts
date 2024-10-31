import * as cc from "cc";
import * as ccl from "ccl";
import { TankGameLogic } from "../TankGameLogic";

@cc._decorator.ccclass("ColliderEventComp")
@cc._decorator.requireComponent(cc.RigidBody2D)
@cc._decorator.requireComponent(cc.BoxCollider2D)
export class ColliderEventComp extends cc.Component {
    boxSize: cc.Size = new cc.Size(32, 32)

    protected onLoad(): void {
        let boxCollider = ccl.GetOrAddComponent(this.node, cc.BoxCollider2D)
        boxCollider.size = this.boxSize

        let rigidComp = ccl.GetOrAddComponent(this.node, cc.RigidBody2D)
        rigidComp.enabledContactListener = true
    }

    start() {
        // 注册单个碰撞体的回调函数
        let collider = this.node.getComponent(cc.Collider2D);
        if (collider) {
            collider.on(cc.Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(cc.Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }
    onBeginContact(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        ccl.Logger.info('onBeginContact');
        (TankGameLogic.GetInstance() as TankGameLogic).OnBeginContact(selfCollider, otherCollider, contact)
    }
    onEndContact(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        ccl.Logger.info('onEndContact');
    }
    onPreSolve(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        // 每次将要处理碰撞体接触逻辑时被调用
        ccl.Logger.info('onPreSolve');
    }
    onPostSolve(selfCollider: cc.Collider2D, otherCollider: cc.Collider2D, contact: cc.IPhysics2DContact | null) {
        // 每次处理完碰撞体接触逻辑时被调用
        ccl.Logger.info('onPostSolve');
    }
}