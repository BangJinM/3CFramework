
export interface IComponent {
    /**
     * 当对象被添加时调用。
     */
    OnAdd();

    /**
     * 当对象移除时调用。
     */
    OnRemove();

    /**
     * 当对象进入时触发。
     */
    OnEnter();

    /**
     * 当对象离开时触发。
     */
    OnExit();

    /**
     * 每帧更新时调用，用于处理随时间变化的逻辑。
     */
    OnUpdate(deltaTime: number);
}
