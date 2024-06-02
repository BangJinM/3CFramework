import * as cc from "cc"

import * as Core from "Core"
import { LoadAssetByName, LoadBundle, LoadScene } from '../Core/Runtime/ResourceManager/ResourceUtils';
const { ccclass, property } = cc._decorator;

@ccclass('UpdatePanel')
export class UpdatePanel extends cc.Component {
    // @property(cc.Label)
    // info: cc.Label = null!;

    // @property(Label)
    // info: Label = null!;

    // @property(ProgressBar)
    // fileProgress: ProgressBar = null!;

    // @property(Label)
    // fileLabel: Label = null!;
    // @property(ProgressBar)
    // byteProgress: ProgressBar = null!;

    // @property(Label)
    // byteLabel: Label = null!;

    // @property(Node)
    // checkBtn: Node = null!;

    // @property(Node)
    // retryBtn: Node = null!;

    // @property(Node)
    // updateBtn: Node = null!;

    @property(cc.Node)
    btnStart: cc.Node = null!;

    // @property(HotUpdate)
    // hotUpdate: HotUpdate = null;
    // /** 是否需要重启 */
    // needRestart: any;

    protected onLoad(): void {
        this.btnStart.on(cc.Button.EventType.CLICK, () => {
            let promise = LoadBundle("Tank")
            promise.then(function (bundleCache) {
                Core.GameStatusManager.GetInstance().ChangeStatus("GameStatusTank")

            })
        }, this)
    }

    // AssetsEventCallback(event: native.EventAssetsManager) {
    //     switch (event.getEventCode()) {
    //         case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
    //             console.error("No local manifest file found, hot update skipped.");
    //             break;
    //         case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
    //         case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
    //             console.error("Fail to download manifest file, hot update skipped.");
    //             break;
    //         case native.EventAssetsManager.ALREADY_UP_TO_DATE:
    //             this.info.string = "Already up to date with the latest remote version.";
    //             this.btnStart.active = true;
    //             break;
    //         case native.EventAssetsManager.NEW_VERSION_FOUND:
    //             this.info.string = 'New version found, please try to update. (' + Math.ceil(event.getAssetsManagerEx().getTotalBytes() / 1024) + 'kb)';
    //             this.checkBtn.active = false;
    //             this.fileProgress.progress = 0;
    //             this.byteProgress.progress = 0;
    //             break;
    //         case native.EventAssetsManager.UPDATE_PROGRESSION:
    //             this.byteProgress.progress = event.getPercent();
    //             this.fileProgress.progress = event.getPercentByFile();

    //             this.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
    //             this.byteLabel.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
    //             console.log(this.fileLabel.string, this.byteLabel.string);
    //             var msg = event.getMessage();
    //             if (msg) {
    //                 this.info.string = 'Updated file: ' + msg;
    //                 // cc.log(event.getPercent()/100 + '% : ' + msg);
    //             }
    //             break;
    //         case native.EventAssetsManager.UPDATE_FINISHED:
    //             this.info.string = 'Update finished. ' + event.getMessage();
    //             break;
    //         case native.EventAssetsManager.UPDATE_FAILED:
    //             this.info.string = 'Update failed. ' + event.getMessage();
    //             this.retryBtn.active = true;
    //             this.checkBtn.active = false;
    //             break;
    //         case native.EventAssetsManager.ERROR_UPDATING:
    //             this.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
    //             break;
    //         case native.EventAssetsManager.ERROR_DECOMPRESS:
    //             this.info.string = event.getMessage();
    //             break;
    //     }
    // }

    // OnSuccess(status) {
    //     if (status == 1) {
    //         game.restart()
    //         return
    //     }

    //     if (status == 2) {
    //         this.btnStart.active = true
    //     }
    // }
};
