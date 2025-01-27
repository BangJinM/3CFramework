import * as cc from "cc";
import * as ccl from "ccl";

/**
 * 方向
 */
export enum DirectionType {
    /**
     * 上
     */
    NORTH,
    /**
     * 下
     */
    SOUTH,
    /**
     * 左
     */
    EAST,
    /**
     * 右
     */
    WEST,
}

export class Direction {
    static north: Readonly<cc.Vec3> = new cc.Vec3(0, 1, 0)
    static south: Readonly<cc.Vec3> = new cc.Vec3(0, -1, 0)
    static east: Readonly<cc.Vec3> = new cc.Vec3(1, 0, 0)
    static west: Readonly<cc.Vec3> = new cc.Vec3(-1, 0, 0)

    static GetDirection(direction: DirectionType) {
        switch (direction) {
            case DirectionType.NORTH:
                return Direction.north
            case DirectionType.SOUTH:
                return Direction.south
            case DirectionType.EAST:
                return Direction.east
            case DirectionType.WEST:
                return Direction.west
        }
    }
}



export class IBaseActor extends ccl.ECSEntity {
    node: cc.Node = null
    direction: DirectionType = DirectionType.NORTH

    setDirection(direction: DirectionType) {
        this.direction = direction

        let angle = 0
        switch (direction) {
            case DirectionType.NORTH:
                angle = 0
                break
            case DirectionType.SOUTH:
                angle = 180
                break
            case DirectionType.EAST:
                angle = -90
                break
            case DirectionType.WEST:
                angle = 90
                break
        }

        this.node.angle = angle
    }

    constructor(id: number, node: cc.Node, spriteFrameName: string, bundleCache: ccl.BundleCache) {
        super(id);
        this.node = node;

        if (spriteFrameName && bundleCache) {
            let sprite: cc.Sprite = ccl.GetOrAddComponent(this.node, cc.Sprite)
            ccl.Resources.UIUtils.LoadSpriteFrame(sprite, spriteFrameName, bundleCache)
        }
    }
}
