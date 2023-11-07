import * as cc from "cc";
import { AssetType, LoadAssetCompleteFunc } from "./BaseResourcesManager";

export class AssetCache {
    url: string = ""
    type: AssetType = null
    data: cc.Asset = null
    completeFuncs: LoadAssetCompleteFunc[]
}

export class BundleCache {
    bundle: string = "";
    completeFuncs: ((error: Error | null) => void)[]
}