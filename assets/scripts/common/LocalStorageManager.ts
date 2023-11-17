import * as cc from "cc";
import { ISingleton } from "./ISingleton";

export class LocalStorageManager implements ISingleton {
    private KEY_CONFIG: string = 'template';
    private KEY_GLOBAL_CONFIG: string = 'template_global';

    /** 全局数据 */
    private globalData = {}
    /** 玩家数据 */
    private userData = {}
    /** 玩家唯一ID */
    private userKey = ""
    /** 时间 */
    deltaTime = 0

    globalMark = false
    userMark = false

    Init() {
        this.Clean()
    }

    Update(deltaTime: number) {
        this.deltaTime += deltaTime
        if (this.deltaTime > 10) {
            this.deltaTime = 0

            if (this.globalMark) {
                this.SaveGlobalData()
            }
            if (this.userMark) {
                this.SaveUserData()
            }
        }
    }
    Clean() {
        this.globalData = {}
        this.userData = {}
        this.userKey = ""
        this.globalMark = false
        this.userMark = false
    }

    SetUserID(userKey: string) {
        this.userKey = userKey
    }
    /** 玩家数据，必须得等玩家初始化完成后才能使用 */
    SetUserData(key: string, value: string) {
        if (!this.userKey)
            return
        this.userData[key] = value
        this.userMark = true
    }
    /** 玩家数据，必须得等玩家初始化完成后才能使用 */
    GetUserData(key: string) {
        if (!this.userKey)
            return ""

        return this.userData[key] || ""
    }

    /** 全局数据，此设备下的所有账号公用 */
    SetGlobalData(key, value) {
        this.globalData[key] = value
        this.globalMark = true
    }
    /** 全局数据，此设备下的所有账号公用 */
    GetGlobalData(key: string) {
        return this.globalData[key] || ""
    }

    SaveUserData() {
        if (!this.userKey)
            return
        var str = JSON.stringify(this.userData)
        this.save(this.userKey + this.KEY_CONFIG, str)
        this.userMark = false
    }
    SaveGlobalData() {
        var str = JSON.stringify(this.globalData)
        this.save(this.KEY_GLOBAL_CONFIG, str)
        this.globalMark = false
    }
    
    /** 保存数据 */
    private save(key: string, value: string) {
        if (cc.sys.isNative) {
            cc.native.fileUtils.writeStringToFile(value, this.getConfigPath() + "/" + key);
        } else {
            localStorage.setItem(key, value)
        }
    }

    /**
     * 获取配置文件路径
     * @returns 获取配置文件路径
     */
    private getConfigPath() {
        let platform: any = cc.sys.platform;

        if (platform === cc.sys.OS.WINDOWS)
            return "src/conf";
        else if (platform === cc.sys.OS.LINUX)
            return "./conf";
        else
            if (cc.sys.isNative) {
                return cc.native.fileUtils.getWritablePath() + "conf"
            } else {
                return "src/conf";
            }
    }
}