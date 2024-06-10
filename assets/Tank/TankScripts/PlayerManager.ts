import * as cc from 'cc';
import * as Core from 'Core';

export class PlayerManager extends Core.ISingleton {
    player: number = 0;

    SetPlayer(id: number) {
        this.player = id
    }

    GetPlayer(): number {
        return this.player
    }


}