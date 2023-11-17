export interface ISingleton {
    /** 单例初始化 */
    Init();
    /** 单例每帧更新 */
    Update(deltaTime: number);
    /** 单例清理数据 */
    Clean();
}