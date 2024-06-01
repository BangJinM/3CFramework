/**
 * 定义了ECSSystem接口，用于实体组件系统中系统的基本行为。
 * 包含实体添加、移除及更新时的回调方法，以及实体进出区域的处理方法。
 */

export interface IECSSystem {

    /**
     * 当实体被添加至系统时调用。
     * @param entity 被添加的实体的唯一标识符。
     */
    OnEntityAdd(entity: number): void;

    /**
     * 当实体从系统中移除时调用。
     * @param entity 被移除的实体的唯一标识符。
     */
    OnEntityRemove(entity: number): void;

    /**
     * 当实体进入时触发。
     * @param entity 进入的实体的唯一标识符。
     */
    OnEntityEnter(entity: number): void;

    /**
     * 当实体离开时触发。
     * @param entity 离开的实体的唯一标识符。
     */
    OnEntityExit(entity: number): void;

    /**
     * 每帧更新时调用，用于处理实体的状态更新。
     * @param entity 需要更新的实体的唯一标识符。
     */
    OnUpdate(entity: number): void;
}