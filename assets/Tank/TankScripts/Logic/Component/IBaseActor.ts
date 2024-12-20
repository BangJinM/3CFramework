

export class IBaseActor {
    public id: string = "";
    /** 血量 */
    public blood: number = 0;
    /** 类型 */
    public type: number = 0;
}

export class IWall extends IBaseActor {

}

export class BaseActor extends IBaseActor {
    
}