import * as cc from "cc";
import * as ccl from "ccl";

// export class IActorEntity {
//     public id: string = "";

//     constructor(id: string) {
//         this.id = id;
//     }
// }
// /** 可被攻击 */
// export interface Blood {
//     /** 血量 */
//     blood: number;

//     OnBloodChange(blood: number): void;
// }
// /** 可攻击 */
// export interface Attackable {
//     /** 攻击力 */
//     attack: number;
//     /** 攻击速度 */
//     attackSpeed: number;

//     OnFire(): void;
// }
// /** 可移动 */
// export interface Moveable {
//     speed: number;
//     moveType: MoveType;
//     direction: number;

//     /** 移动前 */
//     OnPreMove(): void;
//     /** 移动 */
//     OnMove(): void;
//     /** 移动后 */
//     OnPostMove(): void;
// }
// /** 有外观 */
// export interface IApproachable {
//     /** spriteFrames */
//     spriteFrames: string[];
//     bundleCache: ccl.BundleCache;
//     /** 改变方向 */
//     OnChangeAppr(direction: number): void;
// }
// /** 可碰撞 */
// export interface Colliderable {
//     colliderType: ColliderType
//     /** 碰撞边界 */
//     boundary: ccl.QuadBoundary;
//     OnAddCollider(): void;
//     OnRemoveCollider(): void;
//     OnUpdateCollider(x: number, y: number, width: number, height: number): void;
// }

export class IBaseActor extends ccl.ECSEntity {
    public id: number = 0;
    node: cc.Node = null

}

// export class Wall extends IBaseActor implements Colliderable, IApproachable, Blood {
//     boundary: ccl.QuadBoundary;
//     spriteFrames: string[] = [];
//     blood: number;
//     bundleCache: ccl.BundleCache;
//     colliderType: ColliderType = ColliderType.NORMAL;

//     constructor(id: string, node: cc.Node) {
//         super(id, node)
//     }

//     OnUpdateCollider(x: number, y: number, width: number, height: number) {
//     }
//     OnAddCollider(): void {
//         // TankQuadTreeManager.GetInstance<TankQuadTreeManager>().AddColliderEventComp(this)
//     }
//     OnRemoveCollider(): void {
//         // TankQuadTreeManager.GetInstance<TankQuadTreeManager>().RemoveColliderEventComp(this)
//     }
//     OnChangeAppr(direction: number): void {
//         direction = cc.clamp(direction, 0, this.spriteFrames.length)

//         let sprite: cc.Sprite = ccl.GetOrAddComponent(this.node, cc.Sprite)
//         ccl.Resources.UIUtils.LoadSpriteFrame(sprite, this.spriteFrames[direction], this.bundleCache)
//     }
//     OnBloodChange(blood: number): void {
//         let diff = this.blood - blood
//         this.blood = blood;

//         if (diff > 0) {
//         } else {
//         }
//     }

// }

// export class BrickWall extends Wall {

//     constructor(id: string, node: cc.Node) {
//         super(id, node)
//         this.spriteFrames = ["TankRes/Textures/wall"];
//         this.bundleCache = ccl.BundleManager.GetInstance<ccl.BundleManager>().GetBundle("Tank")
//     }
// }

// export class Tank extends IBaseActor implements Moveable, Blood, Attackable, IApproachable, Colliderable {
//     colliderType: ColliderType;
//     boundary: ccl.QuadBoundary;
//     OnAddCollider(): void {

//     }
//     OnRemoveCollider(): void {
//     }
//     OnUpdateCollider(x: number, y: number, width: number, height: number): void {
//     }
//     speed: number;
//     moveType: MoveType;
//     direction: number;
//     OnPreMove(): void {

//     }
//     OnMove(): void {
//         throw new Error("Method not implemented.");
//     }
//     OnPostMove(): void {
//         throw new Error("Method not implemented.");
//     }
//     blood: number;
//     OnBloodChange(blood: number): void {
//         throw new Error("Method not implemented.");
//     }
//     attack: number;
//     attackSpeed: number;
//     OnFire(): void {
//         throw new Error("Method not implemented.");
//     }
//     spriteFrames: string[];
//     bundleCache: ccl.BundleCache;
//     OnChangeAppr(direction: number): void {
//         throw new Error("Method not implemented.");
//     }


// }