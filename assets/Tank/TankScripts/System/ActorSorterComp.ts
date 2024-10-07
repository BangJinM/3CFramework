import * as ccl from "ccl"

export class ActorSorterComp extends ccl.ECSComponent {
    sortIndex = 0

    get SortIndex() { return this.sortIndex }
    set SortIndex(sortIndex: number) {
        this.sortIndex = sortIndex
        this.SetDirty(true)
    }
}

export class ActorSorterSystem extends ccl.ECSSystem {
    OnUpdate(deltaTime: number): void {
        let entities = this.GetEntities()
    }
}