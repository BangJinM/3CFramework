import * as cc from 'cc';
import * as ccl from "ccl"

export class MonsterManager extends ccl.ISingleton {
    /** 怪物实体 */
    monsterEntity: number[] = []
    /** 怪物死亡实体 */
    deathCount: number = 0

    GetMonsterCount(): number {
        return this.monsterEntity.length;
    }

    GetDeathCount(): number {
        return this.deathCount
    }

    SetDeathCount(count: number) {
        this.deathCount = count
    }

    HaveNextMonster(): boolean {
        return true
    }
    AddMonster(entity: number) {
        this.monsterEntity.push(entity)
    }

    RmvMonster(entity: number) {
        let index = this.monsterEntity.indexOf(entity)
        if (index != -1) {
            this.monsterEntity.splice(index, 1)
        }
    }
}