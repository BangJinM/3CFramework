import * as cc from "cc";

export enum VersionEnum {

}

/**
 * 热更新数据
 */
export class HotUpdateData {
    /**
     * 本地版本地址
     */
    localManifestUrl: string = "";
    /**
     * 保存地址
     */
    storagePath: string = "";
    /**
     * 一些回调
     */
    delegate: (arg: cc.native.EventAssetsManager) => void;
}

export class HotUpdateManager {
    private update: boolean = false
    private assetsManager: cc.native.AssetsManager = null

    constructor(data: HotUpdateData) {
        this.assetsManager = new cc.native.AssetsManager(data.localManifestUrl, data.storagePath)
        this.assetsManager.setEventCallback(this.EventCallback.bind(this))
    }

    /**
     * 格式 1.0.0.1
     * 第一个为引擎版本
     * 第三个数字表示大版本
     * 第四个数字表示小版本
     * @returns -1 无需更新， 0 需要更新， 1 需要强更
     */
    public versionCompareHandle(versionA: string, versionB: string): number {
        let vA = versionA.split('.');
        let vB = versionB.split('.');

        if (!vA || !vB || vA.length != 4 || vB.length != 4) return -1

        if (Number(vA[0]) != Number(vB[0])) return -1
        if (Number(vA[2]) != Number(vB[2])) return 1
        if (Number(vA[3]) != Number(vB[3])) return 0

        return -1
    }

    /**
     * 检查更新
     */
    CheckUpdate(): boolean {
        if (!cc.native)
            return false

        if (!this.assetsManager.getLocalManifest() || !this.assetsManager.getLocalManifest().isLoaded()) {
            console.error('Failed to load local manifest ...');
            return;
        }

        this.assetsManager.checkUpdate()
    }

    BeginUpdate() {

    }

    Retry() {

    }

    EventCallback(event: cc.native.EventAssetsManager) {
        console.log('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case cc.native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.error("No local manifest file found, hot update skipped.");
                break;
            case cc.native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case cc.native.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.error("Fail to download manifest file, hot update skipped.");
                break;
            case cc.native.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("Already up to date with the latest remote version.")
                break;
            case cc.native.EventAssetsManager.NEW_VERSION_FOUND:
                console.log('New version found, please try to update. (' + Math.ceil(this.assetsManager.getTotalBytes() / 1024) + 'kb)')
                break;
            case cc.native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                break;
            case cc.native.EventAssetsManager.UPDATE_PROGRESSION:
                break;
            case cc.native.EventAssetsManager.UPDATE_FINISHED:
                break;
            case cc.native.EventAssetsManager.UPDATE_FAILED:
                break;
            case cc.native.EventAssetsManager.ERROR_UPDATING:
                break;
            case cc.native.EventAssetsManager.ERROR_DECOMPRESS:
                break;
            default:
                break
        }


    }
}