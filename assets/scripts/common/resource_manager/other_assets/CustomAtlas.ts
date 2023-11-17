import { Asset, ImageAsset, Rect, Size, SpriteAtlas, SpriteFrame, Vec2, _decorator } from "cc";
import { AssetCache } from "../ResourcesDefines";
const { ccclass } = _decorator;

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
    return new Rect(parseInt(newList_1[0]), parseInt(newList_1[1]), parseInt(newList_2[0]), parseInt(newList_2[1]));
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
    return new Size(parseInt(newList_0[0]), parseInt(newList_0[1]));
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
    return new Vec2(parseInt(newList_0[0]), parseInt(newList_0[1]));
}

@ccclass('CustomAtlas')
export class CustomAtlas extends SpriteAtlas {
    public spriteFrame: SpriteFrame = null
    public imageAsset: AssetCache = null
    public plist: AssetCache = null

    static createWithSpritePlist(imageAsset: AssetCache, plist: AssetCache): CustomAtlas {
        let customAtlas: CustomAtlas = new CustomAtlas()
        customAtlas.spriteFrame = SpriteFrame.createWithImage(imageAsset.data as ImageAsset)
        customAtlas.plist = plist;
        customAtlas.imageAsset = imageAsset

        customAtlas.createSpriteFrames()

        customAtlas.plist.AddRef()
        customAtlas.imageAsset.AddRef()
        
        customAtlas.spriteFrame.addRef()

        return customAtlas
    }

    private createSpriteFrames() {
        if (this.spriteFrame && this.plist) {
            let frames = this.plist.data._nativeAsset?.frames
            if (frames) {
                for (const key of Object.keys(frames)) {
                    let spriteFrame = new SpriteFrame()
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
            }
            this.spriteFrames = null
        }

        if (this.spriteFrame) {
            this.spriteFrame.decRef()
            this.spriteFrame = null
        }

        if (this.plist) {
            this.plist.DecRef()
            this.plist = null
        }

        if (this.imageAsset) {
            this.imageAsset.DecRef()
            this.imageAsset = null
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