import * as cc from "cc";
const { ccclass } = cc._decorator;

// TODO 字符串提取效率问题
function GetFrameData(str: string) {
    if (str.length < 13) {
        return null;
    }
    let newStr: string = str;
    newStr = newStr.slice(2);
    newStr = newStr.slice(0, newStr.length - 2);
    let newList_0: string[] = newStr.split('},{');
    let newList_1: string[] = newList_0[0].split(",");
    let newList_2: string[] = newList_0[1].split(",");
    if (newList_1.length < 2 || newList_2.length < 2) {
        return null;
    }
    return new cc.Rect(parseInt(newList_1[0]), parseInt(newList_1[1]), parseInt(newList_2[0]), parseInt(newList_2[1]));
}

function GetSizeData(str: string) {
    if (str.length < 5) {
        return null;
    }
    let newStr: string = str;
    newStr = newStr.slice(1);
    newStr = newStr.slice(0, newStr.length - 1);
    let newList_0: string[] = newStr.split(',');
    if (newList_0.length < 2) {
        return null;
    }
    return new cc.Size(parseInt(newList_0[0]), parseInt(newList_0[1]));
}
function GetOffsetData(str: string) {
    if (str.length < 5) {
        return null;
    }
    let newStr: string = str;
    newStr = newStr.slice(1);
    newStr = newStr.slice(0, newStr.length - 1);
    let newList_0: string[] = newStr.split(',');
    if (newList_0.length < 2) {
        return null;
    }
    return new cc.Vec2(parseInt(newList_0[0]), parseInt(newList_0[1]));
}

/**
 * 格式化fName， 并获取customAtlas中的资源
 * @param customAtlas CustomAtlas
 * @param fName 子SpriteFrame名字
 */
export function GetCustomAtlasSpriteFrame(customAtlas: CustomAtlas, fName: string, ext = ".png"): cc.SpriteFrame {
    if (!customAtlas)
        return null

    if (fName.indexOf(ext) == -1)
        fName += ext

    return customAtlas.getSpriteFrame(fName)
}

@ccclass('CustomAtlas')
export class CustomAtlas extends cc.SpriteAtlas {
    public spriteFrame: cc.SpriteFrame = null

    static createWithSpritePlist(spriteFrame: cc.SpriteFrame, plist: cc.Asset): CustomAtlas {
        let customAtlas: CustomAtlas = new CustomAtlas()
        customAtlas.spriteFrame = spriteFrame
        customAtlas.spriteFrame.addRef()

        customAtlas.createSpriteFrames(plist)
        return customAtlas
    }

    private createSpriteFrames(plist: cc.Asset) {
        if (this.spriteFrame && plist) {
            let frames = plist._nativeAsset?.frames
            if (frames) {
                for (const key of Object.keys(frames)) {
                    let spriteFrame = new cc.SpriteFrame()
                    let spriteFrameInfo = frames[key]
                    spriteFrame.reset({
                        texture: this.spriteFrame.texture,
                        rect: GetFrameData(spriteFrameInfo.frame),
                        isRotate: spriteFrameInfo.rotated,
                        offset: GetOffsetData(spriteFrameInfo.offset),
                        originalSize: GetSizeData(spriteFrameInfo.sourceSize)
                    })

                    spriteFrame.addRef()
                    this.spriteFrames[key] = spriteFrame
                }
            }
        }
    }

    private cleanup() {
        if (this.spriteFrames) {
            for (const key of Object.keys(this.spriteFrames)) {
                this.spriteFrames[key].decRef()
                this.spriteFrames[key].destroy()
            }
            this.spriteFrames = null
        }

        if (this.spriteFrame) {
            this.spriteFrame.decRef()
            this.spriteFrame = null
        }
    }

    public destroy() {
        this.cleanup()
        return super.destroy()
    }

    public getTexture() {
        return this.spriteFrame.texture
    }
}