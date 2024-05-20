import * as cc from "cc";

@cc._decorator.ccclass("HotUpdate")
export class HotUpdate {
    /**
     * manifest地址
     */
    @cc._decorator.property(String)
    manifestUrl: string = "./project.manifest";
    /**
     * 是否在更新
     */
    @cc._decorator.property(Boolean)
    private updating = false;
    /**
     * 是否重试
     */
    @cc._decorator.property(Boolean)
    private canRetry = false;
    /**
     * 保存地址
     */
    @cc._decorator.property(String)
    private storagePath: string = "";
    /**
     * 热更管理器
     */
    private assetsManager: cc.native.AssetsManager = null!;
    /** 
     * 回调 
     */
    @cc._decorator.property(Function)
    private eventCallback: Function = null

    constructor(manifestUrl: string, storagePath: string, callback?: Function) {
        this.manifestUrl = manifestUrl
        this.storagePath = storagePath
        this.eventCallback = callback
    }

    AssetsEventCallback(event: cc.native.EventAssetsManager) {
        switch (event.getEventCode()) {
            case cc.native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                break;
            case cc.native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case cc.native.EventAssetsManager.ERROR_PARSE_MANIFEST:
                break;
            case cc.native.EventAssetsManager.ALREADY_UP_TO_DATE:
                break;
            case cc.native.EventAssetsManager.NEW_VERSION_FOUND:
                break;
            case cc.native.EventAssetsManager.UPDATE_PROGRESSION:
                break;
            case cc.native.EventAssetsManager.UPDATE_FINISHED:
                break;
            case cc.native.EventAssetsManager.UPDATE_FAILED:
                this.updating = false;
                this.canRetry = true;
                break;
            case cc.native.EventAssetsManager.ERROR_UPDATING:
                break;
            case cc.native.EventAssetsManager.ERROR_DECOMPRESS:
                break;
        }

        this.eventCallback?.call(event)
    }

    updateCb(event: any) {
        this.assetsManager.setEventCallback(null!);
        // Prepend the manifest's search path
        var searchPaths = cc.native.fileUtils.getSearchPaths();
        var newPaths = this.assetsManager.getLocalManifest().getSearchPaths();
        console.log(JSON.stringify(newPaths));
        //判断newPaths是否已经存在于searchPaths顶部
        let needChange = false
        for (let i = 0; i < newPaths.length; i++) {
            if (!searchPaths[i] || newPaths[i] != searchPaths[i]) {
                needChange = true
                break
            }
        }
        if (needChange) {
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            Array.prototype.unshift.apply(searchPaths, newPaths);
            cc.native.fileUtils.setSearchPaths(searchPaths);
        }
        localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        // restart game.
        setTimeout(() => {
            cc.game.restart();
        }, 500)

    }

    //仅下载之前失败的资源
    Retry() {
        if (!this.updating && this.canRetry) {
            this.canRetry = false;
            console.log('Retry failed Assets...')
            this.assetsManager.downloadFailedAssets();
        }
    }

    Check() {
        if (this.updating) {
            console.log('Checking or updating ...')
            return;
        }
        if (this.assetsManager.getState() === cc.native.AssetsManager.State.UNINITED) {
            this.assetsManager.loadLocalManifest(this.manifestUrl);
        }
        if (!this.assetsManager.getLocalManifest() || !this.assetsManager.getLocalManifest().isLoaded()) {
            console.error('Failed to load local manifest ...');
            return;
        }

        this.assetsManager.setEventCallback(this.AssetsEventCallback.bind(this));

        this.assetsManager.checkUpdate();
        this.updating = true;
    }

    Update() {
        if (this.assetsManager && !this.updating) {
            if (this.assetsManager.getState() === cc.native.AssetsManager.State.UNINITED) {
                this.assetsManager.loadLocalManifest(this.manifestUrl);
            }

            this.assetsManager.update();
            this.updating = true;
        }
    }

    // use this for initialization
    Init() {
        // Hot update is only available in Native build
        if (!cc.native) {
            return;
        }

        // Init with empty manifest url for testing custom manifest
        this.assetsManager = new cc.native.AssetsManager('', this.storagePath);

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this.assetsManager.setVerifyCallback(function (path: string, asset: any) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                return true;
            }
            else {
                return true;
            }
        });
    }
}
