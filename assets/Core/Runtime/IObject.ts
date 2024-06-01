export interface IObject {
    /**
     * 初始化
     */
    Init(): void;

    /**
     * 更新
     * @param deltaTime 自上次更新以来的时间差，单位通常为秒或毫秒
     */
    Update(deltaTime: number): void;

    /**
     * 清理
     * 释放或重置对象所占用的资源
     */
    Clean(): void;
}