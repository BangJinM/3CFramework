import * as cc from "cc";
import * as ccl from "ccl";
import { NotifyID } from "../TankGlobalConfig";
import { TankMain } from "../TankMain";

@ccl.set_manager_instance("Tank")
export class TankGameLogic extends ccl.ISingleton {
    level = 0

    Init(): void {
        let subjectManager: ccl.SubjectManager = ccl.SubjectManager.GetInstance()
        subjectManager.AddObserver(NotifyID.TankGameStart, this.RecBegin.bind(this))
    }

    RecBegin(data: ccl.INoticeData): void {
        this.LevelUp()
    }

    LevelUp() {
        this.level++

        ccl.Resources.Loader.LoadAsset(`TankRes/maps/${this.level.toString()}`, cc.TextAsset, ccl.BundleManager.GetInstance().GetBundle("Tank"), (iResource: ccl.IResource) => {
            if (!iResource.oriAsset) return
            let text = (iResource.oriAsset as cc.TextAsset).text
            let index = 0
            for (let x = 0; x < 26; x++) {
                for (let y = 0; y < 26; y++) {

                    let spriteName = ""
                    if (text[index] == "3") {
                        spriteName = "walls"
                    } else if (text[index] == "5") {
                        spriteName == "steels"
                        // } else if (text[index] == "") {
                        //     spriteName == "walls"
                    } else if (text[index] == "1") {
                        spriteName == "grass"
                    } else if (text[index] == "4") {
                        spriteName == "water"
                    }
                    if (spriteName) {
                        let node = new cc.Node()
                        let sprite = node.addComponent(cc.Sprite)
                        ccl.Resources.UIUtils.LoadSpriteFrame(sprite, `TankRes/maps/landform/${spriteName}`, ccl.BundleManager.GetInstance().GetBundle("Tank"))
                        let tankMain: TankMain = TankMain.GetInstance()
                        tankMain.mapNode.addChild(node)

                        node.layer = cc.Layers.Enum.ALL

                        node.setPosition((y - 16) * 32, (16 - x) * 32)
                    }
                    index++
                }
            }
        })
    }

    ActorDie() {

    }
}