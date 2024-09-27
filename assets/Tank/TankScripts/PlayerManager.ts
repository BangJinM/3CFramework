import * as ccl from 'ccl';

@ccl.set_manager_instance()
export class PlayerManager extends ccl.ISingleton {
    player: number = 0;

    SetPlayer(id: number) {
        this.player = id
    }

    GetPlayer(): number {
        return this.player
    }

}