import { ISingleton } from "./ISingleton";

/** 持久化存储 */
export class LocalStorageManager implements ISingleton {
    private KEY_CONFIG: string = 'local_data';

    /** 玩家数据 */
    private userData = {}
    /** 玩家唯一ID，为空则为全局数据 */
    private userKey = ""
    /** 时间 */
    deltaTime = 0

    userMark = false

    Init() {
        this.Clean()
    }

    Update(deltaTime: number) {
    }
    Clean() {
        // this.SaveUserData()

        this.userData = {}
        this.userKey = ""
        this.userMark = false
    }

    SetKey(userKey: string) {
        this.userKey = userKey
        let userData = this.GetUserData() || "{}"
        this.userData = JSON.parse(userData)
    }

    SetUserData(key, value) {
        this.userData[key] = value
        // this.userMark = true
        this.SaveUserData()
    }

    SaveUserData() {
        var str = JSON.stringify(this.userData)
        this.save(this.KEY_CONFIG + this.userKey, str)
        this.userMark = false
    }

    GetUserData(): string {
        return localStorage.getItem(this.KEY_CONFIG + this.userKey) || ""
    }

    private save(key: string, value) {
        localStorage.setItem(key, value)
    }

    GetUserDataByKey(key) {
        return this.userData[key]
    }

    GetStringForKey(key: string, defaultValue = "") {
        return this.GetUserDataByKey(key) || defaultValue
    }

    GetIntegerForKey(key, defaultValue = 0) {
        let result = this.GetUserDataByKey(key)
        if (!result)
            return defaultValue

        return Number(result)
    }

    GetJsonForKey(key) {
        let jsonStr = this.GetStringForKey(key, "{}")
        return JSON.parse(jsonStr)
    }
}