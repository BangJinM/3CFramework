import { IECSSystem } from "./IECSSystem";
import { IComponent } from "./IComponent";

/**
 * 定义了ECSWorld接口，代表一个实体组件系统的世界，管理所有实体和系统。
 */

export interface IECSWorld {

    /**
     * 向世界中添加一个系统。
     * @param system 要添加的系统，实现IECSSystem接口。
     */
    AddSystem(system: IECSSystem): void

    /**
     * 从世界中删除一个系统。
     * @param system 要删除的系统，实现IECSSystem接口。
     */
    RmvSystem(system: IECSSystem): void

    /**
     * 根据类型获取系统实例。
     * @param systemType 要获取的系统类型，需要继承自IECSSystem。
     * @returns 返回指定类型的系统实例。
     */
    GetSystem<T extends IECSSystem>(systemType: new () => T): T

    /**
     * 在世界中创建一个新的实体。
     * @returns 新创建的实体的唯一标识符。
     */
    CreateEntity(): number

    /**
     * 从世界中删除一个实体。
     * @param entity 要删除的实体的唯一标识符。
     */
    RemoveEntity(entity: number): void

    /**
     * 给指定实体添加一个组件。
     * @param entity 要添加组件的实体的唯一标识符。
     * @param component 要添加的组件实例，实现IComponent接口。
     */
    AddComponent<T extends IComponent>(entity: number, component: T): void

    /**
     * 从指定实体上移除一个组件。
     * @param entity 要移除组件的实体的唯一标识符。
     * @param componentType 要移除的组件类型。
     */
    RemoveComponent(entity: number, componentType: any): void

    /**
     * 获取指定实体上的组件。
     * @param entity 要获取组件的实体的唯一标识符。
     * @param componentType 要获取的组件类型。
     * @returns 返回对应类型的组件实例，如果没有找到则返回undefined。
     */
    GetComponent(entity: number, componentType: any): any
}