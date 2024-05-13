
import * as cc from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property } = cc._decorator;

@ccclass('UpdatePanel')
export class UpdatePanel extends cc.Component {
    @property(cc.Label)
    info: cc.Label = null!;

    @property(cc.ProgressBar)
    fileProgress: cc.ProgressBar = null!;

    @property(cc.Label)
    fileLabel: cc.Label = null!;
    @property(cc.ProgressBar)
    byteProgress: cc.ProgressBar = null!;

    @property(cc.Label)
    byteLabel: cc.Label = null!;

    @property(cc.Node)
    checkBtn: cc.Node = null!;

    @property(cc.Node)
    retryBtn: cc.Node = null!;

    @property(cc.Node)
    updateBtn: cc.Node = null!;

    @property(cc.Node)
    btnStart: cc.Node = null

    @property(cc.Node)
    updateUI: cc.Node = null!;

    /** 是否需要重启 */
    needRestart: boolean = false
    manifestUrl: string = ""

    private updating = false;
    private canRetry = false;
    private storagePath = '';
    private assetsManager = null!;

    checkCb(event: any) {
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
                this.info.string = "Already up to date with the latest remote version.";
                this.btnStart.active = true;
                break;
            case cc.native.EventAssetsManager.NEW_VERSION_FOUND:
                this.info.string = 'New version found, please try to update. (' + Math.ceil(this.assetsManager.getTotalBytes() / 1024) + 'kb)';
                this.checkBtn.active = false;
                this.updateUI.active = true;
                this.fileProgress.progress = 0;
                this.byteProgress.progress = 0;
                break;
            default:
                return;
        }


        this.assetsManager.setEventCallback(null!);
        this.updating = false;
    }

    updateCb(event: any) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case cc.native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.info.string = 'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            case cc.native.EventAssetsManager.UPDATE_PROGRESSION:
                this.byteProgress.progress = event.getPercent();
                this.fileProgress.progress = event.getPercentByFile();

                this.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                this.byteLabel.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                console.log(this.fileLabel.string, this.byteLabel.string);
                var msg = event.getMessage();
                if (msg) {
                    this.info.string = 'Updated file: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            case cc.native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case cc.native.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.info.string = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            case cc.native.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.info.string = 'Already up to date with the latest remote version.';
                failed = true;
                break;
            case cc.native.EventAssetsManager.UPDATE_FINISHED:
                this.info.string = 'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            case cc.native.EventAssetsManager.UPDATE_FAILED:
                this.info.string = 'Update failed. ' + event.getMessage();
                this.retryBtn.active = true;
                this.updating = false;
                this.canRetry = true;
                this.updateUI.active = true;
                this.checkBtn.active = false;
                break;
            case cc.native.EventAssetsManager.ERROR_UPDATING:
                this.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case cc.native.EventAssetsManager.ERROR_DECOMPRESS:
                this.info.string = event.getMessage();
                break;
            default:
                break;
        }

        //无需错误处理和失败重试，取消事件回调
        if (failed) {
            this.assetsManager.setEventCallback(null!);
            this.updating = false;
        }

        if (needRestart) {
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
    }

    //仅下载之前失败的资源
    retry() {
        if (!this.updating && this.canRetry) {
            this.retryBtn.active = false;
            this.canRetry = false;
            console.log('Retry failed Assets...')
            this.assetsManager.downloadFailedAssets();
        }
    }

    checkUpdate() {
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

        this.assetsManager.setEventCallback(this.checkCb.bind(this));

        this.assetsManager.checkUpdate();
        this.updating = true;
    }

    hotUpdate() {
        if (this.assetsManager && !this.updating) {
            this.assetsManager.setEventCallback(this.updateCb.bind(this));

            if (this.assetsManager.getState() === cc.native.AssetsManager.State.UNINITED) {
                this.assetsManager.loadLocalManifest(this.manifestUrl);
            }

            this.assetsManager.update();
            this.updateBtn.active = false;
            this.updating = true;
        }
    }

    // use this for initialization
    onLoad() {
        // Hot update is only available in Native build
        this.btnStart.on(cc.Node.EventType.TOUCH_END, (event: cc.EventTouch) => {
            cc.director.loadScene("game");
        })

        if (!cc.native || EDITOR) {
            this.updateUI.active = false;
            this.btnStart.active = true
            return;
        }
        this.updateUI.active = false;
        this.btnStart.active = false;

        this.storagePath = ((cc.native.fileUtils ? cc.native.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        console.log('Storage path for remote asset : ' + this.storagePath);

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
                this.info.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                this.info.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        }.bind(this));

        this.info.string = 'Hot update is ready, please check or directly update.';
        this.fileProgress.progress = 0;
        this.byteProgress.progress = 0;

        this.checkUpdate()
    }

    onDestroy() {
    }
}

