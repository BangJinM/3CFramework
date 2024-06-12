import * as cc from 'cc';
import * as ccl from 'ccl';

export class PlayerManager extends ccl.ISingleton {
    player: number = 0;

    SetPlayer(id: number) {
        this.player = id
    }

    GetPlayer(): number {
        return this.player
    }


}