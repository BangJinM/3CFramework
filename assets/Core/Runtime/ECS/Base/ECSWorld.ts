import { Constructor } from "cc";
import { IECSWorld } from "./IECSWorld";
import { IECSSystem } from "./IECSSystem";
import { IComponent } from "./IComponent";

export class ECSWorld implements IECSWorld {
    private systems: IECSSystem[] = [];
    private entityComp: number[][] = [];
    private components: Constructor<IComponent>[] = [];

    private deleteEntities: number[] = [];

    AddSystem(system: IECSSystem): void {
        throw new Error("Method not implemented.");
    }
    RmvSystem(system: IECSSystem): void {
        throw new Error("Method not implemented.");
    }
    GetSystem<T extends IECSSystem>(systemType: new () => T): T {
        throw new Error("Method not implemented.");
    }
    CreateEntity(): number {
        let index = -1
        if (this.deleteEntities.length > 0) {
            index = this.deleteEntities.pop()
            this.entityComp[index].length = 0
        } else {
            index = this.entityComp.length
            this.entityComp.push([])
        }
        return index
    }

    RemoveEntity(entity: number): void {
        throw new Error("Method not implemented.");
    }
    AddComponent<T extends IComponent>(entity: number, component: T): void {
        throw new Error("Method not implemented.");
    }
    RemoveComponent(entity: number, componentType: any): void {
        throw new Error("Method not implemented.");
    }
    GetComponent(entity: number, componentType: any) {
        throw new Error("Method not implemented.");
    }

}