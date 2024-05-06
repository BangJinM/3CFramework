import * as cc from "cc"
import { AStarNode } from "./AStarNode"
import { HeapSortArray } from "../data_structure/HeapSortArray"
import { ISceneGridManager } from "./ISceneGridManager"

let BIAS_VALUE = 14
let LINE_VALUE = 10
let around = [
    [1, 0, LINE_VALUE], // right
    [0, 1, LINE_VALUE], // bottom
    [-1, 0, LINE_VALUE], // left
    [0, -1, LINE_VALUE], // top
    [1, -1, BIAS_VALUE], // right up    
    [1, 1, BIAS_VALUE], // right bottom
    [-1, 1, BIAS_VALUE], // left bottom
    [-1, -1, BIAS_VALUE], // left top    
]

export class FindAStar {
    sceneGridManager: ISceneGridManager
    /** 排序 */
    sortArray: HeapSortArray = new HeapSortArray()
    gridNodes: Map<number, AStarNode> = new Map()

    constructor(sceneGridManager: ISceneGridManager) {
        this.sceneGridManager = sceneGridManager
    }

    Clear() {
        this.sortArray.clear()
        this.gridNodes.clear()
    }

    FindPath(beginPoint: cc.Vec2, endPoint: cc.Vec2) {
        let points = []
        if (beginPoint.equals(endPoint)) {
            return points
        }

        if (this.sceneGridManager.CheckObstacle(endPoint.x, endPoint.y))
            return points

        let endGrid = this.GetGrid(endPoint.x, endPoint.y)
        let currentNode = this.GetGrid(beginPoint.x, beginPoint.y)
        this.NoFound(currentNode, beginPoint.x, beginPoint.y, endPoint.x, endPoint.y, 0, null)

        let [x, y] = [0, 0]
        let [offsetX, offsetY, tempPower] = [0, 0, 0]
        let neighborNode = null

        let time = 0
        while (this.sortArray.length() > 0) {
            currentNode = this.sortArray.getMinGrid() as AStarNode
            if (!currentNode)
                break
            currentNode.status = 2
            if (endGrid.status == 2)
                break
            for ([offsetX, offsetY, tempPower] of around) {
                x = currentNode.mapX + offsetX
                y = currentNode.mapY + offsetY

                if (!this.sceneGridManager.CheckObstacle(x, y)) {
                    neighborNode = this.GetGrid(x, y)
                    if (neighborNode.status != 2) {
                        time++
                        if (neighborNode.status == 1) {
                            this.Found(neighborNode, currentNode, tempPower)
                        }
                        else {
                            this.NoFound(neighborNode, x, y, endPoint.x, endPoint.y, tempPower, currentNode)
                        }
                    }
                }
            }
        }
        console.log(`time = ${time}`)
        points.push({ x: currentNode.mapX, y: currentNode.mapY })
        while (currentNode.preGridNode) {
            points.push({ x: currentNode.mapX, y: currentNode.mapY })
            currentNode = currentNode.preGridNode
        }
        return points
    }

    Found(gridNode: AStarNode, preNode: AStarNode, tempPower: number) {
        let tempG = preNode.g + tempPower
        if (gridNode.g > tempG) {
            gridNode.g = tempG
            gridNode.f = gridNode.g + gridNode.h
            gridNode.preGridNode = preNode
            this.sortArray.updateNode(gridNode)
        }
    }

    GetGrid(x: number, y: number): AStarNode {
        let gridNode = this.gridNodes.get(((x << 16) + y))
        if (!gridNode) {
            gridNode = new AStarNode(x, y)
            this.gridNodes.set(gridNode.key, gridNode)
        }
        return gridNode
    }

    NoFound(gridNode: AStarNode, x: number, y: number, endX: number, endY: number, tempPower: number, preNode: AStarNode) {
        gridNode.g = preNode ? (preNode.g + tempPower) : 0
        gridNode.h = this.cost(x, y, endX, endY)
        gridNode.f = gridNode.g + gridNode.h
        gridNode.preGridNode = preNode
        gridNode.status = 1
        this.sortArray.add(gridNode)
    }

    /** 从A到B的消耗 */
    private cost(x: number, y: number, endX: number, endY: number) {
        return (Math.abs(x - endX) + Math.abs(y - endY)) * LINE_VALUE
    }
}