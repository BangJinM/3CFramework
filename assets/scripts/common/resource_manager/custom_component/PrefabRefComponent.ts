import { _decorator, Component, Node, isValid } from 'cc';
import Global from '../../config/Global';
import { uiUtil } from '../../uicommon/uiUtil';
import { Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * Author：SaceJ
 * Time：Thu May 04 2023 14:24:14 GMT+0800 (中国标准时间)
 * Annotation：引用计数组件。prefab默认添加
 * db://assets/scripts/game/view/PrefabRefComponent.ts
 *
 */

@ccclass('PrefabRefComponent')
export class PrefabRefComponent extends Component {
    private prefab: Prefab = null

    SetPrefab(prefab: Prefab) {
        if (this.prefab && this.prefab["__asset_cache__"]) {
            this.prefab.decRef()
        }
        this.prefab = prefab
        if (this.prefab && this.prefab["__asset_cache__"]) {
            this.prefab.addRef()
        }
    }

    onDestroy() {
        if (this.prefab && this.prefab["__asset_cache__"]) {
            this.prefab.decRef()
        }
    }
}